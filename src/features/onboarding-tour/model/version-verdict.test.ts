import { describe, expect, it } from "vitest";
import { rankVersions, type VersionScore } from "./version-verdict";

const score = (
	id: string,
	completude: number,
	total: number,
): VersionScore => ({
	id,
	name: id,
	accessPattern: 0,
	recoveryCost: 0,
	redundancy: 0,
	completude,
	total,
});

const ids = (scores: VersionScore[]) => scores.map((item) => item.id);

describe("rankVersions", () => {
	it("puts the version that answers more queries first", () => {
		expect(ids(rankVersions([score("v1", 50, 1), score("v2", 100, 9)]))).toEqual([
			"v2",
			"v1",
		]);
	});

	it("breaks ties with the lowest combined cost", () => {
		expect(ids(rankVersions([score("v1", 100, 6.2), score("v2", 100, 4.1)]))).toEqual([
			"v2",
			"v1",
		]);
	});

	it("keeps the original order on a full tie", () => {
		expect(ids(rankVersions([score("v1", 100, 4), score("v2", 100, 4)]))).toEqual([
			"v1",
			"v2",
		]);
	});

	it("does not mutate its input", () => {
		const input = [score("v1", 0, 1), score("v2", 100, 1)];
		rankVersions(input);
		expect(ids(input)).toEqual(["v1", "v2"]);
	});
});
