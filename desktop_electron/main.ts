import { app, BrowserWindow, Menu, Tray } from 'electron'
import Store from 'electron-store'
import node_path from 'node:path'

const store = new Store()

const getResourcePath = (filename: string) => {
    if (!app.isPackaged) {
        return node_path.join(__dirname, '..', filename)
    }
    return node_path.join(process.resourcesPath, 'app.asar', filename)
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
    })

    win.setIcon(getResourcePath('icon.png'))

    win.loadFile(getResourcePath('frontend/index.html'))

    const saveWindowState = () => {
        const bounds = win.getBounds()
        store.set('windowState', {
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
            isMaximized: win.isMaximized(),
        })
    }

    win.on('resize', saveWindowState)
    win.on('move', saveWindowState)
    win.on('close', saveWindowState)

    win.on('close', (event) => {
        event.preventDefault()
        win.hide()
    })

    return win
}

let win: BrowserWindow | undefined

app.whenReady().then(() => {
    win = createWindow()

    const tray = new Tray(getResourcePath('icon.png'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示窗口',
            type: 'normal',
            click: () => win?.show()
        },
        {
            label: '退出程序',
            type: 'normal',
            click: () => app.exit()
        },
    ])
    tray.setToolTip('LingCat')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
        if (win) {
            if (win.isVisible()) {
                win.hide()
            } else {
                win.show()
            }
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
