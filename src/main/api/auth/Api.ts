import express from "express"
import BaseController from "../.BaseController"
import AuthResponse from "./Response"
import { LoginAttributeBody, loginAttributeValidation, } from "./Request"
import AuthHandler from "./Handler"
import { RefreshToken, TokenPayload, authenticate, refresh } from "../../middleware/Authentication"

const app = express.Router()

class CustomersController extends BaseController {
    private response = new AuthResponse()
    private handler = new AuthHandler()

    router() {
        app.post("/auth/login", loginAttributeValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: LoginAttributeBody = { ...req.body }

                const result = await this.handler.handleLogin(body)
                return this.response.OKWithData(res, "Success", result)
            } catch (error) {
                next(error)
            }
        })

        app.post("/auth/logout", authenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity: TokenPayload | RefreshToken = req.user

                await this.handler.handleLogout(identity)
                return this.response.OKWithEmptyData(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        app.post("/auth/refresh", refresh, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const identity: RefreshToken = req.user

                const data = await this.handler.handleRefreshToken(identity)
                return this.response.OKWithData(res, "Success", data)
            } catch (error) {
                next(error)
            }
        })

        return app
    }
}

export default new CustomersController().router()