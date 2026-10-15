import React from 'react'
import tipError from '../tipError.ts'

export interface UseAudioRecorderOptions {
    /** 录音完成（或达到上限）后触发，返回 blob + 建议文件名 */
    onRecorded: (blob: Blob, mime: string, fileName: string) => void
}

export function useAudioRecorder({ onRecorded }: UseAudioRecorderOptions) {
    const [isRecording, setIsRecording] = React.useState(false)
    const [seconds, setSeconds] = React.useState(0)

    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
    const audioStreamRef = React.useRef<MediaStream | null>(null)
    const audioChunksRef = React.useRef<Blob[]>([])
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

    const onRecordedRef = React.useRef(onRecorded)
    React.useEffect(() => { onRecordedRef.current = onRecorded })

    const cleanup = React.useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        setIsRecording(false)
        setSeconds(0)
    }, [])

    const stop = React.useCallback(() => {
        const recorder = mediaRecorderRef.current
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop()    // onstop 里做收尾
        } else {
            audioStreamRef.current?.getTracks().forEach(t => t.stop())
            audioStreamRef.current = null
            mediaRecorderRef.current = null
            cleanup()
        }
    }, [cleanup])

    const start = React.useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            tipError(new Error('当前环境不支持录音，请使用 HTTPS 访问'), '无法录音')
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            audioStreamRef.current = stream

            const mimeCandidates = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus',
                'audio/mp4',
            ]
            const mimeType = mimeCandidates.find(t =>
                typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)
            ) ?? ''

            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
            audioChunksRef.current = []
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }
            recorder.onstop = () => {
                stream.getTracks().forEach(t => t.stop())
                audioStreamRef.current = null
                mediaRecorderRef.current = null

                let actualMime = recorder.mimeType || mimeType || 'audio/webm'
                if (actualMime.includes('webm') && !actualMime.startsWith('audio/')) {
                    actualMime = 'audio/webm;codecs=opus'
                }

                const blob = new Blob(audioChunksRef.current, { type: actualMime })
                audioChunksRef.current = []
                cleanup()

                if (blob.size === 0) return

                const ext = actualMime.includes('webm') ? 'webm'
                    : actualMime.includes('ogg') ? 'ogg'
                    : actualMime.includes('mp4') ? 'm4a'
                    : 'bin'
                const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
                onRecordedRef.current(blob, actualMime, `${ts}.${ext}`)
            }
            mediaRecorderRef.current = recorder
            recorder.start()
            setIsRecording(true)
            setSeconds(0)
            timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
        } catch (e) {
            tipError(e, '无法访问麦克风')
        }
    }, [cleanup])

    const toggle = React.useCallback(() => {
        if (isRecording) stop()
        else start()
    }, [isRecording, start, stop])

    // 卸载时清理
    React.useEffect(() => {
        return () => {
            const recorder = mediaRecorderRef.current
            if (recorder && recorder.state !== 'inactive') {
                try { recorder.stop() } catch { /* ignore */ }
            }
            audioStreamRef.current?.getTracks().forEach(t => t.stop())
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    return { isRecording, seconds, start, stop, toggle }
}