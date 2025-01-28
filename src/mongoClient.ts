// MongoDataFetcher.ts
import { Document, Filter, MongoClient, ObjectId } from "mongodb";
import { OperationInfo } from "./types.js";

export class MongoDataClient {
  private mongoClient: MongoClient;

  constructor(private mongoConnectionString: string) {
    this.mongoClient = new MongoClient(this.mongoConnectionString);
  }

  // Function fetch affected documents from MongoDB
  async fetchDocumentIds(
    info: OperationInfo,
    body: Document
  ): Promise<ObjectId[]> {
    try {
      const client = await this.mongoClient.connect();
      const db = client.db(info.db);
      const collection = db.collection(info.collection);
      const queries =
        info.operation === "findAndModify"
          ? [{ q: body.query, many: false }]
          : info.operation === "update"
          ? body?.updates?.map((u: any) => ({ q: u.q, many: u?.multi }))
          : info.operation === "delete"
          ? body?.deletes?.map((u: any) => ({ q: u.q, many: u?.limit === 0 }))
          : null;

      if (!queries || !queries?.length) return [];

      const results = (
        await Promise.allSettled(
          queries?.map(
            ({ q, many }: { q: Filter<Document>; many: boolean }) => {
              if (many) {
                return collection.find(q, { projection: { _id: 1 } }).toArray();
              }

              return collection.findOne(q, { projection: { _id: 1 } });
            }
          )
        )
      )
        ?.filter((r) => r.status === "fulfilled")
        .flatMap((r) => (Array.isArray(r.value) ? r.value : [r.value]))
        .map((doc) => doc?._id);

      await client.close();

      return results;
    } catch (error) {
      console.error("Error fetching document(s):", error);
      return [];
    }
  }

  async fetchDocuments(info: OperationInfo, documentIds: ObjectId[]) {
    try {
      const client = await this.mongoClient.connect();
      const db = client.db(info.db);
      const collection = db.collection(info.collection);

      if (!documentIds?.length) return [];

      const documents = await collection
        .find({ _id: { $in: documentIds } })
        .toArray();

      await client.close();

      return documents;
    } catch (error) {
      console.error("Error fetching document(s):", error);
      return [];
    }
  }

  // deriveInsertedIds(req: Document, res: Document) {
  //   const insertedIds: ObjectId[] = [];

  //   if (res?.writeErrors?.length > 0) {
  //     // If there are errors, exclude the failed documents
  //     const failedIndexes = new Set(
  //       res.writeErrors.map((err: any) => err.index)
  //     );

  //     req.documents.forEach((doc: any, index: number) => {
  //       if (!failedIndexes.has(index)) insertedIds.push(doc._id);
  //     });
  //   } else {
  //     req.documents.forEach((doc: any, index: number) => {
  //       insertedIds.push(doc._id);
  //     });
  //   }

  //   return insertedIds;
  // }
}
