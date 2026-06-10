export default function MessageContainer({ children }: { children: React.ReactNode }) {
    return <mdui-layout style={{
        flexGrow: 1,
    }}>
        {children}
    </mdui-layout>
}