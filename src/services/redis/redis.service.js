const { createClient } = require("redis")

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT)
  },
  password: process.env.REDIS_PW
})

// runs when the client has connected to the redis instance:
redisClient.on("connect", async () => {
  console.log("Connected to redis instance")
})

redisClient.on("error", (err) => {
  console.log(err)
})

async function redisConnect() {
  await redisClient.connect()
}

module.exports = {
  redisClient,
  redisConnect
}