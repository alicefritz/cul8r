const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var express = require('express');

let onlineUsers = [];

app.use("/", express.static('client'));   
app.use("/favicon", express.static('favicon')); 

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log(socket.username + " disconnected");
    const disconnectingUser = onlineUsers.filter(e => e.id === socket.id)
    const disconnectingUserColor = disconnectingUser[0] && disconnectingUser[0].color;
    onlineUsers = onlineUsers.filter(e => e.id !== socket.id);
    io.emit('user disconnected', socket.username, onlineUsers, disconnectingUserColor)
  });

  socket.on('chat message', (msg, username, color) => {
    socket.broadcast.emit('chat message', msg, username, color);
  });

  socket.on('new user online', (username, color) => {
    console.log(username + ' connected');
    socket.username = username;
    const obj = {"username": username, "id": socket.id, "color": color}
    onlineUsers.push(obj);
    io.emit('new user online', username, onlineUsers, color)
  })

  socket.on('nudge', (username, color) => {
    io.emit('nudge', username, color)
  })
});


http.listen(port, () => {
  console.log('listening on *:3000');
});