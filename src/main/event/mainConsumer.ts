import { ConsumeMessage } from "amqplib";
import { initConsumer } from "../config/BrokerConfig";
import GeneralConfig from "../config/GeneralConfig";

async function registerConsumer() {
    const serviceName = GeneralConfig.SERVICE_NAME
    initConsumer(
        serviceName,
        handler,
        {
            consumer: { noAck: true },
            queue: { autoDelete: false, durable: true }
        }
    )
}

function handler(data: ConsumeMessage) {
    console.log(data.content.toString(), "From main consumer")
}

export default registerConsumer