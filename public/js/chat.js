const socket = io();

// Elements
const messageForm = document.querySelector(`#message-form`);
const messageInput = document.querySelector(`#message-input`);
const sendButton = document.querySelector(`#send-button`);
const sendLocationButton = document.querySelector(`#send-location`);
const messages = document.querySelector(`#messages`);
const sidebar = document.querySelector(`#sidebar`);

// Templates
const messageTemplate = document.querySelector(`#message-template`).innerHTML;
const locationMessageTemplate = document.querySelector(
  `#location-message-template`
).innerHTML;
const sidebarTemplate = document.querySelector(`#sidebar-template`).innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscrool = () => {
  // New message element
  const newMessage = messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // Visible Height
  const visibleHeight = messages.offsetHeight;

  // Height of messages container
  const containerHeight = messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on(`message`, message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format(`h:mm a`)
  });
  messages.insertAdjacentHTML(`beforeend`, html);
  autoscrool();
});

socket.on(`messageUpdated`, message => {
  console.log(message);
});

socket.on(`locationMessage`, message => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    location: message.text,
    createdAt: moment(message.createdAt).format(`h:mm a`)
  });
  messages.insertAdjacentHTML(`beforeend`, html);
  autoscrool();
});

socket.on(`roomData`, ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  sidebar.innerHTML = html;
});

socket.on(`messageUpdated`, message => {
  console.log(message);
});

messageForm.addEventListener(`submit`, e => {
  e.preventDefault();
  sendButton.setAttribute(`disabled`, `disabled`);
  const message = e.target.elements.message.value;
  socket.emit(`sendMessage`, message, error => {
    sendButton.removeAttribute(`disabled`);
    // prettier-ignore
    messageInput.value = ''
    messageInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log(`The message was delivered`);
  });
});

sendLocationButton.addEventListener(`click`, () => {
  if (!navigator.geolocation) {
    return alert(`Geolocation is not supported by your browser`);
  }
  sendLocationButton.setAttribute(`disabled`, `disabled`);

  navigator.geolocation.getCurrentPosition(async position => {
    const location = await position.coords;
    const { latitude, longitude } = location;
    socket.emit(`sendPosition`, { latitude, longitude }, acknowledgement => {
      sendLocationButton.removeAttribute(`disabled`);

      console.log(acknowledgement);
    });
  });
});

socket.emit(`join`, { username, room }, error => {
  if (error) {
    alert(error);
    location.href = `/`;
  }
});

// socket.on(`countUpdated`, count => {
//   console.log(`The count has been updated`, count);
// });

// document.querySelector(`#increment`).addEventListener(`click`, () => {
//   console.log(`Clicked`);
//   socket.emit(`increment`);
// });
