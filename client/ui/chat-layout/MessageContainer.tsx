export default function MessageContainer({ children }: { children: React.ReactNode }) {
    return <div style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    }}>
        {children}
    </div>
}