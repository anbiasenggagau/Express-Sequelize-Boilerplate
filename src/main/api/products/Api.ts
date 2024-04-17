import express from "express"
import BaseController from "../.BaseController"
import ProductsHandler from "./Handler"
import { CreateAttributeBody, UpdateAttributeValidation, createAttributesValidation, deleteValidation, paginationType, paginationValidation, updateAttributeValidation } from "./Request"
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
                return this.response.CreatedNewData(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        app.get("/products", paginationValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity: TokenPayload = req.user
                const pagination: paginationType = {
                    page: req.query.page ? parseInt(req.query.page as string) : 1,
                    pageSize: req.query.page_size ? parseInt(req.query.page_size as string) : 10
                }

                const result = await this.handler.handleGetAllProducts(identity, pagination)
                return this.response.OKWithDataPagination(
                    res,
                    "Success",
                    result.rows,
                    pagination,
                    result.count
                )
            } catch (error) {
                next(error)
            }
        })

        app.put("/products", updateAttributeValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: UpdateAttributeValidation = { ...req.body }
                const id: string = req.query.id as string
                const identity: TokenPayload = req.user

                await this.handler.handleUpdateProducts(identity, body, id)
                return this.response.OKWithEmptyData(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        app.delete("/products", deleteValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const id: string = req.query.id as string
                const identity: TokenPayload = req.user

                await this.handler.handleDeleteProducts(identity, id)
                return this.response.OKWithEmptyData(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        return app
    }
}

export default new ProductsController().router()