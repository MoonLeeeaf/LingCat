export interface IUser {
    /** 用户 ID 在服务端为真实 ID, 在客户端为服务端生成的针对某个客户端的临时 ID */
    id: string
    username?: string | null
    nickname: string
}

export interface IGroup {
    id: string
    group_unique?: string | null
    name: string
}

export interface IFile {
    hash: string
    first_upload_file_name?: string | null
    belong_to_chat_id?: string | null
    mime: string
    uploaded_at: number
}
