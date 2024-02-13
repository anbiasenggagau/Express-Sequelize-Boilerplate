import express from "express"
import { CreateAttributesBody, createAttributesValidation } from "./Request"
import { TokenPayload } from "../../middleware/Authentication"
import CustomersHandler from "./Handler"
import BaseResponse from "../.BaseResponse"
import BaseController from "../.BaseController"
import CustomersResponse from "./Response"

const app = express.Router()

class CustomersController extends BaseController {
    private handler = new CustomersHandler()
    private response = CustomersResponse

    router() {
        app.post("/customers", createAttributesValidation, async (req: express.Request, res: express.Response) => {
            super.validateRequest(req, res)
            try {
                const body: CreateAttributesBody = { ...req.body }
                const identity: TokenPayload = req.user

                await this.handler.handleCreateCustomer(identity, body)
                return this.response.CreatedNewData("Success", res)
            } catch (error: any) {
                console.log(error)
                return this.response.BadRequest("Error Occured : " + error.message, res)
            }
        })

        app.get("/customers", async (req: express.Request, res: express.Response) => {
            try {
                const identity: TokenPayload = req.user

                const result = await this.handler.handleGetAllCustomers(identity)
                return CustomersResponse.OKWithData("Success", result, res)
            } catch (error: any) {
                console.log(error)
                return BaseResponse.BadRequest("Error Occured : " + error.message, res)
            }
        })

        return app
    }
}

export default new CustomersController().router()