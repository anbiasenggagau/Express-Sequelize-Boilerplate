import { TokenPayload } from "../../middleware/Authentication";
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
                UserId: identity.id,
                CreatedBy: identity.id,
                UpdatedBy: identity.id
            }
        )

        return true
    }

    async handleGetAllCustomers(identity: TokenPayload) {
        return await this.Repository.getAllData(
            {
                where: {},
            }
        )
    }
}

export default CustomersHandler