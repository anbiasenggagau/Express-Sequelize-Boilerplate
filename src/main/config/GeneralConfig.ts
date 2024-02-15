import dotenv from "dotenv"
dotenv.config()

const data = {
    NODE_ENV: process.env.NODE_ENV,
    SERVER_PORT: process.env.SERVER_PORT,
    JWT_SECRET: process.env.JWT_SECRET!,
    ENCRYPTION_SALT: parseInt(process.env.ENCRYPTION_SALT!),
}

export default {
    ...data
}