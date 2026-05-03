require('dotenv').config();

const http = require('http');
const app = require('./app');
const sequelize = require('./config/database');
const initializeSocketServer = require('./websocket/socketServer');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    const httpServer = http.createServer(app);
    const io = initializeSocketServer(httpServer);

    app.set('io', io);

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
