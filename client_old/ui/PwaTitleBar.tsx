import React from 'react'

export default function PwaTitleBar({ title }: { title?: string }) {
    const [rect, setRect] = React.useState<{ x: number, y: number, width: number, height: number } | undefined>(undefined)
    const [background, setBackground] = React.useState<string>()
    const [docTitle, setDocTitle] = React.useState(() => document.title)

    React.useLayoutEffect(() => {
        const overlay = (navigator as any).windowControlsOverlay
        const root = document.documentElement
        if (!overlay) {
            root.style.setProperty('--lc-titlebar-height', '0px')
            return
        }

        const updateGeometry = () => {
            if (overlay.visible) {
                const r = overlay.getTitlebarAreaRect()
                setRect({ x: r.x, y: r.y, width: r.width, height: r.height })
                root.style.setProperty('--lc-titlebar-height', r.height + 'px')
            } else {
                setRect(undefined)
                root.style.setProperty('--lc-titlebar-height', '0px')
            }
        }

        const probe = document.createElement('div')
        probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;'
            + 'background:rgb(var(--mdui-color-surface-container-low, 29 27 32))'
        document.body.appendChild(probe)

        const updateBackground = () => {
            const color = getComputedStyle(probe).backgroundColor
            if (!color || color == 'rgba(0, 0, 0, 0)') return
            setBackground(color)
            const meta = document.querySelector('meta[name="theme-color"]')
            if (meta) meta.setAttribute('content', color)
        }

        updateGeometry()
        updateBackground()

        overlay.addEventListener('geometrychange', updateGeometry)
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        mq.addEventListener?.('change', updateBackground)
        const observer = new MutationObserver(updateBackground)
        observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'] })

        return () => {
            overlay.removeEventListener('geometrychange', updateGeometry)
            mq.removeEventListener?.('change', updateBackground)
            observer.disconnect()
            probe.remove()
            root.style.setProperty('--lc-titlebar-height', '0px')
        }
    }, [])

    React.useEffect(() => {
        const el = document.querySelector('title')
        if (!el) return
        const observer = new MutationObserver(() => setDocTitle(document.title))
        observer.observe(el, { childList: true, characterData: true, subtree: true })
        return () => observer.disconnect()
    }, [])

    if (!rect) return null

    return <div className="lc-titlebar" style={{
        left: rect.x + 'px',
        top: rect.y + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px',
        background: background,
    }}>
        <div style={{
            flex: 1,
            minWidth: 0,
            textAlign: 'center',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }}>{title ?? docTitle}</div>
    </div>
}
