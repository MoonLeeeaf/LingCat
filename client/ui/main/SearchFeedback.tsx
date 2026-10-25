import { AnimatePresence, motion } from 'motion/react'

export default function SearchFeedback({ busy, count, hasQuery, emptyText = '暂无对话' }: {
    busy: boolean, count: number, hasQuery: boolean, emptyText?: string
}) {
    const text = busy ? '正在查找…' : count === 0
        ? (hasQuery ? '没有找到匹配的对话' : emptyText)
        : (hasQuery ? `找到 ${count} 个对话` : '')
    return <div role="status" aria-live="polite" style={{ minHeight: text ? '32px' : 0, textAlign: 'center', fontSize: '13px', opacity: 0.7 }}>
        <AnimatePresence mode="wait" initial={false}>
            {text && <motion.div key={text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }} style={{ padding: '8px' }}>{text}</motion.div>}
        </AnimatePresence>
    </div>
}
