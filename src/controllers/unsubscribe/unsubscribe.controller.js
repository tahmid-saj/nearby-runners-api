const { pubsubClients } = require("../../models/pubsub-clients/pubsub-clients.queries");

const unsubscribe = async (webSocketConnection, pubsubSubscriber) => {
  const pubsubClient = pubsubClients.get(webSocketConnection);
  if (pubsubClient) {
    await pubsubSubscriber.unsubscribe(pubsubClient.channel);
    pubsubClients.delete(webSocketConnection);
  }
};

module.exports = { unsubscribe };
