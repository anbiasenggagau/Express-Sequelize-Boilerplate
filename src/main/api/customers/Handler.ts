import { TokenPayload } from "../../middleware/Authentication";
import CustomersRepo from "../../model/repository/MainRepository/CustomersRepo";
import { CreateAttributesBody, UpdateAttributesBody } from "./Request";

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

    async handleUpdateCustomers(identity: TokenPayload, body: UpdateAttributesBody) {
        await this.Repository.updateData({
            Address: body.address,
            Name: body.name,
            PhoneNumber: body.phoneNumber,
            UpdatedBy: identity.id
        },
            {
                where: {
                    UserId: identity.id
                }
            })

        return true
    }
}

export default CustomersHandler