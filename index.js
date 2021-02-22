const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var express = require('express');

let onlineUsers = [];

app.use("/", express.static('client'));   
app.use("/favicon", express.static('favicon')); 

io.on('connection', (socket) => {
  io.emit('users online', onlineUsers.length);

  socket.on('disconnect', () => {
    console.log(socket.username + " disconnected");
    onlineUsers = onlineUsers.filter(e => e.id !== socket.id);
    io.emit('user disconnected', socket.username, onlineUsers, socket.color)
  });

  socket.on('chat message', (msg) => {
    msg = replaceWithSmileys(msg);
    io.emit('chat message', msg, socket.username, socket.color);
  });

  socket.on('request name', (requestedUsername) => {
    if (onlineUsers.filter(e => e.username === requestedUsername).length > 0) {
      socket.emit('username taken');
    }else{
      console.log(requestedUsername + ' connected');
      socket.username = requestedUsername;
      socket.color = getRandomColor();
      const obj = {"username": socket.username, "id": socket.id, "color": socket.color}
      onlineUsers.push(obj);
      io.emit('new user online', socket.username, onlineUsers, socket.color)
    }
  })

  socket.on('new user online', (username) => {
    
  })

  socket.on('nudge', () => {
    io.emit('nudge', socket.username, socket.color)
  })
});

const replaceWithSmileys = (message) => {
  message = message
  .replace(/\(L\)/g, '❤️')
  .replace(/\(K\)/g, '💔')
  .replace(/\(8/g, '😎')
  .replace(/:D/g, '😃')
  .replace(/\(croc\)/g, '🐊')
  .replace(/\(frog\)/g, '🐸')
  .replace(/\(dino\)/g, '🦕')
  
  return message;
}

const getRandomColor = () => {
  return('#' + (Math.random().toString(16) + "000000").substring(2,8))
}

http.listen(port, () => {
  console.log('listening on *:3000');
});