import express from "express"
import CustomersRoute from "./api/customers/Api"
import AuthRoute from "./api/auth/Api"
import ProductsRoute from "./api/products/Api"
import StoresRoute from "./api/stores/Api"
import UsersRole from "./api/users/Api"
import { authenticate } from "./middleware/Authentication"

const protectedRoute = express.Router()
const unprotectedRoute = express.Router()

// Unprotected Route
unprotectedRoute.use(AuthRoute)
unprotectedRoute.use(UsersRole)

// Protected Route
protectedRoute.use(authenticate, CustomersRoute)
protectedRoute.use(authenticate, ProductsRoute)
protectedRoute.use(authenticate, StoresRoute)

// Do not change the sequence
// in order to make unprotected route keep unprotected
export default [unprotectedRoute, protectedRoute]