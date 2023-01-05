import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ClassValue, zodNonNegativeInt } from "../config-utils";
import { z } from "zod";
import type { INTERNAL_GAME_CONFIG, GamePTConfig } from "../../types/internals";

export const BMS_CONF = {
	defaultPlaytype: "7K",
	name: "BMS",
	playtypes: ["7K", "14K"],
	songData: z.strictObject({
		genre: z.nullable(z.string()),
		subtitle: z.nullable(z.string()),
		subartist: z.nullable(z.string()),
		tableString: z.nullable(z.string()),
	}),
} as const satisfies INTERNAL_GAME_CONFIG;

function FormatSieglindeBMS(sgl: number): string {
	if (sgl < 13) {
		return `☆${sgl.toFixed(2)}`;
	}

	return `★${(sgl - 12).toFixed(2)}`;
}

// works for both 7K and 14K.
export const BMSGenocideDans = [
	ClassValue("NORMAL_1", "☆1", "Normal 1st Dan"),
	ClassValue("NORMAL_2", "☆2", "Normal 2nd Dan"),
	ClassValue("NORMAL_3", "☆3", "Normal 3rd Dan"),
	ClassValue("NORMAL_4", "☆4", "Normal 4th Dan"),
	ClassValue("NORMAL_5", "☆5", "Normal 5th Dan"),
	ClassValue("NORMAL_6", "☆6", "Normal 6th Dan"),
	ClassValue("NORMAL_7", "☆7", "Normal 7th Dan"),
	ClassValue("NORMAL_8", "☆8", "Normal 8th Dan"),
	ClassValue("NORMAL_9", "☆9", "Normal 9th Dan"),
	ClassValue("NORMAL_10", "☆10", "Normal 10th Dan"),
	ClassValue("INSANE_1", "★1", "Insane 1st Dan"),
	ClassValue("INSANE_2", "★2", "Insane 2nd Dan"),
	ClassValue("INSANE_3", "★3", "Insane 3rd Dan"),
	ClassValue("INSANE_4", "★4", "Insane 4th Dan"),
	ClassValue("INSANE_5", "★5", "Insane 5th Dan"),
	ClassValue("INSANE_6", "★6", "Insane 6th Dan"),
	ClassValue("INSANE_7", "★7", "Insane 7th Dan"),
	ClassValue("INSANE_8", "★8", "Insane 8th Dan"),
	ClassValue("INSANE_9", "★9", "Insane 9th Dan"),
	ClassValue("INSANE_10", "★10", "Insane 10th Dan"),
	ClassValue("INSANE_KAIDEN", "★★", "Insane Kaiden"),
	ClassValue("OVERJOY", "(^^)", "Overjoy"),
];

export const BMSStSlDans = [
	ClassValue("SL0", "sl0", "Satellite 0"),
	ClassValue("SL1", "sl1", "Satellite 1"),
	ClassValue("SL2", "sl2", "Satellite 2"),
	ClassValue("SL3", "sl3", "Satellite 3"),
	ClassValue("SL4", "sl4", "Satellite 4"),
	ClassValue("SL5", "sl5", "Satellite 5"),
	ClassValue("SL6", "sl6", "Satellite 6"),
	ClassValue("SL7", "sl7", "Satellite 7"),
	ClassValue("SL8", "sl8", "Satellite 8"),
	ClassValue("SL9", "sl9", "Satellite 9"),
	ClassValue("SL10", "sl10", "Satellite 10"),
	ClassValue("SL11", "sl11", "Satellite 11"),
	ClassValue("SL12", "sl12", "Satellite 12"),
	ClassValue("ST0", "st0", "Stella 0"),
	ClassValue("ST1", "st1", "Stella 1"),
	ClassValue("ST2", "st2", "Stella 2"),
	ClassValue("ST3", "st3", "Stella 3"),
	ClassValue("ST4", "st4", "Stella 4"),
	ClassValue("ST5", "st5", "Stella 5"),
	ClassValue("ST6", "st6", "Stella 6"),
	ClassValue("ST7", "st7", "Stella 7"),
	ClassValue("ST8", "st8", "Stella 8"),
	ClassValue("ST9", "st9", "Stella 9"),
	ClassValue("ST10", "st10", "Stella 10"),
	ClassValue("ST11", "st11", "Stella 11"),
];

