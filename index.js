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
    if(!isPM(msg)){
      io.emit('chat message', msg, socket.username, socket.color);
    }
  });

  socket.on('request name', (requestedUsername, pickedColor) => {
    if (onlineUsers.filter(e => e.username === requestedUsername).length > 0) {
      socket.emit('username error', 'Username not available');
      return;
    }
    
    if(requestedUsername.length > 15){
      socket.emit('username error', 'Username too long (max 15 characters)')
      return;
    }

    if(!requestedUsername.trim().length){
      socket.emit('username error', "User name cannot contain only spaces")
      return;
    }
    console.log(requestedUsername + ' connected');
    socket.username = requestedUsername;
    socket.color = pickedColor ? pickedColor : getRandomColor();
    const obj = {"username": socket.username, "id": socket.id, "color": socket.color}
    onlineUsers.push(obj);
    io.emit('new user online', socket.username, onlineUsers, socket.color)
    
  })

  socket.on('new user online', (username) => {
    
  })

  socket.on('nudge', () => {
    io.emit('nudge', socket.username, socket.color)
  })

  const isPM = (msg) => {
    const splitMSG = msg.split(' ')
    const separated = splitMSG[0].replace(/\*/g, '* ').split(' ');
    for(let i=0; i < onlineUsers.length; i++){
      if(Object.values(onlineUsers[i]).includes(separated[1])){
        const userToPM = onlineUsers.filter(user => user.username === separated[1]);
        const userToPMID = userToPM[0].id;
        splitMSG.shift();
        msg = splitMSG.join(' ')
        io.to(userToPMID).emit("pm", msg, socket.username, socket.color);
        io.to(socket.id).emit("pmsent", msg, userToPM[0].username, userToPM[0].color);
        return true;
      }
    }
    return false;
  }
});

const replaceWithSmileys = (message) => {
  message = message
  .replace(/\(L\)/g, '❤️')
  .replace(/\(K\)/g, '💔')
  .replace(/B\)/g, '😎')
  .replace(/:D/g, '😃')
  .replace(/=D/g, '😁')
  .replace(/lolz/g, '😂')
  .replace(/ehehehe/g, '😅')
  .replace(/=\)/g, '😊')
  .replace(/;P/g, '🤪')
  .replace(/::\)/g, '😌')
  .replace(/\(croc\)/g, '🐊')
  .replace(/\(frog\)/g, '🐸')
  .replace(/\(dino\)/g, '🦕')
  .replace(/\(star\)/g, '⭐')
  .replace(/\(vhand\)/g, '✌️')
  .replace(/\(ohand\)/g, '👌')
  .replace(/\(phonehand\)/g, '🤙')
  .replace(/\(balloon\)/g, '🎈')
  .replace(/\(aubergine\)/g, '🍆')
  .replace(/\(peach\)/g, '🍑')
  
  return message;
}

const getRandomColor = () => {
  return('#' + (Math.random().toString(16) + "000000").substring(2,8))
}



http.listen(port, () => {
  console.log('listening on *:3000');
});