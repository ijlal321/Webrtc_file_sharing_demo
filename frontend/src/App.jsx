import { useState, useEffect } from "react";
import {init_web_rtc_connection, init_web_rtc_data_channel, local_offer_create_and_send, logSelectedCandidatePair} from "./modules/webrtc.js";
import { setTerminalUpdater } from "./modules/utils.js";
import { registerSocketEvents } from "./modules/ws.js";

function App() {
  const [terminal_messages, update_terminal_messages] = useState([]); 
  // allow utils.js to update messages.
  useEffect(() => {
    // Pass the update function to your utility
    setTerminalUpdater(update_terminal_messages);
  }, []);
  
  registerSocketEvents();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Welcome to Webrtc Demo App</h1>
      <p>Our goal will be to generate a Production Level Webrtc connection for 2 clients.<br/> Meaning handling all
        events, logging all connection states, and Most Importantly closing the connection on both sides gracefully.
      </p>
      <button style={{margin:50, width:200, height:50, borderRadius:20, backgroundColor:"lightcyan", cursor:"pointer"}}
        onClick={init_web_rtc_connection}
      >
        Create Webrtc Connection.
      </button>

      {/* <button style={{margin:50, width:200, height:50, borderRadius:20, backgroundColor:"lightcyan", cursor:"pointer"}}
        onClick={()=>init_web_rtc_data_channel(true)}
      >
        Create Data Channel.
      </button>

      <button style={{margin:50, width:200, height:50, borderRadius:20, backgroundColor:"lightcyan", cursor:"pointer"}}
        onClick={()=>local_offer_create_and_send()}
      >
        Create - Regiser - Send - Local Offer.
      </button> */}

      <button style={{margin:50, width:200, height:50, borderRadius:20, backgroundColor:"lightcyan", cursor:"pointer"}}
        onClick={logSelectedCandidatePair}
      >
        Log Connection Info
      </button>




      <div className="terminal">
        {terminal_messages.map((message, index) => (
          <p key={index} style={{color:`${message.color}`, margin:0}}>{message.text}</p>
        ))}
      </div>
    </div>
  );
}

export default App;
