const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

let onlineUsers = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/chatSound.wav', (req, res) => {
  res.sendFile(__dirname + '/chatSound.wav');
});

app.get('/style.css', function(req, res) {
  res.sendFile(__dirname + "/" + "style.css");
});

app.get('/scripts.js', function(req, res) {
  res.sendFile(__dirname + "/" + "scripts.js");
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log(socket.username + " disconnected");
    onlineUsers = onlineUsers.filter(e => e !== socket.username);
    io.emit('user disconnected', socket.username, onlineUsers)
  });

  socket.on('chat message', (msg, username) => {
    socket.broadcast.emit('chat message', msg, username);
  });

  socket.on('new user online', (username) => {
    console.log(username + ' connected');
    socket.username = username;
    onlineUsers.push(username);
    io.emit('new user online', username, onlineUsers)
  })
});

http.listen(port, () => {
  console.log('listening on *:3000');
});