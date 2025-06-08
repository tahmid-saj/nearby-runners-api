const WebSocket = require('ws');
const { createClient } = require('redis');
const { pubsubClients } = require("../models/pubsub-clients/pubsub-clients.queries");
const { WEBSOCKET_MESSAGE_ACTIONS } = require("../utils/constants/websocket.constants");
const { unsubscribeClient } = require("./unsubscribe/unsubscribe.controller");
const { subscribeClient } = require('./subscribe/subscribe.controller');
const { sendLocationUpdate } = require('./send-location-update/send-location-update.controller');

const socketManager = async (server) => {
  const webSocketServer = new WebSocket.Server({ server })

  webSocketServer.on("connection", async (webSocketConnection) => {
    
    const [pubsubPublisher, pubsubSubscriber] = await initializePubsubClient();

    // Track clients: include both Redis clients
    pubsubClients.set(webSocketConnection, {
      pubsubPublisher,
      pubsubSubscriber,
      channel: null, // Will be set after subscription
      userId: null
    });

    webSocketConnection.on("message", async (message) => {
      try {
        const webSocketMessage = JSON.parse(message);

        const clientState = pubsubClients.get(webSocketConnection);

        switch (webSocketMessage.action) {
          case WEBSOCKET_MESSAGE_ACTIONS.subscribe: {
            clientState.userId = webSocketMessage.userId;
            await subscribeClient(
              webSocketMessage,
              webSocketConnection
            );
            break;
          }

          case WEBSOCKET_MESSAGE_ACTIONS.sendLocationUpdate: {
            await sendLocationUpdate(
              webSocketMessage,
              webSocketConnection
            );
            break;
          }

          case WEBSOCKET_MESSAGE_ACTIONS.unsubscribe: {
            const geohashChannel = webSocketMessage.location.substring(0, GEOHASH_CHANNEL_PRECISION);
            await unsubscribeClient(
              webSocketMessage,
              webSocketConnection,
              geohashChannel
            );
            break;
          }
        }
      } catch (err) {
        console.error("Invalid message:", err);
      }
    });

    webSocketConnection.on("close", async () => {
      const clientState = pubsubClients.get(webSocketConnection);

      if (clientState) {
        const { pubsubSubscriber, pubsubPublisher, channel } = clientState;

        if (channel) {
          await pubsubSubscriber.unsubscribe(channel);
        }

        // Gracefully close Redis connections
        await pubsubSubscriber.quit();
        await pubsubPublisher.quit();

        pubsubClients.delete(webSocketConnection);
      }
    });
  });

  const initializePubsubClient = async () => {
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

    return [pubsubPublisher, pubsubSubscriber]
  }
};

const initializePubsubClient = async () => {
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

  return [pubsubPublisher, pubsubSubscriber]
}

module.exports = { 
  socketManager
};
