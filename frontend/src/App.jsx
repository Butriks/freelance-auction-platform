import React from "react";
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import AppRouter from './routes/AppRouter.jsx';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
