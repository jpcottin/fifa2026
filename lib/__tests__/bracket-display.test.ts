import { describe, it, expect } from "vitest";
import { shortNote } from "../bracket-utils";

describe("shortNote", () => {
  it("abbreviates group winner", () => {
    expect(shortNote("Winner Group I")).toBe("I1");
  });

  it("abbreviates group runner-up", () => {
    expect(shortNote("Runner-up Group A")).toBe("A2");
  });

  it("abbreviates 3rd-place spec preserving group letters", () => {
    expect(shortNote("3rd Place Group C/D/F/G/H")).toBe("3rd C/D/F/G/H");
  });

  it("abbreviates full partial-TBD note correctly", () => {
    expect(shortNote("Winner Group I vs 3rd Place Group C/D/F/G/H")).toBe("I1 vs 3rd C/D/F/G/H");
  });

  it("abbreviates full both-TBD R32 note", () => {
    expect(shortNote("Runner-up Group A vs Runner-up Group B")).toBe("A2 vs B2");
  });

  it("abbreviates winner-match refs", () => {
    expect(shortNote("Winner Match 74 vs Winner Match 77")).toBe("W74 vs W77");
  });

  it("abbreviates loser-match refs (3rd place game)", () => {
    expect(shortNote("Loser Match 101 vs Loser Match 102")).toBe("L101 vs L102");
  });

  it("handles two different 3rd-place group pools", () => {
    expect(shortNote("Winner Group E vs 3rd Place Group A/B/C/D/F")).toBe("E1 vs 3rd A/B/C/D/F");
  });
});
