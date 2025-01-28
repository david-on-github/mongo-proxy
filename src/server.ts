import net from "net";
import { ConnectionManager } from "./connectionManager.js";

const LISTEN_PORT = parseInt(process.env.LISTEN_PORT || "27017", 10);
const MONGO_CONNECTION_STRING =
  process.env.MONGO_CONNECTION_STRING || "mongodb://localhost:27017";

const server = net.createServer((clientSocket) => {
  const connectionManager = new ConnectionManager(
    clientSocket,
    MONGO_CONNECTION_STRING
  );

  connectionManager.connect();
});

server.on("listening", () => {
  console.log(`TCP proxy server listening on port ${LISTEN_PORT}`);
});

server.listen(LISTEN_PORT);
