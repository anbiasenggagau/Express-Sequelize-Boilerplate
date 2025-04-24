import { RedisClientType } from "redis";
import Redis from "../config/RedisConfig";

class RedisUtility {
    public client: RedisClientType<any, any, any> | null = null

    constructor(RedisInstance: Redis) {
        this.init(RedisInstance)
    }

    async init(RedisInstance: Redis) {
        this.client = await RedisInstance.authenticate()
    }

    async Set(
        data: {
            key: string,
            value: string
        }
    ) {
        if (this.client != null) return await this.client.set(data.key, data.value)
        return null
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

    async DeleteKeysFromPattern(pattern: string): Promise<number | null> {
        if (this.client != null) {
            let cursor = 0
            let count = 0

            do {
                const result = await this.client.scan(cursor, { MATCH: pattern, COUNT: 100 })
                cursor = result.cursor
                const keys = result.keys

                if (keys.length > 0) {
                    count += await this.client.del(keys)
                }
            } while (cursor !== 0)

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

    async TTL(key: string) {
        if (this.client != null) {
            const result = await this.client.TTL(key)
            return result > 0 ? result : null
        }
        return null
    }
}

export default new RedisUtility(new Redis())