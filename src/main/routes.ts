import express from "express"
import CustomersRoute from "./api/customers/Api"
import AuthRoute from "./api/auth/Api"
import { authenticate } from "./middleware/Authentication"

const protectedRoute = express.Router()
const unprotectedRoute = express.Router()

// Protected Route
protectedRoute.use(authenticate, CustomersRoute)

// Unprotected Route
unprotectedRoute.use(AuthRoute)

export default [protectedRoute, unprotectedRoute]