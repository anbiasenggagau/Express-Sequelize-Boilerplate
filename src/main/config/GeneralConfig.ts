import dotenv from "dotenv"
dotenv.config()

const data = {
    JWT_SECRET: process.env.JWT_SECRET,
    SERVER_PORT: process.env.SERVER_PORT
}

export default {
    ...data
}