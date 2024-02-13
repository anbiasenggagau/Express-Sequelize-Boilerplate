import express from "express"
import BaseController from "../.BaseController"
import ErrorHandler from "../../utility/ErrorHandler"
import UsersResponse from "./Response"
import { CreateAttributesBody, UpdateAttributesBody, createAttributesValidation, updateAttributesValidation } from "./Request"
import UsersHandler from "./Handler"
import { ValidationError } from "sequelize"
import { TokenPayload, authenticate } from "../../middleware/Authentication"

const app = express.Router()

class CustomersController extends BaseController {
    private handler = new UsersHandler()
    private response = new UsersResponse()

    router() {
        app.post("/users", createAttributesValidation, async (req: express.Request, res: express.Response) => {
            try {
                super.validateRequest(req)
                const body: CreateAttributesBody = { ...req.body }

                await this.handler.handleCreateNewUser(body)
                return this.response.CreatedNewData("Success", res)
            } catch (error) {
                console.log(error)
                if (error instanceof ErrorHandler)  // Handle error from manually threw error
                    return this.response.handleErrorStatusCode(error.statusCode, error.message, res, error.errorValidationList)
                if (error instanceof ValidationError)   // Handle error from sequelize
                    return this.response.BadRequest(error.errors[0].message, res)
                else
                    return this.response.InternalServerError(res)
            }
        })

        app.put("/users", authenticate, updateAttributesValidation, async (req: express.Request, res: express.Response) => {
            try {
                super.validateRequest(req)
                const body: UpdateAttributesBody = { ...req.body }
                const identity: TokenPayload = { ...req.user }

                await this.handler.handleUpdateUser(identity, body)
                return this.response.OKWithEmptyData("Success", res)
            } catch (error) {
                console.log(error)
                if (error instanceof ErrorHandler)  // Handle error from manually threw error
                    return this.response.handleErrorStatusCode(error.statusCode, error.message, res, error.errorValidationList)
                if (error instanceof ValidationError)   // Handle error from sequelize
                    return this.response.BadRequest(error.errors[0].message, res)
                else
                    return this.response.InternalServerError(res)
            }
        })

        app.delete("/users", authenticate, async (req: express.Request, res: express.Response) => {
            try {
                const identity: TokenPayload = { ...req.user }

                await this.handler.handleDeleteUser(identity)
                return this.response.OKWithEmptyData("Success", res)
            } catch (error) {
                console.log(error)
                if (error instanceof ErrorHandler)  // Handle error from manually threw error
                    return this.response.handleErrorStatusCode(error.statusCode, error.message, res, error.errorValidationList)
                if (error instanceof ValidationError)   // Handle error from sequelize
                    return this.response.BadRequest(error.errors[0].message, res)
                else
                    return this.response.InternalServerError(res)
            }
        })

        app.get("/users", authenticate, async (req: express.Request, res: express.Response) => {
            try {
                const identity: TokenPayload = { ...req.user }

                const result = await this.handler.handleGetSingleUser(identity)
                return this.response.OKWithData("Success", result, res)
            } catch (error) {
                console.log(error)
                if (error instanceof ErrorHandler)  // Handle error from manually threw error
                    return this.response.handleErrorStatusCode(error.statusCode, error.message, res, error.errorValidationList)
                if (error instanceof ValidationError)   // Handle error from sequelize
                    return this.response.BadRequest(error.errors[0].message, res)
                else
                    return this.response.InternalServerError(res)
            }
        })

        return app
    }
}

export default new CustomersController().router()