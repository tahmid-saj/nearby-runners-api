const { redisClient } = require("../../services/redis/redis.service")
const { geohashUsersKey } = require("./geohash.keys")

async function isUserInGeohash(userId, geohashString) {
  return await redisClient.sIsMember(geohashUsersKey(geohashString), String(userId))
}

async function getUsersInGeohash(geohashString) {
  return await redisClient.sMembers(geohashUsersKey(geohashString))
}

async function addUserToGeohash(userId, geohashString) {
  return await redisClient.sAdd(geohashUsersKey(geohashString), String(userId))
}

async function removeUserFromGeohash(userId, geohashString) {
  return await redisClient.sRem(geohashUsersKey(geohashString), String(userId))
}

module.exports = {
  isUserInGeohash,
  getUsersInGeohash,
  addUserToGeohash,
  removeUserFromGeohash
}