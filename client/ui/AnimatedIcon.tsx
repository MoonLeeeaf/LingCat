import { AnimatePresence, motion } from 'motion/react'

/** 固定占位，状态图标切换时不改变按钮或列表项尺寸。 */
export default function AnimatedIcon({ name, slot }: { name: string, slot?: string }) {
    return <span slot={slot} aria-hidden="true" style={{ display: 'inline-grid', width: '24px', height: '24px', flexShrink: 0 }}>
        <AnimatePresence initial={false}>
            <motion.span key={name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }} style={{ gridArea: '1 / 1', display: 'inline-flex' }}>
                <mdui-icon name={name} />
            </motion.span>
        </AnimatePresence>
    </span>
}
