import { IChat } from "../protocol/classes-interfaces"

export default class SessionEnv {
    /**
     * 如果从本地打开或者纯静态服务器, 此项设为 true
     */
    static isOutOfServer = false
    static myUserId = ''
    static myFileAccessToken = ''
    static favouritedChats: IChat[] = []
}
