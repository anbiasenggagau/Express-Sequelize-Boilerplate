import { Dialect } from "sequelize";
import { Sequelize } from "sequelize-typescript";
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
        path.join(__dirname, "../model/entity/MainDatabase")
    ],
    logging: console.log
})

export const extensionDb = new Sequelize({
    database: process.env.EXTENSION_DB_NAME,
    dialect: process.env.EXTENSION_DB_ENGINE as Dialect,
    host: process.env.EXTENSION_DB_HOST,
    username: process.env.EXTENSION_DB_USERNAME,
    password: process.env.EXTENSION_DB_PASSWORD,
    port: parseInt(process.env.EXTENSION_DB_PORT as string),
    pool: {
        max: 5,
        min: 0,
        idle: 15000,
        acquire: 15000
    },
    models: [
        path.join(__dirname, "../model/entity/ExtensionDatabase")
    ],
    logging: console.log
})

DB.push(mainDb)
DB.push(extensionDb)

export default DB