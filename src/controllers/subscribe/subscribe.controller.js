const WebSocket = require('ws');
const { channelCallbacks } = require("../../models/channel-callbacks/channel-callbacks")
const { pubsubClients } = require("../../models/pubsub-clients/pubsub-clients.queries");
const { hasPubsubChannel, addPubsubChannel } = require("../../models/pubsub-subscriptions/pubsub-subscriptions.queries");
const { doesUserExist, addUser } = require('../../models/users/users.queries');
const { addUserToGeohash } = require('../../models/geohash/geohash.queries');
const { GEOHASH_CHANNEL_PRECISION } = require('../../utils/constants/geohash.constants');

async function subscribeClient(webSocketMessage, webSocketConnection) {

  const geohashChannel = webSocketMessage.location.substring(0, GEOHASH_CHANNEL_PRECISION)

  pubsubClients.get(webSocketConnection).channel = geohashChannel;

  // store user's info
  const userExists = await doesUserExist(webSocketMessage.userId)
  if (!userExists) {
    await addUser(webSocketMessage.userId, {
      name: webSocketMessage.name,
      location: webSocketMessage.location
    })
  }

  // add user to geohash string
  await addUserToGeohash(webSocketMessage.userId, geohashChannel)

  // store channel
  const pubsubChannelExists = await hasPubsubChannel(geohashChannel)

  // subscribe once globally to channel
  if (!pubsubChannelExists) {
    await addPubsubChannel(geohashChannel);
  }
  
  // we'll subscribe to the channel, and when a new message is sent to the channel, the callback 
  // in the subscribe() call will be triggered by redis pubsub

  // define and save the callback (we'll save the callback so that it can be safely unsubscribed from using the subscriber)
  const callback = (locationUpdate) => {
    for (const [clientWebSocketConnection, clientInfo] of pubsubClients.entries()) {
      if (
        clientInfo.channel === geohashChannel &&
        clientWebSocketConnection.readyState === WebSocket.OPEN
      ) {
        clientWebSocketConnection.send(locationUpdate);
      }
    }
  }

  channelCallbacks.set(geohashChannel, callback)

  await pubsubClients.get(webSocketConnection).pubsubSubscriber.subscribe(geohashChannel, callback)

  console.log(`${webSocketMessage.userId} subscribed to ${geohashChannel}`);
}

module.exports = {
  subscribeClient
}