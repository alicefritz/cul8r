const socket = io();

const namePicker = document.getElementById('name-picker');
const messageWindow = document.getElementById('chat-window');

const messageForm = document.getElementById('message-form');
const nameForm = document.getElementById('name-form');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const messageList = document.getElementById('message-list')
const audio = document.getElementById('audio');

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
    
  }
});

socket.on('chat message', function(msg, username) {
  const item = document.createElement('li');
  item.textContent = username + ': ' + msg;
  messageList.appendChild(item);
  audio.play();
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('new user online', (username, onlineUsers) => {
  const item = document.createElement('li');
  item.textContent = username + ' has connected';
  messageList.appendChild(item);
  onlineList = document.getElementById('online-list')
  onlineList.innerHTML = '';
  for(let i=0; i < onlineUsers.length; i++){
    const onlineUser = document.createElement('li');
    onlineUser.textContent = onlineUsers[i];
    onlineList.appendChild(onlineUser)
  }
})

socket.on('user disconnected', (username, onlineUsers) => {
  const item = document.createElement('li');
  item.textContent = username + ' has disconnected';
  messageList.appendChild(item)
  onlineList = document.getElementById('online-list')
  onlineList.innerHTML = '';
  for(let i=0; i < onlineUsers.length; i++){
    const onlineUser = document.createElement('li');
    onlineUser.textContent = onlineUsers[i];
    onlineList.appendChild(onlineUser)
  }
})