import { deserialize, Document } from "bson";
import { OperationInfo, OperationType } from "./types.js";

// https://www.mongodb.com/docs/manual/reference/mongodb-wire-protocol/

// Standard Message Header
// https://www.mongodb.com/docs/manual/reference/mongodb-wire-protocol/#standard-message-header
export interface MessageHeader {
  messageLength: number;
  requestId: number;
  responseTo: number;
  opCode: number;
}

// Opcodes
// https://www.mongodb.com/docs/manual/reference/mongodb-wire-protocol/#opcodes
export enum OpCode {
  OpReply = 1,
  OpUpdate = 2001,
  OpInsert = 2002,
  OpQuery = 2004,
  OpGetMore = 2005,
  OpDelete = 2006,
  OpMsg = 2013,
  OpPing = 2010,
  OpPong = 2011,
  OpCompressed = 2012,
}

// Extract the target db, collection and operation from the buffer
export function parseMongoOperation(op: Document): OperationInfo | null {
  if (!op || typeof op !== "object") return null;

  const operations: Record<string, OperationType> = {
    findAndModify: "findAndModify",
    insert: "insert",
    update: "update",
    delete: "delete",
  };

  for (const [key, operation] of Object.entries(operations)) {
    if (key in op) {
      return {
        db: op?.$db,
        collection: op[key],
        operation,
      };
    }
  }

  return null;
}

// Extract the message header and flags from the buffer
export function parseMongoMessageHeader(buffer: Buffer): MessageHeader | null {
  // Not enough data to read the full header
  if (buffer.length < 16) return null;

  return {
    messageLength: buffer.readInt32LE(0),
    requestId: buffer.readInt32LE(4),
    responseTo: buffer.readInt32LE(8),
    opCode: buffer.readInt32LE(12),
  };
}

// Extract the message body from the buffer
export function deserializeMongoMessageBody(data: Buffer) {
  const sectionsStart = 20; // Skip header and flags
  const sectionType = data.readUInt8(sectionsStart);
  return sectionType === 0
    ? deserialize(data.subarray(sectionsStart + 1))
    : null;
}

// Parse the connection string
export function parseMongoConnectionString(connectionString: string) {
  const parsedUrl = new URL(connectionString);
  return {
    host: parsedUrl.hostname || "localhost",
    port: parseInt(parsedUrl.port || "27017", 10),
  };
}
