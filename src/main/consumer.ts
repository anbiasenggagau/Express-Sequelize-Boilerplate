import mainConsumer from "./event/mainConsumer";
import secondConsumer from "./event/secondConsumer"

export default async function listenConsumers() {
    mainConsumer()
    secondConsumer()
}