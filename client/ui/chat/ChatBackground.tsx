/** 对话背景图层 (图片 + 可读性遮罩), 放在聊天内容容器的最底层 */
export default function ChatBackground({ url }: { url: string }) {
    return (
        <>
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${JSON.stringify(url)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(var(--mdui-color-surface), 0.55)',
                pointerEvents: 'none',
            }} />
        </>
    )
}
