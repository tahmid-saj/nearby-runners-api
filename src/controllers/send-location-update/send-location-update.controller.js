const { pubsubClients } = require("../../models/pubsub-clients/pubsub-clients.queries");
const { addUser } = require("../../models/users/users.queries");
const { GEOHASH_CHANNEL_PRECISION } = require("../../utils/constants/geohash.constants");
const { subscribeClient } = require("../subscribe/subscribe.controller");
const { unsubscribeClient } = require("../unsubscribe/unsubscribe.controller");

async function sendLocationUpdate(webSocketMessage, webSocketConnection) {
  // update user's current location
  await addUser(webSocketMessage.userId, {
    name: webSocketMessage.name,
    location: webSocketMessage.location
  })

  const userCurrentGeohash = webSocketMessage.location.substring(0, GEOHASH_CHANNEL_PRECISION)
  const pubsubClient = pubsubClients.get(webSocketConnection)
  const prevChannel = pubsubClient.channel

  // if the user's location is no longer in the geohash string, then subscribe the user to the new geohash channel
  if (userCurrentGeohash !== prevChannel) {
    console.log(`Previous channel: ${userCurrentGeohash}, new channel: ${prevChannel}`)
    // add user to new channel, and subscribe them
    await subscribeClient(webSocketMessage, webSocketConnection)

    // remove user from their old channel, and unsubscribe them
    await unsubscribeClient(webSocketMessage, webSocketConnection, prevChannel)
  }

  // the below publish() call will publish to the sender who sent the original message
  await pubsubClient.pubsubPublisher.publish(
    userCurrentGeohash,
    JSON.stringify({
      userId: webSocketMessage.userId,
      name: webSocketMessage.name,
      locationUpdate: webSocketMessage.location,
      channel: userCurrentGeohash
    })
  );

  console.log(`${webSocketMessage.userId} sent message to ${userCurrentGeohash}`);
}

module.exports = {
  sendLocationUpdate
}