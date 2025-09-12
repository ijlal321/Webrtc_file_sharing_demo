import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import * as helper from "./helper.js";

// Step1: Setting Up Server
const app = express();
app.use(cors());

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});

// ✅ Simple GET route
app.get("/", (req, res) => {
  res.send("Hello from server 👋");
});

const wss = new WebSocketServer({ server });

// Step2: Setting Up Websocket Functionality
wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (data) => {
    let message = JSON.parse(data);
    if (message.label) {
      switch (message.label) {
        case "send_offer":
          helper.send_msg_to_all_except_sender(wss, ws, {label: "receive_offer", data: message.data});
          break;
        case "send_answer":
          helper.send_msg_to_all_except_sender(wss, ws, {label: "receive_answer", data: message.data});
          break;
        case "send_candidate":
          helper.send_msg_to_all_except_sender(wss, ws, {label: "receive_candidate", data: message.data});
          break
        default:
          console.log("Invalid Label Received: ", message.label);
      }
    } else {
      console.log("No Label Found in ws message");
      ws.send("Invalid Message Received");
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
