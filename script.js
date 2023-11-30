document.addEventListener("DOMContentLoaded", function() {
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const newStrangerButton = document.getElementById("new-stranger-button");

  let userTouchedScroll = false;

  sendButton.addEventListener("click", sendMessage);

  newStrangerButton.addEventListener("click", function() {
      chatMessages.innerHTML = "";
      scrollChatToBottom();
  });

  messageInput.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
          sendMessage();
          scrollChatToBottom();
      }
  });

  chatMessages.addEventListener("touchstart", function() {
      userTouchedScroll = true;
  });

  function sendMessage() {
      const messageText = messageInput.value.trim();
      if (messageText !== "") {
          appendMessage("You", messageText);
          messageInput.value = "";

          if (!userTouchedScroll) {
              scrollChatToBottom();
          }
      }
  }

  function appendMessage(sender, message) {
      const messageElement = document.createElement("div");
      messageElement.classList.add("chat-message");
      messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
      chatMessages.appendChild(messageElement);
  }

  function scrollChatToBottom() {
      chatMessages.scrollTo({
          top: chatMessages.scrollHeight,
          behavior: 'smooth'
      });
  }

  document.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {
          newStrangerButton.click();
      }
  });
});
