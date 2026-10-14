import React from 'react'
import { Dialog } from 'mdui'
import { normalizeServerAddress } from '../../lib/serverAddress.ts'

export interface TrustServerDialogProps {
    mode: 'new' | 'mismatch'
    rawAddr: string
    publicKeyHex: string
    /** 本地已信任的（仅 mismatch 时有意义） */
    oldPublicKeyHex?: string
    onAccept: () => void
    onReject: () => void
}

export function TrustServerDialog({
    mode,
    rawAddr,
    publicKeyHex,
    oldPublicKeyHex,
    onAccept,
    onReject,
}: TrustServerDialogProps) {
    const ref = React.useRef<Dialog>(null)
    const fp = publicKeyHex
    const oldFp = oldPublicKeyHex

    // 保存待执行的回调，动画结束后再执行
    const pendingCallbackRef = React.useRef<(() => void) | null>(null)

    React.useEffect(() => {
        const dlg = ref.current
        if (!dlg) return
        let cancelled = false
        dlg.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => { if (!cancelled) dlg.open = true })
        })

        // ★ 关闭动画完成后才执行 pending 回调
        const onClosed = () => {
            const cb = pendingCallbackRef.current
            pendingCallbackRef.current = null
            cb?.()
        }
        dlg.addEventListener('closed', onClosed)

        return () => {
            cancelled = true
            dlg.removeEventListener('closed', onClosed)
        }
    }, [])

    /** 触发关闭：先播动画，动画结束后再调回调 */
    const closeWith = (cb: () => void) => {
        const dlg = ref.current
        if (!dlg) {
            cb()
            return
        }
        pendingCallbackRef.current = cb
        dlg.open = false
    }

    const addr = (() => {
        try { return normalizeServerAddress(rawAddr) } catch { return rawAddr }
    })()

    return (
        <mdui-dialog ref={ref as any} close-on-esc={false} close-on-overlay-click={false}>
            <span slot="headline" style={mode === 'mismatch' ? { color: 'rgb(var(--mdui-color-error))' } : undefined}>
                {mode === 'new' ? '首次连接此服务端' : '服务端公钥已变更'}
            </span>

            <div>
                <div style={{
                    paddingBottom: '10px'
                }}>
                    {mode === 'new'
                        ? '这是你第一次连接此服务端。请确认下面的公钥与服务器管理员提供的一致。'
                        : '此服务端返回的公钥与本机记录的不一致。这可能是正常的服务器迁移，也可能是中间人攻击。'}
                </div>

                <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgb(var(--mdui-color-surface-container-highest))',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                }}>
                    <div style={{ opacity: 0.7, marginBottom: '6px' }}>服务端</div>
                    <div style={{ marginBottom: '12px' }}>{addr}</div>

                    {mode === 'mismatch' && oldFp && (
                        <>
                            <div style={{ opacity: 0.7, marginBottom: '6px' }}>本地记录</div>
                            <div style={{ marginBottom: '12px', textDecoration: 'line-through', opacity: 0.6 }}>
                                {oldFp}
                            </div>
                        </>
                    )}

                    <div style={{ opacity: 0.7, marginBottom: '6px' }}>当前 Hex</div>
                    <div style={{
                        color: mode === 'mismatch'
                            ? 'rgb(var(--mdui-color-error))'
                            : 'inherit',
                        fontWeight: 500,
                    }}>
                        {fp || '…'}
                    </div>
                </div>
            </div>

            <mdui-button
                slot="action"
                variant="text"
                onClick={() => closeWith(onReject)}
            >
                {mode === 'new' ? '取消' : '拒绝'}
            </mdui-button>
            <mdui-button
                slot="action"
                variant="text"
                onClick={() => closeWith(onAccept)}
                style={mode === 'mismatch'
                    ? { color: 'rgb(var(--mdui-color-error))' }
                    : undefined}
            >
                {mode === 'new' ? '信任' : '仍要信任'}
            </mdui-button>
        </mdui-dialog>
    )
}
