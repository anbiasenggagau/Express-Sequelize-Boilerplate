import amqp, { Connection } from "amqplib"
import amqpCallback from "amqplib/callback_api"

const MAX_RETRIES = 5
const INITIAL_RETRY_DELAY = 1000 // 1 second

let connection // Variable to store the connection

function connectWithRetry(retries = 0) {
    return amqpCallback.connect({
        hostname: process.env.RABBITMQ_HOST,
        password: process.env.RABBITMQ_PASSWORD,
        username: process.env.RABBITMQ_USERNAME,
        port: process.env.RABBITMQ_PORT as (number | undefined),
    }, (err: any, conn: any) => {
        if (err) {
            console.error(`Failed to connect to RabbitMQ. Retrying in ${INITIAL_RETRY_DELAY / 1000} seconds...`)

            setTimeout(() => {
                connectWithRetry(retries + 1)
            }, INITIAL_RETRY_DELAY)
        } else {
            console.log('Connected to RabbitMQ')
            connection = conn
        }
    })
}

// Call the function to initiate the connection with retries
export default connectWithRetry()
