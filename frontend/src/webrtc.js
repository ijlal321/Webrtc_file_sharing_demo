let pc;
let dataChannel;
let ws;

export function initConnection(setMessages) {
  ws = new WebSocket("wss://yourapp.onrender.com"); // replace with Render server URL

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