export const BMSDPSlDans = [
	ClassValue("SL0", "sl0", "Satellite 0"),
	ClassValue("SL1", "sl1", "Satellite 1"),
	ClassValue("SL2", "sl2", "Satellite 2"),
	ClassValue("SL3", "sl3", "Satellite 3"),
	ClassValue("SL4", "sl4", "Satellite 4"),
	ClassValue("SL5", "sl5", "Satellite 5"),
	ClassValue("SL6", "sl6", "Satellite 6"),
	ClassValue("SL7", "sl7", "Satellite 7"),
	ClassValue("SL8", "sl8", "Satellite 8"),
	ClassValue("SL9", "sl9", "Satellite 9"),
	ClassValue("SL10", "sl10", "Satellite 10"),
	ClassValue("SL11", "sl11", "Satellite 11"),
	ClassValue("SL12", "sl12", "Satellite 12"),
];

export const BMSLNDans = [
	ClassValue("DAN_1", "◆1", "LN 1st Dan"),
	ClassValue("DAN_2", "◆2", "LN 2nd Dan"),
	ClassValue("DAN_3", "◆3", "LN 3rd Dan"),
	ClassValue("DAN_4", "◆4", "LN 4th Dan"),
	ClassValue("DAN_5", "◆5", "LN 5th Dan"),
	ClassValue("DAN_6", "◆6", "LN 6th Dan"),
	ClassValue("DAN_7", "◆7", "LN 7th Dan"),
	ClassValue("DAN_8", "◆8", "LN 8th Dan"),
	ClassValue("DAN_9", "◆9", "LN 9th Dan"),
	ClassValue("DAN_10", "◆10", "LN 10th Dan"),
	ClassValue("KAIDEN", "◆◆", "LN Kaiden"),
	ClassValue("OVERJOY", "◆(^^)", "LN Overjoy"),
	ClassValue("UDON", "◆うどん", "LN Udon"),
];

export const BMSScratchDans = [
	ClassValue("KYU_7", "七級", "Scratch 7th Kyu"),
	ClassValue("KYU_6", "六級", "Scratch 6th Kyu"),
	ClassValue("KYU_5", "五級", "Scratch 5th Kyu"),
	ClassValue("KYU_4", "四級", "Scratch 4th Kyu"),
	ClassValue("KYU_3", "三級", "Scratch 3rd Kyu"),
	ClassValue("KYU_2", "二級", "Scratch 2nd Kyu"),
	ClassValue("KYU_1", "一級", "Scratch 1st Kyu"),
	ClassValue("DAN_1", "初段", "Scratch 1st Dan"),
	ClassValue("DAN_2", "二段", "Scratch 2nd Dan"),
	ClassValue("DAN_3", "三段", "Scratch 3rd Dan"),
	ClassValue("DAN_4", "四段", "Scratch 4th Dan"),
	ClassValue("DAN_5", "五段", "Scratch 5th Dan"),
	ClassValue("DAN_6", "六段", "Scratch 6th Dan"),
	ClassValue("DAN_7", "七段", "Scratch 7th Dan"),
	ClassValue("DAN_8", "八段", "Scratch 8th Dan"),
	ClassValue("DAN_9", "九段", "Scratch 9th Dan"),
	ClassValue("DAN_10", "十段", "Scratch 10th Dan"),
	ClassValue("KAIDEN", "皆伝", "Scratch Kaiden"),
];

const RANDOM_SCHEMA = z.enum(["MIRROR", "NONRAN", "R-RANDOM", "RANDOM", "S-RANDOM"]);

