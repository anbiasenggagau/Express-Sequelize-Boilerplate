import { RedisClientType, createClient } from "redis"
import Logging from "./LoggingConfig"

class Redis {
    private client: RedisClientType<any, any, any> | null = null

    async authenticate() {
        try {
            const data = await createClient({
                password: process.env.REDIS_PASSWORD,
                socket: {
                    host: process.env.REDIS_HOST,
                    port: parseInt(process.env.REDIS_PORT!)
                },

            })
                .on('error', err => {
                    Logging.warn('Redis Client Error', err)
                    throw new Error(err)
                })
                .connect()

            Logging.info("Redis Client Connected")
            this.client = data
            return data
        } catch (error) {
            this.client = null
            return null
        }
    }

    async disconnect(client: RedisClientType) {
        await client.disconnect()
    }
}

export default Redis