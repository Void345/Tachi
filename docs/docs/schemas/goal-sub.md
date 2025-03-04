# Goal Subscription Document

Goal Subscriptions are stored in `goal-subs`.

The goal subscription document represents a user's subscription
to a goal. Truly, this is a surprising description.

!!! warning
	This does not describe the goal or its criteria,
	for that - see [Goal Document](./goal.md).

*****

## Definition

```ts
type GoalSubscriptionDocument = MongoDBDocument & {
	goalID: string;
	userID: integer;
	game: Game;
	playtype: Playtype;
	lastInteraction: integer | null;
	progress: number | null;
	progressHuman: string;
	outOf: number;
	outOfHuman: string;
	wasInstantlyAchieved: boolean;
} & (
		| {
				achieved: true;
				timeAchieved: integer;
		  }
		| {
				achieved: false;
				timeAchieved: null;
		  }
	);
```

| Property | Description |
| :: | :: |
| `goalID` | This is the goal the user is subscribed to in this document. |
| `userID` | This is the user this goal subscription belongs to. |
| `game`, `playtype` | These fields are both *technically* redundant. However, for optimisation reasons, they are copied over from the goal document field. |
| `achieved` | Whether this goal has been achieved or not. |
| `timeAchieved` | The time this user achieved this goal. If the user has not achieved this goal, it is set as `null`. |
| `lastInteraction` | The last time this user did something that shifted their progress/outOf on this goal. This is initialised to null. |
| `progress` | The user's raw progress towards this goal. This is a number, and should not be displayed to the user. |
| `outOf` | The value this goal is out of - this is a number, and should not be displayed to the user. |
| `progressHuman`, `outOfHuman` | These are humanised, stringified versions of the above two fields. These convert things like the enum value of lamps to their string equivalents. |
| `wasInstantlyAchieved` | Whether this goal was instantly achieved or not. Instantly achieved goals are excluded from some parts of the UI, and from being emitted as webhook events. [Read more here](../tachi-server/implementation-details/goals-quests.md). |
