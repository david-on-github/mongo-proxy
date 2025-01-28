import { Document, ObjectId } from "bson";

export type OperationType = "findAndModify" | "insert" | "update" | "delete";

export interface OperationInfo {
  db: string;
  collection: string;
  operation: OperationType;
}

export interface RequestMapEntry {
  body: Document;
  info: OperationInfo;
  // documentIds: ObjectId[];
}
