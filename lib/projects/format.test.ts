import { describe, expect, it } from "vitest";
import { daysUntil, formatDate, formatRelativeDue, isOverdue } from "./format";

const now = new Date("2026-06-23T09:00:00Z");

describe("formatDate", () => {
  it("formats an ISO date", () => {
    expect(formatDate("2026-07-15")).toBe("15 Jul 2026");
  });

  it("renders a dash for empty input", () => {
    expect(formatDate("")).toBe("—");
  });
});

describe("daysUntil", () => {
  it("counts whole days, past and future", () => {
    expect(daysUntil("2026-06-23", now)).toBe(0);
    expect(daysUntil("2026-06-26", now)).toBe(3);
    expect(daysUntil("2026-06-20", now)).toBe(-3);
  });
});

describe("isOverdue", () => {
  it("is true when past and not completed", () => {
    expect(isOverdue("2026-06-20", false, now)).toBe(true);
  });

  it("is false when completed, regardless of date", () => {
    expect(isOverdue("2026-06-20", true, now)).toBe(false);
  });

  it("is false for a future date", () => {
    expect(isOverdue("2026-06-26", false, now)).toBe(false);
  });
});

describe("formatRelativeDue", () => {
  it("labels relative due dates", () => {
    expect(formatRelativeDue("2026-06-23", now)).toBe("Today");
    expect(formatRelativeDue("2026-06-24", now)).toBe("Tomorrow");
    expect(formatRelativeDue("2026-06-26", now)).toBe("in 3 days");
    expect(formatRelativeDue("2026-06-22", now)).toBe("1 day overdue");
    expect(formatRelativeDue("2026-06-18", now)).toBe("5 days overdue");
  });
});
