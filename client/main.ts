/// <reference types="./env.d.ts" />

import 'mdui/mdui.css'
import 'mdui'

import 'pinch-zoom-element'

import ReactDOM from 'react-dom/client'
import React from 'react'
import Main from './ui/Main.tsx'

import './ui/MduiPatchedTextAreaElement.ts'

ReactDOM.createRoot(document.getElementById('app')!).render(React.createElement(Main))
