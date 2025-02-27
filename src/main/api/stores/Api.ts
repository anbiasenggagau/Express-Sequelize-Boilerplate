import express from "express"
import BaseController from "../.BaseController"
import StoreHandler from "./Handler"
import { CreateAttributeBody, UpdateAttributeValidation, createAttributesValidation, updateAttributeValidation } from "./Request"
import StoreResponse from "./Response"

const app = express.Router()

class StoreController extends BaseController {
    private readonly handler = new StoreHandler()
    private readonly response = new StoreResponse()

    router() {
        app.post("/stores", createAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: CreateAttributeBody = req.body
                const identity = super.getIdentity(req)

                const data = await this.handler.handleCreateStore(identity, body)
                return this.response.CreatedNewData(res, "Success", data.id)
            } catch (error) {
                next(error)
            }
        })

        app.put("/stores", updateAttributeValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: UpdateAttributeValidation = req.body
                const identity = super.getIdentity(req)

                await this.handler.handleUpdateStore(identity, body)
                return this.response.OK(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        app.get("/stores", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const identity = super.getIdentity(req)

                const result = await this.handler.handleGetAllProducts(identity)
                return this.response.OK(res, "Success", result)
            } catch (error) {
                next(error)
            }
        })


        return app
    }
}

export default new StoreController().router()