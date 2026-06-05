import { lingcat } from './lingcat-proto.js'

export default class Methods {
    static Error_Response = 0x0
    static HandShake_Request = 0x1
    static HandShake_Response = 0x2
    static Ping_Request = 0x3
    static Ping_Response = 0x4
    static User_Registration_Request = 0x5
    static User_Registration_Response = 0x6

    static CACHED_KEYS?: Array<string>
    static CACHED_VALUES?: Array<any>
    static getMethodName(id: number) {
        if (this.CACHED_KEYS == undefined) this.CACHED_KEYS = Object.keys(this)
        if (this.CACHED_VALUES == undefined) this.CACHED_VALUES = Object.values(this)
        return this.CACHED_KEYS[this.CACHED_VALUES.indexOf(id)]
    }
}
