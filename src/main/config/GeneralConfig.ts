import dotenv from "dotenv"
dotenv.config()

const data = {
    JWT_SECRET: process.env.JWT_SECRET!,
    SERVER_PORT: process.env.SERVER_PORT,
    ENCRYPTION_SALT: parseInt(process.env.ENCRYPTION_SALT!),
}

export default {
    ...data
}