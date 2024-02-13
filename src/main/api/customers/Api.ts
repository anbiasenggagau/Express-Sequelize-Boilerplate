import express from "express"
import { CreateAttributesBody, createAttributesValidation } from "./Request"
import { TokenPayload } from "../../middleware/Authentication"
import CustomersHandler from "./Handler"
import BaseController from "../.BaseController"
import CustomersResponse from "./Response"
import ErrorHandler from "../../utility/ErrorHandler"
import { ValidationError } from "sequelize"

const app = express.Router()

class CustomersController extends BaseController {
    private handler = new CustomersHandler()
    private response = new CustomersResponse()

    router() {
        app.post("/customers", createAttributesValidation, async (req: express.Request, res: express.Response) => {
            try {
                super.validateRequest(req)
                const body: CreateAttributesBody = { ...req.body }
                const identity: TokenPayload = req.user

                await this.handler.handleCreateCustomer(identity, body)
                return this.response.CreatedNewData("Success", res)
            } catch (error) {
                console.log(error)
                if (error instanceof ErrorHandler)  // Handle error from manually threw error
                    return this.response.handleErrorStatusCode(error.statusCode, error.message, res, error.errorValidationList)
                if (error instanceof ValidationError)   // Handle error from sequelize
                    return this.response.BadRequest(error.errors[0].message, res)
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
                if (error instanceof ErrorHandler)  // Handle error from manually threw error
                    return this.response.handleErrorStatusCode(error.statusCode, error.message, res, error.errorValidationList)
                if (error instanceof ValidationError)   // Handle error from sequelize
                    return this.response.BadRequest(error.errors[0].message, res)
                else
                    return this.response.InternalServerError(res)
            }
        })

        return app
    }
}

export default new CustomersController().router()