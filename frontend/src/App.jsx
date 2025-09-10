import { useState } from "react";
import { initConnection, startOffer, sendMessage } from "./webrtc";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>WebRTC Demo (Vite + React)</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => initConnection(setMessages)}>Connect</button>
        <button onClick={startOffer}>Start Offer</button>
      </div>

      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={() => sendMessage(input)}>Send</button>
      </div>

      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
