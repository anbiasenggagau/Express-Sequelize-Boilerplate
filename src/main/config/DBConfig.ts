import { Dialect } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import Logging from "./LoggingConfig";
import path from 'path'

const DB: Sequelize[] = []

export const mainDb = new Sequelize({
    database: process.env.MAIN_DB_NAME,
    dialect: process.env.MAIN_DB_ENGINE as Dialect,
    host: process.env.MAIN_DB_HOST,
    username: process.env.MAIN_DB_USERNAME,
    password: process.env.MAIN_DB_PASSWORD,
    port: parseInt(process.env.MAIN_DB_PORT as string),
    pool: {
        max: 5,
        min: 0,
        idle: 15000,
        acquire: 15000
    },
    models: [
        path.join(__dirname, "../model/entity")
    ],
    logging: (message) => {
        Logging.info(message)
    }
})



DB.push(mainDb)

export default DB