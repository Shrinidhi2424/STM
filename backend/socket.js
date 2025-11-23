// backend/socket.js
let io;
module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: { origin: '*' }
    });
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);
    });
    return io;
  },
  getIO: () => io
};
