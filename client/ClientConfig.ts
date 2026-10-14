interface OAuth2Provider {
    id: string
    display_name?: string
    type?: string
}

export interface IClientConfig {
    public_key?: string
    site_title: string
    livekit_enabled: boolean
    oauth2?: OAuth2Provider[]
}

class ClientConfigClass {
    config: IClientConfig | undefined
    async initConfig(configUrl: string) {
        const re = await fetch(configUrl)
        if (re.ok) this.config = await re.json()
        if (re.status == 404) this.config = {
            site_title: "灵猫",
            livekit_enabled: false,
        }
    }
    get site_title() {
        return this.config?.site_title || "灵猫"
    }
    get livekit_enabled() {
        return this.config?.livekit_enabled || false
    }
    get oauth2() {
        return this.config?.oauth2 || []
    }
    get public_key() {
        return this.config?.public_key
    }
    get oauthProviders() {
        return this.oauth2
    }
}

const instance = new ClientConfigClass()

export default instance
