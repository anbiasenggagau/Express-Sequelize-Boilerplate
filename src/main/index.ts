import dotenv from "dotenv"
dotenv.config()

import express, { Request, Response } from "express"
import cors from "cors"
import expressEndpoint from "express-list-endpoints"
import config, { initializeConnection } from "./config/GeneralConfig"
import router from "./routes"
import { handleError } from "./middleware/ErrorHandler"
import { handleLogging } from "./middleware/Logging"
import * as constant from "./const"
import Logging from "./config/LoggingConfig"
import listenConsumers from "./consumer"

// Initialize Connection
initializeConnection()

// Register All Consumers
listenConsumers()

const app = express()
app.set('trust proxy', true)
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: "5mb" }))
app.use(handleLogging)

app.get("/", (req: Request, res: Response) => {
    return res.send("Connected to server")
})

app.get("/api/v1/dropdowns", (req, res) => {
    return res.status(200).json({ ...constant })
})

// List all endpoints
const endpoints: expressEndpoint.Endpoint[] = []
app.get("/api/v1/endpoints", (req, res) => {
    return res.status(200).json(endpoints)
})

// Route Assignment
router.forEach(value => {
    app.use("/api/v1", value)
})

// Custom Error Handler
app.use(handleError)

// Push all endpoints after all routes assigned
endpoints.push(...expressEndpoint(app).map(value => {
    if (
        value.path == "/" ||
        value.path == "/api/v1/dropdowns" ||
        value.path == "/api/v1/endpoints"
    ) return
    delete (value as any).middlewares
    return value
}).filter(value => value != undefined))

app.listen(config.SERVER_PORT, () => {
    Logging.info("Listen to port " + config.SERVER_PORT)
})