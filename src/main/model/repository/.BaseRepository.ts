import { BOOLEAN, DATE, DECIMAL, INTEGER, STRING, TEXT, BIGINT, SMALLINT, DOUBLE, FLOAT, Op, Order, Transaction, WhereOptions, Model, DATEONLY, Sequelize, ENUM, JSONB, JSON, FindAttributeOptions, ModelAttributeColumnOptions } from "sequelize"
import { ModelCtor } from "sequelize-typescript"
import { PaginationType } from "../../api/.BaseController"
import ErrorHandler from "../../middleware/ErrorHandler"

type QueryOption<T> = {
    where: WhereOptions<T>
    attributes?: FindAttributeOptions
    limit?: number
    offset?: number
    order?: Order
    lock?: boolean
    transaction?: Transaction
    paranoid?: boolean
}

type PaginationQuery<T> = {
    where?: WhereOptions<T>
    attributes?: FindAttributeOptions
    order?: Order
    lock?: boolean
    transaction?: Transaction
    paranoid?: boolean
    includeAllAttributes?: boolean
}

type SingleQueryOption<T> = {
    where: WhereOptions<T>
    order?: Order
    lock?: boolean
    transaction?: Transaction
}

type CountOption<T> = {
    where: WhereOptions<T>
    paranoid?: boolean
}

type CreateOption = {
    transaction?: Transaction
}

type UpdateOption<T> = {
    where: WhereOptions<T>
    transaction?: Transaction
}

type DeleteOption<T> = {
    where: WhereOptions<T>
    transaction?: Transaction
    force?: false
    simmulateForceDelete?: false
    additionalField?: any
} | {
    where: WhereOptions<T>
    transaction?: Transaction
    force: true
    /**
     * Simulate force delete so it can trigger "ON DELETE" event
     * that are defined on foreign key while also keep the record being soft deleted.
     * Transaction will be required if this option is true
    */
    simmulateForceDelete?: false
    additionalField?: any
} | {
    where: WhereOptions<T>
    transaction: Transaction
    force?: false
    /**
     * Simulate force delete so it can trigger "ON DELETE" event
     * that are defined on foreign key while also keep the record being soft deleted
     * Transaction will be required if this option is true
    */
    simmulateForceDelete: true
    additionalField?: any
}

type RestoreOption<T> = {
    where: WhereOptions<T>
    transaction?: Transaction
}

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
        return await this.model.create({ ...CreationAttributes }, { ...CreateOption, validate: true })
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

    async updateData(CreationAttributes: Partial<TCreationAttributes>, UpdateOption: UpdateOption<TModelAttributes>): Promise<[affectedCount: number, affectedRows: TModelInstance[]]> {
        return await this.model.update({ ...CreationAttributes }, { ...UpdateOption, returning: true })
    }

    async deleteData(DeleteOption: DeleteOption<TModelAttributes>): Promise<number> {
        if (DeleteOption.simmulateForceDelete === true) {
            if (this.model.options.paranoid === false)
                throw new ErrorHandler(500, "Unexpected behaviour. Model should implement paranoid")

            // Create save point
            const savePoint = this.model.sequelize.transaction({ transaction: DeleteOption.transaction })

            await this.model.destroy({
                ...DeleteOption,
                transaction: savePoint,
                force: true,
            })
            await savePoint.rollback()

            return await this.model.destroy({
                ...DeleteOption,
                force: false,
            })
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
