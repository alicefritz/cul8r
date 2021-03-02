const socket = io();
let loggedIn = false;
const namePicker = document.getElementById('name-picker');
const messageWindow = document.getElementById('chat-window');

const messageForm = document.getElementById('message-form');
const nameForm = document.getElementById('name-form');
const colorCheckbox = document.getElementById('color-checkbox')
const messageInput = document.getElementById('message-input');
const nameInput = document.getElementById('name-input');
const messageList = document.getElementById('message-list')
const chatAudio = document.getElementById('chat-audio');
const nudgeAudio = document.getElementById('nudge-audio');
const smileyToggle = document.getElementById('smiley-toggle');
const smileyMenu = document.getElementById('smiley-menu');
const smileys = document.querySelectorAll('.smiley');
const nudgeButton = document.getElementById('nudge-button');
const themeChoices = document.querySelectorAll('.background-choice');
const audioToggle = document.getElementById('audio-toggle')

let notifications = 0;
let username = '';

// NOTIFICATIONS

if(Notification.permission !== 'denied'){
  Notification.requestPermission()
}

const showNotification = (user) => {
  if(user != username){
    const notification = new Notification(`${user} is now online on CUL8R!`);
  }
}

const setBackgroundColor = () => {
  const savedColor = localStorage.getItem('background-color');
  if(savedColor){
    const background = document.getElementById('main-container');
    const activeTheme = document.getElementsByClassName('active-theme');
    const newActiveTheme = document.querySelectorAll('[data-color="'+savedColor+'"]');
    activeTheme[0].classList.remove('active-theme');
    background.style.backgroundColor = savedColor;
    newActiveTheme[0].classList.add('active-theme')
  }
}

nameForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const pickedColor = colorCheckbox.checked ? document.getElementById('color-picker').value : undefined;
  if (nameInput.value) {
    socket.emit('request name', nameInput.value, pickedColor);
    username = nameInput.value;
  }
});

messageForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (messageInput.value) {
    socket.emit('chat message', messageInput.value);
    scrollToBottom();
    messageInput.value = '';
    reactivateInput();
  }
});

socket.on('username error', (error) => {
  setNameError(error)
})

socket.on('users online', numberOnline => {
  const usersOnlineP = document.getElementById('users-online');
  const text = numberOnline === 1 ? ' user online' : ' users online'
  usersOnlineP.textContent = numberOnline + text;
})

socket.on('chat message', function(msg, sender, color) {
  if(loggedIn){
    const item = document.createElement('li');
    const span = document.createElement('span');
    span.innerHTML = sender;
    span.style.color = color;
    item.appendChild(span);
    const itemText = document.createTextNode(': '+msg);
    item.setAttribute('title', getCurrentTime());
    item.appendChild(itemText)
    if(msg.toLowerCase().includes('@'+username.toLowerCase())){
      item.classList.add('message-highlight')
    }
    messageList.appendChild(item);
    handleNotification();
    scrollToBottom();
    playMessageSound(sender);
  }
});

socket.on("pm", (msg, sender, color) => {
  const item = document.createElement('li');
  const span = document.createElement('span');
  span.innerHTML = 'PM from '+sender;
  span.style.color = color;
  item.appendChild(span);
  const itemText = document.createTextNode(': '+msg);
  item.setAttribute('title', getCurrentTime());
  item.appendChild(itemText)
  messageList.appendChild(item);
  handleNotification();
  scrollToBottom();
  playMessageSound(sender);
})

socket.on('pmsent', (msg, receiver, color) => {
  const item = document.createElement('li');
  const span = document.createElement('span');
  span.innerHTML = 'PM to '+receiver;
  span.style.color = color;
  item.appendChild(span);
  const itemText = document.createTextNode(': '+msg);
  item.setAttribute('title', getCurrentTime());
  item.appendChild(itemText)
  messageList.appendChild(item);
  scrollToBottom();
})

socket.on('new user online', (user, onlineUsers, color) => {
  nameInput.value = '';
  namePicker.style.display = 'none';
  messageWindow.style.display = 'flex';
  loggedIn = true;
  const item = document.createElement('li');
  const span = document.createElement('span');
  span.innerHTML = user;
  span.style.color = color;
  item.appendChild(span);
  const itemText = document.createTextNode(' has connected');
  item.setAttribute('title', getCurrentTime());
  item.appendChild(itemText)
  messageList.appendChild(item);
  scrollToBottom();
  onlineList = document.getElementById('online-list')
  onlineList.innerHTML = '';
  for(let i=0; i < onlineUsers.length; i++){
    const onlineUser = document.createElement('li');
    onlineUser.textContent = onlineUsers[i].username;
    onlineUser.style.color = onlineUsers[i].color;
    onlineList.appendChild(onlineUser)
  }
  addEventListenersOnlineList();
  (!document.hasFocus() && loggedIn)&& showNotification(user);
  reactivateInput();
})

