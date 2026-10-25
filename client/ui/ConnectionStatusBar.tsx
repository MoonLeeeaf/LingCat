import React from 'react'
import type LingCatClient from 'lingcat-client-protocol'
import showSnackbar from './showSnackbar'

export default function ConnectionStatusBar({ client }: { client: LingCatClient | null }) {
    const subscribe = React.useCallback((notify: () => void) => client?.subscribeConnectionState(notify) ?? (() => {}), [client])
    const snapshot = React.useCallback(() => client?.connectionState ?? 'idle', [client])
    const state = React.useSyncExternalStore(subscribe, snapshot)
    const [online, setOnline] = React.useState(() => navigator.onLine)
    const hadIssue = React.useRef(false)

    // 维护全局唯一的 Snackbar 实例，避免反复弹窗
    const activeSnackbarRef = React.useRef<ReturnType<typeof showSnackbar> | null>(null)
    const hideTimerRef = React.useRef<number | null>(null)

    React.useEffect(() => {
        const update = () => setOnline(navigator.onLine)
        window.addEventListener('online', update)
        window.addEventListener('offline', update)
        return () => {
            window.removeEventListener('online', update)
            window.removeEventListener('offline', update)
        }
    }, [])

    // 工具方法：更新或创建 Snackbar
    const updateSnackbar = (text: string) => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current)
            hideTimerRef.current = null
        }

        if (activeSnackbarRef.current) {
            activeSnackbarRef.current.textContent = text
            activeSnackbarRef.current.open = true
        } else {
            // autoCloseDelay: 0 代表不自动关闭，由我们手动控制
            activeSnackbarRef.current = showSnackbar({ message: text, autoCloseDelay: 0 })
        }
    }

    // 工具方法：关闭 Snackbar
    const hideSnackbar = () => {
        if (activeSnackbarRef.current) {
            activeSnackbarRef.current.open = false
            activeSnackbarRef.current = null
        }
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current)
            hideTimerRef.current = null
        }
    }

    React.useEffect(() => {
        if (state === 'idle') {
            hadIssue.current = false
            hideSnackbar()
            return
        }

        if (!online) {
            hadIssue.current = true
            updateSnackbar('网络已断开，等待恢复…')
            return
        }

        if (state !== 'connected') {
            hadIssue.current = true
            updateSnackbar(
                state === 'reconnecting' 
                    ? '连接中断，正在重新连接…' 
                    : state === 'disconnected' 
                        ? '连接已断开' 
                        : '正在连接…'
            )
            return
        }

        if (!hadIssue.current) return
        
        // 之前有错误，现在恢复正常
        hadIssue.current = false
        updateSnackbar('连接已恢复')
        
        // 恢复提示 1.8 秒后自动消失
        hideTimerRef.current = window.setTimeout(() => {
            hideSnackbar()
        }, 1800)
        
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        }
    }, [state, online])

    // 组件卸载时，确保彻底清理 Snackbar 和定时器
    React.useEffect(() => {
        return () => hideSnackbar()
    }, [])

    // 纯逻辑组件，不需要渲染任何 DOM
    return null
}