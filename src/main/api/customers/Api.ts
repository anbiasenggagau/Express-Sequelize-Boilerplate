import express from "express"
import { CreateAttributesBody, UpdateAttributesBody, createAttributesValidation, updateAttributesValidation } from "./Request"
import CustomerHandler from "./Handler"
import BaseController from "../.BaseController"
import CustomerResponse from "./Response"

const app = express.Router()

class CustomerController extends BaseController {
    private readonly handler = new CustomerHandler()
    private readonly response = new CustomerResponse()

    router() {
        app.post("/customers", createAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: CreateAttributesBody = req.body
                const identity = super.getIdentity(req)

                const data = await this.handler.handleCreateCustomer(identity, body)
                return this.response.CreatedNewData(res, "Success", data.id)
            } catch (error) {
                next(error)
            }
        })

        app.get("/customers", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity = super.getIdentity(req)
                const pagination = super.initPagination(req)

                const result = await this.handler.handleGetCustomersList(identity, pagination)
                return this.response.OK(res, "Success", pagination, { data: result.rows, count: result.count })
            } catch (error) {
                next(error)
            }
        })

        app.put("/customers", updateAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const identity = super.getIdentity(req)
                const body: UpdateAttributesBody = req.body

                await this.handler.handleUpdateCustomer(identity, body)
                return this.response.OK(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        return app
    }
}

export default new CustomerController().router()