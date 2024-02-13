import express, { Request, Response } from "express"
import config from "./config/GeneralConfig"
import router from "./routes"
import DB from "./config/DBConfig"
import dotenv from "dotenv"
dotenv.config()


DB.forEach((value) => {
    value.authenticate()
        .then(() => {
            console.log("Connected to " + value.getDatabaseName())
            value.sync({ alter: true })
        })
})

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: "5mb" }))

app.get("/", (req: Request, res: Response) => {
    return res.send("Connected to server")
})

router.forEach(value => {
    app.use(value)
})

app.listen(config.SERVER_PORT, () => {
    console.log("Listen to port 3000")
})