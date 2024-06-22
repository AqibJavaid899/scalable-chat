import http from "http";

import SocketService from "./services/socket/index";
import { startConsumerSrv } from "./services/kafka/index";

async function init() {
  startConsumerSrv();

  const httpServer = http.createServer();
  const PORT = process.env.PORT || 8000;

  const socketService = new SocketService();
  socketService.io.attach(httpServer);

  httpServer.listen(PORT, () =>
    console.log(`Server is running at PORT:${PORT}`)
  );
  socketService.initListeners();
}

init();
