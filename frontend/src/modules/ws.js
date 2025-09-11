import { add_error_to_terminal, add_log_to_terminal, add_success_to_terminal } from "./utils";
import { handle_offer , handle_answer, handle_ice_candidates} from "./webrtc";

// establish a ws connection
const signalingUrl = import.meta.env.VITE_SIGNALING_URL;
const wsClientConnection = new WebSocket(`${signalingUrl}`);
// const wsClientConnection = new WebSocket(`${window.location.origin.replace(/^http/, 'ws')}/ws`); // for testing with ngrok


// EVENT LISTENERS THAT THE BROWSER'S WEBSOCKET OBJECT GIVES US
export function registerSocketEvents() {
    // listen for those 4 events
    wsClientConnection.onopen = () => {
        // tell the user that they have connected with our ws server
        add_success_to_terminal("You have connected with our websocket server");

        // register the remaining 3 events
        wsClientConnection.onmessage = handleMessage;
        wsClientConnection.onclose = handleClose;
        wsClientConnection.onerror = handleError;
    };
};

function handleClose() {
    add_error_to_terminal("You have been disconnected from our ws server");
};

function handleError() {
    add_error_to_terminal("An error was thrown");
};

// ############## OUTGOING WEBSOCKET MESSAGES

export function ws_sendOffer(offer) {
    const message = {
        label: "send_offer",
        data: {
            offer, 
        }
    };
    wsClientConnection.send(JSON.stringify(message));
};

export function ws_sendAnswer(answer) {
    const message = {
        label: "send_answer",
        data: {
            answer, 
        }
    };
    wsClientConnection.send(JSON.stringify(message));
};

export function ws_sendCandidate(candidate) {
    const message = {
        label: "send_candidate",
        data: {
            candidate, 
        }
    };
    wsClientConnection.send(JSON.stringify(message));
};


// ############## INCOMING WEBSOCKET MESSAGES

function handleMessage(incomingMessageEventObject) {
    const message = JSON.parse(incomingMessageEventObject.data);
    
    // process an incoming message depending on its label
    switch(message.label) {
        // NORMAL SERVER STUFF
        case "receive_offer":
            handle_offer(message.data.offer);
            // normalServerProcessing(message.data);
            break;
        // WEBRTC SERVER STUFF
        case "receive_answer":
            handle_answer(message.data.answer);
            // webRTCServerProcessing(message.data);
            break;
        case "receive_candidate":
            handle_ice_candidates(message.data.candidate);
            break;
        default: 
            console.log("unknown server processing label: ", message.label);
    }
};

