document.addEventListener("DOMContentLoaded", function() {
    const chatMessages = document.getElementById("chat-messages");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const newStrangerButton = document.getElementById("new-stranger-button");
  
    // Add a variable to track if the user has touched the scroll
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
  
    // Add an event listener for the scroll
    chatMessages.addEventListener("touchstart", function() {
      userTouchedScroll = true;
    });
  
    function sendMessage() {
      const messageText = messageInput.value.trim();
      if (messageText !== "") {
        appendMessage("You", messageText);
        messageInput.value = "";
  
        // If the user hasn't touched the scroll, scroll to the bottom
        if (!userTouchedScroll) {
          scrollChatToBottom();
        }
      }
    }
  
    function appendMessage(sender, message) {
      const messageElement = document.createElement("div");
      messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
      chatMessages.appendChild(messageElement);
    }
  
    function scrollChatToBottom() {
        chatMessages.scrollTo({
          top: chatMessages.scrollHeight,
          behavior: 'smooth' // You can use 'auto' for instant scrolling
        });
      }
      
  
    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {
        newStrangerButton.click();
      }
    });
  });
  