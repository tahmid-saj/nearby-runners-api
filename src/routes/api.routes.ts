import express from "express"
import { subscribe, sendLocationUpdate, unsubscribe } from "./api.controllers.ts"

const api = express.Router()

api.post("/subscribe", subscribe)
api.post("/location-update", sendLocationUpdate)
api.post("/unsubscribe", unsubscribe)

export { api }