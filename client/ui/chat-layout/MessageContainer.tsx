export default function MessageContainer({ children, ref }: { children: React.ReactNode, ref?: React.RefObject<HTMLDivElement | null> }) {
    return <div style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    }} ref={ref}>
        {children}
    </div>
}