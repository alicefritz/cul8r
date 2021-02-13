const socket = io();
let loggedIn = false;
const namePicker = document.getElementById('name-picker');
const messageWindow = document.getElementById('chat-window');

const messageForm = document.getElementById('message-form');
const nameForm = document.getElementById('name-form');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const messageList = document.getElementById('message-list')
const audio = document.getElementById('audio');
const smileyToggle = document.getElementById('smiley-toggle');
const smileyMenu = document.getElementById('smiley-menu');
const smileys = document.querySelectorAll('.smiley');
const nudgeButton = document.getElementById('nudge-button')

let username = '';

nameForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (nameInput.value) {
    socket.emit('new user online', nameInput.value);
    username = nameInput.value;
    nameInput.value = '';
    namePicker.style.display = 'none';
    messageWindow.style.display = 'flex';
  }
});

messageForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (messageInput.value) {
    socket.emit('chat message', messageInput.value, username);
    const item = document.createElement('li');
    item.textContent = username + ': ' + messageInput.value;
    messageList.appendChild(item);
    messageList.scrollTop = messageList.scrollHeight;
    messageInput.value = '';
    loggedIn = true;
  }
});

socket.on('chat message', function(msg, username) {
  if(loggedIn){
    const item = document.createElement('li');
    item.textContent = username + ': ' + msg;
    messageList.appendChild(item);
    audio.src = '/chatSound.wav';
    audio.load();
    audio.play();
  }
  messageList.scrollTop = messageList.scrollHeight;
});

socket.on('new user online', (username, onlineUsers) => {
  const item = document.createElement('li');
  item.textContent = username + ' has connected';
  messageList.appendChild(item);
  onlineList = document.getElementById('online-list')
  onlineList.innerHTML = '';
  for(let i=0; i < onlineUsers.length; i++){
    const onlineUser = document.createElement('li');
    onlineUser.textContent = onlineUsers[i].username;
    onlineList.appendChild(onlineUser)
  }
})

socket.on('user disconnected', (username, onlineUsers) => {
  if(username){
    const item = document.createElement('li');
    item.textContent = username + ' has disconnected';
    messageList.appendChild(item)
    onlineList = document.getElementById('online-list')
    onlineList.innerHTML = '';
    for(let i=0; i < onlineUsers.length; i++){
      const onlineUser = document.createElement('li');
      onlineUser.textContent = onlineUsers[i].username;
      onlineList.appendChild(onlineUser)
    }
  }
})

socket.on('nudge', () => {
  if(audio.paused){
    audio.src = '/nudgeSound.wav';
    audio.load();
    audio.play();
    messageWindow.style.animationName = 'nudge';
  setTimeout(() => {
    messageWindow.style.animationName = 'none';
  }, 1000);
  }
})

smileyToggle.addEventListener('click', () => {
  console.log(smileyMenu.style.display)
  window.getComputedStyle(smileyMenu, null).getPropertyValue("display") === 'none' ? smileyMenu.style.display = 'flex' : smileyMenu.style.display = 'none'
})

smileys.forEach(smiley => {
  smiley.addEventListener('click', (e) => {
    console.log(e.target.getAttribute('data-smiley'))
    messageInput.value += e.target.getAttribute('data-smiley')
  })
})

nudgeButton.addEventListener('click', () => {
  socket.emit('nudge');
})