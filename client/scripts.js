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
let userColor = '';

nameForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (nameInput.value) {
    userColor = getRandomColor();
    socket.emit('new user online', nameInput.value, userColor);
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
    socket.emit('chat message', messageInput.value, username, userColor);
    const item = document.createElement('li');
    const span = document.createElement('span');
    span.innerHTML = username + ': ';
    span.style.color = userColor;
    item.appendChild(span);
    const itemText = document.createTextNode(messageInput.value);
    item.appendChild(itemText)
    messageList.appendChild(item);
    scrollToBottom();
    messageInput.value = '';
    reactivateInput();
  }
});

socket.on('chat message', function(msg, sender, color) {
  if(loggedIn){
    const item = document.createElement('li');
    const span = document.createElement('span');
    span.innerHTML = sender + ': ';
    span.style.color = color;
    item.appendChild(span);
    const itemText = document.createTextNode(msg);
    item.appendChild(itemText)
    if(msg.includes('@'+username)){
      item.classList.add('message-highlight')
    }
    messageList.appendChild(item);
    scrollToBottom();
    chatAudio.play();
  }
});

socket.on('new user online', (user, onlineUsers, color) => {
  const item = document.createElement('li');
  const span = document.createElement('span');
  span.innerHTML = user;
  span.style.color = color;
  item.appendChild(span);
  const itemText = document.createTextNode(' has connected');
  item.appendChild(itemText)
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

socket.on('user disconnected', (sender, onlineUsers, color) => {
  if(sender){
    const item = document.createElement('li');
    const span = document.createElement('span');
    span.innerHTML = sender;
    span.style.color = color;
    item.appendChild(span);
    const itemText = document.createTextNode(' has disconnected');
    item.appendChild(itemText)
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

socket.on('nudge', (sender, color) => {
  if(nudgeAudio.paused){
    nudgeAudio.play();
    messageWindow.style.animationName = 'nudge';
    const item = document.createElement('li');
    const span = document.createElement('span');
    span.innerHTML = sender;
    span.style.color = color;
    item.appendChild(span);
    const itemText = document.createTextNode(' sent a nudge');
    item.appendChild(itemText)
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
  socket.emit('nudge', username, userColor);
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

const getRandomColor = () => {
  return('#' + (Math.random().toString(16) + "000000").substring(2,8))
}