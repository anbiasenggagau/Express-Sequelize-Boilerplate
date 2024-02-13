import Customers, { CustomersAttributes, CustomersCreationAttributes } from "../entity/MainDatabase/Customers";
import BaseRepository from "./.BaseRepository";

class CustomersRepo extends BaseRepository<Customers, CustomersAttributes, CustomersCreationAttributes> {

}

export default new CustomersRepo(Customers as any)