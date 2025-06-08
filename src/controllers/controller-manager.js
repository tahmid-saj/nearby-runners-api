const WebSocket = require('ws');
const { createClient } = require('redis');
const { pubsubClients } = require("../models/pubsub-clients/pubsub-clients.queries");
const { WEBSOCKET_MESSAGE_ACTIONS } = require("../utils/constants/websocket.constants");
const { clientUnsubscribe } = require("./unsubscribe/unsubscribe.controller");
const { subscribeClient } = require('./subscribe/subscribe.controller');
const { sendLocationUpdate } = require('./send-location-update/send-location-update.controller');

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
            await subscribeClient(webSocketMessage, webSocketConnection, pubsubSubscriber)
            break;
          }

          case WEBSOCKET_MESSAGE_ACTIONS.sendLocationUpdate: {
            await sendLocationUpdate(webSocketMessage, pubsubPublisher)
            break;
          }

          case WEBSOCKET_MESSAGE_ACTIONS.unsubscribe: {
            await clientUnsubscribe(webSocketMessage, webSocketConnection)
            break;
          }
        }
      } catch (err) {
        console.error("Invalid message:", err);
      }
    });

    webSocketConnection.on("close", async () => {
      const pubsubClient = pubsubClients.get(webSocketConnection);
      if (pubsubClient) {
        await pubsubSubscriber.unsubscribe(pubsubClient.channel);
        pubsubClients.delete(webSocketConnection);
      }
    });
  });
};

module.exports = { 
  socketManager
};
