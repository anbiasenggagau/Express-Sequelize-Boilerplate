import dotenv from "dotenv"
dotenv.config()

import express, { Request, Response } from "express"
import cors from "cors"
import config from "./config/GeneralConfig"
import router from "./routes"
import DB from "./config/DBConfig"
import { handleError } from "./middleware/ErrorHandler"
import { handleLogging } from "./middleware/Logging"
import Logging from "./config/LoggingConfig"

DB.forEach((value) => {
    value.authenticate()

    // Only implement on development environment
    // if (config.NODE_ENV == "development")
    //     value.sync({ alter: true })
})

const app = express()
app.set('trust proxy', true)
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: "5mb" }))
app.use(handleLogging)

app.get("/", (req: Request, res: Response) => {
    return res.send("Connected to server")
})

// Route Assignment
router.forEach(value => {
    app.use("/api/v1", value)
})

// Custom Error Handler
app.use(handleError)

app.listen(config.SERVER_PORT, () => {
    Logging.info("Listen to port " + config.SERVER_PORT)
})