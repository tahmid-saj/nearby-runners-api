const express = require("express");
const {
  subscribe,
  sendLocationUpdate,
  unsubscribe,
} = require("./api.controllers");

const api = express.Router();

api.post("/subscribe", subscribe);
api.post("/location-update", sendLocationUpdate);
api.post("/unsubscribe", unsubscribe);

module.exports = { api };
