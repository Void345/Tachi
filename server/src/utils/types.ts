import type { TachiBMSTable } from "lib/game-specific/custom-bms-tables";
import type {
	FolderDocument,
	TableDocument,
	SessionDocument,
	ScoreDocument,
	ChartDocument,
	UserDocument,
	UserGameStats,
	Game,
	Playtype,
	SongDocument,
	UserSettings,
	TachiAPIClientDocument,
	GoalDocument,
	QuestSubscriptionDocument,
	GoalSubscriptionDocument,
	QuestDocument,
	QuestlineDocument,
	integer,
	ImportDocument,
} from "tachi-common";

// Inject additional properties on express-session
declare module "express-session" {
	interface SessionData {
		tachi: TachiSessionData;
	}
}

declare module "express-serve-static-core" {
	export interface Request {
		// eslint-disable-next-line lines-around-comment
		// KNOWN BUG IN TS-ESLINT.
		/**
		 * This is a type-safe variant of "req.safeBody".
		 * "req.safeBody" is 'any' by default, which makes it exceptionally difficult
		 * to use in our codebase (due to the strict cadence rules.)
		 */
		safeBody: Record<string, unknown>;
	}
}

export interface TachiSessionData {
	user: UserDocument;
	settings: UserSettings;
}

export interface TachiAPIFailResponse {
	success: false;
	description: string;
}

export interface TachiAPISuccessResponse {
	success: true;
	description: string;
	body: Record<string, unknown>;
}

export type TachiAPIReponse = TachiAPIFailResponse | TachiAPISuccessResponse;

/**
 * Clarity type for empty objects - such as in context.
 */
export type EmptyObject = Record<string, never>;

/**
 * Data that may be monkey-patched onto req.tachi. This holds things such as middleware results.
 */
export interface TachiRequestData {
	uscChartDoc?: ChartDocument<"usc:Controller" | "usc:Keyboard">;

	beatorajaChartDoc?: ChartDocument<"bms:7K" | "bms:14K" | "pms:Controller" | "pms:Keyboard">;

	requestedUser?: UserDocument;
	requestedUserGameStats?: UserGameStats;
	game?: Game;
	playtype?: Playtype;

	chartDoc?: ChartDocument;
	songDoc?: SongDocument;
	scoreDoc?: ScoreDocument;
	sessionDoc?: SessionDocument;
	tableDoc?: TableDocument;
	folderDoc?: FolderDocument;
	goalDoc?: GoalDocument;
	questDoc?: QuestDocument;
	goalSubDoc?: GoalSubscriptionDocument;
	questSubDoc?: QuestSubscriptionDocument;
	questlineDoc?: QuestlineDocument;
	importDoc?: ImportDocument;

	customBMSTable?: TachiBMSTable;

	apiClientDoc: Omit<TachiAPIClientDocument, "clientSecret">;
}

// This is only used on tachi-server, and isn't exposed -- so shouldn't be a part
// of common.
export interface PrivateUserInfoDocument {
	userID: integer;
	password: string;
	email: string;
}

export interface Migration {
	id: string;
	up: () => Promise<unknown>;
	down: () => Promise<unknown>;
}

export type MigrationDocument = {
	migrationID: string;
} & (
	| {
			status: "applied";
			appliedOn: integer;
	  }
	| {
			status: "pending";
	  }
);
