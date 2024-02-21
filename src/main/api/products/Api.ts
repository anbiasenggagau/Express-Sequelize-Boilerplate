import express from "express"
import BaseController from "../.BaseController"
import ProductsHandler from "./Handler"
import { CreateAttributeBody, UpdateAttributeValidation, createAttributesValidation, updateAttributeValidation } from "./Request"
import { TokenPayload } from "../../middleware/Authentication"
import ProductsResponse from "./Response"

const app = express.Router()

class ProductsController extends BaseController {
    private handler = new ProductsHandler()
    private response = new ProductsResponse()

    router() {
        app.post("/products", createAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: CreateAttributeBody = { ...req.body }
                const identity: TokenPayload = req.user

                await this.handler.handleCreateProducts(identity, body)
                return this.response.CreatedNewData("Success", res)
            } catch (error) {
                next(error)
            }
        })

        app.get("/products", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity: TokenPayload = req.user

                const result = await this.handler.handleGetAllProducts(identity)
                return this.response.OKWithData("Success", result, res)
            } catch (error) {
                next(error)
            }
        })

        app.put("/products/:id", updateAttributeValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: UpdateAttributeValidation = { ...req.body }
                const id: string = req.params.id
                const identity: TokenPayload = req.user

                await this.handler.handleUpdateProducts(identity, body, id)
                return this.response.OKWithEmptyData("Success", res)
            } catch (error) {
                next(error)
            }
        })

        app.delete("/products/:id", updateAttributeValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const id: string = req.params.id
                const identity: TokenPayload = req.user

                await this.handler.handleDeleteProducts(identity, id)
                return this.response.OKWithEmptyData("Success", res)
            } catch (error) {
                next(error)
            }
        })

        return app
    }
}

export default new ProductsController().router()