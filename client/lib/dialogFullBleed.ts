import type { Dialog } from 'mdui'

/**
 * 把 mdui-dialog 的 shadow DOM 改造成"全屏内容"模式：
 * - `.panel`：去掉 padding、背景透明、颜色继承
 * - `.body`：撑满高度、flex column
 *
 * 必须等 Lit 首次渲染完成后 `.panel` / `.body` 才存在，
 * 所以这里 await `updateComplete`。
 *
 * @param isCancelled 可选。组件卸载时通过它放弃后续操作（避免对已卸载元素动样式）
 */
export async function applyFullBleed(
    el: Dialog,
    isCancelled?: () => boolean,
): Promise<void> {
    await el.updateComplete
    if (isCancelled?.()) return

    const shadow = el.shadowRoot
    if (!shadow) return

    const panel = shadow.querySelector('.panel') as HTMLElement | null
    const body = shadow.querySelector('.body') as HTMLElement | null

    if (panel) {
        panel.style.padding = '0'
        panel.style.color = 'inherit'
        panel.style.backgroundColor = 'rgb(var(--mdui-color-background))'
        panel.style.setProperty('--mdui-color-background', 'inherit')
    }
    if (body) {
        body.style.height = '100%'
        body.style.display = 'flex'
        body.style.flexDirection = 'column'
    }
}