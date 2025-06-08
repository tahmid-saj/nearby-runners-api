const { redisClient } = require("../../services/redis/redis.service")
const { usersKey } = require("./users.keys")

async function doesUserExist(userId) {
  return await redisClient.exists(usersKey(userId))
}

async function addUser(userId, userInfo) {
  await redisClient.hSet(usersKey(userId), {
    name: String(userInfo.name),
    location: String(userInfo.location)
  })
}

async function removeUser(userId) {
  await redisClient.del(usersKey(userId))
}

module.exports = {
  doesUserExist,
  addUser,
  removeUser
}