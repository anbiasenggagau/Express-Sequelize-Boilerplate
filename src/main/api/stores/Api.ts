import express from "express"
import BaseController from "../.BaseController"
import StoresHandler from "./Handler"
import { CreateAttributeBody, UpdateAttributeValidation, createAttributesValidation, updateAttributeValidation } from "./Request"
import { TokenPayload } from "../../middleware/Authentication"
import StoresResponse from "./Response"

const app = express.Router()

class StoresController extends BaseController {
    private handler = new StoresHandler()
    private response = new StoresResponse()

    router() {
        app.post("/stores", createAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: CreateAttributeBody = { ...req.body }
                const identity: TokenPayload = req.user

                const data = await this.handler.handleCreateStores(identity, body)
                return this.response.CreatedNewData(res, "Success", data.Id)
            } catch (error) {
                next(error)
            }
        })

        app.put("/stores", updateAttributeValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: UpdateAttributeValidation = { ...req.body }
                const identity: TokenPayload = req.user

                await this.handler.handleUpdateStores(identity, body)
                return this.response.OKWithEmptyData(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        app.get("/stores", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const identity: TokenPayload = req.user

                const result = await this.handler.handleGetAllProducts(identity)
                return this.response.OKWithData(res, "Success", result)
            } catch (error) {
                next(error)
            }
        })


        return app
    }
}

export default new StoresController().router()