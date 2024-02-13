import express from "express"
import { CreateAttributesBody, createAttributesValidation } from "./Request"
import { TokenPayload } from "../../middleware/Authentication"
import CustomersHandler from "./Handler"
import BaseController from "../.BaseController"
import CustomersResponse from "./Response"
import ErrorHandler from "../../middleware/ErrorHandler"

const app = express.Router()

class CustomersController extends BaseController {
    private handler = new CustomersHandler()
    private response = new CustomersResponse()

    router() {
        app.post("/customers", createAttributesValidation, async (req: express.Request, res: express.Response) => {
            super.validateRequest(req, res)
            try {
                const body: CreateAttributesBody = { ...req.body }
                const identity: TokenPayload = req.user

                await this.handler.handleCreateCustomer(identity, body)
                return this.response.CreatedNewData("Success", res)
            } catch (error) {
                console.log(error)
                if (error instanceof ErrorHandler)
                    return this.response.handleErrorStatusCode(error.statusCode, error.message, res, error.errorValidationList)
                else
                    return this.response.InternalServerError(res)
            }
        })

        app.get("/customers", async (req: express.Request, res: express.Response) => {
            try {
                const identity: TokenPayload = req.user

                const result = await this.handler.handleGetAllCustomers(identity)
                return this.response.OKWithData("Success", result, res)
            } catch (error) {
                console.log(error)
                if (error instanceof ErrorHandler)
                    return this.response.handleErrorStatusCode(error.statusCode, error.message, res, error.errorValidationList)
                else
                    return this.response.InternalServerError(res)
            }
        })

        return app
    }
}

export default new CustomersController().router()