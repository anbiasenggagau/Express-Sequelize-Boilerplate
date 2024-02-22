import express from "express"
import { CreateAttributesBody, UpdateAttributesBody, createAttributesValidation, updateAttributesValidation } from "./Request"
import { TokenPayload } from "../../middleware/Authentication"
import CustomersHandler from "./Handler"
import BaseController from "../.BaseController"
import CustomersResponse from "./Response"

const app = express.Router()

class CustomersController extends BaseController {
    private handler = new CustomersHandler()
    private response = new CustomersResponse()

    router() {
        app.post("/customers", createAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: CreateAttributesBody = { ...req.body }
                const identity: TokenPayload = req.user

                await this.handler.handleCreateCustomer(identity, body)
                return this.response.CreatedNewData("Success", res)
            } catch (error) {
                next(error)
            }
        })

        app.get("/customers", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity: TokenPayload = req.user

                const result = await this.handler.handleGetAllCustomers(identity)
                return this.response.OKWithData("Success", result, res)
            } catch (error) {
                next(error)
            }
        })

        app.put("/customers", updateAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const identity: TokenPayload = req.user
                const body: UpdateAttributesBody = { ...req.body }

                await this.handler.handleUpdateCustomers(identity, body)
                return this.response.OKWithEmptyData("Success", res)
            } catch (error) {
                next(error)
            }
        })

        return app
    }
}

export default new CustomersController().router()