import express from "express"
import BaseController from "../.BaseController"
import ProductHandler from "./Handler"
import { CreateAttributeBody, UpdateAttributeValidation, createAttributesValidation, deleteValidation, paginationType, paginationValidation, updateAttributeValidation } from "./Request"
import ProductResponse from "./Response"

const app = express.Router()

class ProductController extends BaseController {
    private readonly handler = new ProductHandler()
    private readonly response = new ProductResponse()

    router() {
        app.post("/products", createAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: CreateAttributeBody = req.body
                const identity = super.getIdentity(req)

                const data = await this.handler.handleCreateProduct(identity, body)
                return this.response.CreatedNewData(res, "Success", data.id)
            } catch (error) {
                next(error)
            }
        })

        app.get("/products", paginationValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity = super.getIdentity(req)
                const pagination: paginationType = {
                    page: req.query.page ? parseInt(req.query.page as string) : 1,
                    pageSize: req.query.page_size ? parseInt(req.query.page_size as string) : 10
                }

                const result = await this.handler.handleGetProductsList(identity, pagination)
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
                const body: UpdateAttributeValidation = req.body
                const id: string = req.query.id as string
                const identity = super.getIdentity(req)

                await this.handler.handleUpdateProduct(identity, body, id)
                return this.response.OKWithEmptyData(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        app.delete("/products", deleteValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const id: string = req.query.id as string
                const identity = super.getIdentity(req)

                await this.handler.handleDeleteProduct(identity, id)
                return this.response.OKWithEmptyData(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        return app
    }
}

export default new ProductController().router()