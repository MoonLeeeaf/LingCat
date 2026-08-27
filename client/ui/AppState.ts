import { IChat } from "lingcat-protocol"

export default class AppState {
    static setActiveChat(chat: IChat) {}
    static favouritedChats: IChat[] = []
    static fileAccessToken: string = ''
}