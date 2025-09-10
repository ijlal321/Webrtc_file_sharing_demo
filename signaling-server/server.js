import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";


// Step1: Setting Up Server
const app = express();
app.use(cors());

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

// Step2: Setting Up Websocket Functionality
wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log("Received:", message.toString());

    // Broadcast message to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
