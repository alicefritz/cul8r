const socket = io();
let loggedIn = false;
const namePicker = document.getElementById('name-picker');
const messageWindow = document.getElementById('chat-window');

const messageForm = document.getElementById('message-form');
const nameForm = document.getElementById('name-form');
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const messageList = document.getElementById('message-list')
const chatAudio = document.getElementById('chat-audio');
const nudgeAudio = document.getElementById('nudge-audio');
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
    loggedIn = true;
  }
});

messageForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (messageInput.value) {
    socket.emit('chat message', messageInput.value, username);
    const item = document.createElement('li');
    item.textContent = username + ': ' + messageInput.value;
    messageList.appendChild(item);
    scrollToBottom();
    messageInput.value = '';
    reactivateInput();
  }
});

socket.on('chat message', function(msg, sender) {
  if(loggedIn){
    const item = document.createElement('li');
    item.textContent = sender + ': ' + msg;
    if(msg.includes('@'+username)){
      item.classList.add('message-highlight')
    }
    messageList.appendChild(item);
    scrollToBottom();
    chatAudio.play();
  }
});

socket.on('new user online', (user, onlineUsers) => {
  const item = document.createElement('li');
  item.textContent = user + ' has connected';
  messageList.appendChild(item);
  scrollToBottom();
  onlineList = document.getElementById('online-list')
  onlineList.innerHTML = '';
  for(let i=0; i < onlineUsers.length; i++){
    const onlineUser = document.createElement('li');
    onlineUser.textContent = onlineUsers[i].username;
    onlineList.appendChild(onlineUser)
  }
})

socket.on('user disconnected', (sender, onlineUsers) => {
  if(sender){
    const item = document.createElement('li');
    item.textContent = sender + ' has disconnected';
    messageList.appendChild(item)
    scrollToBottom();
    onlineList = document.getElementById('online-list')
    onlineList.innerHTML = '';
    for(let i=0; i < onlineUsers.length; i++){
      const onlineUser = document.createElement('li');
      onlineUser.textContent = onlineUsers[i].username;
      onlineList.appendChild(onlineUser)
    }
  }
})

socket.on('nudge', (sender) => {
  if(nudgeAudio.paused){
    nudgeAudio.play();
    messageWindow.style.animationName = 'nudge';
    const item = document.createElement('li');
    item.textContent = sender + ' sent a nudge';
    messageList.appendChild(item)
    scrollToBottom();
  setTimeout(() => {
    messageWindow.style.animationName = 'none';
  }, 1000);
  }
})

smileyToggle.addEventListener('click', () => {
  window.getComputedStyle(smileyMenu, null).getPropertyValue("display") === 'none' ? smileyMenu.style.display = 'flex' : smileyMenu.style.display = 'none'
})

smileys.forEach(smiley => {
  smiley.addEventListener('click', (e) => {
    messageInput.value += e.target.getAttribute('data-smiley');
    reactivateInput();
  })
})

nudgeButton.addEventListener('click', () => {
  socket.emit('nudge', username);
  reactivateInput();
})

const scrollToBottom = () => {
  messageList.scrollTop = messageList.scrollHeight;
}

const reactivateInput = () => {
  const inputLength = messageInput.value.length;
  messageInput.focus();
  messageInput.setSelectionRange(inputLength, inputLength)
}