import { add_error_to_terminal, add_log_to_terminal, add_success_to_terminal } from "./utils";
import {ws_sendOffer, ws_sendAnswer, ws_sendCandidate} from "./ws";

// set up global variables
let pc; // define a global local peer connection object that contains everything we need to establish a WebRTC connection
let dataChannel; // we will set this up when we create a peer connection
const iceCandidatesReceivedBuffer = [];  // all ice candidates received before we had remote_description
// const iceCandidatesGenerated = []; // for learning purposes, we will store all ice candidates generated inside of an array


const webRTCConfiguratons = {
    iceServers: [
        {
            urls: [
                "stun:23.21.150.121:3478",
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
            ]
        }
    ]
};


// =========== MAIN FUNCTIONS ============ //

export function init_web_rtc_connection(){
  // Step1: Create PC
  add_log_to_terminal("Step1. Create a webrtc object");
  pc = new RTCPeerConnection(webRTCConfiguratons);
  // Step2: Register Events
  register_pc_events(pc);
}

export function init_web_rtc_data_channel(isOfferor) {
  // isOfferror is one who made offer (Meaning p1 , who is creating data channel).
  if (isOfferor) {
    // Step3: Open data channel
    /*  For UDP - EXTRA INFO
     only need to create a data channel once, when an offer is established
     to mimic UDP type transport on our data channel, set the 'ordered' property to false, and the maxRetransmits to 0
     const dataChannelOptions = {
         ordered: false, 
         maxRetransmits: 0
     };
     */
    dataChannel = pc.createDataChannel("transfer");
    registerDataChannelEventListeners();
    add_success_to_terminal("Succesfully created a Data Channel and added it to your pc object");
  } else {
    // if this else is executed, we are dealing with the oferree
    // the receiver needs to register a ondatachannel listener
    // this will only fire once a valid webrtc connection has been established
    pc.ondatachannel = (e) => {
      console.log("The ondatachannel event was emitted for PEER2. Here is the event object: ", e);
      dataChannel = e.channel;
      registerDataChannelEventListeners();
    }
    add_success_to_terminal("Succesfully registered the ondatachannel event listener on your pc object");
  }
}

export async function local_offer_create_and_send(){
  let offer = await pc.createOffer(); // this is a promise
  add_success_to_terminal("Succesfully created an offer - why don't you view it in the console?");
  console.log("Here's your offer: ", offer);

  await pc.setLocalDescription(offer); 
  add_log_to_terminal("You must now send your offer to the other peer");
  console.log("Your pc object: after adding your offer to your pc object", pc);
  // ice candidates will now be gathered by the browser

  ws_sendOffer(offer);
  // update UI
  add_log_to_terminal("Offer is sent. Now wait for an answer ...")           
}

// =========== HANLDE OFEER/ANSWER from WEB_SOCKET =========== //

export async function handle_offer(offer){
    let answer; 

    add_success_to_terminal("WebRTC offer 📨 received. Create your peer connection object");
    init_web_rtc_connection();
    init_web_rtc_data_channel(false);

    await pc.setRemoteDescription(offer);
    add_log_to_terminal("Remote Description Added.");
    
    answer = await pc.createAnswer(); 
    add_log_to_terminal("Answer Created.");
    console.log("answer: ", answer);
    
    await pc.setLocalDescription(answer);
    add_log_to_terminal("Answer Set To Local Description.");

    ws_sendAnswer(answer);
    add_success_to_terminal("Answer is sent. Don't forget to send your ice candidates too");

    // finally, add the ice candidates inside the buffer (if any)
    // once remoteDescription is set, you can add ice candidates
    for (const candidate of iceCandidatesReceivedBuffer) {
        await pc.addIceCandidate(candidate);
        add_log_to_terminal('Added ice candidate to pc from buffer');
    }; 
    iceCandidatesReceivedBuffer.splice(0, iceCandidatesReceivedBuffer.length); // reset buffer
}

