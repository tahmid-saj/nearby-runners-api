const WebSocket = require('ws');
const { createClient } = require('redis');
const { pubsubClients } = require("../models/pubsub-clients/pubsub-clients.queries");
const { pubsubSubscriptions } = require("../models/pubsub-subscriptions/pubsub-subscriptions.queries");
const { WEBSOCKET_MESSAGE_ACTIONS } = require("../utils/constants/websocket.constants");
const { unsubscribe } = require("./unsubscribe/unsubscribe.controller");

const socketManager = async (server) => {
  const webSocketServer = new WebSocket.Server({ server })

  const pubsubPublisher = await createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT)
    },
    password: process.env.REDIS_PW
  })
  const pubsubSubscriber = await createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT)
    },
    password: process.env.REDIS_PW
  })

  await pubsubPublisher.connect();
  await pubsubSubscriber.connect();

  pubsubPublisher.on("error", (err) => {
    console.log("Redis pubsub publisher error: ", err);
  });

  pubsubSubscriber.on("error", (err) => {
    console.log("Redis pubsub subscriber error: ", err);
  });

  webSocketServer.on("connection", (webSocketConnection) => {
    webSocketConnection.on("message", async (message) => {
      try {
        const webSocketMessage = JSON.parse(message);

        switch (webSocketMessage.action) {
          case WEBSOCKET_MESSAGE_ACTIONS.subscribe: {
            console.log(`Connected to: ${webSocketConnection}`);

            pubsubClients.set(webSocketConnection, {
              userName: webSocketMessage.userName,
              channel: webSocketMessage.channel
            });

            if (!pubsubSubscriptions.has(webSocketMessage.channel)) {
              pubsubSubscriptions.add(webSocketMessage.channel);

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

            console.log(`${webSocketMessage.username} subscribed to ${webSocketMessage.channel}`);
            break;
          }

          case WEBSOCKET_MESSAGE_ACTIONS.sendLocationUpdate: {
            await pubsubPublisher.publish(
              webSocketMessage.channel,
              JSON.stringify({
                userName: webSocketMessage.userName,
                message: webSocketMessage.message
              })
            );

            console.log(`${webSocketMessage.username} sent message to ${webSocketMessage.channel}`);
            break;
          }

          case WEBSOCKET_MESSAGE_ACTIONS.unsubscribe: {
            await unsubscribe(webSocketConnection, pubsubSubscriber);

            console.log(`${webSocketMessage.username} unsubscribed from ${webSocketMessage.channel}`);
            break;
          }
        }
      } catch (err) {
        console.error("Invalid message:", err);
      }
    });

    webSocketConnection.on("close", async () => {
      await unsubscribe(webSocketConnection, pubsubSubscriber);
    });
  });
};

module.exports = { 
  socketManager
};
