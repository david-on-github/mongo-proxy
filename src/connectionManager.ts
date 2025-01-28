import net from "net";
import { inspect } from "util";
import {
  deserializeMongoMessageBody,
  OpCode,
  parseMongoConnectionString,
  parseMongoMessageHeader,
  parseMongoOperation,
} from "./parseUtils.js";
import { RequestMapEntry } from "./types.js";

export class ConnectionManager {
  private requestMap = new Map<number, RequestMapEntry>();

  constructor(
    private clientSocket: net.Socket,
    private mongoConnectionString: string
  ) {}

  /**
   * Main methods for handling the connections
   */

  public connect() {
    const { host, port } = parseMongoConnectionString(
      this.mongoConnectionString
    );

    const mongoSocket = net.createConnection({ host, port }, () => {
      console.log("Connection to MongoDB started ...");
    });

    this.clientSocket.on("data", async (data) => {
      await this.handleIncomingRequest(data);
      mongoSocket.write(data); // Forward to MongoDB
    });

    mongoSocket.on("data", (data) => {
      this.handleMongoResponse(data);
      this.clientSocket.write(data); // Forward to client
    });

    // Handle errors and close events
    this.setupErrorHandlers(mongoSocket);
    this.setupCloseHandlers(mongoSocket);

    return mongoSocket;
  }

  /**
   * Methods for processing incoming requests and responses
   */

  private async handleIncomingRequest(data: Buffer) {
    try {
      const header = parseMongoMessageHeader(data);

      if (!header) {
        console.error("Incomplete header received from client.");
        return;
      }

      const { opCode, requestId } = header;

      // https://www.mongodb.com/docs/manual/reference/mongodb-wire-protocol/#op_msg
      if (opCode !== OpCode.OpMsg) return;

      const body = deserializeMongoMessageBody(data);
      if (!body) return;

      // Operation types we are interested in ...
      const info = parseMongoOperation(body);
      if (!info) return;

      const requestEntry: RequestMapEntry = { info, body };

      this.requestMap.set(requestId, requestEntry);

      this.logMessage(`Captured Request: RequestId - [${requestId}]`, body);
    } catch (error) {
      console.error("Error processing MongoDB request:", error);
    }
  }

  private async handleMongoResponse(data: Buffer) {
    let buffer = Buffer.alloc(0);
    buffer = Buffer.concat([buffer, data]);

    try {
      // Check if we have a full message in the buffer
      while (buffer.length >= 16) {
        const header = parseMongoMessageHeader(buffer);
        if (!header) break;

        const { messageLength, responseTo, opCode } = header;

        // If we are not waiting for this response, skip it ...
        if (!this.requestMap.get(responseTo)) break;
        // Wait for a full message
        if (buffer.length < messageLength) break;

        // https://www.mongodb.com/docs/manual/reference/mongodb-wire-protocol/#op_msg
        if (opCode !== OpCode.OpMsg) break;

        const body = deserializeMongoMessageBody(buffer);
        const req = this.requestMap.get(responseTo); // Are we waiting for this response?

        if (req) {
          this.requestMap.delete(responseTo);

          this.logMessage(`Captured Response: RequestId - [${responseTo}]:`, {
            ...body,
            info: req.info,
          });
        }

        buffer = buffer.subarray(messageLength);
      }
    } catch (error) {
      console.error("Error processing MongoDB response:", error);
    }
  }

  /**
   *  Error and close handlers for both client and MongoDB sockets
   */

  private setupErrorHandlers(mongoSocket: net.Socket) {
    this.clientSocket.on("error", (err) => {
      console.error("Client socket error:", err);
      mongoSocket.end();
    });

    mongoSocket.on("error", (err) => {
      console.error("MongoDB socket error:", err);
      this.clientSocket.end();
    });
  }

  private setupCloseHandlers(mongoSocket: net.Socket) {
    this.clientSocket.on("close", () => {
      console.log("Client socket closed.");
      mongoSocket.end();
    });

    mongoSocket.on("close", () => {
      console.log("MongoDB socket closed.");
      this.clientSocket.end();
    });
  }

  /**
   * Logging
   */

  private logMessage(message: string, data: any = null) {
    console.log(
      message,
      inspect(data, { showHidden: false, depth: null, colors: true })
    );
  }
}
