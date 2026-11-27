import { app, BrowserWindow, Menu, Tray, desktopCapturer, session, ipcMain, screen } from 'electron'
import Store from 'electron-store'
import node_path from 'node:path'
import { fileURLToPath } from 'node:url'

const store = new Store()

// `__dirname` is not available in an ESM main process.
const __dirname = node_path.dirname(fileURLToPath(import.meta.url))
const PRELOAD = node_path.join(__dirname, 'preload.cjs')

const getResourcePath = (filename: string) => {
    if (!app.isPackaged) {
        return node_path.join(__dirname, filename)
    }
    return node_path.join(process.resourcesPath, 'app.asar', filename)
}

interface MeetingHandoff {
    chatId: string
    meetingId?: string
    title?: string
    session: {
        server: string
        userId: string
        account: string
        nickname: string
        token: string
    }
    publicKeyHex: string
}

const meetingWindows = new Map<string, BrowserWindow>()
const ballWindows = new Map<string, BrowserWindow>()
const meetingHandoffs = new Map<string, MeetingHandoff>()
const byWebContents = new Map<number, { kind: 'meeting' | 'ball', chatId: string }>()
const forceClosing = new Set<string>()
let forceQuit = false
let ballDragTimer: ReturnType<typeof setInterval> | undefined
let ballDragChatId: string | undefined

function loadApp(win: BrowserWindow, query: Record<string, string>) {
    win.loadFile(getResourcePath('frontend/index.html'), { query })
}

function saveWindowState(win: BrowserWindow) {
    const bounds = win.getBounds()
    store.set('windowState', {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
    })
}

function createWindow() {
    const windowState: {
        width: number
        height: number
        x: number
        y: number
    } = store.get('windowState') as any || {
        width: 1000,
        height: 600,
        x: undefined,
        y: undefined,
    }

    const win = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        resizable: true,
        webPreferences: { preload: PRELOAD },
    })

    win.setIcon(getResourcePath('icon.png'))
    loadApp(win, {})

    win.on('resize', () => saveWindowState(win))
    win.on('move', () => saveWindowState(win))

    win.on('close', (event) => {
        if (forceQuit) return
        saveWindowState(win)
        event.preventDefault()
        win.hide()
    })

    return win
}

// ============================================================
//                    会议桌面窗口
// ============================================================

function defaultBallPosition(): { x: number, y: number } {
    const { workArea } = screen.getPrimaryDisplay()
    return {
        x: workArea.x + workArea.width - 92 - 24,
        y: workArea.y + workArea.height - 92 - 24,
    }
}

function hideBall(chatId: string) {
    const ball = ballWindows.get(chatId)
    if (ball && !ball.isDestroyed()) {
        ball.destroy()
    }
    ballWindows.delete(chatId)
}

function createMeetingWindow(handoff: MeetingHandoff) {
    const chatId = handoff.chatId
    meetingHandoffs.set(chatId, handoff)
    hideBall(chatId)

    const existing = meetingWindows.get(chatId)
    if (existing && !existing.isDestroyed()) {
        if (existing.isMinimized()) existing.restore()
        existing.show()
        existing.focus()
        return existing
    }

    const win = new BrowserWindow({
        width: 1100,
        height: 760,
        minWidth: 640,
        minHeight: 480,
        title: handoff.title ? `${handoff.title} · 会议` : '会议',
        backgroundColor: '#06070f',
        autoHideMenuBar: true,
        webPreferences: {
            preload: PRELOAD,
            // 隐藏到悬浮球时会议（音频/视频）不能因后台节流而中断
            backgroundThrottling: false,
        },
    })

    meetingWindows.set(chatId, win)
    byWebContents.set(win.webContents.id, { kind: 'meeting', chatId })

    loadApp(win, { meetingWindow: '1', chatId })

    win.on('minimize', () => {
        win.hide()
        showBall(chatId)
    })

    win.on('close', (event) => {
        if (forceQuit || forceClosing.has(chatId)) return
        event.preventDefault()
        win.webContents.send('meeting:close-requested')
    })

    win.on('closed', () => {
        meetingWindows.delete(chatId)
        hideBall(chatId)
    })

    return win
}

