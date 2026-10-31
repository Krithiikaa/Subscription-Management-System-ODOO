export type ProductDepartmentInfo = {
  department: string;
  leadStaff: string;
  role: string;
  email: string;
  approvalCode: string;
};

export const PRODUCT_DEPARTMENTS: Record<string, ProductDepartmentInfo> = {
  BrightMail: {
    department: "Cloud Communications & Messaging",
    leadStaff: "Kiran Kumar",
    role: "Senior Communications Specialist",
    email: "kiran.staff@brightloop.io",
    approvalCode: "DEPT-COMM-01",
  },
  BrightAnalytics: {
    department: "Data Intelligence & Analytics",
    leadStaff: "Deepa Verma",
    role: "Principal Analytics Officer",
    email: "deepa.staff@brightloop.io",
    approvalCode: "DEPT-DATA-02",
  },
  BrightSupport: {
    department: "Customer Success & Technical Services",
    leadStaff: "Suresh Nair",
    role: "Support Division Lead",
    email: "suresh.staff@brightloop.io",
    approvalCode: "DEPT-SUPP-03",
  },
  BrightCloud: {
    department: "Cloud Infrastructure & DevOps",
    leadStaff: "Arun Prakash",
    role: "Cloud Solutions Architect",
    email: "arun.staff@brightloop.io",
    approvalCode: "DEPT-CLD-04",
  },
  BrightSecure: {
    department: "Information Security & Identity Protection",
    leadStaff: "Meera Krishnan",
    role: "Cybersecurity Lead Specialist",
    email: "meera.staff@brightloop.io",
    approvalCode: "DEPT-SEC-05",
  },
  BrightAPI: {
    department: "Developer Platform & API Systems",
    leadStaff: "Rohan Das",
    role: "API Gateway Architect",
    email: "rohan.staff@brightloop.io",
    approvalCode: "DEPT-API-06",
  },
  BrightBackup: {
    department: "Storage & Disaster Recovery",
    leadStaff: "Ananya Iyer",
    role: "Data Protection Officer",
    email: "ananya.staff@brightloop.io",
    approvalCode: "DEPT-STRG-07",
  },
  BrightMeet: {
    department: "Unified Collaboration & Video Networks",
    leadStaff: "Karthik Raja",
    role: "Media Services Specialist",
    email: "karthik.staff@brightloop.io",
    approvalCode: "DEPT-CONF-08",
  },
  BrightDocs: {
    department: "Enterprise Content & Document Management",
    leadStaff: "Pooja M.",
    role: "Document Systems Officer",
    email: "pooja.staff@brightloop.io",
    approvalCode: "DEPT-DOCS-09",
  },
  BrightAI: {
    department: "Artificial Intelligence & Automation Division",
    leadStaff: "Vikram Sengupta",
    role: "AI Solutions Principal",
    email: "vikram.staff@brightloop.io",
    approvalCode: "DEPT-AI-10",
  },
};

export function getDepartmentForProduct(
  productName?: string | null,
  category?: string | null
): ProductDepartmentInfo {
  if (productName && PRODUCT_DEPARTMENTS[productName]) {
    return PRODUCT_DEPARTMENTS[productName];
  }

  // Fallback by category
  if (category?.toLowerCase().includes("ai")) {
    return PRODUCT_DEPARTMENTS.BrightAI;
  }
  if (category?.toLowerCase().includes("security")) {
    return PRODUCT_DEPARTMENTS.BrightSecure;
  }
  if (category?.toLowerCase().includes("cloud")) {
    return PRODUCT_DEPARTMENTS.BrightCloud;
  }
  if (category?.toLowerCase().includes("comm") || category?.toLowerCase().includes("mail")) {
    return PRODUCT_DEPARTMENTS.BrightMail;
  }

  return {
    department: "Enterprise Software Licensing Division",
    leadStaff: "Department Review Officer",
    role: "Authorized Staff Specialist",
    email: "licensing@brightloop.io",
    approvalCode: "DEPT-GEN-00",
  };
}

