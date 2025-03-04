import amqp, { ConsumeMessage } from "amqplib";
import { initConsumer } from "../config/BrokerConfig";

let channel: amqp.Channel | undefined = undefined
async function registerConsumer() {
    channel = await initConsumer(
        "Hello-World",
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