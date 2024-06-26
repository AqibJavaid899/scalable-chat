import { Server } from "socket.io";
import { Redis } from "ioredis";

import { produceMessage } from "../kafka/index";

const pub = new Redis({
  port: 12345,
  host: "",
  username: "",
  password: "",
});

const sub = new Redis({
  port: 12345,
  host: "",
  username: "",
  password: "",
});

class SocketService {
  private _io: Server;

  constructor() {
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
        methods: ["*"],
      },
    });

    //  subscribing to the redis for channel "MESSAGES"
    sub.subscribe("MESSAGES");
  }

  initListeners() {
    console.log("Initializing the Socket Listeners...");
    const io = this._io;

    io.on("connect", (socket) => {
      console.log(`Socket with Id ${socket.id} connected`);

      socket.on("client:message", async ({ message }: { message: string }) => {
        console.log("On Client:Message, Rec Payload is : ", message);

        //  pushing the recieved message to redis cloud
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        let payload = JSON.parse(message);

        console.log("\nMsg from MESSAGES Channel is : ", payload.message);
        io.emit("srv:message", message);

        //  publishing the message to kafka broker
        await produceMessage(message);
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
