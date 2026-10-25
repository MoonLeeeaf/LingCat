import React from 'react'
import copyToClipboard from '../lib/copyToClipboard.ts'
import showSnackbar from './showSnackbar.ts'

export function useCopyFeedback() {
    const [copied, setCopied] = React.useState(false)
    const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const mounted = React.useRef(true)
    React.useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false; clearTimeout(timer.current) }
    }, [])
    const copy = React.useCallback(async (text: string) => {
        const ok = await copyToClipboard(text)
        if (!mounted.current) return
        showSnackbar({ message: ok ? '已复制' : '复制失败' })
        clearTimeout(timer.current)
        if (!ok) { setCopied(false); return }
        setCopied(true)
        timer.current = setTimeout(() => setCopied(false), 1600)
    }, [])
    return { copied, copy }
}
