import express from "express"
import BaseController from "../.BaseController"
import UserResponse from "./Response"
import { CreationAttributesBody, UpdateAttributesBody, createAttributesValidation, updateAttributesValidation } from "./Request"
import UserHandler from "./Handler"
import { TokenPayload, authenticate } from "../../middleware/Authentication"

const app = express.Router()

class UserController extends BaseController {
    private readonly handler = new UserHandler()
    private readonly response = new UserResponse()

    router() {
        app.post("/users", createAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const identity = super.getIdentity(req)
                const body: CreationAttributesBody = req.body

                const data = await this.handler.handleCreateNewUser(identity, body)
                return this.response.CreatedNewData(res, "Success", data.id)
            } catch (error) {
                next(error)
            }
        })

        app.put("/users", authenticate, updateAttributesValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: UpdateAttributesBody = req.body
                const identity: TokenPayload = { ...req.user }

                await this.handler.handleUpdateUser(identity, body)
                return this.response.OK(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        app.delete("/users", authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity: TokenPayload = { ...req.user }

                await this.handler.handleDeleteUser(identity)
                return this.response.OK(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        app.get("/users", authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity: TokenPayload = { ...req.user }

                const result = await this.handler.handleGetSingleUser(identity)
                return this.response.OK(res, "Success", result)
            } catch (error) {
                next(error)
            }
        })

        return app
    }
}

export default new UserController().router()