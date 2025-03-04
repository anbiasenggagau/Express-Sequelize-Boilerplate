import amqp, { Connection, Options, ConsumeMessage } from "amqplib"
import Logging from "./LoggingConfig"
import listenConsumers from "../consumer"

type InitConsumerOption = {
    consumer?: Options.Consume
    queue?: Options.AssertQueue
}

let amqpConn: Connection | undefined = undefined
let retryDelay = 5000

export async function initBroker() {
    while (true) {
        try {
            amqpConn = await amqp.connect({
                hostname: process.env.RABBITMQ_HOST,
                password: process.env.RABBITMQ_PASSWORD,
                username: process.env.RABBITMQ_USERNAME,
                port: process.env.RABBITMQ_PORT as (number | undefined),
            })

            Logging.info("RabbitMQ Successfully Connected")

            amqpConn.on("close", async () => {
                Logging.warn("RabbitMQ connection closed unexpectedly")
                Logging.warn("Initiating new connection")
                await initBroker()
                listenConsumers()
            })

            return
        } catch (error) {
            Logging.warn("AMQP Connection error", error)

            if (retryDelay >= 30000) retryDelay = 30000
            else retryDelay += 5000

            Logging.info(`trying to reconnect in ${retryDelay / 1000} seconds`)
            await new Promise(resolve => setTimeout(resolve, 5000))
        }
    }
}

export async function initConsumer(queueName: string, handler: (data: ConsumeMessage) => void, options?: InitConsumerOption) {
    while (true) {
        if (amqpConn) {
            const channel = await amqpConn.createChannel()
            await channel.assertQueue(queueName, options?.queue)
            channel.consume(queueName, handler as (data: ConsumeMessage | null) => void, options?.consumer)
            Logging.info(`Listening to ${queueName}`)
            return channel
        }

        Logging.warn(`AMQP Connection not ready yet. Trying to reinitiate consumer queue ${queueName} in 5 seconds`)
        await new Promise(resolve => setTimeout(resolve, 5000))
    }
}

export async function getBrokerConnection() {
    if (amqpConn)
        return amqpConn

    Logging.warn("AMQP Connection is not ready yet")
    return false
}