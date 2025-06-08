const { redisClient } = require("../../services/redis/redis.service")
const { pubsubSubscriptionsKey } = require("./pubsub-subscriptions.keys")

const hasPubsubChannel = async (channel) => {
  return await redisClient.sIsMember(pubsubSubscriptionsKey(), channel)
}

const addPubsubChannel = async (channel) => {
  return await redisClient.sAdd(pubsubSubscriptionsKey(), channel)
}

module.exports = {
  hasPubsubChannel,
  addPubsubChannel
}