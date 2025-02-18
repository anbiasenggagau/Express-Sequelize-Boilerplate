import { ConsumeMessage } from "amqplib";
import { initConsumer } from "../config/BrokerConfig";

async function registerConsumer() {
    initConsumer(
        "Hello-World",
        handler,
        {
            consumer: { noAck: true },
            queue: { autoDelete: false, durable: true }
        }
    )
}

function handler(data: ConsumeMessage) {
    console.log(data.content.toString(), "From second consumer")
}

export default registerConsumer