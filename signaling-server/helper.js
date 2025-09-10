


export function send_msg_to_all_except_sender(wss, ws, message){
    // Broadcast message to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
}