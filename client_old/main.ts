/// <reference types="./env.d.ts" />

import 'mdui/mdui.css'
import 'mdui'

import 'pinch-zoom-element'

import ReactDOM from 'react-dom/client'
import React from 'react'
import Main from './ui/Main.tsx'
import MeetingWindowApp from './ui/meeting/MeetingWindowApp.tsx'

import './ui/MduiPatchedTextAreaElement.ts'
import ClientConfigInstance from './ClientConfig.ts'
import showSnackbar from './ui/showSnackbar.ts'
import { handleOAuthRedirect, takeOAuthMessage } from './oauthLogin.ts'
import { canOpenMeetingWindow, describeRuntime } from './pwa.ts'
import { clearMeetingWindowParams, parseMeetingWindowRequest, setPendingInAppMeeting } from './ui/meeting/MeetingWindow.ts'
import { installNotificationPermissionPrompt } from './ui/notify.ts'

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return
    if (!location.protocol.startsWith('http')) return
    navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('[PWA] Service Worker 注册失败', e))
}

await ClientConfigInstance.load()

await handleOAuthRedirect()

console.log('[PWA] 运行环境检测', describeRuntime())

const root = ReactDOM.createRoot(document.getElementById('app')!)

const meetingRequest = parseMeetingWindowRequest()

if (meetingRequest && (meetingRequest.pwa || canOpenMeetingWindow())) {
    root.render(React.createElement(MeetingWindowApp, { req: meetingRequest }))
} else {
    if (meetingRequest) {
        console.warn('[PWA] 当前不是已安装的 PWA (或为 Android / iOS), 不支持会议独立窗口, 改为应用内进行会议')
        setPendingInAppMeeting(meetingRequest)
        clearMeetingWindowParams()
    }

    registerServiceWorker()
    installNotificationPermissionPrompt()

    root.render(React.createElement(Main))

    const oauthMsg = takeOAuthMessage()
    if (oauthMsg) showSnackbar({ message: oauthMsg, autoCloseDelay: 6000 })
}