socket.on('user disconnected', (sender, onlineUsers, color) => {
  if(sender){
    const item = document.createElement('li');
    const span = document.createElement('span');
    span.innerHTML = sender;
    span.style.color = color;
    item.appendChild(span);
    const itemText = document.createTextNode(' has disconnected');
    item.setAttribute('title', getCurrentTime());
    item.appendChild(itemText)
    messageList.appendChild(item)
    scrollToBottom();
    onlineList = document.getElementById('online-list')
    onlineList.innerHTML = '';
    for(let i=0; i < onlineUsers.length; i++){
      const onlineUser = document.createElement('li');
      onlineUser.style.color = onlineUsers[i].color;
      onlineUser.textContent = onlineUsers[i].username;
      onlineList.appendChild(onlineUser)
    }
    addEventListenersOnlineList();
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
    item.setAttribute('title', getCurrentTime());
    item.appendChild(itemText)
    messageList.appendChild(item)
    scrollToBottom();
  setTimeout(() => {
    messageWindow.style.animationName = 'none';
  }, 1000);
  }
})

const addEventListenersOnlineList = () => {
  const onlineListItems = document.getElementById('online-list').children;
  for (const item of onlineListItems) {
    item.addEventListener('click', () => {
      if(!messageInput.value){
        messageInput.value += '*' + item.innerHTML + ' ';
        reactivateInput();
      }
    })
  }
}

smileyToggle.addEventListener('click', () => {
  window.getComputedStyle(smileyMenu, null).getPropertyValue("display") === 'none' ? smileyMenu.style.display = 'flex' : smileyMenu.style.display = 'none'
})

smileys.forEach(smiley => {
  smiley.addEventListener('click', (e) => {
    messageInput.value += e.target.getAttribute('data-smiley');
    reactivateInput();
  })
})

themeChoices.forEach(choice => {
  choice.addEventListener('click', (e) => {
    const background = document.getElementById('main-container');
    const color = e.target.getAttribute('data-color');
    const activeTheme = document.getElementsByClassName('active-theme');
    activeTheme[0].classList.remove('active-theme')
    e.target.classList.add('active-theme')
    background.style.backgroundColor = color;
    localStorage.setItem('background-color', color);
  })
})

nudgeButton.addEventListener('click', () => {
  socket.emit('nudge');
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

const setNameError = (error) => {
  const nameError = document.getElementById('name-error');
  nameError.textContent = error;
}

const getCurrentTime = () => {
  const currentDate = new Date(); 
  const currentTime = currentDate.getHours().toString().padStart(2, "0") + ":" + currentDate.getMinutes().toString().padStart(2, "0");
  return currentTime;
}

audioToggle.addEventListener('click', () => {
  audioToggle.getAttribute('src') === './volume-on.png' ? audioToggle.setAttribute('src', './volume-off.png') : audioToggle.setAttribute('src', './volume-on.png');
  chatAudio.volume === 0 ? chatAudio.volume = 1 : chatAudio.volume = 0;
})

const playMessageSound = (sender) => {
  if(!document.hasFocus()){
    sender != username && chatAudio.play();
  }
}

const handleNotification = () => {
  if(!document.hasFocus()){
    notifications++;
    document.title = `(${notifications}) - CUL8R`;
  }else{
    notifications = 0;
    document.title = 'CUL8R';
  }
}

window.addEventListener('focus', handleNotification)

const validateName = () => {
  const value = nameInput.value;
  if(value.length > 15){
    setNameError('Name too long. Pick a name of maximum 15 characters.')
    return;
  }
  if(!value.trim().length){
    setNameError("That's not a valid name.")
    return;
  }
  setNameError('')
}

nameInput.addEventListener('keyup', validateName)

const toggleColorPicker = () => {
  const colorPicker = document.getElementById('color-picker')
  colorPicker.classList.toggle('hidden')
}

colorCheckbox.addEventListener('click', toggleColorPicker)

window.addEventListener("load", setBackgroundColor);