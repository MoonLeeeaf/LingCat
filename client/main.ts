/// <reference types="./env.d.ts" />

import 'mdui/mdui.css'
import 'mdui'

import 'pinch-zoom-element'

import ReactDOM from 'react-dom/client'
import React from 'react'
import Main from './ui/Main.tsx'

import './ui/MduiPatchedTextAreaElement.ts'
import ClientConfigInstance from './ClientConfig.ts'
import showSnackbar from './ui/showSnackbar.ts'
import { handleOAuthRedirect, takeOAuthMessage } from './oauthLogin.ts'

await ClientConfigInstance.load()

// 处理 OIDC 回调 (可能触发刷新)
await handleOAuthRedirect()

if ("Notification" in window && Notification.permission == "default") Notification.requestPermission()

ReactDOM.createRoot(document.getElementById('app')!).render(React.createElement(Main))

// 回调提示 (登录失败 / 绑定成功)
const oauthMsg = takeOAuthMessage()
if (oauthMsg) showSnackbar({ message: oauthMsg, autoCloseDelay: 6000 })
