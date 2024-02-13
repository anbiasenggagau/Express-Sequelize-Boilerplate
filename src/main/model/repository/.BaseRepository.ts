import { Order, Transaction, WhereOptions } from "sequelize";

type QueryOption<T> = {
    where: WhereOptions<T>,
    limit?: number,
    offset?: number,
    order?: Order,
    lock?: boolean,
    transaction?: Transaction
}

type SingleQueryOption<T> = {
    where: WhereOptions<T>,
    lock?: boolean,
    transaction?: Transaction
}

type CountOption<T> = {
    where: WhereOptions<T>
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
    transaction?: Transaction
}

abstract class BaseRepository<TModelInstance, TModelAttributes, TCreationAttributes,> {
    private model: any
    constructor(modelProperties: TModelInstance) {
        this.model = modelProperties
    }

    async insertNewData(CreationAttributes: TCreationAttributes, CreateOption?: CreateOption) {
        await this.model.create({ ...CreationAttributes }, { ...CreateOption, validate: true })
    }

    async getAllData(QueryOption: QueryOption<TModelAttributes>): Promise<TModelInstance[]> {
        return await this.model.findAll({ ...QueryOption })
    }

    async getSingleData(QueryOption: SingleQueryOption<TModelAttributes>): Promise<TModelInstance | null> {
        return await this.model.findOne({ ...QueryOption })
    }

    async getAndCountData(QueryOption: QueryOption<TModelAttributes>): Promise<{ rows: TModelInstance[], count: number }> {
        return await this.model.findAndCountAll({ ...QueryOption })
    }

    async getCountData(CountOption: CountOption<TModelAttributes>): Promise<number> {
        return await this.model.count({ ...CountOption })
    }

    async updateData(CreationAttributes: Partial<TCreationAttributes>, UpdateOption: UpdateOption<TModelAttributes>): Promise<[affectedCount: number, affectedRows: TModelInstance[]]> {
        return await this.model.update({ ...CreationAttributes }, { ...UpdateOption })
    }

    async deleteData(DeleteOption: DeleteOption<TModelAttributes>) {
        await this.model.destroy({ ...DeleteOption })
    }
}

export default BaseRepository


