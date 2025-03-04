import dm from "deepmerge";
import db from "external/mongo/db";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
	FakeOtherUser,
	IIDXSPQuestGoals,
	IIDXSPQuestGoalSubs,
	TestingIIDXSPQuest,
} from "test-utils/test-data";
import type { GoalDocument, GoalSubscriptionDocument } from "tachi-common";

// this is my lazy sample data for these tests.
const LoadLazySampleData = async () => {
	await db.users.insert(FakeOtherUser);
	await db.goals.insert(IIDXSPQuestGoals);
	await db["goal-subs"].insert([
		...IIDXSPQuestGoalSubs,
		dm(IIDXSPQuestGoalSubs[0]!, {
			userID: 2,
		}),
	] as Array<GoalSubscriptionDocument>);
};

t.test("GET /api/v1/games/:game/:playtype/targets/goals/popular", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadLazySampleData);

	t.test("Should return the most popular subscribed goals for this game.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/goals/popular");

		t.equal(res.statusCode, 200, "Should return 200.");

		for (const goalSub of IIDXSPQuestGoals) {
			// i hate this monk 'feature'!!!
			delete goalSub._id;
		}

		// note: we have to sort the output here such that it's deterministic.
		t.strictSame(
			(res.body.body as Array<GoalDocument>).sort((a, b) => a.goalID.localeCompare(b.goalID)),
			(
				[
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					dm(IIDXSPQuestGoals[0] as any, { __subscriptions: 2 }),
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					dm(IIDXSPQuestGoals[1] as any, { __subscriptions: 1 }),
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					dm(IIDXSPQuestGoals[2] as any, { __subscriptions: 1 }),
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					dm(IIDXSPQuestGoals[3] as any, { __subscriptions: 1 }),
				] as unknown as Array<GoalDocument>
			).sort((a, b) => a.goalID.localeCompare(b.goalID)),
			"Should return the most subscribed goals."
		);

		t.end();
	});

	t.test("Should return an empty array if nobody has done anything.", async (t) => {
		const res = await mockApi.get("/api/v1/games/chunithm/Single/targets/goals/popular");

		t.equal(res.statusCode, 200, "Should return 200.");
		t.strictSame(res.body.body, []);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/targets/goals/:goalID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadLazySampleData);

	t.test("Should return information about the specified goal.", async (t) => {
		await db.quests.insert(TestingIIDXSPQuest);

		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/goals/eg_goal_1");

		t.hasStrict(res.body.body, {
			goal: {
				goalID: "eg_goal_1",
			},
			goalSubs: [
				{ userID: 1, goalID: "eg_goal_1" },
				{ userID: 2, goalID: "eg_goal_1" },
			],
			users: [{ id: 1 }, { id: 2 }],
			parentQuests: [{ questID: TestingIIDXSPQuest.questID }],
		});

		t.end();
	});

	t.end();
});
