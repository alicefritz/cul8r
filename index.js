const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var express = require('express');

let onlineUsers = [];

/*app.get('/', (req, res) => {
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
});*/

app.use("/", express.static('client')); 
//app.use("/favicon", express.static('favicon'));  
app.use("/favicon", express.static('favicon')); 

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log(socket.username + " disconnected");
    onlineUsers = onlineUsers.filter(e => e.id !== socket.id);
    io.emit('user disconnected', socket.username, onlineUsers)
  });

  socket.on('chat message', (msg, username) => {
    socket.broadcast.emit('chat message', msg, username);
  });

  socket.on('new user online', (username) => {
    console.log(username + ' connected');
    socket.username = username;
    const obj = {"username": username, "id": socket.id}
    onlineUsers.push(obj);
    io.emit('new user online', username, onlineUsers)
  })
});

http.listen(port, () => {
  console.log('listening on *:3000');
});