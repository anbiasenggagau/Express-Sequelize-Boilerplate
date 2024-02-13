import { Order, Transaction, WhereOptions } from "sequelize";

type QueryOption<T> = {
    where: WhereOptions<T>,
    limit?: number,
    offset?: number,
    order?: Order,
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

abstract class BaseRepository<T, ModelAttributes, CreationAttributes,> {
    private model: any
    constructor(modelProperties: T) {
        this.model = modelProperties
    }

    async insertNewData(CreationAttributes: CreationAttributes, CreateOption?: CreateOption) {
        await this.model.create({ ...CreationAttributes }, { ...CreateOption, validate: true })
    }

    async getAllData(QueryOption: QueryOption<ModelAttributes>): Promise<T[]> {
        return await this.model.findAll({ ...QueryOption })
    }

    async getAndCountData(QueryOption: QueryOption<ModelAttributes>): Promise<{ rows: T[], count: number }> {
        return await this.model.findAndCountAll({ ...QueryOption })
    }

    async getCountData(CountOption: CountOption<ModelAttributes>): Promise<number> {
        return await this.model.count({ ...CountOption })
    }

    async updateData(CreationAttributes: CreationAttributes, UpdateOption: UpdateOption<ModelAttributes>) {
        await this.model.update({ ...CreationAttributes }, { ...UpdateOption })
    }

    async deleteData(DeleteOption: DeleteOption<ModelAttributes>) {
        await this.model.destroy({ ...DeleteOption })
    }
}

export default BaseRepository


