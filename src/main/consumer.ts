import mainConsumer from "./event/mainConsumer";
import secondConsumer from "./event/secondConsumer"

export default function listenConsumers() {
    mainConsumer()
    secondConsumer()
}