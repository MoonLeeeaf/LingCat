import { IUser } from "./classes-interfaces"

export default class User {
    bean: IUser

    constructor(bean: IUser) {
        this.bean = bean
    }
}
