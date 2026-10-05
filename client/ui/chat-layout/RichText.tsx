import React from "react"
import { IMessageEntity } from "lingcat-protocol"
import UserProfileDialog from "../viewer/UserProfileDialog.tsx"
import ChatProfileDialog from "../viewer/ChatProfileDialog.tsx"
import Attachment, { IAttachmentData } from "../chat/Attachment.tsx"

interface IRichTextProps {
    text: string
    entities: IMessageEntity[]
    isSystem?: boolean
}

function Spoiler({ children }: { children: React.ReactNode }) {
    const [revealed, setRevealed] = React.useState(false)
    return <span
        onClick={() => setRevealed(true)}
        style={{
            background: revealed ? 'transparent' : 'rgb(var(--mdui-color-surface-variant))',
            color: revealed ? 'inherit' : 'transparent',
            cursor: revealed ? 'inherit' : 'pointer',
            borderRadius: '3px',
            padding: revealed ? 0 : '0 2px',
        }}
    >{children}</span>
}

function TextContainer({ children }: { children: React.ReactNode }) {
    return <div style={{
        padding: '13px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    }}>
        {children}
    </div>
}

function TextContainerSystem({ children }: { children: React.ReactNode }) {
    return <div style={{
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: '17px',
        paddingRight: '17px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    }}>
        {children}
    </div>
}

export default function RichText({ text, entities, isSystem }: IRichTextProps) {
    if (!entities?.length)
        if (isSystem)
            return <TextContainerSystem>{text}</TextContainerSystem>
        else
            return <TextContainer>{text}</TextContainer>

    const sorted = [...entities].sort((a, b) => a.offset - b.offset)
    const segments: Array<{ text: string, entity?: IMessageEntity }> = []
    let cursor = 0
    for (const e of sorted) {
        if (e.offset > cursor) segments.push({ text: text.slice(cursor, e.offset) })
        segments.push({ text: text.slice(e.offset, e.offset + e.length), entity: e })
        cursor = e.offset + e.length
    }
    if (cursor < text.length) segments.push({ text: text.slice(cursor) })

    const groups: Array<
        { type: 'inline', segments: typeof segments } |
        { type: 'block', segment: typeof segments[0] }
    > = []

    let inlineCache: typeof segments = []
    const flushInline = () => {
        if (inlineCache.length > 0) {
            groups.push({ type: 'inline', segments: inlineCache })
            inlineCache = []
        }
    }

    for (const seg of segments) {
        if (seg.entity?.type === 'attachment') {
            flushInline()
            groups.push({ type: 'block', segment: seg })
        } else {
            inlineCache.push(seg)
        }
    }
    flushInline()

    return <>{groups.map((g, gi) => {
        if (g.type === 'block') {
            return <React.Fragment key={gi}>
                {renderSegment(g.segment, 0)}
            </React.Fragment>
        }
        if (isSystem)
            return <TextContainerSystem key={gi}>
                {g.segments.map((s, si) => renderSegment(s, si))}
            </TextContainerSystem>
        else
            return <TextContainer key={gi}>
                {g.segments.map((s, si) => renderSegment(s, si))}
            </TextContainer>
    })}</>
}

function renderSegment(seg: { text: string, entity?: IMessageEntity }, i: number) {
    if (!seg.entity) return <React.Fragment key={i}>{seg.text}</React.Fragment>
    const e = seg.entity
    switch (e.type) {
        case 'bold':
            return <strong key={i}>{seg.text}</strong>

        case 'italic':
            return <em key={i}>{seg.text}</em>

        case 'code':
            return <code key={i} style={{
                background: 'rgba(127,127,127,0.15)',
                padding: '1px 5px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
            }}>{seg.text}</code>

        case 'strikethrough':
            return <del key={i}>{seg.text}</del>

        case 'spoiler':
            return <Spoiler key={i}>{seg.text}</Spoiler>

        case 'link':
            return <a
                key={i}
                href={e.data || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgb(var(--mdui-color-primary))' }}
                onClick={(ev) => ev.stopPropagation()}
            >{seg.text}</a>

        case 'user_mention': {
            const uid = e.data
            return <span
                key={i}
                style={{ color: 'rgb(var(--mdui-color-primary))', cursor: 'pointer' }}
                onClick={(ev) => {
                    ev.stopPropagation()
                    uid && UserProfileDialog.show(uid)
                }}
            >{seg.text}</span>
        }

        case 'chat_mention': {
            const cid = e.data
            return <span
                key={i}
                style={{ color: 'rgb(var(--mdui-color-primary))', cursor: 'pointer' }}
                onClick={(ev) => {
                    ev.stopPropagation()
                    cid && ChatProfileDialog.show(cid)
                }}
            >{seg.text}</span>
        }

        case 'attachment': {
            if (!e.data) return <em key={i}>[无效附件]</em>
            let parsed: IAttachmentData
            try {
                parsed = JSON.parse(e.data)
            } catch {
                return <em key={i}>[无效附件]</em>
            }
            return <Attachment key={i} data={parsed} />
        }

        default:
            return <React.Fragment key={i}>{seg.text}</React.Fragment>
    }
}