function showBall(chatId: string) {
    const handoff = meetingHandoffs.get(chatId)
    if (!handoff) return

    const existing = ballWindows.get(chatId)
    if (existing && !existing.isDestroyed()) {
        existing.show()
        existing.setAlwaysOnTop(true, 'floating')
        return
    }

    const saved = store.get('meetingBallPos') as { x: number, y: number } | undefined
    const pos = saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)
        ? saved
        : defaultBallPosition()

    const ball = new BrowserWindow({
        width: 92,
        height: 92,
        x: pos.x,
        y: pos.y,
        frame: false,
        transparent: true,
        resizable: false,
        movable: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        hasShadow: false,
        maximizable: false,
        minimizable: false,
        fullscreenable: false,
        webPreferences: {
            preload: PRELOAD,
            backgroundThrottling: false,
        },
    })

    ballWindows.set(chatId, ball)
    byWebContents.set(ball.webContents.id, { kind: 'ball', chatId })
    loadApp(ball, { meetingBall: '1', chatId })
    ball.setAlwaysOnTop(true, 'floating')

    ball.on('closed', () => {
        ballWindows.delete(chatId)
    })
}

// ============================================================
//                    屏幕共享 / 摄像头
// ============================================================

function setupScreenShare() {
    try {
        session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
            try {
                const sources = await desktopCapturer.getSources({
                    types: ['screen', 'window'],
                    thumbnailSize: { width: 0, height: 0 },
                })
                const screenSource = sources.find((s) => s.id.startsWith('screen:')) ?? sources[0]
                if (!screenSource) {
                    callback({})
                    return
                }
                callback({ video: screenSource })
            } catch (e) {
                console.error('[screen-share] getSources failed:', e)
                callback({})
            }
        }, { useSystemPicker: true })
    } catch (e) {
        console.error('[screen-share] setDisplayMediaRequestHandler failed:', e)
    }
}

// ============================================================
//                    IPC
// ============================================================

