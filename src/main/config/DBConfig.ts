import { Dialect, Model, CreateOptions, UpdateOptions, DestroyOptions, BulkCreateOptions, InstanceUpdateOptions, InstanceDestroyOptions, Op } from "sequelize"
import { Sequelize } from "sequelize-typescript"
import Logging from "./LoggingConfig"
import path from 'path'
import DataHistoryRepo from "../model/repository/DataHistoryRepo"
import { LoggingAttribute } from "../model/repository/.BaseRepository"
import ArrayUtility from "../utility/ArrayUtility"
import { DataHistoryCreationAttributes } from "../model/entity/DataHistory"
import ObjectUtility from "../utility/ObjectUtility"

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
        // Handle Data History on Bulk Creation
        async beforeBulkCreate(instances, options: BulkCreateOptions & LoggingAttribute & DataBefore) {
            // Save data before update only of updateOnDuplicate
            if (
                (options.logHistory === true || options.logHistory === undefined) &&
                (options.updateOnDuplicate && options.updateOnDuplicate.length > 0)
            ) {
                const modelInstance = instances[0].constructor as any
                const allWhereClause = []
                for (const instance of instances) {
                    const whereClause: any = {}
                    for (const key of options.conflictAttributes!) {
                        whereClause[key] = instance.dataValues[key]
                    }
                    allWhereClause.push(whereClause)
                }
                const dataBefore = await modelInstance.findAll({
                    where: { [Op.or]: allWhereClause },
                    transaction: options.transaction
                })
                options.dataBefore = dataBefore
            }
        },
        async afterBulkCreate(instances: Model[], options: BulkCreateOptions & LoggingAttribute & DataBefore) {
            if (options.logHistory === true || options.logHistory === undefined) {
                const modelInstance = instances[0].constructor as any
                const modelName = modelInstance.name
                const dataBeforeMap = options.dataBefore ? ArrayUtility.transformIntoHashMap(options.dataBefore, "id") : {}
                const creationAttributes: DataHistoryCreationAttributes[] = instances.map(value => {
                    // Ignore if the instance is not created due to duplicate data
                    if (!value.dataValues.id) return undefined

                    const creationAttribute: DataHistoryCreationAttributes = {
                        modelName: modelName,
                        idModelName: value.dataValues.id,
                        valueAfter: value.dataValues,
                        valueBefore: dataBeforeMap[value.dataValues.id]?.dataValues ?? null,
                        updatedBy: options.identity?.username ?? "System",
                    }
                    // If there are no changes done, don't store it
                    if (creationAttribute.valueBefore && ObjectUtility.isObjectEqual(
                        {
                            ...creationAttribute.valueAfter,
                            createdAt: (creationAttribute.valueAfter as any).createdAt === null,
                            createdBy: (creationAttribute.valueAfter as any).createdBy === null,
                            updatedAt: (creationAttribute.valueAfter as any).updatedAt === null,
                            updatedBy: (creationAttribute.valueAfter as any).updatedBy === null,
                            deletedAt: (creationAttribute.valueAfter as any).deletedAt === null,
                            deletedBy: (creationAttribute.valueAfter as any).deletedBy === null,
                        },
                        {
                            ...creationAttribute.valueBefore,
                            createdAt: (creationAttribute.valueBefore as any).createdAt === null,
                            createdBy: (creationAttribute.valueBefore as any).createdBy === null,
                            updatedAt: (creationAttribute.valueBefore as any).updatedAt === null,
                            updatedBy: (creationAttribute.valueBefore as any).updatedBy === null,
                            deletedAt: (creationAttribute.valueBefore as any).deletedAt === null,
                            deletedBy: (creationAttribute.valueBefore as any).deletedBy === null,
                        }
                    )) return undefined
                    return creationAttribute
                }).filter(value => value != undefined)

                await DataHistoryRepo.insertBulkData(
                    creationAttributes,
                    {
                        transaction: options.transaction,
                        logHistory: false,
                        hooks: false,
                    }
                )

                delete (options as any).dataBefore
            }
        },

        // Handle Data History on Create method
        async afterCreate(attributes, options: CreateOptions & LoggingAttribute) {
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

        // Handle Data History on Bulk Update method
        async beforeBulkUpdate(options: UpdateOptions & LoggingAttribute & DataBefore) {
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
        async afterBulkUpdate(options: UpdateOptions & LoggingAttribute & DataBefore) {
            if (options.logHistory === true || options.logHistory === undefined) {
                const modelName = (this as any).name
                const modelInstance = (this as any).sequelize.models[modelName]
                const dataAfter = await modelInstance.findAll({
                    where: options.where,
                    order: [[modelInstance.primaryKeyAttribute, "DESC"]],
                    transaction: options.transaction,
                    paranoid: false,
                }) as any[]

                const creationAttributes: DataHistoryCreationAttributes[] = dataAfter.map((value, index) => {
                    const creationAttribute: DataHistoryCreationAttributes = {
                        modelName: modelName,
                        idModelName: value.dataValues.id,
                        valueAfter: value.dataValues,
                        valueBefore: options.dataBefore[index].dataValues,
                        updatedBy: options.identity?.username ?? "System"
                    }
                    // If there are no changes done, don't store it
                    if (ObjectUtility.isObjectEqual(
                        {
                            ...creationAttribute.valueAfter,
                            createdAt: (creationAttribute.valueAfter as any).createdAt === null,
                            createdBy: (creationAttribute.valueAfter as any).createdBy === null,
                            updatedAt: (creationAttribute.valueAfter as any).updatedAt === null,
                            updatedBy: (creationAttribute.valueAfter as any).updatedBy === null,
                            deletedAt: (creationAttribute.valueAfter as any).deletedAt === null,
                            deletedBy: (creationAttribute.valueAfter as any).deletedBy === null,
                        },
                        {
                            ...creationAttribute.valueBefore,
                            createdAt: (creationAttribute.valueBefore as any).createdAt === null,
                            createdBy: (creationAttribute.valueBefore as any).createdBy === null,
                            updatedAt: (creationAttribute.valueBefore as any).updatedAt === null,
                            updatedBy: (creationAttribute.valueBefore as any).updatedBy === null,
                            deletedAt: (creationAttribute.valueBefore as any).deletedAt === null,
                            deletedBy: (creationAttribute.valueBefore as any).deletedBy === null,
                        }
                    )) return undefined
                    return creationAttribute
                }).filter(value => value != undefined)

                await DataHistoryRepo.insertBulkData(
                    creationAttributes,
                    {
                        transaction: options.transaction,
                        logHistory: false,
                        hooks: false,
                    }
                )

                delete (options as any).dataBefore
            }
        },

        // Handle Data History on Update method
        async afterUpdate(instance, options: InstanceUpdateOptions & LoggingAttribute) {
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

        // Handle Data History on Bulk Destroy method
        async beforeBulkDestroy(options: DestroyOptions & LoggingAttribute & DataBefore) {
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
        async afterBulkDestroy(options: DestroyOptions & LoggingAttribute & DataBefore) {
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

                delete (options as any).dataBefore
            }
        },

        // Handle Data History on Destroy method
        async afterDestroy(instance, options: InstanceDestroyOptions & LoggingAttribute) {
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