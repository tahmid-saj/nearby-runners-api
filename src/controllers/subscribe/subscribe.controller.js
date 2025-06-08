const WebSocket = require('ws');
const { pubsubClients } = require("../../models/pubsub-clients/pubsub-clients.queries");
const { hasPubsubChannel, addPubsubChannel } = require("../../models/pubsub-subscriptions/pubsub-subscriptions.queries")

async function subscribeClient(webSocketMessage, webSocketConnection, pubsubSubscriber) {
  console.log(`Connected to: ${webSocketMessage.userName}`);

  pubsubClients.set(webSocketConnection, {
    userName: webSocketMessage.userName,
    channel: webSocketMessage.channel
  });

  const pubsubChannelExists = await hasPubsubChannel(webSocketMessage.channel)
  console.log(pubsubChannelExists)

  if (!pubsubChannelExists) {
    await addPubsubChannel(webSocketMessage.channel);

    // we'll subscribe to the channel, and when a new message is sent to the channel, the callback 
    // in the subscribe() call will be triggered by redis pubsub
    await pubsubSubscriber.subscribe(webSocketMessage.channel, (message) => {
      for (const [clientWebSocketConnection, clientInfo] of pubsubClients.entries()) {
        if (
          clientInfo.channel === webSocketMessage.channel &&
          clientWebSocketConnection.readyState === WebSocket.OPEN
        ) {
          clientWebSocketConnection.send(message);
        }
      }
    });
  }

  console.log(`${webSocketMessage.userName} subscribed to ${webSocketMessage.channel}`);
}

module.exports = {
  subscribeClient
}