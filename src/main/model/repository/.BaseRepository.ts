import { BOOLEAN, DATE, DECIMAL, INTEGER, STRING, TEXT, BIGINT, SMALLINT, DOUBLE, FLOAT, Op, Order, Transaction, WhereOptions } from "sequelize"

type QueryOption<T> = {
    where: WhereOptions<T>,
    limit?: number,
    offset?: number,
    order?: Order,
    lock?: boolean,
    transaction?: Transaction,
    paranoid?: boolean
}

type PaginationQuery<T> = {
    where: WhereOptions<T>,
    order?: Order,
    lock?: boolean,
    transaction?: Transaction,
    paranoid?: boolean
}

type SingleQueryOption<T> = {
    where: WhereOptions<T>,
    lock?: boolean,
    transaction?: Transaction,
    paranoid?: boolean
}

type CountOption<T> = {
    where: WhereOptions<T>,
    paranoid?: boolean
}

type CreateOption = {
    transaction?: Transaction
}

type UpdateOption<T> = {
    where: WhereOptions<T>,
    transaction?: Transaction
}

type DeleteOption<T> = {
    where: WhereOptions<T>,
    transaction?: Transaction,
    force?: boolean
}

type RestoreOption<T> = {
    where: WhereOptions<T>,
    transaction?: Transaction
}

type PaginationType = {
    page: number
    pageSize: number,
    softDeleted?: boolean
}

abstract class BaseRepository<TModelInstance, TModelAttributes, TCreationAttributes,> {
    private model: any
    constructor(modelProperties: TModelInstance) {
        this.model = modelProperties
    }

    constructSearchQueryOnAllColumn(search: string) {
        const whereQuery: any = {}
        const keys = this.model.getAttributes()

        for (const key in keys) {
            if (key.toLowerCase() == "password") continue
            const value = keys[key as keyof typeof keys]!
            if (
                value.type instanceof STRING ||
                value.type instanceof TEXT
            ) whereQuery[key] = { [Op.like]: `%${search}%` }

            else if (value.type instanceof DATE && !isNaN(Date.parse(search))) {
                console.log("Date", key)
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
        }

        return { [Op.or]: whereQuery } as WhereOptions<TModelAttributes>
    }

    async insertNewData(CreationAttributes: TCreationAttributes, CreateOption?: CreateOption): Promise<TModelInstance> {
        return await this.model.create({ ...CreationAttributes }, { ...CreateOption, validate: true })
    }

    async getAllData(QueryOption: QueryOption<TModelAttributes>): Promise<TModelInstance[]> {
        return await this.model.findAll({ ...QueryOption })
    }

    async getSingleData(QueryOption: SingleQueryOption<TModelAttributes>): Promise<TModelInstance | null> {
        return await this.model.findOne({ ...QueryOption })
    }

    async getPaginationData(QueryOption: PaginationQuery<TModelAttributes>, pagination: PaginationType): Promise<{ rows: TModelInstance[], count: number }> {
        const paranoid = pagination.softDeleted ? !(pagination.softDeleted) : true
        return await this.model.findAndCountAll(
            {
                ...QueryOption,
                paranoid,
                limit: pagination.pageSize,
                offset: (pagination.page - 1) * pagination.pageSize,

            }
        )
    }

    async getAndCountData(QueryOption: QueryOption<TModelAttributes>): Promise<{ rows: TModelInstance[], count: number }> {
        return await this.model.findAndCountAll({ ...QueryOption })
    }

    async getCountData(CountOption: CountOption<TModelAttributes>): Promise<number> {
        return await this.model.count({ ...CountOption })
    }

    async updateData(CreationAttributes: Partial<TCreationAttributes>, UpdateOption: UpdateOption<TModelAttributes>): Promise<[affectedCount: number, affectedRows: TModelInstance[]]> {
        return await this.model.update({ ...CreationAttributes }, { ...UpdateOption, returning: true })
    }

    async deleteData(DeleteOption: DeleteOption<TModelAttributes>): Promise<number> {
        return await this.model.destroy({ ...DeleteOption })
    }

    async restoreData(RestoreOption: RestoreOption<TModelAttributes>): Promise<void> {
        return await this.model.restore({ ...RestoreOption })
    }
}

export default BaseRepository
