
//=============== UPDATE TERMINAL MESSAGES ==============

let updateTerminal = null;

export function setTerminalUpdater(fn) {
  updateTerminal = fn;
}

function add_message_to_terminal(message){    
    const {color, text} = message;
    if (!color || ! text){
        console.log("Invalid Message");
        return;
    }
    if (updateTerminal) {
        updateTerminal(prev => [...prev, message]);
    } else {
        console.warn('Terminal updater not set yet.');
    }
}

export function add_log_to_terminal(text_message){
    let message = {color:"blue", text: text_message};
    add_message_to_terminal(message);
}

export function add_error_to_terminal(text_message){
    let message = {color:"red", text: text_message};
    add_message_to_terminal(message);
}

export function add_success_to_terminal(text_message){
    let message = {color:"green", text: text_message};
    add_message_to_terminal(message);
}

//=============== UPDATE TERMINAL MESSAGES ==============
