const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const { v4: uuidv4, validate: isUuidValid } = require('uuid');
const path = require('path');
const sql = require('mssql');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.use(express.static('frontend'));
app.use(cookieParser());

const dbConfig = {
  server: 'whis.database.windows.net',
  user: 'node',
  password: 'VeryStrongPassMSWord3010',
  database: 'WHIS',
  options: { 
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: false,
  },
};

app.get('*', (req, res) => {  
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

async function checkClientIdExistsInDatabase(clientId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('clientId', sql.VarChar, clientId)
      .query('SELECT COUNT(*) AS count FROM Users WHERE UUID = @clientId');

    return result.recordset[0].count > 0;
  } catch (error) {
    console.error('Error checking clientId in the database:', error.message);
    throw error;
  }
}

async function getSocketId(clientId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('clientId', sql.VarChar, clientId)
      .query('SELECT SocketId FROM Users WHERE UUID = @clientId');

    return result.recordset[0].SocketId;
  } catch (error) {
    console.error('Error getting socket id from the database:', error.message);
    throw error;
  }
}


async function insertClientIdIntoDatabase(clientId, socketId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('uuid', sql.VarChar, clientId)
      .input('socketId', sql.VarChar, socketId)
      .query('INSERT INTO Users (UUID, IsActive, IsSearching, socketId) VALUES (@uuid, \'true\', \'true\', @socketId)');
  } catch (error) {
    console.error('Error inserting clientId into the database:', error.message);
    throw error;
  }
}
async function makeClientIdInactiveInDatabase(clientId) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('uuid', sql.NVarChar, clientId)
      .query('UPDATE Users SET IsActive = \'false\' WHERE UUID = @uuid');
  } catch (error) {
    console.error('Error inserting clientId into the database:', error.message);
    throw error;
  }
}

async function updateClientSearchingStatus(clientId, isSearching) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('uuid', sql.VarChar, clientId)
      .input('isSearching', sql.VarChar, isSearching)
      .query('UPDATE Users SET IsSearching = @isSearching WHERE UUID = @uuid');
  } catch (error) {
    console.error('Error updating IsSearching in the database:', error.message);
    throw error;
  }
}

async function getSearchingUsers() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query('SELECT UUID FROM Users WHERE IsActive = \'true\' AND IsSearching = \'true\'');

      const uuids = result.recordset.map((row) => row.UUID);

      // Use Promise.all to await all asynchronous operations
      const users = await Promise.all(uuids.map(async (uuid) => {
        return uuid;
      }));
  
      return users;
  } catch (error) {
    console.error('Error getting active users from the database:', error.message);
    throw error;
  }
}

async function getOtherUserInConnection(clientId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('clientId', sql.VarChar, clientId)
      .query('SELECT ClientOneUUID, ClientTwoUUID FROM Connections WHERE ( ClientOneUUID = @clientId OR ClientTwoUUID = @clientId ) AND IsActive = \'true\'');
    if(result.recordset.length == 0)
      return null;
    if(result.recordset[0].ClientOneUUID == clientId)
      return result.recordset[0].ClientTwoUUID;
    else return result.recordset[0].ClientOneUUID;
  } catch (error) {
    console.error('Error getting other user in connection from the database:', error.message);
    throw error;
  }
}
async function createConnectionInDatabase(clientOneUUID, clientTwoUUID) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('clientOneUUID', sql.VarChar, clientOneUUID)
      .input('clientTwoUUID', sql.VarChar, clientTwoUUID)
      .query('INSERT INTO Connections (ClientOneUUID, ClientTwoUUID, IsActive) VALUES (@clientOneUUID, @clientTwoUUID, \'true\')');
  } catch (error) {
    console.error('Error creating connection in the database:', error.message);
    throw error;
  }
}
async function getIdOfConnection(clientId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('clientId', sql.VarChar, clientId)
      .query('SELECT Id FROM Connections WHERE ( ClientOneUUID = @clientId OR ClientTwoUUID = @clientId ) AND IsActive = \'true\'');
      if(result.recordset[0])
        return result.recordset[0].Id;
      else return -1;
  } catch (error) {
    console.error('Error creating connection in the database:', error.message);
    throw error;
  }
}

async function makeConnectionInactive(conId) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('conId', sql.Int, conId)
    .query('UPDATE Connections SET IsActive = \'false\' WHERE Id = @conId');
}

async function connectStrangers() {
  const clients = await getSearchingUsers();
  if(clients.length > 1) {
    const clientOne = clients[Math.floor(Math.random()*clients.length)];
    const clientTwo = clients[Math.floor(Math.random()*clients.length)];
    if(clientOne != clientTwo) {
      createConnectionInDatabase(clientOne, clientTwo);
      updateClientSearchingStatus(clientOne, 'false');
      updateClientSearchingStatus(clientTwo, 'false');
      io.to(clientOne).to(clientTwo).emit('connectionEstablished', { user1: clientOne, user2: clientTwo });
      console.log(`Connection established between ${clientOne} and ${clientTwo}`);
    }
  }
}

io.on('connection', async (socket) => {
  let clientId = socket.handshake.headers.cookie
    ? socket.handshake.headers.cookie.split('; ').find(row => row.startsWith('clientId='))
    : null;

  if (!clientId || !isUuidValid(clientId.split('=')[1]) || !(await checkClientIdExistsInDatabase(clientId.split('=')[1]))) {
    clientId = `clientId=${uuidv4()}`;
    socket.handshake.headers.cookie = clientId;

    await insertClientIdIntoDatabase(clientId.split('=')[1], socket.id);
  }

  clientId = clientId.split('=')[1];
  socket.emit('clientIdentifier', clientId);

  console.log(`User connected with ID: ${clientId} on socket: ${socket.id}`);

  // Listen for chat messages
  socket.on('chat message', async ({ message }) => {
    const connectionExists = await getIdOfConnection(clientId);
    if (connectionExists != -1) {
      console.log('connectionExists with id: ' + connectionExists);
      // If the user is part of an active connection, get the other user in the connection
      const otherUser = await getOtherUserInConnection(clientId);
      
      if (otherUser) {
        const otherUserSocketId = await getSocketId(otherUser);
        console.log('otherUser: ' + otherUser);
        console.log('message: ' + message);
        // Emit the message only to the two users in the connection
        io.to(otherUserSocketId).emit('chat message', { message, sender: clientId });
      }
    }
  });

  // Handle the request for a new stranger
  socket.on('requestNewStranger', async (requestingClientId) => {
    // Check if the requesting client already has an active connection
    const connectionId = await getIdOfConnection(requestingClientId);

    if (connectionId != -1) {
      makeConnectionInactive(connectionId);
    }
    // Update the requesting client's IsSearching to 'true'
    await updateClientSearchingStatus(requestingClientId, 'true');
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log(`User with ID ${clientId} disconnected`);
    await makeClientIdInactiveInDatabase(clientId);
    const connectionId = await getIdOfConnection(clientId);
    if(connectionId)
      await makeConnectionInactive(connectionId);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

var timer = setInterval(connectStrangers, 5000);