import { BOOLEAN, DATE, DECIMAL, INTEGER, STRING, TEXT, BIGINT, SMALLINT, DOUBLE, FLOAT, Op, Order, Transaction, WhereOptions, Model, DATEONLY, Sequelize, ENUM, JSONB, JSON, FindAttributeOptions, ModelAttributeColumnOptions } from "sequelize"
import { ModelCtor } from "sequelize-typescript"
import { PaginationType } from "../../api/.BaseController"
import ErrorHandler from "../../middleware/ErrorHandler"
import { Col, Fn, Literal } from "sequelize/lib/utils"

type UnionAllFieldWithNewTypes<T, U extends any[]> = {
    [K in keyof T]: T[K] | U[number];
}

export type LoggingAttribute = {
    /**
     * createdBy or updatedBy will be filled based on token payload.
     * Will be replaced if createdBy or updatedBy is defined.
     */
    identity?: { username: string }
    /**
     * Will create a logging data for all changes to data_history table.
     * The default value will be true
     */
    logHistory?: boolean
}

type QueryOption<T> = {
    where: WhereOptions<T>
    attributes?: FindAttributeOptions
    limit?: number
    offset?: number
    order?: Order
    lock?: boolean
    transaction?: Transaction | null
    paranoid?: boolean
}

type PaginationQuery<T> = {
    where?: WhereOptions<T>
    attributes?: FindAttributeOptions
    order?: Order
    lock?: boolean
    transaction?: Transaction | null
    paranoid?: boolean
    includeAllAttributes?: boolean
}

type SingleQueryOption<T> = {
    where: WhereOptions<T>
    order?: Order
    lock?: boolean
    transaction?: Transaction | null
}

type CountOption<T> = {
    where: WhereOptions<T>
    paranoid?: boolean
}

type CreateOption = {
    transaction?: Transaction | null
    hooks?: boolean
} & LoggingAttribute

type CreateBulkOption<T> = {
    updateOnDuplicate?: (keyof T)[] | boolean
    transaction?: Transaction | null
    conflictAttributes?: (keyof T)[]
    hooks?: boolean
} & LoggingAttribute

type UpdateOption<T> = {
    where: WhereOptions<T>
    transaction?: Transaction | null
} & LoggingAttribute

type DeleteOption<T> = ({
    where: WhereOptions<T>
    transaction?: Transaction | null
    force?: boolean
    simmulateForceDelete?: boolean
} | {
    where: WhereOptions<T>
    transaction?: Transaction | null
    force: true
    /**
     * Simulate force delete so it can trigger "ON DELETE" event
     * that are defined on foreign key while also keep the record being soft deleted.
    */
    simmulateForceDelete?: false
} | {
    where: WhereOptions<T>
    transaction?: Transaction | null
    force?: false
    /**
     * Simulate force delete so it can trigger "ON DELETE" event
     * that are defined on foreign key while also keep the record being soft deleted
    */
    simmulateForceDelete: true
}) & LoggingAttribute

type RestoreOption<T> = {
    where: WhereOptions<T>
    transaction?: Transaction | null
} & LoggingAttribute

interface ModelInstance<T> {
    new(): T
    [key: string]: any
}

abstract class BaseRepository<TModelInstance extends Model, TModelAttributes, TCreationAttributes,> {
    readonly model: ModelInstance<TModelInstance>
    constructor(modelInstance: ModelInstance<TModelInstance>) {
        this.model = modelInstance
    }

    getAllAttributes(): {
        readonly [Key in keyof TModelAttributes]: ModelAttributeColumnOptions & { Model: ModelCtor }
    } {
        return this.model.getAttributes()
    }