export async function handle_answer(answer){
    add_log_to_terminal("answer received");

    await pc.setRemoteDescription(answer);
    add_success_to_terminal("remote description updated with the answer");

    // finally, add the ice candidates inside the buffer (if any)
    // once remoteDescription is set, you can add ice candidates
    for (const candidate of iceCandidatesReceivedBuffer) {
        await pc.addIceCandidate(candidate);
        add_log_to_terminal('Added ice candidate to pc from buffer');
    }; 
    iceCandidatesReceivedBuffer.splice(0, iceCandidatesReceivedBuffer.length); // reset buffer
}

// handle ice candidates received from the signaling server
export async function handle_ice_candidates(candidate) {
  console.log("candidate received: ", candidate);

    if(pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
          add_log_to_terminal("Added ice candidate to your pc object");
        } catch (error) {
          console.log("Error trying to add an ice candidate to the pc object", error);
        }
    } else {
        // create a temporary buffer
        iceCandidatesReceivedBuffer.push(candidate);
        add_log_to_terminal("Added ice candidate to your temp buffer");
    }   
};


// ========== EVENT REGISTERS ========
function registerDataChannelEventListeners() {
    dataChannel.addEventListener("message", (e) => {
        console.log("message has been received from a Data Channel");
        // first, we need to extract the actual data from the Data Channel
        const msg = e.data; 
        add_log_to_terminal(msg);
    });
    dataChannel.addEventListener("close", (e) => {
        // will fire for all users that are listening on this data channel
        console.log("The 'close' event was fired on your data channel object");
    });
    dataChannel.addEventListener("open", (e) => {
        // this will fire when webrtc connection is established. 
        console.log("Data Channel has been opened. You are now ready to send/receive messsages over your Data Channel");
    });
};


function register_pc_events(pc){
  // #1. listen for WebRTC connection state change event (goal is "connected")
  pc.addEventListener("connectionstatechange", () => {
    console.log("connection state changed to: ", pc.connectionState);
    if (pc.connectionState === "connected") {
      alert("YOU HAVE DONE IT! A WEBRTC CONNECTION HAS BEEN MADE BETWEEN YOU AND THE OTHER PEER");
      add_log_to_terminal(`Connection state changed to: ${pc.connectionState}`);
    }
  });

  // #2. listen for change in the signaling state
  pc.addEventListener("signalingstatechange", () => {
    add_log_to_terminal(`Signaling state changed to: ${pc.signalingState}`);
  });
  // step 7 - listening for ice candidates (md file reference)
  // #3. listen for ice candidate generation
  pc.addEventListener("icecandidate", (e) => {
    add_success_to_terminal(`Ice candidate has been generated by the browser`);
    if (e.candidate) {
      // console.log("ICE:", e.candidate);
      ws_sendCandidate(e.candidate);
    }else{
      // console.log("ICE Gathering Complete");
    }
  });
  // #4. listen for the ice connection property to change value
  pc.addEventListener("iceconnectionstatechange", () => {
    console.log("Iceconncetionstate changed to :", pc.iceConnectionState);
    if(pc.iceConnectionState === "disconnected") {
      // closePeerConnection();
    }
  });

  // return out of this function
  return add_success_to_terminal("You've succesfully created a PC object");
}









// =============== OLD AI Generated ============

export function initConnection(setMessages) {
  const signalingUrl = import.meta.env.VITE_SIGNALING_URL;
  ws = new WebSocket(signalingUrl); // replace with Render server URL

  ws.onmessage = async (event) => {
    const msg = JSON.parse(event.data);

    if (msg.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify({ answer }));
    } else if (msg.answer) {
      await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
    } else if (msg.ice) {
      try {
        await pc.addIceCandidate(msg.ice);
      } catch (err) {
        console.error("Error adding ICE", err);
      }
    }
  };

  pc = new RTCPeerConnection();

  dataChannel = pc.createDataChannel("fileShare");
  dataChannel.onmessage = (e) => {
    setMessages((prev) => [...prev, e.data]);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(JSON.stringify({ ice: event.candidate }));
    }
  };
}

export async function startOffer() {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  ws.send(JSON.stringify({ offer }));
}

export function sendMessage(msg) {
  if (dataChannel?.readyState === "open") {
    dataChannel.send(msg);
  } else {
    console.warn("DataChannel not open yet");
  }
}
