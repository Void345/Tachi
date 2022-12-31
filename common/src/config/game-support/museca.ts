import { FAST_SLOW_MAXCOMBO } from "./_common";
import { COLOUR_SET } from "../../constants/colour-set";
import { NoDecimalPlace } from "../config-utils";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const MUSECA_CONF = {
	defaultPlaytype: "Single",
	name: "MÚSECA",
	validPlaytypes: ["Single"],
} as const satisfies INTERNAL_GAME_CONFIG;

export const MUSECA_SINGLE_CONF = {
	providedMetrics: {
		score: { type: "INTEGER" },
		lamp: {
			type: "ENUM",
			values: ["FAILED", "CLEAR", "CONNECT ALL", "PERFECT CONNECT ALL"],
			minimumRelevantValue: "CLEAR",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",

			// MUSECA uses kanji for its grades. This is kinda inconvenient to read.
			// Ah well!
			values: ["没", "拙", "凡", "佳", "良", "優", "秀", "傑", "傑G"],

			// This is equal to 900K.
			// In my opinion (zkldi) this is a little too low for this
			// game, as 900K is pretty easy to get. Ah well!
			minimumRelevantValue: "優",
		},
	},

	defaultMetric: "score",
	preferredDefaultEnum: "grade",

	additionalMetrics: FAST_SLOW_MAXCOMBO,

	scoreRatingAlgs: {
		curatorSkill: {
			description: "Curator Skill as it's implemented in-game.",
			formatter: NoDecimalPlace,
		},
	},
	sessionRatingAlgs: {
		curatorSkill: {
			description: "The average of your best 10 Curator skills this session.",
			formatter: NoDecimalPlace,
		},
	},
	profileRatingAlgs: {
		curatorSkill: {
			description:
				"The sum of your best 20 Curator Skills. This is identical to how it's calculated in-game.",
		},
	},

	defaultScoreRatingAlg: "curatorSkill",
	defaultSessionRatingAlg: "curatorSkill",
	defaultProfileRatingAlg: "curatorSkill",

	difficultyConfig: {
		type: "FIXED",
		difficultyOrder: ["Green", "Yellow", "Red"],
		difficultyShorthand: { Green: "G", Yellow: "Y", Red: "R" },
		defaultDifficulty: "Red",
		difficultyColours: {
			Green: COLOUR_SET.green,
			Yellow: COLOUR_SET.vibrantYellow,
			Red: COLOUR_SET.red,
		},
	},

	supportedClasses: {},

	orderedJudgements: ["critical", "near", "miss"],

	supportedVersions: ["1 + 1/2", "1 + 1/2 Rev. B"],

	supportedTierlists: {},

	supportedMatchTypes: ["songTitle", "tachiSongID", "inGameID"],
} as const satisfies INTERNAL_GPT_CONFIG;
