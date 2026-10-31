import { describe, it, expect } from "vitest";

describe("Customer Portal Business Rules", () => {
  describe("Overdue Computation", () => {
    function computeIsOverdue(invoice: {
      status: string;
      dueDate: string | null;
      total: string;
      amountPaid: string;
      todayStr: string;
    }): boolean {
      const totalNum = parseFloat(invoice.total);
      const paidNum = parseFloat(invoice.amountPaid);
      const balanceDue = Math.max(0, totalNum - paidNum);

      return (
        invoice.status === "CONFIRMED" &&
        invoice.dueDate !== null &&
        invoice.dueDate < invoice.todayStr &&
        balanceDue > 0.01
      );
    }

    it("marks CONFIRMED invoice with past due date and remaining balance as overdue", () => {
      const isOverdue = computeIsOverdue({
        status: "CONFIRMED",
        dueDate: "2026-10-01",
        total: "1500.00",
        amountPaid: "500.00",
        todayStr: "2026-10-31",
      });
      expect(isOverdue).toBe(true);
    });

    it("does not mark invoice as overdue if fully paid", () => {
      const isOverdue = computeIsOverdue({
        status: "CONFIRMED",
        dueDate: "2026-10-01",
        total: "1500.00",
        amountPaid: "1500.00",
        todayStr: "2026-10-31",
      });
      expect(isOverdue).toBe(false);
    });

    it("does not mark invoice as overdue if status is DRAFT", () => {
      const isOverdue = computeIsOverdue({
        status: "DRAFT",
        dueDate: "2026-10-01",
        total: "1500.00",
        amountPaid: "0.00",
        todayStr: "2026-10-31",
      });
      expect(isOverdue).toBe(false);
    });

    it("does not mark invoice as overdue if due date is in the future", () => {
      const isOverdue = computeIsOverdue({
        status: "CONFIRMED",
        dueDate: "2026-11-15",
        total: "1500.00",
        amountPaid: "0.00",
        todayStr: "2026-10-31",
      });
      expect(isOverdue).toBe(false);
    });
  });

  describe("Subscription State Transition Guards", () => {
    function canCustomerPause(sub: { status: string; planPausable: boolean }): boolean {
      return sub.status === "ACTIVE" && sub.planPausable;
    }

    function canCustomerResume(sub: { status: string }): boolean {
      return sub.status === "PAUSED";
    }

    function canCustomerCancel(sub: { status: string; planClosable: boolean }): boolean {
      return sub.status !== "CLOSED" && sub.planClosable;
    }

    it("allows pause only when active and plan allows pausable", () => {
      expect(canCustomerPause({ status: "ACTIVE", planPausable: true })).toBe(true);
      expect(canCustomerPause({ status: "ACTIVE", planPausable: false })).toBe(false);
      expect(canCustomerPause({ status: "PAUSED", planPausable: true })).toBe(false);
      expect(canCustomerPause({ status: "CLOSED", planPausable: true })).toBe(false);
    });

    it("allows resume only when subscription is in PAUSED status", () => {
      expect(canCustomerResume({ status: "PAUSED" })).toBe(true);
      expect(canCustomerResume({ status: "ACTIVE" })).toBe(false);
      expect(canCustomerResume({ status: "CLOSED" })).toBe(false);
    });

    it("allows cancellation only when plan is closable and not already closed", () => {
      expect(canCustomerCancel({ status: "ACTIVE", planClosable: true })).toBe(true);
      expect(canCustomerCancel({ status: "PAUSED", planClosable: true })).toBe(true);
      expect(canCustomerCancel({ status: "ACTIVE", planClosable: false })).toBe(false);
      expect(canCustomerCancel({ status: "CLOSED", planClosable: true })).toBe(false);
    });
  });

  describe("Payment Settlement Logic", () => {
    function calculatePaymentResult(currentPaid: number, total: number, paymentAmount: number) {
      const balanceDue = Math.max(0, total - currentPaid);
      if (paymentAmount > balanceDue + 0.01) {
        throw new Error("Payment exceeds balance due");
      }
      const newAmountPaid = currentPaid + paymentAmount;
      const isNowFullyPaid = newAmountPaid >= total - 0.01;
      return {
        newAmountPaid: newAmountPaid.toFixed(2),
        isNowFullyPaid,
        newStatus: isNowFullyPaid ? "PAID" : "CONFIRMED",
      };
    }

    it("handles partial payment correctly without flipping to PAID", () => {
      const res = calculatePaymentResult(0, 1000, 400);
      expect(res.newAmountPaid).toBe("400.00");
      expect(res.isNowFullyPaid).toBe(false);
      expect(res.newStatus).toBe("CONFIRMED");
    });

    it("handles complete settlement flipping status to PAID", () => {
      const res = calculatePaymentResult(400, 1000, 600);
      expect(res.newAmountPaid).toBe("1000.00");
      expect(res.isNowFullyPaid).toBe(true);
      expect(res.newStatus).toBe("PAID");
    });

    it("rejects overpayment beyond balance due", () => {
      expect(() => calculatePaymentResult(500, 1000, 600)).toThrow(
        "Payment exceeds balance due"
      );
    });
  });
});

