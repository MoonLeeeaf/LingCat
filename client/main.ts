/// <reference types="./env.d.ts" />

import 'mdui/mdui.css'
import 'mdui'

import 'pinch-zoom-element'

import ReactDOM from 'react-dom/client'
import React from 'react'
import Main from './ui/Main.tsx'

import './ui/MduiPatchedTextAreaElement.ts'
import ClientConfigInstance from './ClientConfig.ts'

await ClientConfigInstance.load()

if ("Notification" in window && Notification.permission == "default") Notification.requestPermission()

ReactDOM.createRoot(document.getElementById('app')!).render(React.createElement(Main))
