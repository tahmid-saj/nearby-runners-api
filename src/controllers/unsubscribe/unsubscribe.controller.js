const { channelCallbacks } = require("../../models/channel-callbacks/channel-callbacks")
const { removeUserFromGeohash } = require("../../models/geohash/geohash.queries");
const { pubsubClients } = require("../../models/pubsub-clients/pubsub-clients.queries");
const { GEOHASH_CHANNEL_PRECISION } = require("../../utils/constants/geohash.constants");

async function unsubscribeClient(webSocketMessage, webSocketConnection, previousGeohashChannel=undefined) {
  const geohashChannel = webSocketMessage.location.substring(0, GEOHASH_CHANNEL_PRECISION)
  const pubsubClient = pubsubClients.get(webSocketConnection);

  if (pubsubClient) {
    if (previousGeohashChannel) {
      const channelCallback = channelCallbacks.get(previousGeohashChannel)
      // unsubscribe from the channel
      if (channelCallback) {
        await pubsubClient.pubsubSubscriber.unsubscribe(previousGeohashChannel, channelCallback)
      }
    }

    // set the new channel for the user
    pubsubClients.get(webSocketConnection).channel = geohashChannel

    // remove user from geohash channel
    await removeUserFromGeohash(webSocketMessage.userId, geohashChannel)

    console.log(`${webSocketMessage.userId} unsubscribed from ${previousGeohashChannel}`);
  }
}

module.exports = {
  unsubscribeClient
}