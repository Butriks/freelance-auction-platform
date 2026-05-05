const { Server } = require('socket.io');
const socketAuthMiddleware = require('./socketAuthMiddleware');
const { registerAuctionSocketHandlers } = require('./auctionSocket');
const { registerChatSocketHandlers } = require('./chatSocket');
const { buildUserRoomName } = require('../services/notificationService');

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const initializeSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(
      `Socket connected: userId=${socket.user.id}, role=${socket.user.role}, socketId=${socket.id}`,
    );

    const personalRoom = buildUserRoomName(socket.user.id);
    socket.join(personalRoom);
    console.log(`User joined personal room ${personalRoom}`);

    registerAuctionSocketHandlers(socket);
    registerChatSocketHandlers(socket);

    socket.on('disconnect', () => {
      console.log(
        `Socket disconnected: userId=${socket.user.id}, role=${socket.user.role}, socketId=${socket.id}`,
      );
    });
  });

  return io;
};

module.exports = initializeSocketServer;
