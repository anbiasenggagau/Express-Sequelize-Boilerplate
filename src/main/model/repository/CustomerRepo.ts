import { Transaction, WhereOptions } from "sequelize";
import Customer, { CustomerAttributes, CustomerCreationAttributes } from "../entity/Customer";
import BaseRepository, { LoggingAttribute } from "./.BaseRepository";

type FindOrCreateOptions = {
    transaction?: Transaction
} & LoggingAttribute

class CustomerRepo extends BaseRepository<Customer, CustomerAttributes, CustomerCreationAttributes> {
    async findOrCreate(whereQuery: WhereOptions<CustomerAttributes>, valueCreation: CustomerCreationAttributes, options?: FindOrCreateOptions) {
        const storeData = await Customer.findOne({
            where: { ...whereQuery },
            ...options,
        })
        if (storeData) return storeData

        return await this.insertNewData(valueCreation, options)
    }
}

export default new CustomerRepo(Customer)