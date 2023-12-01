document.addEventListener("DOMContentLoaded", () => {
  const socket = io(); // Assuming you've included the Socket.io script in your HTML

  let clientId;

  const appendMessage = (message, sender) => {
    const chatMessages = document.getElementById("chat-messages");
    const messageElement = document.createElement("div");

    messageElement.className =
      sender === clientId ? "sent-message" : "received-message";
    messageElement.classList.add("chat-message");
    sender = sender === clientId ? "You" : "Stranger";
    if (typeof message === 'object' && message.message) {
      // If the message is an object, assume it has 'message' property
      messageElement.innerHTML = `<strong>${sender}:</strong> ${message.message}`;
    } else {
      messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    }
  
    // Append the new message at the end of the chat
    chatMessages.appendChild(messageElement);
  
    // Scroll to the bottom after appending a new message
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
      // Handle the new connection, e.g., display a message, update UI, etc.
      appendSystemMessage("You are now connected with a new stranger!");
    });

  document.getElementById("send-button").addEventListener("click", () => {
    sendMessage();
  });

  document
    .getElementById("message-input")
    .addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        // Prevent the default behavior of the Enter key (e.g., adding a new line)
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
      // Send the message to the backend along with the sender's ID
      socket.emit("chat message", { message, sender: clientId });
      // Append the sent message to the chat window
      appendMessage(message, clientId);

      messageInput.value = "";

      if (!userTouchedScroll) {
        // Scroll to the bottom after sending a new message
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
    // Append the received message to the chat window
    appendMessage(message, sender);
  });
});
