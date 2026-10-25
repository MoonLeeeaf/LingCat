import { motion } from 'motion/react'
import { useChatMessageStore } from './useChatMessageStore.ts'

export default function MessageHighlight({ seq }: { seq: number }) {
    const request = useChatMessageStore(s => s.highlightRequest?.seq === seq ? s.highlightRequest : null)
    if (!request) return null
    return <motion.div key={request.token} aria-hidden="true" data-message-highlight={seq}
        initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.5, ease: 'easeOut' }}
        onAnimationComplete={() => useChatMessageStore.getState().clearHighlight(request.token)}
        style={{ position: 'absolute', inset: 0, borderRadius: '10px', background: 'rgba(var(--mdui-color-primary), 0.18)', pointerEvents: 'none', zIndex: 1 }} />
}
