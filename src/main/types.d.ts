import { TokenPayload } from "./middleware/Authentication"

declare module "express-serve-static-core" {
    export interface Request {
        user: TokenPayload
    }
}

declare module "sequelize" {
    export interface UpdateOptions {
        identity?: TokenPayload
    }

    export interface DestroyOptions {
        identity?: TokenPayload
    }

    export interface InstanceUpdateOptions {
        identity?: TokenPayload
    }

    export interface InstanceDestroyOptions {
        identity?: TokenPayload
    }
}