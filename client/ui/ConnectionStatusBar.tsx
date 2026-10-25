import React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import type LingCatClient from 'lingcat-client-protocol'

export default function ConnectionStatusBar({ client }: { client: LingCatClient | null }) {
    const subscribe = React.useCallback((notify: () => void) => client?.subscribeConnectionState(notify) ?? (() => {}), [client])
    const snapshot = React.useCallback(() => client?.connectionState ?? 'idle', [client])
    const state = React.useSyncExternalStore(subscribe, snapshot)
    const [online, setOnline] = React.useState(() => navigator.onLine)
    const hadIssue = React.useRef(false)
    const [notice, setNotice] = React.useState<{ key: string, text: string } | null>(null)

    React.useEffect(() => {
        const update = () => setOnline(navigator.onLine)
        window.addEventListener('online', update)
        window.addEventListener('offline', update)
        return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
    }, [])

    React.useEffect(() => {
        if (state === 'idle') { hadIssue.current = false; setNotice(null); return }
        if (!online) { hadIssue.current = true; setNotice({ key: 'offline', text: '网络已断开，等待恢复…' }); return }
        if (state !== 'connected') {
            hadIssue.current = true
            setNotice({ key: state, text: state === 'reconnecting' ? '连接中断，正在重新连接…' : state === 'disconnected' ? '连接已断开' : '正在连接…' })
            return
        }
        if (!hadIssue.current) return
        hadIssue.current = false
        setNotice({ key: 'recovered', text: '连接已恢复' })
        const timer = window.setTimeout(() => setNotice(null), 1800)
        return () => window.clearTimeout(timer)
    }, [state, online])

    return createPortal(<div role="status" aria-live="polite">
        <AnimatePresence mode="wait">
            {notice && <motion.div key={notice.key} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }} style={{ position: 'fixed', top: '12px', left: 0, right: 0, margin: 'auto', width: 'fit-content', maxWidth: 'calc(100% - 32px)', padding: '10px 18px', borderRadius: '999px', background: 'rgb(var(--mdui-color-secondary-container))', color: 'rgb(var(--mdui-color-on-secondary-container))', boxShadow: 'var(--mdui-elevation-level2)', zIndex: 2600, pointerEvents: 'none', fontSize: '13px' }}>
                {notice.text}
            </motion.div>}
        </AnimatePresence>
    </div>, document.body)
}
