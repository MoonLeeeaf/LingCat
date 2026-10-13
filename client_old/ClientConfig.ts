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
    private loadedFrom?: string

    async load() {
        return this.loadFrom('')
    }

    async loadFrom(serverUrl: string) {
        if (this.loadedFrom === serverUrl) return this.config

        const base = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl
        const url = base + '/config.json'

        try {
            const res = await fetch(url, { cache: 'no-store' })
            if (res.ok) {
                this.config = await res.json()
                this.loadedFrom = serverUrl
            }
        } catch (e) {
            console.warn('[ClientConfig] 加载失败', url, e)
        }
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