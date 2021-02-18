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
    onlineUsers = onlineUsers.filter(e => e.id !== socket.id);
    io.emit('user disconnected', socket.username, onlineUsers, socket.color)
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg, socket.username, socket.color);
  });

  socket.on('new user online', (username) => {
    console.log(username + ' connected');
    socket.username = username;
    socket.color = getRandomColor();
    const obj = {"username": socket.username, "id": socket.id, "color": socket.color}
    onlineUsers.push(obj);
    io.emit('new user online', socket.username, onlineUsers, socket.color)
  })

  socket.on('nudge', () => {
    io.emit('nudge', socket.username, socket.color)
  })
});

const getRandomColor = () => {
  return('#' + (Math.random().toString(16) + "000000").substring(2,8))
}

http.listen(port, () => {
  console.log('listening on *:3000');
});