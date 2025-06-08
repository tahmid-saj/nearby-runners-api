
async function sendLocationUpdate(webSocketMessage, pubsubPublisher) {
  // the below publish() call will publish to the sender who sent the original message
  await pubsubPublisher.publish(
    webSocketMessage.channel,
    JSON.stringify({
      userName: webSocketMessage.userName,
      message: webSocketMessage.message
    })
  );

  console.log(`${webSocketMessage.userName} sent message to ${webSocketMessage.channel}`);
}

module.exports = {
  sendLocationUpdate
}