export const BMS_7K_CONF = {
	providedMetrics: {
		score: { type: "INTEGER" },

		// if #RANDOM is to ever be supported, the user's percent would become
		// a *mandatory* metric, as a chart's notecount can be completely unknown.
		// #RANDOM is not supported (other painful reasons), but this should be done
		// anyway.
		percent: { type: "DECIMAL" },

		lamp: {
			type: "ENUM",
			values: [
				"NO PLAY",
				"FAILED",
				"ASSIST CLEAR",
				"EASY CLEAR",
				"CLEAR",
				"HARD CLEAR",
				"EX HARD CLEAR",
				"FULL COMBO",
			],
			minimumRelevantValue: "EASY CLEAR",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["F", "E", "D", "C", "B", "A", "AA", "AAA", "MAX-", "MAX"],
			minimumRelevantValue: "A",
		},
	},

	defaultMetric: "percent",
	preferredDefaultEnum: "lamp",

	optionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
		bp: { type: "INTEGER" },
		gauge: { type: "DECIMAL" },
		gaugeHistory: { type: "GRAPH" },
		epg: { type: "INTEGER" },
		egr: { type: "INTEGER" },
		egd: { type: "INTEGER" },
		ebd: { type: "INTEGER" },
		epr: { type: "INTEGER" },
		lpg: { type: "INTEGER" },
		lgr: { type: "INTEGER" },
		lgd: { type: "INTEGER" },
		lbd: { type: "INTEGER" },
		lpr: { type: "INTEGER" },
	},

	scoreRatingAlgs: {
		sieglinde: {
			description:
				"A clearing algorithm that rewards you points based on how difficult an easy clear or hard clear was.",
			formatter: FormatSieglindeBMS,
		},
	},
	sessionRatingAlgs: {
		sieglinde: {
			description: "The average of your best 10 sieglinde ratings this session.",
			formatter: FormatSieglindeBMS,
		},
	},

	profileRatingAlgs: {
		sieglinde: {
			description: "The average of your best 20 sieglinde ratings.",
			formatter: FormatSieglindeBMS,
		},
	},

	defaultScoreRatingAlg: "sieglinde",
	defaultSessionRatingAlg: "sieglinde",
	defaultProfileRatingAlg: "sieglinde",

	// we implement "songs + charts" for BMS by declaring that each song has exactly
	// one (1) chart attached onto it. This is given the aptly creative name "CHART".
	// This is never displayed in the UI, and is generally hidden from end-use view.
	//
	// The reason for this decision is because charts in BMS have no realistic concept
	// of a "parent song". Charters (frequently) alter the metadata of the song they're
	// adding charts for, such as renaming "elegante" to "gorillante". This leaves us
	// with no possible method for determining what "song" a chart belongs to.
	// As such, the only correct method left is to assert that every bit of song
	// metadata is just its own thing.
	difficulties: {
		type: "FIXED",
		// "CHART" isn't a very creative name, but this is in a similar vein to how
		// games with no playtypes use the value "Single".
		order: ["CHART"],
		shorthand: {},
		default: "CHART",
	},

	classes: {
		genocideDan: { type: "PROVIDED", values: BMSGenocideDans },
		stslDan: { type: "PROVIDED", values: BMSStSlDans },
		lnDan: { type: "PROVIDED", values: BMSLNDans },
		scratchDan: { type: "PROVIDED", values: BMSScratchDans },
	},

	orderedJudgements: ["pgreat", "great", "good", "bad", "poor"],

	versions: [],

	chartData: z.strictObject({
		notecount: zodNonNegativeInt,
		hashMD5: z.string(),
		hashSHA256: z.string(),
		tableFolders: z.array(z.strictObject({ table: z.string(), level: z.string() })),
		sglEC: z.number().nullable(),
		sglHC: z.number().nullable(),
	}),

	preferences: z.strictObject({
		displayTables: z.array(z.string()),
	}),

	scoreMeta: z.strictObject({
		random: RANDOM_SCHEMA.optional(),
		inputDevice: z.enum(["BM_CONTROLLER", "KEYBOARD"]).optional(),
		client: z.enum(["lr2oraja", "LR2"]).optional(),
		gauge: z.enum(["EASY", "NORMAL", "HARD", "EX-HARD"]).optional(),
	}),

	supportedMatchTypes: ["bmsChartHash", "tachiSongID"],
} as const satisfies GamePTConfig;

export const BMS_14K_CONF = {
	...BMS_7K_CONF,
	classes: {
		genocideDan: { type: "PROVIDED", values: BMSGenocideDans },
		stslDan: { type: "PROVIDED", values: BMSDPSlDans },
	},

	scoreMeta: z.strictObject({
		random: z.tuple([RANDOM_SCHEMA, RANDOM_SCHEMA]).optional(),
		inputDevice: z.enum(["BM_CONTROLLER", "KEYBOARD"]).optional(),
		client: z.enum(["lr2oraja", "LR2"]).optional(),
		gauge: z.enum(["EASY", "NORMAL", "HARD", "EX-HARD"]).optional(),
	}),
} as const satisfies GamePTConfig;
