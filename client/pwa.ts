const STANDALONE_DISPLAY_MODES = [
    'window-controls-overlay',
    'standalone',
    'minimal-ui',
    'fullscreen',
    'tabbed',
]

function matchesDisplayMode(mode: string) {
    try {
        return window.matchMedia('(display-mode: ' + mode + ')').matches
    } catch (e) {
        return false
    }
}

export function isStandalonePwa() {
    if (typeof window == 'undefined') return false
    if (STANDALONE_DISPLAY_MODES.some(matchesDisplayMode)) return true
    if ((navigator as any).standalone === true) return true
    if (typeof document != 'undefined' && document.referrer.startsWith('android-app://')) return true
    return false
}

export function isMobilePlatform() {
    if (typeof navigator == 'undefined') return false
    const ua = navigator.userAgent || ''
    if (/Android|iPhone|iPad|iPod|Windows Phone|HarmonyOS|OpenHarmony/i.test(ua)) return true
    if (/Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1) return true
    const uaData = (navigator as any).userAgentData
    if (uaData && uaData.mobile === true) return true
    return false
}

export function canOpenMeetingWindow() {
    return isStandalonePwa() && !isMobilePlatform()
}

export function describeRuntime() {
    return {
        standalonePwa: isStandalonePwa(),
        mobile: isMobilePlatform(),
        meetingWindowSupported: canOpenMeetingWindow(),
        displayMode: STANDALONE_DISPLAY_MODES.find(matchesDisplayMode) ?? 'browser',
        titleBarOverlay: !!(navigator as any).windowControlsOverlay?.visible,
        titleBarApi: !!(navigator as any).windowControlsOverlay,
        secureContext: window.isSecureContext === true,
    }
}
