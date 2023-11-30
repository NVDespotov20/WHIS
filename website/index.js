const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the 'website' folder
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Store connected clients
const connectedClients = {};

io.on("connection", (socket) => {
  console.log("User connected");

  // Store the socket ID of the connected client
  const socketId = socket.id;
  connectedClients[socketId] = socket;

  // Listen for chat messages
  socket.on("chat message", (msg) => {
    console.log(`Message: ${msg}`);

    // Broadcast the message to all connected clients except the sender
    socket.broadcast.emit("chat message", { message: msg, sender: socketId });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");

    // Remove disconnected client from the connectedClients object
    delete connectedClients[socketId];
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