function registerIpc() {
    ipcMain.handle('meeting:get-handoff', (e) => {
        const ref = byWebContents.get(e.sender.id)
        if (!ref || ref.kind !== 'meeting') return null
        return meetingHandoffs.get(ref.chatId) ?? null
    })

    ipcMain.handle('meeting:get-ball-handoff', (e) => {
        const ref = byWebContents.get(e.sender.id)
        if (!ref || ref.kind !== 'ball') return null
        const h = meetingHandoffs.get(ref.chatId)
        return h ? { chatId: h.chatId, title: h.title ?? '' } : null
    })

    ipcMain.handle('meeting:open', (_e, handoff: MeetingHandoff) => {
        if (!handoff?.chatId || !handoff?.session) return false
        createMeetingWindow(handoff)
        return true
    })

    ipcMain.handle('meeting:minimize', (e) => {
        const ref = byWebContents.get(e.sender.id)
        if (!ref) return
        const win = meetingWindows.get(ref.chatId)
        if (win && !win.isDestroyed()) {
            win.hide()
            showBall(ref.chatId)
        }
    })

    ipcMain.on('meeting:close', (e) => {
        const ref = byWebContents.get(e.sender.id)
        if (!ref) return
        forceClosing.add(ref.chatId)
        const win = meetingWindows.get(ref.chatId)
        if (win && !win.isDestroyed()) win.destroy()
        forceClosing.delete(ref.chatId)
        hideBall(ref.chatId)
    })

    ipcMain.on('meeting:restore', (e) => {
        const ref = byWebContents.get(e.sender.id)
        if (!ref || ref.kind !== 'ball') return
        const handoff = meetingHandoffs.get(ref.chatId)
        if (!handoff) return
        hideBall(ref.chatId)
        createMeetingWindow(handoff)
    })

    ipcMain.handle('meeting:ball-position', (e) => {
        const ref = byWebContents.get(e.sender.id)
        const ball = ref ? ballWindows.get(ref.chatId) : undefined
        return ball && !ball.isDestroyed() ? ball.getPosition() : [0, 0]
    })

    ipcMain.handle('meeting:ball-move', (e, x: number, y: number) => {
        const ref = byWebContents.get(e.sender.id)
        const ball = ref ? ballWindows.get(ref.chatId) : undefined
        if (!ball || ball.isDestroyed()) return
        const px = Math.round(x)
        const py = Math.round(y)
        ball.setPosition(px, py)
        store.set('meetingBallPos', { x: px, y: py })
    })

    ipcMain.on('meeting:ball-state', (e, state) => {
        const ref = byWebContents.get(e.sender.id)
        if (!ref || ref.kind !== 'meeting') return
        const ball = ballWindows.get(ref.chatId)
        if (ball && !ball.isDestroyed()) ball.webContents.send('meeting:ball-state', state)
    })

    // 悬浮球拖动：由主进程按系统光标位置驱动窗口，避免渲染层逐帧 IPC 造成"粘手"
    ipcMain.on('meeting:ball-drag-start', (e) => {
        const ref = byWebContents.get(e.sender.id)
        if (!ref || ref.kind !== 'ball') return
        const ball = ballWindows.get(ref.chatId)
        if (!ball || ball.isDestroyed()) return

        if (ballDragTimer) clearInterval(ballDragTimer)
        const [wx, wy] = ball.getPosition()
        const cursor = screen.getCursorScreenPoint()
        const offsetX = cursor.x - wx
        const offsetY = cursor.y - wy
        ballDragChatId = ref.chatId

        ballDragTimer = setInterval(() => {
            const b = ballWindows.get(ref.chatId)
            if (!b || b.isDestroyed()) {
                if (ballDragTimer) clearInterval(ballDragTimer)
                ballDragTimer = undefined
                return
            }
            const p = screen.getCursorScreenPoint()
            b.setPosition(Math.round(p.x - offsetX), Math.round(p.y - offsetY))
        }, 10)
    })

    ipcMain.on('meeting:ball-drag-end', () => {
        if (ballDragTimer) clearInterval(ballDragTimer)
        ballDragTimer = undefined
        const chatId = ballDragChatId
        ballDragChatId = undefined
        if (!chatId) return
        const ball = ballWindows.get(chatId)
        if (ball && !ball.isDestroyed()) {
            const [x, y] = ball.getPosition()
            store.set('meetingBallPos', { x, y })
        }
    })
}

let win: BrowserWindow | undefined

// 单实例：避免重复启动多个 App（共享 userData 会触发各种锁/音频冲突）
if (!app.requestSingleInstanceLock()) {
    app.quit()
} else {
    app.on('second-instance', () => {
        if (win && !win.isDestroyed()) {
            if (win.isMinimized()) win.restore()
            win.show()
            win.focus()
        }
    })

    app.on('before-quit', () => { forceQuit = true })

    app.whenReady().then(() => {
        registerIpc()
        setupScreenShare()

        win = createWindow()

        const tray = new Tray(getResourcePath('icon.png'))
        const contextMenu = Menu.buildFromTemplate([
            {
                label: '显示窗口',
                type: 'normal',
                click: () => win?.show(),
            },
            {
                label: '退出程序',
                type: 'normal',
                click: () => { forceQuit = true; app.quit() },
            },
        ])
        tray.setToolTip('LingCat')
        tray.setContextMenu(contextMenu)
        tray.on('click', () => {
            if (win) {
                if (win.isVisible()) win.hide()
                else win.show()
            }
        })
    })

    app.on('window-all-closed', () => {
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            win = createWindow()
        }
    })
}
