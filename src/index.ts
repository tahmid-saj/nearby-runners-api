import path from "path";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.ts";
import { socketManager } from "./controllers/controller-manager.ts"

const server = http.createServer(app)
const PORT = process.env.PORT

async function startServer() {
  console.log("App is starting...");

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  })

  try {
    // initialize websocket
    socketManager(server)

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (err) {
    console.error("Fatal startup error: ", err);
    process.exit(1); // Optionally fail fast
  }

}

startServer()