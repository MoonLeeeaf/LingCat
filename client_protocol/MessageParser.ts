import { IMessageEntity } from 'lingcat-protocol'

/**
 * 把用户输入的轻量语法解析为 text + entities
 * 支持: **bold** *italic* `code` [文字](url) [显示名](user:id) [群名](chat:id) ![文件名称](file:id)
 */
export default class MessageParser {
    static parseMessage(input: string) {
        let text = ''
        const entities: IMessageEntity[] = []
        let i = 0

        while (i < input.length) {
            // 转义: \* → 字面 *
            if (input[i] === '\\' && i + 1 < input.length) {
                text += input[i + 1]
                i += 2
                continue
            }

            const rest = input.slice(i)

            // **bold**
            let m = rest.match(/^\*\*([^*]+)\*\*/)
            if (m) {
                entities.push({ type: 'bold', offset: text.length, length: m[1].length })
                text += m[1]
                i += m[0].length
                continue
            }

            // *italic*
            m = rest.match(/^\*([^*]+)\*/)
            if (m) {
                entities.push({ type: 'italic', offset: text.length, length: m[1].length })
                text += m[1]
                i += m[0].length
                continue
            }

            // `code`
            m = rest.match(/^`([^`]+)`/)
            if (m) {
                entities.push({ type: 'code', offset: text.length, length: m[1].length })
                text += m[1]
                i += m[0].length
                continue
            }

            // ~~删除线~~
            m = rest.match(/^~~([^~]+)~~/)
            if (m) {
                entities.push({ type: 'strikethrough', offset: text.length, length: m[1].length })
                text += m[1]
                i += m[0].length
                continue
            }

            // ||剧透||
            m = rest.match(/^\|\|([^|]+)\|\|/)
            if (m) {
                entities.push({ type: 'spoiler', offset: text.length, length: m[1].length })
                text += m[1]
                i += m[0].length
                continue
            }

            // [@显示名](user:id)
            m = rest.match(/^\[@([^\]]+)\]\(user:([^)]+)\)/)
            if (m) {
                entities.push({ type: 'user_mention', offset: text.length, length: 1 + m[1].length, data: m[2] })
                text += '@' + m[1]
                i += m[0].length
                continue
            }

            // [@群名](chat:id)
            m = rest.match(/^\[@([^\]]+)\]\(chat:([^)]+)\)/)
            if (m) {
                entities.push({ type: 'chat_mention', offset: text.length, length: 1 + m[1].length, data: m[2] })
                text += '@' + m[1]
                i += m[0].length
                continue
            }

            // ![文件](lingcat://file?hash=xxx)  或  ![文件](file:xxx)
            m = rest.match(/^!\[([^\]]+)\]\((?:lingcat:\/\/file\?hash=|file:)([^)]+)\)/)
            if (m) {
                // m[1] 可能是 "图片" / "Video=video.mp4" / "File=doc.pdf"
                // 剥掉 Video= / File= / Image= 前缀，只留文件名
                let name = m[1]
                const prefixMatch = name.match(/^(?:Image|Video|File)=/)
                if (prefixMatch) name = name.slice(prefixMatch[0].length)

                entities.push({
                    type: 'attachment',
                    offset: text.length,
                    length: 4,
                    data: JSON.stringify({ hash: m[2], name: name || 'Unnamed' }),
                })
                text += '[附件]'
                i += m[0].length
                continue
            }

            // [文字](url)
            m = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/)
            if (m) {
                entities.push({ type: 'link', offset: text.length, length: m[1].length, data: m[2] })
                text += m[1]
                i += m[0].length
                continue
            }

            // 普通字符
            text += input[i]
            i++
        }

        return { text, entities }
    }
    static entitiesToRawRichText(text: string, entities: IMessageEntity[]): string {
        if (!entities?.length) return text
        const sorted = [...entities].sort((a, b) => a.offset - b.offset)
        let out = ''
        let cursor = 0
        for (const e of sorted) {
            if (e.offset > cursor) out += text.slice(cursor, e.offset)
            const seg = text.slice(e.offset, e.offset + e.length)
            switch (e.type) {
                case 'bold': out += `**${seg}**`; break
                case 'italic': out += `*${seg}*`; break
                case 'code': out += '`' + seg + '`'; break
                case 'strikethrough': out += `~~${seg}~~`; break
                case 'spoiler': out += `||${seg}||`; break
                case 'link': out += `[${seg}](${e.data})`; break
                case 'user_mention': out += `[@${seg.replace(/^@/, '')}](user:${e.data})`; break
                case 'chat_mention': out += `[@${seg.replace(/^@/, '')}](chat:${e.data})`; break
                case 'attachment': {
                    try {
                        const a = JSON.parse(e.data!)
                        out += `![${a.name}](file:${a.hash})`
                    } catch { out += seg }
                    break
                }
                default: out += seg
            }
            cursor = e.offset + e.length
        }
        if (cursor < text.length) out += text.slice(cursor)
        return out
    }
}