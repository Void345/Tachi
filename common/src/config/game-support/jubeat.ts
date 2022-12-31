import { FAST_SLOW_MAXCOMBO } from "./_common";
import { ClassValue } from "../config-utils";
import type { INTERNAL_GAME_CONFIG, INTERNAL_GPT_CONFIG } from "../../types/internals";

export const JUBEAT_CONF = {
	defaultPlaytype: "Single",
	name: "jubeat",
	validPlaytypes: ["Single"],
} as const satisfies INTERNAL_GAME_CONFIG;

const JubeatColours = [
	ClassValue("BLACK", "Black"),
	ClassValue("YELLOW_GREEN", "Yellow-Green"),
	ClassValue("GREEN", "Green"),
	ClassValue("LIGHT_BLUE", "Light Blue"),
	ClassValue("BLUE", "Blue"),
	ClassValue("VIOLET", "Violet"),
	ClassValue("PURPLE", "Purple"),
	ClassValue("PINK", "Pink"),
	ClassValue("ORANGE", "Orange"),
	ClassValue("GOLD", "Gold"),
];

export const JUBEAT_SINGLE_CONF = {
	providedMetrics: {
		score: { type: "INTEGER" },
		musicRate: { type: "DECIMAL" },
		lamp: {
			type: "ENUM",
			values: ["FAILED", "CLEAR", "FULL COMBO", "EXCELLENT"],
			minimumRelevantValue: "CLEAR",
		},
	},

	derivedMetrics: {
		grade: {
			type: "ENUM",
			values: ["E", "D", "C", "B", "A", "S", "SS", "SSS", "EXC"],
			minimumRelevantValue: "A",
		},
	},

	defaultMetric: "musicRate",
	preferredDefaultEnum: "grade",

	additionalMetrics: {
		...FAST_SLOW_MAXCOMBO,
	},

	scoreRatingAlgs: { jubility: { description: "Jubility as it's implemented in game." } },
	sessionRatingAlgs: {
		jubility: { description: "The average of your best 10 jubilities this session." },
	},
	profileRatingAlgs: {
		jubility: {
			description:
				"Your profile jubility. This takes your best 30 scores on PICK UP songs, and your best 30 elsewhere.",
		},
		naiveJubility: {
			description:
				"A naive version of jubility which just adds together your best 60 scores.",
		},
	},

	defaultScoreRatingAlg: "jubility",
	defaultSessionRatingAlg: "jubility",
	defaultProfileRatingAlg: "jubility",

	difficultyConfig: {
		type: "FIXED",
		difficultyOrder: ["BSC", "ADV", "EXT", "HARD BSC", "HARD ADV", "HARD EXT"],
		difficultyShorthand: {
			BSC: "BSC",
			ADV: "ADV",
			EXT: "EXT",
			"HARD BSC": "H. BSC",
			"HARD ADV": "H. ADV",
			"HARD EXT": "H. EXT",
		},
		defaultDifficulty: "EXT",
	},

	supportedClasses: {
		colour: { type: "DERIVED", values: JubeatColours },
	},

	orderedJudgements: ["perfect", "great", "good", "poor", "miss"],

	supportedVersions: [
		"jubeat",
		"ripples",
		"knit",
		"copious",
		"saucer",
		"prop",
		"qubell",
		"clan",
		"festo",
	],

	supportedTierlists: {},

	supportedMatchTypes: ["inGameID", "tachiSongID"],
} as const satisfies INTERNAL_GPT_CONFIG;
