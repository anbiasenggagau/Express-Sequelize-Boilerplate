import { TokenPayload } from "../../middleware/Authentication";
import ErrorHandler from "../../middleware/ErrorHandler";
import CustomerRepo from "../../model/repository/CustomerRepo";
import { PaginationType } from "../.BaseController";
import { CreateAttributesBody, UpdateAttributesBody } from "./Request";

class CustomerHandler {
    private readonly customerRepo = CustomerRepo

    async handleCreateCustomer(identity: TokenPayload, body: CreateAttributesBody) {
        const result = await this.customerRepo.findOrCreate(
            {
                userId: identity.id
            },
            {
                ...body,
                userId: identity.id
            })

        if (!result[1]) throw new ErrorHandler(400, "Already initialized your own")

        return result[0]
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