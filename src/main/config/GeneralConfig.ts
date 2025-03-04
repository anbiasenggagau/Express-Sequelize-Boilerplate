import { initBroker } from "./BrokerConfig"
import DB from "./DBConfig"

const data = {
    NODE_ENV: process.env.NODE_ENV,
    SERVICE_NAME: process.env.SERVICE_NAME!,
    SERVER_PORT: process.env.SERVER_PORT,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN == "true",
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRATION: parseInt(process.env.JWT_EXPIRATION ?? "900"),
    JWT_REFRESH_EXPIRATION: parseInt(process.env.JWT_REFRESH_EXPIRATION ?? "604800"),
    NUMBER_OF_ALLOWED_SESSIONS: parseInt(process.env.NUMBER_OF_ALLOWED_SESSIONS ?? "1"),
    ENCRYPTION_SALT: parseInt(process.env.ENCRYPTION_SALT!),
}

export async function initializeConnection() {
    DB.forEach(async (value) => {
        await value.instance.authenticate()
        if (value.afterConnect)
            value.afterConnect(value.instance)
    })
    initBroker()
}

export default {
    ...data
}