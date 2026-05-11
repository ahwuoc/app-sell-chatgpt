import { getDatabase } from "./mongodb";

export type TransactionType = "credit" | "debit" | "purchase" | "refund" | "set";

export interface TransactionDocument {
  username: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string;
  createdAt: Date;
}

export interface TransactionView {
  id: string;
  username: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string;
  createdAt: string;
}

const collectionName = "transactions";

async function getTransactionsCollection() {
  const database = await getDatabase();
  return database.collection<TransactionDocument>(collectionName);
}

export async function logTransaction(input: {
  username: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string;
}) {
  const collection = await getTransactionsCollection();
  await collection.insertOne({
    ...input,
    createdAt: new Date(),
  });
}

export async function listTransactions(limit = 50): Promise<TransactionView[]> {
  const collection = await getTransactionsCollection();
  const docs = await collection
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    username: doc.username,
    type: doc.type,
    amount: doc.amount,
    balanceBefore: doc.balanceBefore,
    balanceAfter: doc.balanceAfter,
    note: doc.note,
    createdAt: doc.createdAt.toLocaleString("vi-VN"),
  }));
}

export async function listTransactionsByUsername(username: string, limit = 50): Promise<TransactionView[]> {
  const collection = await getTransactionsCollection();
  const docs = await collection
    .find({ username: username.trim().toLowerCase() })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => ({
    id: doc._id.toHexString(),
    username: doc.username,
    type: doc.type,
    amount: doc.amount,
    balanceBefore: doc.balanceBefore,
    balanceAfter: doc.balanceAfter,
    note: doc.note,
    createdAt: doc.createdAt.toLocaleString("vi-VN"),
  }));
}
