import { Server } from "socket.io";

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Calling Socket Service Constructor...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
        methods: ["*"]
      }
    });
  }

  initListeners() {
    console.log("Initializing the Socket Listeners...");
    const io = this._io;

    io.on("connect", (socket) => {
      console.log(`Socket with Id ${socket.id} connected`);

      socket.on("event:message", ({ message }: { message: string }) => {
        console.log("On Event:Message, Rec Payload is : ", message);
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
