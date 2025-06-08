const { pubsubClients } = require("../../models/pubsub-clients/pubsub-clients.queries");

async function clientUnsubscribe(webSocketMessage, webSocketConnection) {
  const pubsubClient = pubsubClients.get(webSocketConnection);
  if (pubsubClient) {
    pubsubClients.delete(webSocketConnection);

    console.log(`${webSocketMessage.userName} unsubscribed from ${webSocketMessage.channel}`);
  }
}

module.exports = {
  clientUnsubscribe
}