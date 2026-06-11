export type WarrantyStatus = "pending" | "active" | "expired" | "void";

export type ElectronicWarranty = {
  id: string;
  memberId: string;
  orderId: string | null;
  productId: string;
  frameSerialNumber: string;
  batterySerialNumber: string | null;
  purchaseDate: string;
  activatedAt: string | null;
  expiresAt: string | null;
  status: WarrantyStatus;
  serviceRecords: WarrantyServiceRecord[];
};

export type WarrantyServiceRecord = {
  id: string;
  warrantyId: string;
  type: "inspection" | "maintenance" | "repair";
  description: string;
  servicedAt: string;
  store: "hengchun" | "guishan" | "other";
};
