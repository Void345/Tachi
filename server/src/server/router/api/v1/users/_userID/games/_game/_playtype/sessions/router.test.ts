import db from "external/mongo/db";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { LoadTachiIIDXData } from "test-utils/test-data";
import type { SessionDocument } from "tachi-common";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/sessions", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadTachiIIDXData);

	t.test("Should return 400 if no search param is given", async (t) => {
		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/sessions");

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		t.end();
	});

	t.test("Should return 400 if invalid search param is given", async (t) => {
		const res = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/sessions?search=foo&search=bar"
		);

		t.equal(res.statusCode, 400);
		t.equal(res.body.success, false);

		// evil eval attempts
		const res2 = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/sessions?search[$where]=process.exit(1)"
		);

		t.equal(res2.statusCode, 400);
		t.equal(res2.body.success, false);

		t.end();
	});

	t.test("Should search a user's sessions.", async (t) => {
		await db.sessions.insert(
			["Epic Session", "Session Of Epic", "Epic Gaming", "something else", "bad session"].map(
				(e) => ({
					userID: 1,
					game: "iidx",
					playtype: "SP",
					name: e,
					desc: "something",

					// hack to avoid db nonsense
					sessionID: e,
				})
			) as Array<SessionDocument>
		);

		const res = await mockApi.get(
			"/api/v1/users/test_zkldi/games/iidx/SP/sessions?search=Epic"
		);

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 3 sessions.",
			body: [],
		});

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/sessions/best", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadTachiIIDXData);

	t.test("Should return a user's best 100 sessions.", async (t) => {
		const sessions: Array<SessionDocument> = [];

		for (let i = 0; i < 200; i++) {
			sessions.push({
				sessionID: i.toString(),
				game: "iidx",
				playtype: "SP",
				userID: 1,
				scoreIDs: [],
				calculatedData: {
					ktLampRating: i,
				},
				desc: null,
				name: i.toString(),
				highlight: false,
				importType: "file/batch-manual",
				timeEnded: 0,
				timeInserted: 0,
				timeStarted: 0,
			});
		}

		await db.sessions.remove({});
		await db.sessions.insert(sessions);

		const res = await mockApi.get("/api/v1/users/test_zkldi/games/iidx/SP/sessions/best");

		t.hasStrict(res.body, {
			success: true,
			description: "Retrieved 100 sessions.",
		});

		t.strictSame(
			res.body.body.map((e: SessionDocument) => e.sessionID),
			sessions
				.slice(100)
				.reverse()
				.map((e) => e.sessionID)
		);

		t.end();
	});

	t.test(
		"Should return a user's best 100 sessions according to the provided rating alg.",
		async (t) => {
			const sessions: Array<SessionDocument> = [];

			for (let i = 0; i < 200; i++) {
				sessions.push({
					sessionID: i.toString(),
					game: "iidx",
					playtype: "SP",
					userID: 1,
					scoreIDs: [],
					calculatedData: {
						ktLampRating: 200 - i,
						BPI: i,
					},
					desc: null,
					name: i.toString(),
					highlight: false,
					importType: "file/batch-manual",
					timeEnded: 0,
					timeInserted: 0,
					timeStarted: 0,
				});
			}

			await db.sessions.remove({});
			await db.sessions.insert(sessions);

			const res = await mockApi.get(
				"/api/v1/users/test_zkldi/games/iidx/SP/sessions/best?alg=BPI"
			);

			t.hasStrict(res.body, {
				success: true,
				description: "Retrieved 100 sessions.",
			});

			t.strictSame(
				res.body.body.map((e: SessionDocument) => e.sessionID),
				sessions
					.slice(100)
					.reverse()
					.map((e) => e.sessionID)
			);

			t.end();
		}
	);

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/sessions/highlighted", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return only highlighted sessions.", async (t) => {
		await db.sessions.insert({
			highlight: true,
			userID: 1,
			game: "iidx",
			playtype: "SP",
			sessionID: "highlighted_id",
			scoreIDs: [""],
		} as SessionDocument);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/sessions/highlighted");

		t.equal(res.body.body.length, 1);
		t.equal(res.body.body[0].sessionID, "highlighted_id");

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/sessions/recent", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the users most recent sessions.", async (t) => {
		await db.sessions.remove({});
		await db.sessions.insert([
			{
				highlight: false,
				userID: 1,
				game: "iidx",
				playtype: "SP",
				sessionID: "recent_id1",
				timeEnded: 1,
				scoreIDs: [""],
			},
			{
				highlight: false,
				userID: 1,
				game: "iidx",
				playtype: "SP",
				sessionID: "recent_id2",
				timeEnded: 3,
				scoreIDs: [""],
			},
			{
				highlight: false,
				userID: 1,
				game: "iidx",
				playtype: "SP",
				sessionID: "recent_id3",
				timeEnded: 2,
				scoreIDs: [""],
			},
		] as Array<SessionDocument>);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/sessions/recent");

		t.equal(res.body.body.length, 3);
		t.strictSame(
			// eslint-disable-next-line lines-around-comment
			// @ts-expect-error temporary type hack
			res.body.body.map((e) => e.sessionID),
			["recent_id2", "recent_id3", "recent_id1"]
		);

		t.end();
	});

	t.end();
});
