import { describe, it, expect } from "vitest";
import { getColumnTypeLabel, COLUMN_TYPE_LABELS } from "./column-type-labels";

describe("COLUMN_TYPE_LABELS", () => {
  it("should have entries for PRIMARY_KEY, FOREIGN_KEY, and FOREIGN_KEY_ARRAY", () => {
    expect(COLUMN_TYPE_LABELS["PRIMARY_KEY"]).toBe("PK");
    expect(COLUMN_TYPE_LABELS["FOREIGN_KEY"]).toBe("FK");
    expect(COLUMN_TYPE_LABELS["FOREIGN_KEY_ARRAY"]).toBe("FK []");
  });
});

describe("getColumnTypeLabel", () => {
  it("returns 'PK' for PRIMARY_KEY", () => {
    expect(getColumnTypeLabel("PRIMARY_KEY")).toBe("PK");
  });

  it("returns 'FK' for FOREIGN_KEY", () => {
    expect(getColumnTypeLabel("FOREIGN_KEY")).toBe("FK");
  });

  it("returns 'FK []' for FOREIGN_KEY_ARRAY", () => {
    expect(getColumnTypeLabel("FOREIGN_KEY_ARRAY")).toBe("FK []");
  });

  it("passes through unknown types unchanged", () => {
    expect(getColumnTypeLabel("VARCHAR")).toBe("VARCHAR");
    expect(getColumnTypeLabel("INT")).toBe("INT");
    expect(getColumnTypeLabel("custom_type")).toBe("custom_type");
  });
});
