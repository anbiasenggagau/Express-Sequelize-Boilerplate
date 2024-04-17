import { RedisClientType, createClient } from "redis"
import dotenv from "dotenv"
dotenv.config()

class MemCache {
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
                    console.log('Redis Client Error', err)
                    throw new Error(err)
                })
                .connect()

            console.log("Redis Client Connected")
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

export default MemCache