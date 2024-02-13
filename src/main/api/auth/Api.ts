import express from "express"
import BaseController from "../.BaseController"
import ErrorHandler from "../../middleware/ErrorHandler"
import AuthResponse from "./Response"

const app = express.Router()

class CustomersController extends BaseController {
    private response = new AuthResponse()

    router() {
        app.post("/login", async (req: express.Request, res: express.Response) => {
            try {
                return this.response.OKWithEmptyData("Success", res)
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