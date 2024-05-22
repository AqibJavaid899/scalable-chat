import http from 'http'

import SocketService from './services/socket';

async function init() {
    const httpServer = http.createServer();
    const PORT = process.env.PORT || 8000;

    const socketService = new SocketService();

    socketService.io.attach(httpServer);

    httpServer.listen(PORT, () => console.log(`Server is running at PORT:${PORT}`))

    socketService.initListeners();
}

init();