    constructSearchQueryOnAllColumn(search: string) {
        const whereQuery: any = {}
        const keys = this.getAllAttributes()

        for (const key in keys) {
            if (key.toLowerCase() == "password") continue
            const value = keys[key]
            if (
                value.type instanceof STRING ||
                value.type instanceof TEXT
            ) whereQuery[key] = { [Op.iLike]: `%${search}%` }

            else if ((value.type instanceof DATE || value.type instanceof DATEONLY) && !isNaN(Date.parse(search))) {
                const date1 = new Date(search)
                const date2 = new Date(search)
                date1.setHours(0, 0, 0, 0)
                date2.setHours(24, 0, 0, 0)

                whereQuery[key] = { [Op.between]: [date1, date2] }
            }

            else if (
                (value.type instanceof INTEGER ||
                    value.type instanceof BIGINT ||
                    value.type instanceof SMALLINT ||
                    value.type instanceof DECIMAL ||
                    value.type instanceof DOUBLE ||
                    value.type instanceof FLOAT) &&
                (!isNaN(parseInt(search)))
            ) whereQuery[key] = parseInt(search)

            else if (value.type instanceof BOOLEAN && (search == "true" || search == "false"))
                whereQuery[key] = search == "true"

            else if (value.type instanceof JSONB || value.type instanceof JSON || value.type instanceof ENUM)
                whereQuery[key] = Sequelize.where(Sequelize.cast(Sequelize.col(`${value.Model.name}.${value.field}`), "TEXT"), { [Op.iLike]: `%${search}%` })
        }

        return { [Op.or]: whereQuery } as WhereOptions<TModelAttributes>
    }

    async startTransaction(option?: { transaction?: Transaction }): Promise<Transaction> {
        return await this.model.sequelize.transaction({ ...option })
    }

    async insertNewData(CreationAttributes: TCreationAttributes, CreateOption?: CreateOption): Promise<TModelInstance> {
        const attributes = Object.keys(this.getAllAttributes())
        const defaultOptions = { logHistory: true }

        CreateOption = { ...defaultOptions, ...CreateOption }
        if ((CreationAttributes as any)["createdBy"])
            CreateOption.identity = { username: (CreationAttributes as any)["createdBy"] }
        else if ((CreationAttributes as any)["updatedBy"])
            CreateOption.identity = { username: (CreationAttributes as any)["updatedBy"] }

        CreationAttributes = {
            ...CreationAttributes,
            createdBy: attributes.includes("createdBy") ? CreateOption?.identity?.username : undefined,
            updatedBy: attributes.includes("updatedBy") ? CreateOption?.identity?.username : undefined,
        }
        return await this.model.create(CreationAttributes, CreateOption)
    }

    async insertBulkData(CreationAttributes: TCreationAttributes[], CreateOption?: CreateBulkOption<TModelAttributes>): Promise<TModelInstance[]> {
        if (CreationAttributes.length == 0) return []
        const attributes = Object.keys(this.getAllAttributes())
        const fieldCreateExist = attributes.includes("createdBy")
        const fieldUpdateExist = attributes.includes("updatedBy")
        let replaced = false
        const defaultOptions = {
            logHistory: true,
            conflictAttributes: [this.model.primaryKeyAttribute]
        }
        CreateOption = { ...defaultOptions, ...CreateOption }
        if (CreateOption.updateOnDuplicate === true) {
            CreateOption.updateOnDuplicate = Object.keys(this.getAllAttributes()) as (keyof TModelAttributes)[]
        }

        if ((CreationAttributes[0] as any)["createdBy"]) {
            CreateOption.identity = { username: (CreationAttributes[0] as any)["createdBy"] }
            replaced = true
        }

        if ((!replaced && CreateOption.identity) && (fieldCreateExist || fieldUpdateExist))
            for (const [index, _] of CreationAttributes.entries()) {
                (CreationAttributes[index] as any).createdBy = fieldCreateExist ? CreateOption.identity.username : (CreationAttributes[index] as any).createdBy;
                (CreationAttributes[index] as any).updatedBy = fieldUpdateExist ? CreateOption.identity.username : (CreationAttributes[index] as any).updatedBy;
            }

        return await this.model.bulkCreate(CreationAttributes, { ...CreateOption, validate: true })
    }

    async getAllData(QueryOption: QueryOption<TModelAttributes>): Promise<TModelInstance[]> {
        return await this.model.findAll({ ...QueryOption })
    }

    async getSingleData(QueryOption: SingleQueryOption<TModelAttributes>): Promise<TModelInstance | null> {
        return await this.model.findOne({ ...QueryOption, paranoid: false })
    }

