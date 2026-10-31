/**
 * SAMPLE DEMO DATA — MODULE 1: INVOICE GENERATION DASHBOARD
 * 
 * Note: This data is structured to easily map to Odoo standard models:
 * - Odoo Model: account.move (Invoice)
 * - Odoo Model: res.partner (Customer)
 * - Odoo Model: sale.subscription (Subscription Contract)
 * 
 * Future Integration Notice:
 * When connecting to Odoo XML-RPC or REST API, the fields below correspond to:
 * - id -> odoo_id
 * - invoiceNumber -> name (e.g. 'INV/2026/0001')
 * - customer -> partner_id [id, name]
 * - subscription -> subscription_id [id, display_name]
 * - invoiceDate -> invoice_date
 * - dueDate -> invoice_date_due
 * - amount -> amount_total
 * - status -> state / payment_state ('draft', 'posted', 'paid', 'overdue')
 */

export const INITIAL_INVOICES = [
  {
    id: 'inv-001',
    odooId: 101,
    invoiceNumber: 'INV-2026-001',
    customer: {
      name: 'Acme Global Technologies',
      email: 'billing@acmeglobal.com',
      avatarColor: '#BFA588',
      initials: 'AG',
      type: 'B2B Enterprise',
      odooPartnerId: 42
    },
    subscription: {
      plan: 'Enterprise Cloud Suite',
      billingCycle: 'Annual',
      code: 'SUB-ENT-2024-88',
      seats: 120
    },
    invoiceDate: '2026-10-01',
    dueDate: '2026-10-31',
    amount: 14500.00,
    currency: 'USD',
    status: 'paid', // 'paid' | 'draft' | 'overdue'
    paymentDate: '2026-10-24',
    paymentMethod: 'Stripe Corporate Card',
    notes: 'Includes Q4 Enterprise Support & Dedicated SLA'
  },
  {
    id: 'inv-002',
    odooId: 102,
    invoiceNumber: 'INV-2026-002',
    customer: {
      name: 'Nordic Horizon Media',
      email: 'finance@nordichorizon.se',
      avatarColor: '#8C7A6B',
      initials: 'NH',
      type: 'Agency Pro',
      odooPartnerId: 58
    },
    subscription: {
      plan: 'Professional Multi-Seat',
      billingCycle: 'Monthly',
      code: 'SUB-PRO-2025-14',
      seats: 25
    },
    invoiceDate: '2026-10-05',
    dueDate: '2026-10-20',
    amount: 3200.00,
    currency: 'USD',
    status: 'overdue',
    paymentDate: null,
    paymentMethod: 'Wire Transfer (Pending)',
    notes: 'Automated 7-day overdue reminder sent on Oct 27'
  },
  {
    id: 'inv-003',
    odooId: 103,
    invoiceNumber: 'INV-2026-003',
    customer: {
      name: 'Lumina Health Labs',
      email: 'accounts@luminalabs.org',
      avatarColor: '#A4907C',
      initials: 'LH',
      type: 'Healthcare Pro',
      odooPartnerId: 64
    },
    subscription: {
      plan: 'Compliance & Analytics',
      billingCycle: 'Quarterly',
      code: 'SUB-CMP-2025-09',
      seats: 40
    },
    invoiceDate: '2026-10-12',
    dueDate: '2026-11-12',
    amount: 7850.00,
    currency: 'USD',
    status: 'draft',
    paymentDate: null,
    paymentMethod: 'Awaiting Confirmation',
    notes: 'Draft generated from recurring subscription cron'
  },
  {
    id: 'inv-004',
    odooId: 104,
    invoiceNumber: 'INV-2026-004',
    customer: {
      name: 'Vanguard Retail Systems',
      email: 'invoicing@vanguardretail.io',
      avatarColor: '#9C8370',
      initials: 'VR',
      type: 'Enterprise Retail',
      odooPartnerId: 77
    },
    subscription: {
      plan: 'Enterprise POS + Cloud Sync',
      billingCycle: 'Annual',
      code: 'SUB-POS-2024-03',
      seats: 200
    },
    invoiceDate: '2026-09-28',
    dueDate: '2026-10-28',
    amount: 22400.00,
    currency: 'USD',
    status: 'paid',
    paymentDate: '2026-10-18',
    paymentMethod: 'ACH Direct Debit',
    notes: 'Pre-paid annual renewal with 10% contract discount'
  },
  {
    id: 'inv-005',
    odooId: 105,
    invoiceNumber: 'INV-2026-005',
    customer: {
      name: 'Solaris Energy Partners',
      email: 'ops@solarisenergy.com',
      avatarColor: '#B09B82',
      initials: 'SE',
      type: 'Industrial CleanTech',
      odooPartnerId: 81
    },
    subscription: {
      plan: 'Industrial IoT Telemetry',
      billingCycle: 'Monthly',
      code: 'SUB-IOT-2025-72',
      seats: 15
    },
    invoiceDate: '2026-10-15',
    dueDate: '2026-10-30',
    amount: 4600.00,
    currency: 'USD',
    status: 'overdue',
    paymentDate: null,
    paymentMethod: 'Corporate Credit Card',
    notes: 'Payment gateway declined: Expired card on file'
  },
  {
    id: 'inv-006',
    odooId: 106,
    invoiceNumber: 'INV-2026-006',
    customer: {
      name: 'Crestline Financial Advisory',
      email: 'treasury@crestlineadvisory.com',
      avatarColor: '#78685A',
      initials: 'CF',
      type: 'Financial Services',
      odooPartnerId: 93
    },
    subscription: {
      plan: 'Wealth Advisory Suite',
      billingCycle: 'Monthly',
      code: 'SUB-FIN-2025-33',
      seats: 30
    },
    invoiceDate: '2026-10-20',
    dueDate: '2026-11-20',
    amount: 5120.00,
    currency: 'USD',
    status: 'paid',
    paymentDate: '2026-10-25',
    paymentMethod: 'Bank Wire / Swift',
    notes: 'Early payment discount applied'
  },
  {
    id: 'inv-007',
    odooId: 107,
    invoiceNumber: 'INV-2026-007',
    customer: {
      name: 'Kestrel Robotics Corp',
      email: 'billing@kestrelrobotics.ai',
      avatarColor: '#957C66',
      initials: 'KR',
      type: 'Hardware / AI',
      odooPartnerId: 104
    },
    subscription: {
      plan: 'Vision AI Simulation Node',
      billingCycle: 'Quarterly',
      code: 'SUB-ROB-2026-01',
      seats: 10
    },
    invoiceDate: '2026-10-25',
    dueDate: '2026-11-25',
    amount: 8900.00,
    currency: 'USD',
    status: 'draft',
    paymentDate: null,
    paymentMethod: 'Net 30 Terms',
    notes: 'Pending purchase order verification from procurement'
  },
  {
    id: 'inv-008',
    odooId: 108,
    invoiceNumber: 'INV-2026-008',
    customer: {
      name: 'Aura Design Studios',
      email: 'hello@auradesign.co',
      avatarColor: '#C4B29E',
      initials: 'AD',
      type: 'Creative Agency',
      odooPartnerId: 112
    },
    subscription: {
      plan: 'Creative Team Starter',
      billingCycle: 'Monthly',
      code: 'SUB-CRT-2025-55',
      seats: 8
    },
    invoiceDate: '2026-10-28',
    dueDate: '2026-11-12',
    amount: 1450.00,
    currency: 'USD',
    status: 'draft',
    paymentDate: null,
    paymentMethod: 'Online Payment Portal',
    notes: 'New subscriber introductory rate'
  }
];

export const DEMO_SUBSCRIPTION_PLANS = [
  'Enterprise Cloud Suite ($14,500/yr)',
  'Professional Multi-Seat ($3,200/mo)',
  'Compliance & Analytics ($7,850/qtr)',
  'Enterprise POS + Cloud Sync ($22,400/yr)',
  'Industrial IoT Telemetry ($4,600/mo)',
  'Wealth Advisory Suite ($5,120/mo)',
  'Vision AI Simulation Node ($8,900/qtr)',
  'Creative Team Starter ($1,450/mo)',
  'Custom Enterprise Tier (Variable)'
];
