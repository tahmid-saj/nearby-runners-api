
// set containing userIDs within geohash string
const geohashUsersKey = (geohashString) => `geohash-users#${geohashString}`

module.exports = {
  geohashUsersKey
}