import express from "express"
import CustomersRoute from "./api/customers/Api"
import AuthRoute from "./api/auth/Api"
import UsersRole from "./api/users/Api"
import { authenticate } from "./middleware/Authentication"

const protectedRoute = express.Router()
const unprotectedRoute = express.Router()

// Unprotected Route
unprotectedRoute.use(AuthRoute)
unprotectedRoute.use(UsersRole)

// Protected Route
protectedRoute.use(authenticate, CustomersRoute)

export default [unprotectedRoute, protectedRoute]