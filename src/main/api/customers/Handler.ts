import { TokenPayload } from "../../middleware/Authentication";
import CustomerRepo from "../../model/repository/CustomerRepo";
import { PaginationType } from "../.BaseController";
import { CreationAttributesBody, UpdateAttributesBody } from "./Request";

class CustomerHandler {
    private readonly customerRepo = CustomerRepo

    async handleCreateCustomer(identity: TokenPayload, body: CreationAttributesBody) {
        const result = await this.customerRepo.findOrCreate(
            { userId: identity.id },
            {
                ...body,
                userId: identity.id,
            },
            { identity }
        )

        return result
    }

    async handleUpdateCustomer(identity: TokenPayload, body: UpdateAttributesBody) {
        await this.customerRepo.updateData(
            {
                ...body
            },
            {
                where: { userId: identity.id },
                identity,
            })

        return true
    }

    async handleGetCustomersList(identity: TokenPayload, pagination: PaginationType) {
        return await this.customerRepo.getPaginationData(pagination)
    }
}

export default CustomerHandler