require("dotenv").config()
module.exports = {
    "development": {
        "username": process.env.MAIN_DB_USERNAME,
        "password": process.env.MAIN_DB_PASSWORD,
        "database": process.env.MAIN_DB_NAME,
        "host": process.env.MAIN_DB_HOST,
        "dialect": process.env.MAIN_DB_ENGINE,
        "port": process.env.MAIN_DB_PORT
    },
    "test": {
        "username": process.env.MAIN_DB_USERNAME,
        "password": process.env.MAIN_DB_PASSWORD,
        "database": process.env.MAIN_DB_NAME,
        "host": process.env.MAIN_DB_HOST,
        "dialect": process.env.MAIN_DB_ENGINE,
        "port": process.env.MAIN_DB_PORT
    },
    "production": {
        "username": process.env.MAIN_DB_USERNAME,
        "password": process.env.MAIN_DB_PASSWORD,
        "database": process.env.MAIN_DB_NAME,
        "host": process.env.MAIN_DB_HOST,
        "dialect": process.env.MAIN_DB_ENGINE,
        "port": process.env.MAIN_DB_PORT
    }
}