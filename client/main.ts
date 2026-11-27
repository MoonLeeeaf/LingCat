/// <reference types="./env.d.ts" />

import 'mdui/mdui.css'
import './styles.css'
import 'mdui'

import 'pinch-zoom-element'

import ReactDOM from 'react-dom/client'
import React from 'react'

import './ui/MduiPatchedTextAreaElement.ts'

const params = new URLSearchParams(location.search)
const appEl = document.getElementById('app')!

if (params.has('meetingBall')) {
    // 悬浮球窗口: 极简，透明背景
    const { mountMeetingBall } = await import('./ui/meeting/MeetingBallRoot.tsx')
    mountMeetingBall(appEl, params.get('chatId') || '')
} else if (params.has('meetingWindow')) {
    // 独立原生会议窗口: 只渲染会议
    const { mountMeetingWindow } = await import('./ui/meeting/MeetingWindowRoot.tsx')
    mountMeetingWindow(appEl)
} else {
    const { default: Main } = await import('./ui/Main.tsx')
    ReactDOM.createRoot(appEl).render(React.createElement(Main))
}
