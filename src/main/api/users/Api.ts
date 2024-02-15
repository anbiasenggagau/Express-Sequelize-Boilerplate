import express from "express"
import BaseController from "../.BaseController"
import UsersResponse from "./Response"
import { CreateAttributesBody, UpdateAttributesBody, createAttributesValidation, updateAttributesValidation } from "./Request"
import UsersHandler from "./Handler"
import { TokenPayload, authenticate } from "../../middleware/Authentication"

const app = express.Router()

class CustomersController extends BaseController {
    private handler = new UsersHandler()
    private response = new UsersResponse()

    router() {
        app.post("/users", createAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: CreateAttributesBody = { ...req.body }

                await this.handler.handleCreateNewUser(body)
                return this.response.CreatedNewData("Success", res)
            } catch (error) {
                next(error)
            }
        })

        app.put("/users", authenticate, updateAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: UpdateAttributesBody = { ...req.body }
                const identity: TokenPayload = { ...req.user }

                await this.handler.handleUpdateUser(identity, body)
                return this.response.OKWithEmptyData("Success", res)
            } catch (error) {
                next(error)
            }
        })

        app.delete("/users", authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity: TokenPayload = { ...req.user }

                await this.handler.handleDeleteUser(identity)
                return this.response.OKWithEmptyData("Success", res)
            } catch (error) {
                next(error)
            }
        })

        app.get("/users", authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity: TokenPayload = { ...req.user }

                const result = await this.handler.handleGetSingleUser(identity)
                return this.response.OKWithData("Success", result, res)
            } catch (error) {
                next(error)
            }
        })

        return app
    }
}

export default new CustomersController().router()