    async getPaginationData(pagination: PaginationType, QueryOption?: PaginationQuery<TModelAttributes>,): Promise<{ rows: TModelInstance[], count: number }> {
        const paranoid = pagination.softDeleted ? !(pagination.softDeleted) : true

        if (!QueryOption) QueryOption = {}
        let exclude: string[] = []
        if (!QueryOption.includeAllAttributes && !QueryOption.attributes) {
            exclude = ["createdAt", "createdBy", "updatedAt", "updatedBy", "deletedBy", "deletedAt"]
                .filter(value =>
                    Object
                        .keys(this.getAllAttributes())
                        .includes(value)
                )
            if (!paranoid)
                exclude = exclude.filter(value => value != "deletedAt")

            QueryOption.attributes = { exclude: exclude, include: [] }
        }
        if (!QueryOption.order) QueryOption.order = [[this.model.primaryKeyAttribute, "DESC"]]

        if (pagination.search) QueryOption.where = {
            ...QueryOption.where,
            ...this.constructSearchQueryOnAllColumn(pagination.search)
        }

        return await this.model.findAndCountAll(
            {
                ...QueryOption,
                paranoid,
                limit: pagination.pageSize,
                offset: (pagination.page - 1) * pagination.pageSize,
            }
        )
    }

    async getCountData(CountOption: CountOption<TModelAttributes>): Promise<number> {
        return await this.model.count({ ...CountOption })
    }

    async updateData(UpdateAttributes: UnionAllFieldWithNewTypes<Partial<TCreationAttributes>, [Literal, Fn, Col]>, UpdateOption: UpdateOption<TModelAttributes>): Promise<[affectedCount: number, affectedRows: TModelInstance[]]> {
        let fieldExist = false
        if (UpdateOption.logHistory == undefined) UpdateOption.logHistory = true
        if ((UpdateAttributes as any)["updatedBy"]) {
            UpdateOption.identity = { username: (UpdateAttributes as any)["updatedBy"] }
            fieldExist = true
        }

        UpdateAttributes = {
            ...UpdateAttributes,
            updatedBy: fieldExist || Object.keys(this.getAllAttributes()).includes("updatedBy") ? UpdateOption?.identity?.username : undefined,
        }
        return await this.model.update({ ...UpdateAttributes }, { ...UpdateOption, returning: true })
    }

    async deleteData(DeleteOption: DeleteOption<TModelAttributes>): Promise<number> {
        const fieldExist = Object.keys(this.getAllAttributes()).includes("deletedBy")
        if (DeleteOption.logHistory == undefined) DeleteOption.logHistory = true

        if (DeleteOption.simmulateForceDelete === true) {
            if (this.model.options.paranoid === false)
                throw new ErrorHandler(500, "Unexpected behaviour. Model should implement paranoid")

            // Create save point
            let savePoint: Transaction | undefined = undefined
            if (DeleteOption.transaction)
                savePoint = await this.startTransaction({ transaction: DeleteOption.transaction })
            else savePoint = await this.startTransaction()

            await this.model.destroy({
                ...DeleteOption,
                transaction: savePoint,
                force: true,
            })
            await savePoint.rollback()

            const updateAttributes = {
                deletedBy: fieldExist ? DeleteOption.identity?.username : undefined,
                deletedAt: new Date(),
            }
            const [result, _] = await this.model.update(
                { ...updateAttributes },
                {
                    ...DeleteOption,
                    force: false,
                    paranoid: false,
                })

            return result
        }

        if (this.model.options.paranoid === true && !DeleteOption.force) {
            const updateAttributes = {
                deletedBy: fieldExist ? DeleteOption.identity?.username : undefined,
                deletedAt: new Date(),
            }
            const [result, _] = await this.model.update(
                { ...updateAttributes },
                {
                    ...DeleteOption,
                    paranoid: false,
                })

            return result
        }

        return await this.model.destroy({
            ...DeleteOption,
        })
    }

    async restoreData(RestoreOption: RestoreOption<TModelAttributes>): Promise<void> {
        return await this.model.restore({ ...RestoreOption })
    }
}

export default BaseRepository
