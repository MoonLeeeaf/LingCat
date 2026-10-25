import React from 'react'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'

export interface UseAudioRecorderOptions {
    /** 录音完成（或达到上限）后触发，返回 blob + 建议文件名 + 实际时长 */
    onRecorded: (blob: Blob, mime: string, fileName: string, durationSeconds: number) => void
    /** 会话切换时取消当前录音 */
    cancelKey?: string
    /** 最长录音秒数，默认 5 分钟 */
    maxSeconds?: number
    /** 最短录音秒数，短于该值丢弃，默认 0.5 秒 */
    minSeconds?: number
}

const DEFAULT_MAX_SECONDS = 5 * 60
const DEFAULT_MIN_SECONDS = 0.5

function voiceFileName(seconds: number, ext: string) {
    return `语音 ${Math.max(1, Math.round(seconds))}秒.${ext}`
}

export function useAudioRecorder({
    onRecorded,
    cancelKey,
    maxSeconds = DEFAULT_MAX_SECONDS,
    minSeconds = DEFAULT_MIN_SECONDS,
}: UseAudioRecorderOptions) {
    const [isRecording, setIsRecording] = React.useState(false)
    const [seconds, setSeconds] = React.useState(0)

    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
    const audioStreamRef = React.useRef<MediaStream | null>(null)
    const audioChunksRef = React.useRef<Blob[]>([])
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
    const startedAtRef = React.useRef(0)
    const discardRef = React.useRef(false)
    const finishingRef = React.useRef(false)
    const startingRef = React.useRef(false)
    const startIdRef = React.useRef(0)
    const cancelKeyRef = React.useRef(cancelKey)

    const onRecordedRef = React.useRef(onRecorded)
    React.useEffect(() => { onRecordedRef.current = onRecorded })

    const cleanup = React.useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        setIsRecording(false)
        setSeconds(0)
        finishingRef.current = false
    }, [])

    const releaseStream = React.useCallback(() => {
        audioStreamRef.current?.getTracks().forEach(t => t.stop())
        audioStreamRef.current = null
        mediaRecorderRef.current = null
    }, [])

    /** 丢弃当前录音（不触发 onRecorded） */
    const cancel = React.useCallback(() => {
        startIdRef.current++
        discardRef.current = true
        finishingRef.current = false
        const recorder = mediaRecorderRef.current
        if (recorder && recorder.state !== 'inactive') {
            try {
                recorder.stop()
            } catch {
                releaseStream()
                cleanup()
            }
        } else {
            releaseStream()
            cleanup()
        }
    }, [cleanup, releaseStream])

    /** 结束并保留当前录音 */
    const stop = React.useCallback(() => {
        if (finishingRef.current) return
        finishingRef.current = true
        discardRef.current = false
        const recorder = mediaRecorderRef.current
        if (recorder && recorder.state !== 'inactive') {
            try {
                recorder.stop()
            } catch {
                releaseStream()
                cleanup()
            }
        } else {
            releaseStream()
            cleanup()
        }
    }, [cleanup, releaseStream])

    const start = React.useCallback(async () => {
        if (startingRef.current || mediaRecorderRef.current) return
        if (!navigator.mediaDevices?.getUserMedia) {
            tipError(new Error('当前环境不支持录音，请使用 HTTPS 访问'), '无法录音')
            return
        }

        startingRef.current = true
        const startId = ++startIdRef.current
        let stream: MediaStream
        try {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                })
            } catch (e) {
                // 部分浏览器不支持这些约束，退回默认麦克风
                if ((e as DOMException)?.name === 'OverconstrainedError') {
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                } else {
                    throw e
                }
            }
        } catch (e) {
            startingRef.current = false
            tipError(e, '无法访问麦克风')
            return
        }

        // 等待权限期间用户已取消 / 切换会话
        if (startId !== startIdRef.current) {
            stream.getTracks().forEach(t => t.stop())
            startingRef.current = false
            return
        }

        audioStreamRef.current = stream

        try {
            const mimeCandidates = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus',
                'audio/mp4',
            ]
            const mimeType = mimeCandidates.find(t =>
                typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)
            ) ?? ''

            const baseOptions: MediaRecorderOptions = { audioBitsPerSecond: 32000 }
            let recorder: MediaRecorder
            try {
                recorder = new MediaRecorder(stream, mimeType ? { ...baseOptions, mimeType } : baseOptions)
            } catch {
                try {
                    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
                } catch {
                    recorder = new MediaRecorder(stream)
                }
            }

            audioChunksRef.current = []
            discardRef.current = false
            finishingRef.current = false
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }
            recorder.onstop = () => {
                releaseStream()
                const discarded = discardRef.current
                const duration = Math.max(0, (Date.now() - startedAtRef.current) / 1000)

                let actualMime = recorder.mimeType || mimeType || 'audio/webm'
                if (actualMime.includes('webm') && !actualMime.startsWith('audio/')) {
                    actualMime = 'audio/webm;codecs=opus'
                }

                const blob = new Blob(audioChunksRef.current, { type: actualMime })
                audioChunksRef.current = []
                cleanup()

                if (discarded) return
                if (blob.size === 0) return
                if (duration < minSeconds) {
                    showSnackbar({ message: '录音太短，已取消' })
                    return
                }

                const ext = actualMime.includes('webm') ? 'webm'
                    : actualMime.includes('ogg') ? 'ogg'
                    : actualMime.includes('mp4') ? 'm4a'
                    : 'bin'
                onRecordedRef.current(blob, actualMime, voiceFileName(duration, ext), duration)
            }

            if (startId !== startIdRef.current) {
                releaseStream()
                return
            }

            mediaRecorderRef.current = recorder
            startedAtRef.current = Date.now()
            recorder.start()
            setIsRecording(true)
            setSeconds(0)
            timerRef.current = setInterval(() => {
                const elapsed = (Date.now() - startedAtRef.current) / 1000
                setSeconds(Math.floor(elapsed))
                if (elapsed >= maxSeconds && !finishingRef.current) {
                    showSnackbar({ message: `已达到最长录音时间（${Math.round(maxSeconds / 60)} 分钟）` })
                    stop()
                }
            }, 250)
        } catch (e) {
            releaseStream()
            tipError(e, '无法开始录音')
        } finally {
            startingRef.current = false
        }
    }, [cleanup, maxSeconds, minSeconds, releaseStream, stop])

    // 切换会话时取消录音
    React.useEffect(() => {
        if (cancelKeyRef.current === cancelKey) return
        cancelKeyRef.current = cancelKey
        cancel()
    }, [cancelKey, cancel])

    const toggle = React.useCallback(() => {
        if (isRecording) stop()
        else start()
    }, [isRecording, start, stop])

    // 卸载时丢弃未完成录音，不回调 onRecorded
    React.useEffect(() => {
        return () => {
            discardRef.current = true
            startIdRef.current++
            const recorder = mediaRecorderRef.current
            if (recorder && recorder.state !== 'inactive') {
                try { recorder.stop() } catch { /* ignore */ }
            }
            releaseStream()
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [releaseStream])

    return { isRecording, seconds, start, stop, cancel, toggle }
}
