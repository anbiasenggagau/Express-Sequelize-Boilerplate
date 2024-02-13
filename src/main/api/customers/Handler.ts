import { TokenPayload } from "../../middleware/Authentication";
import ErrorHandler from "../../middleware/ErrorHandler";
import CustomersRepo from "../../model/repository/CustomersRepo";
import { CreateAttributesBody } from "./Request";

class CustomersHandler {
    private Repository = CustomersRepo
    async handleCreateCustomer(identity: TokenPayload, body: CreateAttributesBody) {
        await this.Repository.insertNewData(
            {
                Name: body.name,
                PhoneNumber: body.phoneNumber,
                Address: body.address,
                Email: body.email,
                CreatedBy: identity.id,
                UpdatedBy: identity.id
            }
        ).catch((error) => {
            throw new ErrorHandler(400, error.message)
        })
        return true
    }

    async handleGetAllCustomers(identity: TokenPayload) {
        return await this.Repository.getAllData(
            {
                where: {},
            }
        ).catch((error) => {
            throw new ErrorHandler(400, error.message)
        })
    }
}

export default CustomersHandler