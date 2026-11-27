const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('lingcatDesktop', {
    isDesktop: true,

    // ---- meeting window ----
    getMeetingHandoff: () => ipcRenderer.invoke('meeting:get-handoff'),
    openMeeting: (handoff) => ipcRenderer.invoke('meeting:open', handoff),
    minimizeMeeting: () => ipcRenderer.invoke('meeting:minimize'),
    closeMeeting: () => ipcRenderer.send('meeting:close'),
    onCloseRequested: (cb) => {
        ipcRenderer.on('meeting:close-requested', () => cb())
    },

    // ---- floating ball ----
    getBallHandoff: () => ipcRenderer.invoke('meeting:get-ball-handoff'),
    restoreMeeting: () => ipcRenderer.send('meeting:restore'),
    ballDragStart: () => ipcRenderer.send('meeting:ball-drag-start'),
    ballDragEnd: () => ipcRenderer.send('meeting:ball-drag-end'),
    getBallPosition: () => ipcRenderer.invoke('meeting:ball-position'),
    setBallPosition: (x, y) => ipcRenderer.invoke('meeting:ball-move', x, y),
    sendBallState: (state) => ipcRenderer.send('meeting:ball-state', state),
    onBallState: (cb) => {
        ipcRenderer.on('meeting:ball-state', (_e, state) => cb(state))
    },
})
