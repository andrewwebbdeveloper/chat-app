const users = [];

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: `Username and room are required`
    };
  }

  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });
  // Validate Username
  if (existingUser) {
    return {
      error: `${username} is already in use!`
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => users.find(user => user.id === id);

const getUserInRoom = room => users.filter(user => user.room === room);

module.exports = {
  getUserInRoom,
  getUser,
  removeUser,
  addUser
};
