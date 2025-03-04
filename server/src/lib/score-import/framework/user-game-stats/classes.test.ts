import { ProcessClassDeltas, UpdateUGSClasses } from "./classes";
import CreateLogCtx from "lib/logger/logger";
import { GITADORA_COLOURS } from "tachi-common";
import t from "tap";
import ResetDBState from "test-utils/resets";
import type { UserGameStats } from "tachi-common";

const logger = CreateLogCtx(__filename);

t.test("#UpdateUGSClasses", (t) => {
	t.test("Should produce an empty object by default", async (t) => {
		const res = await UpdateUGSClasses("iidx", "SP", 1, {}, null, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should call and merge the ClassHandler", async (t) => {
		const res = await UpdateUGSClasses("iidx", "SP", 1, {}, () => ({ dan: 2 }), logger);

		t.strictSame(res, { dan: 2 });

		t.end();
	});

	t.test("Should call static handlers if there is one", async (t) => {
		const res = await UpdateUGSClasses(
			"gitadora",
			"Dora",
			1,
			{
				skill: 9000,
			},
			null,
			logger
		);

		t.strictSame(res, { colour: GITADORA_COLOURS.RAINBOW });

		t.end();
	});

	t.end();
});

t.test("#ProcessClassDeltas", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return improved classes from null", async (t) => {
		const res = await ProcessClassDeltas("iidx", "SP", { dan: 18 }, null, 1, logger);

		t.strictSame(res, [
			{
				game: "iidx",
				set: "dan",
				playtype: "SP",
				old: null,
				new: 18,
			},
		]);

		t.end();
	});

	t.test("Should return improved classes from null class", async (t) => {
		const res = await ProcessClassDeltas(
			"iidx",
			"SP",
			{ dan: 18 },
			{ classes: {} } as UserGameStats,
			1,
			logger
		);

		t.strictSame(res, [
			{
				game: "iidx",
				set: "dan",
				playtype: "SP",
				old: null,
				new: 18,
			},
		]);

		t.end();
	});

	t.test("Should return improved classes", async (t) => {
		const res = await ProcessClassDeltas(
			"iidx",
			"SP",
			{ dan: 18 },
			{ classes: { dan: 17 } } as unknown as UserGameStats,
			1,
			logger
		);

		t.strictSame(res, [
			{
				game: "iidx",
				set: "dan",
				playtype: "SP",
				old: 17,
				new: 18,
			},
		]);

		t.end();
	});

	t.test("Should not return identical classes", async (t) => {
		const res = await ProcessClassDeltas(
			"iidx",
			"SP",
			{ dan: 18 },
			{ classes: { dan: 18 } } as unknown as UserGameStats,
			1,
			logger
		);

		t.strictSame(res, []);

		t.end();
	});

	t.test("Should not return worse classes if the class isn't downgradable", async (t) => {
		const res = await ProcessClassDeltas(
			"iidx",
			"SP",
			{ dan: 16 },
			{ classes: { dan: 18 } } as unknown as UserGameStats,
			1,
			logger
		);

		t.strictSame(res, []);

		t.end();
	});

	t.test("Should return worse classes if the class is downgradable", async (t) => {
		const res = await ProcessClassDeltas(
			"sdvx",
			"Single",
			{ vfClass: 9 },
			{ classes: { vfClass: 10 } } as unknown as UserGameStats,
			1,
			logger
		);

		t.strictSame(res, [
			{
				game: "sdvx",
				set: "vfClass",
				playtype: "Single",
				old: 10,
				new: 9,
			},
		]);

		t.end();
	});

	t.end();
});
