export type OrderStatus = "pending" | "assigned" | "completed" | "cancelled";

export type OrderDocument = {
  buyerUsername?: string;
  buyerContact: string;
  unitPrice: number;
  quantity: 1;
  totalPrice: number;
  status: OrderStatus;
  accountId?: string;
  accountEmail?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
};

export type OrderView = {
  id: string;
  buyerUsername: string | null;
  buyerContact: string;
  unitPriceLabel: string;
  status: OrderStatus;
  accountEmail: string | null;
  accountId: string | null;
  createdAt: string;
  assignedAt: string | null;
};
