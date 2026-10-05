export interface OAuth2ProviderPublic {
    id: string
    display_name?: string
    type?: string
}

export interface IClientConfig {
    site_title?: string
    livekit_enabled?: boolean
    oauth2?: OAuth2ProviderPublic[]
}

class ClientConfig {
    private config: IClientConfig = {}
    private loaded = false

    async load() {
        if (this.loaded) return this.config
        try {
            const res = await fetch('/config.json', { cache: 'no-store' })
            if (res.ok) {
                this.config = await res.json()
            }
        } catch (e) {
            console.warn('[ClientConfig] 加载失败, 使用默认值', e)
        }
        this.loaded = true
        return this.config
    }

    get(): IClientConfig {
        return this.config
    }

    get title() {
        return this.config.site_title || '灵猫'
    }

    get meetingEnabled() {
        return this.config.livekit_enabled
    }

    get oauthProviders(): OAuth2ProviderPublic[] {
        return this.config.oauth2 || []
    }
}

const ClientConfigInstance = new ClientConfig()

export default ClientConfigInstance