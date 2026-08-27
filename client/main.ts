/// <reference types="./env.d.ts" />

import 'mdui/mdui.css'
import 'mdui'

import 'pinch-zoom-element'

import ReactDOM from 'react-dom/client'
import React from 'react'
import Main from './ui/Main.tsx'

import './ui/MduiPatchedTextAreaElement.ts'

if ("Notification" in window && Notification.permission == "default") Notification.requestPermission()
if ("LingCatClientInterface" in window) {
    // @ts-ignore
    window.Notification = function (title: string, options: NotificationOptions) {
        if (!(this instanceof Notification)) {
            return new Notification(title, options)
        }

        // @ts-ignore
        this.title = title
        // @ts-ignore
        this.body = options?.body || ''
        // @ts-ignore
        this.icon = options?.icon || ''

        LingCatClientInterface.showNotification(
            this.title,
            this.body,
            this.icon
        )
    }

    // @ts-ignore
    Notification.permission = 'granted'
}

ReactDOM.createRoot(document.getElementById('app')!).render(React.createElement(Main))
