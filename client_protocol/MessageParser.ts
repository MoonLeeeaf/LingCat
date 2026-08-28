import marked from 'marked'

type FileType = 'Video' | 'Image' | 'File'
type MentionType = 'ChatMention' | 'UserMention'

class ChatMention {
    chat_id?: string
    user_id?: string
    text?: string
    constructor({
        user_id,
        chat_id,
        text,
    }: {
        user_id?: string,
        chat_id?: string,
        text: string,
    }) {
        this.user_id = user_id
        this.chat_id = chat_id
        this.text = text
    }
}

class ChatAttachment {
    file_hash: string
    file_name: string
    constructor({
        file_hash,
        file_name
    }: {
        file_hash: string,
        file_name: string
    }) {
        this.file_name = file_name
        this.file_hash = file_hash
    }
}

export default class MessageParser {
    static parseWithTransformers(msg: string, {
        attachment,
        mention,
    }: {
        attachment?: ({ text, fileType, attachment }: { text: string, fileType: FileType, attachment: ChatAttachment }) => string,
        mention?: ({ text, mentionType, mention }: { text: string, mentionType: MentionType, mention: ChatMention }) => string,
    }) {
        return new marked.Marked({
            async: false,
            extensions: [
                {
                    name: 'text',
                    renderer: ({ text }) => text,
                },
                {
                    name: 'heading',
                    renderer({ tokens }) {
                        return this.parser.parseInline(tokens!)
                    },
                },
                {
                    name: 'paragraph',
                    renderer({ tokens }) {
                        return this.parser.parseInline(tokens!)
                    },
                },
                {
                    name: 'image',
                    renderer: ({ text, href }) => {
                        const mentionType = /^(UserMention|ChatMention)=.*/.exec(text)?.[1] as MentionType
                        const fileType = (/^(Video|File)=.*/.exec(text)?.[1] || 'Image') as FileType

                        if (fileType != null && /lingcat:\/\/file\?hash=[A-Za-z0-9]+$/.test(href)) {
                            const file_hash = /^lingcat:\/\/file\?hash=(.*)/.exec(href)?.[1]!
                            let file_name: string = /^(Video|File|Image)=(.*)/.exec(text)?.[2] || text
                            file_name.trim() == '' && (file_name = 'Unnamed_File')
                            return attachment ? attachment({ text: text, attachment: new ChatAttachment({ file_hash, file_name }), fileType: fileType, }) : text
                        }
                        if (mentionType != null && /^lingcat:\/\/(chat|user)\?id=[A-Za-z0-9]+/.test(href)) {
                            const id = /^lingcat:\/\/(chat|user)\?id=(.*)/.exec(href)?.[2]!
                            const label = /^(User|Chat)Mention=(.*)/.exec(text)?.[2] || ''
                            return mention ? mention({
                                text: text,
                                mention: new ChatMention({
                                    [({
                                        ChatMention: 'chat_id',
                                        UserMention: 'user_id',
                                    })[mentionType]]: id,
                                    text: label,
                                }),
                                mentionType: mentionType,
                            }) : text
                        }
                    },
                }
            ]
        }).parse(msg) as string
    }

}
