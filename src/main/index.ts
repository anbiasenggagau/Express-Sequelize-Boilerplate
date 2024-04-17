import express, { Request, Response } from "express"
import cors from "cors"
import config from "./config/GeneralConfig"
import router from "./routes"
import DB from "./config/DBConfig"
import dotenv from "dotenv"
import { handleError } from "./middleware/ErrorHandler"
import { handleLogging } from "./middleware/Logging"
dotenv.config()

DB.forEach((value) => {
    value.authenticate()

    // Only implement on development environment
    // if (config.NODE_ENV == "development")
    //     value.sync({ alter: true })
})

const app = express()
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
    console.log("Listen to port " + config.SERVER_PORT)
})