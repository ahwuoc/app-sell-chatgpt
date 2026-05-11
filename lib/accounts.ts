import { ObjectId, type WithId } from "mongodb";
import type {
  AccountDocument,
  AccountSaleStatus,
  AccountStatus,
  AccountView,
  CreateAccountInput,
} from "@/types/account";
import { getDatabase } from "./mongodb";

const collectionName = "accounts";

function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function mapAccount(document: WithId<AccountDocument>): AccountView {
  return {
    id: document._id.toHexString(),
    email: document.email,
    accountId: document.accountId,
    status: document.status,
    saleStatus: document.saleStatus,
    soldOrderId: document.soldOrderId,
    password: document.password,
    sessionToken: document.sessionToken,
    passwordMasked: document.password ? maskSecret(document.password) : "Khong luu",
    tokenMasked: document.sessionToken ? maskSecret(document.sessionToken) : "Khong luu",
    mailkpMasked: document.mailkp ? maskSecret(document.mailkp) : "Khong co",
    passwordMailkpMasked: document.passwordMailkp ? maskSecret(document.passwordMailkp) : "Khong co",
    createdAt: document.createdAt.toLocaleString("vi-VN"),
  };
}

async function getAccountsCollection() {
  const database = await getDatabase();
  return database.collection<AccountDocument>(collectionName);
}

export async function listAccounts(): Promise<AccountView[]> {
  const collection = await getAccountsCollection();
  const accounts = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return accounts.map(mapAccount as any) as AccountView[];
}

export async function findAccountByEmail(email: string) {
  const collection = await getAccountsCollection();
  return collection.findOne({ email: email.trim() });
}

export async function getAccountById(id: string) {
  const collection = await getAccountsCollection();
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function getAccountByOrderId(orderId: string) {
  const collection = await getAccountsCollection();
  const account = await collection.findOne({ soldOrderId: orderId });
  return account ? (mapAccount(account as WithId<AccountDocument>)) : null;
}

export async function listSellableAccounts() {
  const collection = await getAccountsCollection();
  const accounts = await collection.find({
    status: "reg-success",
    saleStatus: "available"
  }).toArray();
  return accounts.map(mapAccount);
}

export async function countSellableAccounts() {
  const collection = await getAccountsCollection();
  return collection.countDocuments({
    status: "reg-success",
    saleStatus: "available"
  });
}

export async function countSoldAccounts() {
  const collection = await getAccountsCollection();
  return collection.countDocuments({
    saleStatus: "sold",
  });
}

export async function listAvailableAccountsForSale() {
  const collection = await getAccountsCollection();
  const accounts = await collection
    .find({
      status: "reg-success",
      saleStatus: "available"
    })
    .sort({ createdAt: 1 })
    .toArray();

  return accounts.map(mapAccount);
}

export async function findExistingAccounts(inputs: CreateAccountInput[]): Promise<AccountView[]> {
  if (inputs.length === 0) return [];
  const collection = await getAccountsCollection();
  const emails = [...new Set(inputs.map((input) => input.email))];
  const existing = await collection.find({ email: { $in: emails } }).toArray();
  return existing.map(mapAccount as any) as AccountView[];
}

export async function createAccounts(inputs: CreateAccountInput[]) {
  if (inputs.length === 0) return;
  const now = new Date();
  const collection = await getAccountsCollection();
  await collection.insertMany(
    inputs.map((input): AccountDocument => ({
      email: input.email,
      accountId: input.accountId,
      status: input.status,
      saleStatus: input.status === "reg-success" ? "available" : "reserved",
      password: input.password,
      sessionToken: input.sessionToken,
      mailkp: input.mailkp,
      passwordMailkp: input.passwordMailkp,
      createdAt: now,
      updatedAt: now,
    })),
  );
}

export async function updateAccountStatus(id: string, status: AccountStatus) {
  const collection = await getAccountsCollection();
  const updateDoc: any = { status, updatedAt: new Date() };
  if (status === "reg-success") {
    updateDoc.saleStatus = "available";
  } else {
    updateDoc.saleStatus = "reserved";
  }
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
}

export async function updateAccountSaleStatus(id: string, saleStatus: AccountSaleStatus) {
  const collection = await getAccountsCollection();
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { saleStatus, updatedAt: new Date() } }
  );
}

export async function deleteAccount(id: string) {
  const collection = await getAccountsCollection();
  await collection.deleteOne({ _id: new ObjectId(id) });
}

export async function assignAccountToOrder(accountId: string, orderId: string) {
  const collection = await getAccountsCollection();
  const result = await collection.updateOne(
    {
      _id: new ObjectId(accountId),
      status: "reg-success",
      saleStatus: "available"
    },
    {
      $set: {
        saleStatus: "reserved",
        soldOrderId: orderId,
        updatedAt: new Date(),
      },
      $unset: { soldAt: "" },
    },
  );
  return result.modifiedCount === 1;
}

export async function markAccountAsSold(accountId: string, orderId: string) {
  const collection = await getAccountsCollection();
  const result = await collection.updateOne(
    {
      _id: new ObjectId(accountId),
      saleStatus: "reserved",
      soldOrderId: orderId,
    },
    {
      $set: {
        saleStatus: "sold",
        soldAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );
  return result.modifiedCount === 1;
}

export async function releaseAccountFromOrder(accountId: string, orderId: string) {
  const collection = await getAccountsCollection();
  const result = await collection.updateOne(
    {
      _id: new ObjectId(accountId),
      soldOrderId: orderId,
      saleStatus: "reserved",
    },
    {
      $set: {
        saleStatus: "available",
        updatedAt: new Date(),
      },
      $unset: {
        soldOrderId: "",
        soldAt: "",
      },
    },
  );
  return result.modifiedCount === 1;
}

export async function rollbackAccountOrderAssignment(accountId: string, orderId: string) {
  const collection = await getAccountsCollection();
  const result = await collection.updateOne(
    {
      _id: new ObjectId(accountId),
      soldOrderId: orderId,
      saleStatus: { $in: ["reserved", "sold"] },
    },
    {
      $set: {
        saleStatus: "available",
        updatedAt: new Date(),
      },
      $unset: {
        soldOrderId: "",
        soldAt: "",
      },
    },
  );
  return result.modifiedCount === 1;
}

export async function revokeAccount(accountId: string) {
  const collection = await getAccountsCollection();
  const account = await collection.findOne({ _id: new ObjectId(accountId), saleStatus: "sold" });
  if (!account) return null;

  const soldOrderId = account.soldOrderId;

  const result = await collection.updateOne(
    { _id: new ObjectId(accountId), saleStatus: "sold" },
    {
      $set: {
        saleStatus: "available",
        updatedAt: new Date(),
      },
      $unset: {
        soldOrderId: "",
        soldAt: "",
      },
    }
  );

  return result.modifiedCount === 1 ? soldOrderId : null;
}

export async function revokeAccountsByOrderId(orderId: string) {
  const collection = await getAccountsCollection();
  const now = new Date();
  const result = await collection.updateMany(
    {
      soldOrderId: orderId,
      saleStatus: "sold",
    },
    {
      $set: {
        saleStatus: "available",
        updatedAt: now,
      },
      $unset: {
        soldOrderId: "",
        soldAt: "",
      },
    },
  );

  return result.modifiedCount;
}
