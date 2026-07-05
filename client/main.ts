/// <reference types="vite/client" />

/// <reference types="mdui/jsx.zh-cn.d.ts" />

import 'mdui/mdui.css'
import 'mdui'

import ReactDOM from 'react-dom/client'
import React from 'react'
import Main from './ui/Main.tsx'

import './ui/MduiPatchedTextAreaElement.ts'

ReactDOM.createRoot(document.getElementById('app')!).render(React.createElement(Main))
