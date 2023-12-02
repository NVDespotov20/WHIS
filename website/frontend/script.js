document.addEventListener("DOMContentLoaded", () => {
  const socket = io(); 
  let clientId;

  const appendMessage = (message, sender) => {
    const chatMessages = document.getElementById("chat-messages");
    const messageElement = document.createElement("div");

    messageElement.className =
      sender === clientId ? "sent-message" : "received-message";
    messageElement.classList.add("chat-message");
    sender = sender === clientId ? "You" : "Stranger";
    if (typeof message === 'object' && message.message) {
          messageElement.innerHTML = `<strong>${sender}:</strong> ${message.message}`;
    } else {
      messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    }
  
    
    chatMessages.appendChild(messageElement);
    scrollChatToBottom();
  };
  
  const appendSystemMessage = (message) => {
    const chatMessages = document.getElementById("chat-messages");
    const messageElement = document.createElement("div");
    messageElement.className = "system-message";
    messageElement.innerText = message;
    chatMessages.appendChild(messageElement);
  };

  socket.emit('clientIdentifier', clientId);

  console.log(`User connected with ID: ${clientId}`);

  document
    .getElementById("new-stranger-button")
    .addEventListener("click", () => {
      const chatMessages = document.getElementById("chat-messages");
      chatMessages.innerHTML = "";
      scrollChatToBottom();
      appendSystemMessage(
        "You requested a new stranger. Waiting for a match..."
      );
      socket.emit('newStrangerRequest');
    });
  
    socket.on('connectionEstablished', ({ user1, user2 }) => {
      console.log(`Connection established between ${user1} and ${user2}`);
      appendSystemMessage("You are now connected with a new stranger!");
    });

  document.getElementById("send-button").addEventListener("click", () => {
    sendMessage();
  });

  document
    .getElementById("message-input")
    .addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
      
        event.preventDefault();
        sendMessage();
        scrollChatToBottom();
      }
    });

  document
    .getElementById("chat-messages")
    .addEventListener("touchstart", function () {
      userTouchedScroll = true;
    });

  function sendMessage() {
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value.trim();

    if (message !== "") {
      
      socket.emit("chat message", { message, sender: clientId });
      
      appendMessage(message, clientId);

      messageInput.value = "";

      if (!userTouchedScroll) {
        scrollChatToBottom();
      }
    }
  }

  function scrollChatToBottom() {
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: "smooth",
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      newStrangerButton.click();
    }
  });

  socket.on("clientIdentifier", (id) => {
    clientId = id;
  });

  socket.on("chat message", ({ message, sender }) => {
    appendMessage(message, sender);
  });
});
