// establish a ws connection
const signalingUrl = import.meta.env.VITE_SIGNALING_URL;
const wsClientConnection = new WebSocket(`${signalingUrl}`);



