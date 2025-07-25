import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("chat message", (msg) => {
      io.emit("chat message", msg, socket.id);
      console.log("server msg", msg);
    });
  });
  httpServer.listen(port, () => {
    console.log(`🚀 Ready on http://${hostname}:${port}`);
  });
});
