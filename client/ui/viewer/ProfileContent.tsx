import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

export default function ProfileContent({ loading, children }: { loading: boolean, children: React.ReactNode }) {
    const reduceMotion = useReducedMotion()
    return <AnimatePresence mode="wait" initial={false}>
        <motion.div key={loading ? 'loading' : 'profile'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}>
            {loading ? <div role="status" aria-label="正在加载资料" style={{ minWidth: '220px', minHeight: '200px', padding: '8px 0' }}>
                <motion.div animate={{ opacity: reduceMotion ? 0.6 : [0.4, 0.75, 0.4] }}
                    transition={{ duration: 1.2, repeat: reduceMotion ? 0 : Infinity }}>
                    {[48, 80, 65, 90].map((width, index) => <div key={index} style={{
                        width: `${width}%`, height: index === 0 ? '48px' : '20px', marginBottom: '18px',
                        borderRadius: '12px', background: 'rgba(var(--mdui-color-on-surface), 0.1)',
                    }} />)}
                </motion.div>
            </div> : children}
        </motion.div>
    </AnimatePresence>
}
