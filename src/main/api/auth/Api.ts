import express from "express"
import BaseController from "../.BaseController"
import AuthResponse from "./Response"
import { LoginAttributeBody, loginAttributeValidation } from "./Request"
import AuthHandler from "./Handler"
import { TokenPayload, authenticate } from "../../middleware/Authentication"

const app = express.Router()

class CustomersController extends BaseController {
    private response = new AuthResponse()
    private handler = new AuthHandler()

    router() {
        app.post("/login", loginAttributeValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: LoginAttributeBody = { ...req.body }

                const result = await this.handler.handleLogin(body)
                return this.response.OKWithData("Success", result, res)
            } catch (error) {
                next(error)
            }
        })

        app.post("/logout", authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity: TokenPayload = req.user

                await this.handler.handleLogout(identity)
                return this.response.OKWithEmptyData("Success", res)
            } catch (error) {
                next(error)
            }
        })

        return app
    }
}

export default new CustomersController().router()