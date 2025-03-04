import amqp, { ConsumeMessage } from "amqplib";
import { initConsumer } from "../config/BrokerConfig";
import GeneralConfig from "../config/GeneralConfig";

let channel: amqp.Channel | undefined = undefined
async function registerConsumer() {
    const serviceName = GeneralConfig.SERVICE_NAME
    channel = await initConsumer(
        serviceName,
        handler,
        {
            consumer: { noAck: false },
            queue: { autoDelete: false, durable: true }
        }
    )
}

function handler(data: ConsumeMessage) {
    console.log(data.content.toString(), "From main consumer")
    channel?.ack(data)
}

export default registerConsumer