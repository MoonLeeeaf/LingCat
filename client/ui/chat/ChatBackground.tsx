import React from 'react'
import { AnimatePresence, motion } from 'motion/react'

/** 新背景加载成功后再交叉淡化，保留旧图直到过渡完成。 */
export default function ChatBackground({ url }: { url: string | null }) {
    const [readyUrl, setReadyUrl] = React.useState<string | null>(null)
    React.useEffect(() => {
        if (!url) { setReadyUrl(null); return }
        let cancelled = false
        const image = new Image()
        image.onload = () => { if (!cancelled) setReadyUrl(url) }
        image.src = url
        return () => { cancelled = true; image.onload = null }
    }, [url])
    return (
        <AnimatePresence initial={false}>
            {readyUrl && <motion.div key={readyUrl}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.24 }} style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
            }}>
            <img src={readyUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(var(--mdui-color-surface), 0.55)',
                pointerEvents: 'none',
            }} />
            </motion.div>}
        </AnimatePresence>
    )
}
