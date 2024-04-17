import { RedisClientType } from "redis";
import MemCache from "../config/MemCacheConfig";

class MemCacheUtility {
    public client: RedisClientType<any, any, any> | null = null

    constructor(MemCacheInstance: MemCache) {
        this.init(MemCacheInstance)
    }

    async init(MemCacheInstance: MemCache) {
        this.client = await MemCacheInstance.authenticate()
    }

    async SetEx(
        data: {
            key: string,
            value: string,
            ttl: number
        }
    ) {
        if (this.client != null) await this.client.setEx(data.key, data.ttl, data.value)
        return null
    }

    async GetKeysFromPattern(pattern: string) {
        if (this.client != null) return await this.client.keys(pattern)
        return null
    }

    async DeleteKeysFromPattern(pattern: string) {
        if (this.client != null) {
            const keys = await this.client.keys(pattern)
            let count = 0
            for (const key of keys) {
                count += await this.client.del(key)
            }
            return count
        }
        return null
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
            return true
        }
        return null
    }

    async Delete(key: string) {
        if (this.client != null) return await this.client.del(key)
        return null
    }

    async Get(key: string) {
        if (this.client != null) return await this.client.get(key)
        return null
    }
}

export default new MemCacheUtility(new MemCache())