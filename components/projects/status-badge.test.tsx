import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { STATUSES, PRIORITIES } from "@/lib/projects/types";

describe("StatusBadge", () => {
  it.each(STATUSES)("renders the %s status label", (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });
});

describe("PriorityBadge", () => {
  it.each(PRIORITIES)("renders the %s priority label", (priority) => {
    render(<PriorityBadge priority={priority} />);
    expect(screen.getByText(priority)).toBeInTheDocument();
  });
});
