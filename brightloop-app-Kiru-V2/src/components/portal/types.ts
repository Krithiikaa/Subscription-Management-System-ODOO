export type PortalCustomer = {
  id: number;
  name: string;
  email: string;
  companyName?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type PortalMetrics = {
  activeSubsCount: number;
  pausedSubsCount: number;
  totalSubsCount: number;
  nextBillingDate: string | null;
  estimatedNextBillingAmount: string;
  totalOutstanding: string;
  overdueCount: number;
  totalInvoiced: string;
  totalPaid: string;
};

export type PortalSubscriptionLine = {
  id: number;
  subscriptionId: number;
  productId: number;
  variantId?: number | null;
  quantity: number;
  unitPrice: string;
  amount: string;
  productName: string;
  variantName?: string | null;
  variantCode?: string | null;
  extraPrice?: string | null;
};

export type PortalSubscription = {
  id: number;
  number: string;
  status: "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED";
  startDate: string;
  expiryDate?: string | null;
  nextBillingDate?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  createdAt: string;
  planId: number;
  planName: string;
  planPrice: string;
  planCurrency: string;
  planBillingPeriod: string;
  planAutoClose: boolean;
  planClosable: boolean;
  planPausable: boolean;
  planRenewable: boolean;
  productId: number;
  productName: string;
  productCategory: string;
  productType: string;
  lines: PortalSubscriptionLine[];
};

export type PortalInvoiceLine = {
  id: number;
  invoiceId: number;
  productId: number;
  variantId?: number | null;
  description?: string | null;
  quantity: number;
  unitPrice: string;
  variantExtra: string;
  taxRatePct: string;
  taxAmount: string;
  discountAmount: string;
  lineTotal: string;
  productName: string;
  variantName?: string | null;
};

export type PortalPayment = {
  id: number;
  invoiceId: number;
  invoiceNumber?: string;
  amount: string;
  method: string;
  paidOn: string;
  note?: string | null;
  createdAt: string;
};

export type PortalInvoice = {
  id: number;
  number: string;
  subscriptionId: number;
  status: "DRAFT" | "CONFIRMED" | "PAID" | "CANCELLED";
  periodStart: string;
  periodEnd: string;
  dueDate: string | null;
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  total: string;
  amountPaid: string;
  sentAt?: string | null;
  createdAt: string;
  balanceDue: string;
  isOverdue: boolean;
  lines: PortalInvoiceLine[];
  payments: PortalPayment[];
};

export type PortalCatalogueVariant = {
  id: number;
  productId: number;
  name: string;
  code?: string | null;
  description?: string | null;
  extraPrice: string;
  active: boolean;
};

export type PortalCataloguePlan = {
  id: number;
  productId: number;
  name: string;
  description?: string | null;
  price: string;
  currency: string;
  billingPeriod: string;
  minQuantity: number;
  closable: boolean;
  pausable: boolean;
  renewable: boolean;
};

export type PortalCatalogueProduct = {
  id: number;
  name: string;
  sku?: string | null;
  category: string;
  type: string;
  description?: string | null;
  salesPrice: string;
  currency: string;
  notes?: string | null;
  status: string;
  variants: PortalCatalogueVariant[];
  plans: PortalCataloguePlan[];
};

export type PortalQuotation = {
  id: number;
  number: string;
  status: string;
  startDate: string;
  expiryDate?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  createdAt: string;
  planId: number;
  planName: string;
  planPrice: string;
  planBillingPeriod: string;
  productId: number;
  productName: string;
  productCategory: string;
  lines: PortalSubscriptionLine[];
  totalAmount: string;
};

export type PortalSoftwareAccess = {
  subscriptionId: number;
  subscriptionNumber: string;
  productName: string;
  productCategory: string;
  planName: string;
  accessStatus: "ACTIVE" | "SUSPENDED" | "PAUSED" | "EXPIRED" | "PROVISIONING";
  statusMessage: string;
  activationDate: string;
  expiryDate: string;
  licenseKey: string;
  accessUrl: string;
  canLaunch: boolean;
};

export type PortalNotification = {
  id: string;
  type: "QUOTATION" | "INVOICE" | "PAYMENT" | "SUBSCRIPTION" | "SYSTEM";
  title: string;
  message: string;
  date: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  read: boolean;
};

export type PortalDashboardData = {
  customer: PortalCustomer;
  metrics: PortalMetrics;
  subscriptions: PortalSubscription[];
  invoices: PortalInvoice[];
  payments: PortalPayment[];
};
