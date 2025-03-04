import express from "express"
import BaseController from "../.BaseController"
import AuthResponse from "./Response"
import { LoginAttributeBody, loginAttributeValidation, refreshTokenValidation, } from "./Request"
import AuthHandler from "./Handler"
import { logoutAuthenticate } from "../../middleware/Authentication"
import GeneralConfig from "../../config/GeneralConfig"

const app = express.Router()

class CustomersController extends BaseController {
    private readonly response = new AuthResponse()
    private readonly handler = new AuthHandler()

    router() {
        app.post("/auth/login", loginAttributeValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                super.validateRequest(req)
                const body: LoginAttributeBody = req.body

                const result = await this.handler.handleLogin(body)
                return this.response.OK(res, "Success", result)
            } catch (error) {
                next(error)
            }
        })

        app.post("/auth/logout", logoutAuthenticate, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const refreshToken = req.body.refreshToken
                if (GeneralConfig.REFRESH_TOKEN)
                    await this.handler.handleLogout(refreshToken)
                else
                    await this.handler.handleLogout(super.getIdentity(req))
                return this.response.OK(res, "Success")
            } catch (error) {
                next(error)
            }
        })

        app.post("/auth/refresh", refreshTokenValidation, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const refreshToken = req.body.refreshToken
                const data = await this.handler.handleRefreshToken(refreshToken)
                return this.response.OK(res, "Success", data)
            } catch (error) {
                next(error)
            }
        })

        return app
    }
}

export default new CustomersController().router()