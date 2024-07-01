import dotenv from "dotenv"
dotenv.config()

const data = {
    NODE_ENV: process.env.NODE_ENV,
    SERVER_PORT: process.env.SERVER_PORT,
    REFRESH_TOKEN: Boolean(process.env.REFRESH_TOKEN),
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION!,
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION!,
    NUMBER_OF_ALLOWED_SESSIONS: parseInt(process.env.NUMBER_OF_ALLOWED_SESSIONS ?? "1"),
    ENCRYPTION_SALT: parseInt(process.env.ENCRYPTION_SALT!),
}

export default {
    ...data
}