const path = require(`path`);
const http = require(`http`);
const express = require(`express`);
const socketio = require(`socket.io`);
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {
  generateMessage,
  generateLocationMessage
} = require(`./utils/messages.js`);
const {
  getUserInRoom,
  getUser,
  removeUser,
  addUser
} = require(`./utils/users`);

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, `../public`);

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

io.on(`connection`, socket => {
  console.log(`New WebSocket connection`);

  socket.on(`join`, ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    // console.log(user.room);

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(
      `message`,
      generateMessage(`ADMIN`, `Welcome ${user.username}`)
    );
    socket.broadcast
      .to(user.room)
      .emit(`message`, generateMessage(`ADMIN`, `${user.username} is here!`));

    io.to(user.room).emit(`roomData`, {
      room: user.room,
      users: getUserInRoom(user.room)
    });

    callback();
  });

  socket.on(`sendMessage`, (inputMessage, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      `message`,
      generateMessage(user.username, inputMessage)
    );
    callback(`Message Sent`);
  });

  socket.on(`sendPosition`, (position, acknowledgement) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      `locationMessage`,
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${position.latitude},${position.longitude}`
      )
    );
    acknowledgement(`Location shared!`);
  });
  // socket.emit(`countUpdated`, count);
  // socket.on(`increment`, () => {
  //   count++;
  //   // socket.emit(`countUpdated`, count);
  //   io.emit(`countUpdated`, count);
  // });
  socket.on(`disconnect`, () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        `message`,
        generateMessage(`ADMIN`, `${user.username} has left`)
      );
      io.to(user.room).emit(`roomData`, {
        room: user.room,
        users: getUserInRoom(user.room)
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is up on port: ${PORT}`);
});
