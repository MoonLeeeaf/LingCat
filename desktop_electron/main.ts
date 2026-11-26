import { app, BrowserWindow } from 'electron'

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        resizable: true,
    })

    win.loadFile('./frontend/index.html')
}

app.whenReady().then(() => {
    createWindow()
})
