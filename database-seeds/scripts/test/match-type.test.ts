import chalk from "chalk";
import {
	ChartDocument,
	FormatGame,
	Game,
	GetGameConfig,
	GetGamePTConfig,
	MatchTypes,
	Playtype,
	SongDocument,
} from "tachi-common";
import { allSupportedGames } from "tachi-common/config/static-config";
import { ReadCollection } from "../util";

// check that a given matchType works for a given game.
const uniquenessChecks: Array<{ game: Game; playtype: Playtype; matchType: MatchTypes }> = [];

for (const game of allSupportedGames) {
	for (const playtype of GetGameConfig(game).validPlaytypes) {
		const gptConfig = GetGamePTConfig(game, playtype);

		for (const matchType of gptConfig.supportedMatchTypes) {
			uniquenessChecks.push({ game, playtype, matchType });
		}
	}
}

// Retrieve a unique identifer (or array of identifiers that must be globally unique)
// for this match type to work
const MATCH_TYPE_CHECKS: Record<
	MatchTypes,
	| {
			type: "SONGS";
			fn: (s: SongDocument) => string | Array<string>;
	  }
	| {
			type: "CHARTS";
			fn: (c: any) => string | Array<string>;
	  }
> = {
	tachiSongID: { type: "CHARTS", fn: (s) => `${s.songID}-${s.difficulty}` },
	songTitle: { type: "SONGS", fn: (s) => [s.title, ...s.altTitles] },
	bmsChartHash: {
		type: "CHARTS",
		fn: (c: ChartDocument<"bms:7K" | "bms:14K">) => [c.data.hashMD5, c.data.hashSHA256],
	},
	inGameID: { type: "CHARTS", fn: (c) => `${c.data.inGameID}-${c.difficulty}` },
	itgChartHash: { type: "CHARTS", fn: (c) => c.data.hashGSV3 },
	popnChartHash: { type: "CHARTS", fn: (c) => c.data.hashSHA256 },
	sdvxInGameID: {
		type: "CHARTS",
		fn: (c) => {
			let diff = c.difficulty;

			if (["XCD", "HVN", "GRV", "VVD", "INF"].includes(diff)) {
				diff = "ANY_INF";
			}

			return `${c.data.inGameID}-${diff}`;
		},
	},
	uscChartHash: { type: "CHARTS", fn: (c) => c.data.hashSHA1 },
};

let exitCode = 0;
const suites: Array<{ name: string; good: boolean; report: unknown }> = [];

for (const { game, matchType, playtype } of uniquenessChecks) {
	const name = `${FormatGame(game, playtype)} ${matchType}`;
	console.log(`[CHECKING MATCHTYPE] ${name}.`);

	const handler = MATCH_TYPE_CHECKS[matchType];

	let success = 0;
	let fails = 0;

	const data =
		handler.type === "CHARTS"
			? ReadCollection(`charts-${game}.json`)
			: ReadCollection(`songs-${game}.json`);

	const uniqueIDs = new Set();
	for (const el of data.filter((e) => e.playtype === playtype)) {
		// skip non-primaries as they can't really be matched anyway.
		if (handler.type === "CHARTS" && !el.isPrimary) {
			continue;
		}

		let newUniqueThingies = handler.fn(el);

		// make single returns into arrays. convenient.
		if (!Array.isArray(newUniqueThingies)) {
			newUniqueThingies = [newUniqueThingies];
		}

		for (const maybeUnique of newUniqueThingies) {
			if (uniqueIDs.has(maybeUnique)) {
				console.log(
					chalk.red(
						`ID ${maybeUnique} wasn't unique in ${FormatGame(
							game,
							playtype
						)} (matchType=${matchType}). It needs to be for this matchType to be legal.`
					)
				);
				fails++;
			} else {
				success++;
				uniqueIDs.add(maybeUnique);
			}
		}
	}

	const report = `GOOD: ${success}, BAD: ${fails}(${Math.min(
		(success * 100) / fails,
		100
	).toFixed(2)}%)`;
	if (fails > 0) {
		console.error(chalk.red(`[FAILED] ${name}. ${report}.`));
		exitCode++;
	} else {
		console.log(chalk.green(`[GOOD] ${name}. ${report}.`));
	}

	suites.push({ name, report, good: fails === 0 });
}

console.log(`=== Suite Overview ===`);
for (const suite of suites) {
	console.log(chalk[suite.good ? "green" : "red"](`[MATCHTYPES] ${suite.name}: ${suite.report}`));
}

process.exit(exitCode);
