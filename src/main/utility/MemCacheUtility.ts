import { RedisClientType } from "redis";
import MemCache from "../config/MemCacheConfig";

class MemCacheUtility {
    public client: RedisClientType | null = null

    constructor(MemCacheInstance: MemCache) {
        this.init(MemCacheInstance)
    }

    async init(MemCacheInstance: MemCache) {
        this.client = await MemCacheInstance.authenticate() as any
    }

    async SetEx(
        data: {
            key: string,
            value: string,
            ttl: number
        }
    ) {
        if (this.client != null) await this.client.setEx(data.key, data.ttl, data.value)
    }

    async SetExpiredAt(
        data: {
            key: string,
            value: string,
            expiredAt: number
        }) {
        if (this.client != null) {
            await this.client.set(data.key, data.value)
            await this.client.expireAt(data.key, data.expiredAt)
        }
    }

    async Delete(key: string) {
        if (this.client != null) await this.client.del(key)
    }

    async Get(key: string) {
        if (this.client != null) return await this.client.get(key)
        return null
    }
}

export default new MemCacheUtility(new MemCache())