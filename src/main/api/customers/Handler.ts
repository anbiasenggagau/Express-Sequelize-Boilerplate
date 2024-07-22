import { TokenPayload } from "../../middleware/Authentication";
import ErrorHandler from "../../middleware/ErrorHandler";
import CustomersRepo from "../../model/repository/CustomersRepo";
import { CreateAttributesBody, UpdateAttributesBody } from "./Request";

class CustomersHandler {
    private Repository = CustomersRepo
    async handleCreateCustomer(identity: TokenPayload, body: CreateAttributesBody) {
        const result = await this.Repository.findOrCreate(
            {
                UserId: identity.id
            },
            {
                Name: body.name,
                PhoneNumber: body.phoneNumber,
                Address: body.address,
                UserId: identity.id,
                CreatedBy: identity.id,
                UpdatedBy: identity.id
            })

        if (!result[1]) throw new ErrorHandler(400, "Already initialized your own")

        return result[0]
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