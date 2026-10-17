import { create } from 'zustand'

interface MeetingUIState {
    isOpen: boolean
    isMinimized: boolean
    isMaximized: boolean
    /** 分栏模式: 会议在左, 聊天在右 (仅桌面端) */
    split: boolean
    /** 分栏时会议面板宽度百分比 (20-80) */
    splitWidthPercent: number
    position: { x: number, y: number }
    size: { w: number, h: number }

    open(): void
    close(): void
    toggleMinimized(): void
    setMinimized(v: boolean): void
    toggleMaximized(): void
    setMaximized(v: boolean): void
    /** 切换分栏/悬浮窗 */
    toggleSplit(): void
    setSplit(v: boolean): void
    setSplitWidthPercent(v: number): void
    setPosition(p: { x: number, y: number }): void
    setSize(s: { w: number, h: number }): void
}

const POSITION_KEY = 'lingcat.meeting.ui.position'
const SIZE_KEY = 'lingcat.meeting.ui.size'
const SPLIT_WIDTH_KEY = 'lingcat.meeting.ui.splitWidth'
const DEFAULT_POSITION = { x: 20, y: 20 }
const DEFAULT_SIZE = { w: 640, h: 480 }

function loadPosition() {
    try {
        const raw = localStorage.getItem(POSITION_KEY)
        return raw ? JSON.parse(raw) : undefined
    } catch { return undefined }
}
function loadSize() {
    try {
        const raw = localStorage.getItem(SIZE_KEY)
        return raw ? JSON.parse(raw) : undefined
    } catch { return undefined }
}
function loadSplitWidth(): number | undefined {
    try {
        const raw = localStorage.getItem(SPLIT_WIDTH_KEY)
        return raw ? Number(raw) : undefined
    } catch { return undefined }
}
function saveSplitWidth(n: number) {
    try { localStorage.setItem(SPLIT_WIDTH_KEY, String(n)) } catch { }
}
function savePosition(p: { x: number, y: number }) {
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(p)) } catch { }
}
function saveSize(s: { w: number, h: number }) {
    try { localStorage.setItem(SIZE_KEY, JSON.stringify(s)) } catch { }
}

export const useMeetingUIStore = create<MeetingUIState>((set, get) => ({
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    split: false,
    splitWidthPercent: Math.min(80, Math.max(20, loadSplitWidth() ?? 50)),
    position: loadPosition() ?? DEFAULT_POSITION,
    size: loadSize() ?? DEFAULT_SIZE,

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),

    toggleMinimized: () => set(s => ({ isMinimized: !s.isMinimized })),
    setMinimized: (v) => set({ isMinimized: v }),

    toggleMaximized: () => set(s => ({ isMaximized: !s.isMaximized })),
    setMaximized: (v) => set({ isMaximized: v }),

    toggleSplit: () => set(s => ({ split: !s.split })),
    setSplit: (v) => set({ split: v }),
    setSplitWidthPercent: (v) => {
        const w = Math.min(80, Math.max(20, v))
        set({ splitWidthPercent: w })
        saveSplitWidth(w)
    },

    setPosition: (p) => { set({ position: p }); savePosition(p) },
    setSize: (s) => { set({ size: s }); saveSize(s) },
}))