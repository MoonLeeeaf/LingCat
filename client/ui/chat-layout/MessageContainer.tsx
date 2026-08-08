export default function MessageContainer({ children, ref, style }: { children: React.ReactNode, ref?: React.RefObject<HTMLDivElement | null>, style?: React.CSSProperties }) {
    return <div style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        ...style
    }} ref={ref}>
        {children}
    </div>
}