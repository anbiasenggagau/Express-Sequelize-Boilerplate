import express from "express"
import BaseController from "../.BaseController"
import ErrorHandler from "../../utility/ErrorHandler"
import AuthResponse from "./Response"
import { ValidationError } from "sequelize"
import { LoginAttributeBody, loginAttributeValidation } from "./Request"
import AuthHandler from "./Handler"

const app = express.Router()

class CustomersController extends BaseController {
    private response = new AuthResponse()
    private handler = new AuthHandler()

    router() {
        app.post("/login", loginAttributeValidation, async (req: express.Request, res: express.Response) => {
            try {
                super.validateRequest(req)
                const body: LoginAttributeBody = { ...req.body }

                const result = await this.handler.handleLogin(body)
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