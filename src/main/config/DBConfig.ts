import { Dialect } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import Logging from "./LoggingConfig";
import path from 'path'

const DB: {
    instance: Sequelize
    afterConnect?: ((instance: Sequelize) => Promise<void> | void) | null
}[] = []

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
    },
    hooks: {
        beforeCreate(attributes, options) {
            console.log(attributes)
        },
        beforeBulkCreate(instances, options) {
            console.log(instances)
        },
        beforeUpdate(instance, options) {
            console.log(instance)
        },
        beforeBulkUpdate(options) {
            console.log(options)
        },
        beforeDestroy(instance, options) {
            console.log(instance)
        },
        beforeBulkDestroy(options) {
            console.log(options)
        },
    }
})

DB.push({
    instance: mainDb,
    afterConnect: async (instance) => {
        await instance.query(`            
            CREATE OR REPLACE FUNCTION generate_random_number(digits INT)
            RETURNS BIGINT AS $$
            DECLARE
            result BIGINT;
            BEGIN
            result := floor(random() * power(10, digits))::BIGINT;
            RETURN result;
            END;
            $$ LANGUAGE plpgsql;

            CREATE EXTENSION IF NOT EXISTS pgcrypto;
            CREATE OR REPLACE FUNCTION
            uuid_generate_v7()
            RETURNS
            uuid
            LANGUAGE
            plpgsql
            PARALLEL SAFE
            AS $$
            DECLARE
            unix_time_ms CONSTANT bytea NOT NULL DEFAULT substring(int8send((extract(epoch FROM clock_timestamp()) * 1000)::bigint) from 3);
            buffer                bytea NOT NULL DEFAULT unix_time_ms || gen_random_bytes(10);
            BEGIN
            buffer = set_byte(buffer, 6, (b'0111' || get_byte(buffer, 6)::bit(4))::bit(8)::int);
            buffer = set_byte(buffer, 8, (b'10'   || get_byte(buffer, 8)::bit(6))::bit(8)::int);
            RETURN encode(buffer, 'hex');
            END $$;
            `
        )
    }
})

export default DB