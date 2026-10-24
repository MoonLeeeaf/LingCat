import React from 'react'

/**
 * 原生画中画 (Video PiP)。
 * - 桌面 Chrome/Edge/Safari/Firefox 走标准 API
 * - iOS Safari 走 webkitSetPresentationMode
 * - 一次只保留一个 PiP
 */

let activeVideo: HTMLVideoElement | null = null

export function isPipSupported(): boolean {
    if (typeof document === 'undefined' || typeof HTMLVideoElement === 'undefined') return false
    const proto = HTMLVideoElement.prototype as any
    if (document.pictureInPictureEnabled && typeof proto.requestPictureInPicture === 'function') return true
    return typeof proto.webkitSetPresentationMode === 'function'
}

export function isPipActive(video?: HTMLVideoElement | null): boolean {
    if (!video) return false
    if (document.pictureInPictureElement === video) return true
    return (video as any).webkitPresentationMode === 'picture-in-picture'
}

export async function exitPip(video?: HTMLVideoElement | null): Promise<void> {
    if (!video) return
    try {
        if (document.pictureInPictureElement === video) {
            await document.exitPictureInPicture()
        } else if (typeof (video as any).webkitSetPresentationMode === 'function') {
            ; (video as any).webkitSetPresentationMode('inline')
        }
    } catch { /* ignore */ }
    if (activeVideo === video) activeVideo = null
}

export async function enterPip(video: HTMLVideoElement): Promise<void> {
    if (isPipActive(video)) return

    // 一次只允许一个
    if (activeVideo && activeVideo !== video) await exitPip(activeVideo)
    if (document.pictureInPictureElement && document.pictureInPictureElement !== video) {
        try { await document.exitPictureInPicture() } catch { /* ignore */ }
    }

    if (document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function') {
        await video.requestPictureInPicture()
    } else {
        const anyVideo = video as any
        const supported = typeof anyVideo.webkitSetPresentationMode === 'function'
            && (typeof anyVideo.webkitSupportsPresentationMode !== 'function'
                || anyVideo.webkitSupportsPresentationMode('picture-in-picture'))
        if (!supported) throw new Error('Picture-in-Picture not supported')
        anyVideo.webkitSetPresentationMode('picture-in-picture')
    }

    activeVideo = video
    const clear = () => { if (activeVideo === video) activeVideo = null }
    video.addEventListener('leavepictureinpicture', clear, { once: true })
    video.addEventListener('webkitpresentationmodechanged', clear, { once: true })
}

export async function togglePip(video?: HTMLVideoElement | null): Promise<void> {
    if (!video) return
    if (isPipActive(video)) await exitPip(video)
    else await enterPip(video)
}

/** 订阅某个 video 元素的 PiP 状态 (key 变化时重新绑定, 如切换摄像头/共享屏) */
export function usePipActive(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    key?: string,
): boolean {
    const [active, setActive] = React.useState(false)

    React.useEffect(() => {
        const video = videoRef.current
        if (!video) {
            setActive(false)
            return
        }
        const update = () => setActive(isPipActive(video))
        update()
        video.addEventListener('enterpictureinpicture', update)
        video.addEventListener('leavepictureinpicture', update)
        video.addEventListener('webkitpresentationmodechanged', update as any)
        return () => {
            video.removeEventListener('enterpictureinpicture', update)
            video.removeEventListener('leavepictureinpicture', update)
            video.removeEventListener('webkitpresentationmodechanged', update as any)
        }
    }, [videoRef, key])

    return active
}
