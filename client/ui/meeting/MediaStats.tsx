import React from 'react'
import { LocalVideoTrack, RemoteVideoTrack, type TrackPublication } from 'livekit-client'

interface Rows {
    [label: string]: string | undefined
}

/**
 * 视频流调试信息浮层 (类似 YouTube "统计信息")。
 * 数据来源: livekit-client 的 RemoteVideoTrack.getReceiverStats() / LocalVideoTrack.getSenderStats(),
 * 以及 <video> 元素的 getVideoPlaybackQuality()。均复用现有库, 不额外引入依赖。
 */
export function MediaStatsOverlay({ publication, videoRef, compact }: {
    publication?: TrackPublication
    videoRef: React.RefObject<HTMLVideoElement | null>
    compact?: boolean
}) {
    const [rows, setRows] = React.useState<Rows>({})

    React.useEffect(() => {
        let prev: any
        let cancelled = false
        let timer: ReturnType<typeof setInterval> | undefined

        const fmtBitrate = (bps?: number) =>
            bps == null ? undefined : bps >= 1e6 ? (bps / 1e6).toFixed(2) + ' Mbps' : Math.round(bps / 1e3) + ' kbps'

        const tick = async () => {
            const track = publication?.track
            const v = videoRef.current
            const out: Rows = {}
            if (v && v.videoWidth && v.videoHeight)
                out['分辨率'] = `${v.videoWidth}x${v.videoHeight}`
            try {
                if (track instanceof RemoteVideoTrack) {
                    const st = await track.getReceiverStats()
                    if (st) {
                        const dt = prev ? (st.timestamp - prev.timestamp) / 1000 : 0
                        if (st.frameWidth && st.frameHeight) out['分辨率'] = `${st.frameWidth}x${st.frameHeight}`
                        if (prev && dt > 0 && st.bytesReceived != null && prev.bytesReceived != null) {
                            out['帧率'] = Math.round((st.framesDecoded - prev.framesDecoded) / dt) + ' fps'
                            out['码率'] = fmtBitrate((st.bytesReceived - prev.bytesReceived) * 8 / dt)
                        }
                        if (st.mimeType) out['编码'] = st.mimeType
                        out['已解码'] = `${st.framesDecoded} 帧, 丢弃 ${st.framesDropped ?? 0}`
                        if (st.packetsLost != null) out['丢包'] = String(st.packetsLost)
                        if (st.jitter != null) out['抖动'] = (st.jitter * 1000).toFixed(1) + ' ms'
                        if (st.decoderImplementation) out['解码器'] = st.decoderImplementation
                        prev = st
                    }
                } else if (track instanceof LocalVideoTrack) {
                    const arr = await track.getSenderStats()
                    const st = arr?.find((x) => x.rid === 'f') ?? arr?.[arr.length - 1]
                    if (st) {
                        const dt = prev ? (st.timestamp - prev.timestamp) / 1000 : 0
                        out['分辨率'] = `${st.frameWidth}x${st.frameHeight}`
                        out['帧率'] = st.framesPerSecond + ' fps'
                        if (prev && dt > 0 && st.bytesSent != null && prev.bytesSent != null)
                            out['码率'] = fmtBitrate((st.bytesSent - prev.bytesSent) * 8 / dt)
                        if (st.rid) out['层'] = st.rid
                        if (st.targetBitrate != null) out['目标码率'] = fmtBitrate(st.targetBitrate)
                        if (st.roundTripTime != null) out['RTT'] = Math.round(st.roundTripTime * 1000) + ' ms'
                        if (st.qualityLimitationReason && st.qualityLimitationReason !== 'none')
                            out['限流'] = st.qualityLimitationReason
                        prev = st
                    }
                }
            } catch { /* 统计偶发失败忽略 */ }
            if (!cancelled) setRows(out)
        }

        tick()
        timer = setInterval(tick, 1000)
        return () => { cancelled = true; if (timer) clearInterval(timer) }
    }, [publication?.track, videoRef])

    const entries = Object.entries(rows).filter(([, v]) => v != null && v !== '')
    if (!entries.length) return null

    return <div
        onClick={(e) => e.stopPropagation()}
        style={{
            position: 'absolute',
            left: '6px',
            top: '16px',
            zIndex: 3,
            padding: compact ? '4px 6px' : '6px 8px',
            borderRadius: '6px',
            background: 'rgba(0,0,0,0.72)',
            color: '#fff',
            fontSize: compact ? '9px' : '10px',
            lineHeight: 1.45,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            pointerEvents: 'none',
            maxWidth: 'calc(100% - 12px)',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 2px rgba(0,0,0,.6)',
        }}>
        {entries.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.6 }}>{k}</span>
                <span>{v}</span>
            </div>
        ))}
    </div>
}
