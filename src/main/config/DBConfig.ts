import { Dialect, CreateOptions, UpdateOptions, DestroyOptions, InstanceUpdateOptions, InstanceDestroyOptions, Transaction } from "sequelize"
import { Sequelize } from "sequelize-typescript"
import Logging from "./LoggingConfig"
import path from 'path'
import DataHistoryRepo from "../model/repository/DataHistoryRepo"
import { LoggingAttribute } from "../model/repository/.BaseRepository"
import ArrayUtility from "../utility/ArrayUtility"

type OverridingTransaction = { transaction: Transaction | undefined }
type DataBefore = { dataBefore: any[] }

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
        async afterCreate(attributes, options: CreateOptions & LoggingAttribute & OverridingTransaction) {
            if (options.logHistory === true || options.logHistory === undefined)
                await DataHistoryRepo.insertNewData(
                    {
                        modelName: attributes.constructor.name,
                        idModelName: attributes.dataValues.id,
                        valueAfter: attributes.dataValues,
                        updatedBy: options.identity?.username ?? "System"
                    },
                    {
                        transaction: options.transaction,
                        logHistory: false,
                        hooks: false
                    }
                )
        },

        async beforeBulkUpdate(options: UpdateOptions & LoggingAttribute & DataBefore & OverridingTransaction) {
            if (options.logHistory === true || options.logHistory === undefined) {
                const modelInstance = (this as any).sequelize.models[(this as any).name]
                const dataBefore = await modelInstance.findAll({
                    where: options.where,
                    order: [[modelInstance.primaryKeyAttribute, "DESC"]],
                    transaction: options.transaction,
                    paranoid: false,
                })
                options.dataBefore = dataBefore
            }
        },
        async afterBulkUpdate(options: UpdateOptions & LoggingAttribute & DataBefore & OverridingTransaction) {
            if (options.logHistory === true || options.logHistory === undefined) {
                const modelName = (this as any).name
                const modelInstance = (this as any).sequelize.models[modelName]
                const dataAfter = await modelInstance.findAll({
                    where: options.where,
                    order: [[modelInstance.primaryKeyAttribute, "DESC"]],
                    transaction: options.transaction,
                    paranoid: false,
                })

                if (dataAfter.length == 0) return
                if (!ArrayUtility.checkIfIdentical(
                    options.dataBefore.map((value: any) => ({
                        ...value.dataValues,
                        createdAt: value.dataValues.createdAt === null,
                        createdBy: value.dataValues.createdBy === null,
                        updatedAt: value.dataValues.updatedAt === null,
                        updatedBy: value.dataValues.updatedBy === null,
                        deletedAt: value.dataValues.deletedAt === null,
                        deletedBy: value.dataValues.deletedBy === null,
                    })),
                    dataAfter.map((value: any) => ({
                        ...value.dataValues,
                        createdAt: value.dataValues.createdAt === null,
                        createdBy: value.dataValues.createdBy === null,
                        updatedAt: value.dataValues.updatedAt === null,
                        updatedBy: value.dataValues.updatedBy === null,
                        deletedAt: value.dataValues.deletedAt === null,
                        deletedBy: value.dataValues.deletedBy === null,
                    }))
                )) {
                    await DataHistoryRepo.insertBulkData(
                        dataAfter.map((value: any, index: number) => {
                            return {
                                modelName: modelName,
                                idModelName: value.dataValues.id,
                                valueAfter: value.dataValues,
                                valueBefore: options.dataBefore[index].dataValues,
                                updatedBy: options.identity?.username ?? "System"
                            }
                        }),
                        {
                            transaction: options.transaction,
                            logHistory: false,
                        }
                    )
                }
                delete (options as any).dataBefore
            }
        },

        async afterUpdate(instance, options: InstanceUpdateOptions & LoggingAttribute & OverridingTransaction) {
            if (options.logHistory === true || options.logHistory === undefined)
                await DataHistoryRepo.insertNewData(
                    {
                        modelName: instance.constructor.name,
                        idModelName: instance.dataValues.id,
                        valueAfter: instance.dataValues,
                        valueBefore: (instance as any)._previousDataValues,
                        updatedBy: options.identity?.username ?? "System"
                    },
                    {
                        transaction: options.transaction,
                        logHistory: false,
                        hooks: false
                    }
                )
        },

        async beforeBulkDestroy(options: DestroyOptions & LoggingAttribute & DataBefore & OverridingTransaction) {
            if (options.logHistory === true || options.logHistory === undefined) {
                const modelInstance = (this as any).sequelize.models[(this as any).name]
                const dataBefore = await modelInstance.findAll({
                    where: options.where,
                    order: [[modelInstance.primaryKeyAttribute, "DESC"]],
                    transaction: options.transaction,
                    paranoid: false,
                })
                options.dataBefore = dataBefore
            }
        },
        async afterBulkDestroy(options: DestroyOptions & LoggingAttribute & DataBefore & OverridingTransaction) {
            if (options.dataBefore.length != 0 && options.logHistory === true || options.logHistory === undefined) {
                const modelName = (this as any).name
                await DataHistoryRepo.insertBulkData(
                    options.dataBefore.map((value: any, index: number) => {
                        return {
                            modelName: modelName,
                            idModelName: value.dataValues.id,
                            valueBefore: options.dataBefore[index].dataValues,
                            updatedBy: options.identity?.username ?? "System"
                        }
                    }),
                    {
                        transaction: options.transaction,
                        logHistory: false,
                        hooks: false
                    }
                )
            }
        },

        async afterDestroy(instance, options: InstanceDestroyOptions & LoggingAttribute & OverridingTransaction) {
            if (options.logHistory === true || options.logHistory === undefined)
                await DataHistoryRepo.insertNewData(
                    {
                        modelName: instance.constructor.name,
                        idModelName: instance.dataValues.id,
                        valueBefore: (instance as any)._previousDataValues,
                        updatedBy: options.identity?.username ?? "System"
                    },
                    {
                        transaction: options.transaction,
                        logHistory: false,
                        hooks: false
                    }
                )
        },

        async afterBulkCreate(instances, options) {
            // console.log(instances)
        },
        async beforeBulkCreate(instances, options) {
            // console.log(instances)
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