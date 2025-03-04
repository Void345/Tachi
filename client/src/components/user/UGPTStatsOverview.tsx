import { FormatGPTProfileRating, FormatGPTRating, UppercaseFirst } from "util/misc";
import ClassBadge from "components/game/ClassBadge";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import MiniTable from "components/tables/components/MiniTable";
import Divider from "components/util/Divider";
import React from "react";
import {
	GetGamePTConfig,
	IDStrings,
	ScoreCalculatedDataLookup,
	ProfileRatingLookup,
	UserGameStats,
} from "tachi-common";
import { GameClassSets } from "tachi-common/game-classes";

export default function UGPTRatingsTable({ ugs }: { ugs: UserGameStats }) {
	const gptConfig = GetGamePTConfig(ugs.game, ugs.playtype);

	const ratings = Object.entries(ugs.ratings) as [ProfileRatingLookup[IDStrings], number][];

	return (
		<MiniTable className="table-sm text-center" headers={["Player Stats"]} colSpan={2}>
			<>
				{(Object.keys(gptConfig.classHumanisedFormat) as GameClassSets[IDStrings][])
					.filter((k) => ugs.classes[k] !== undefined)
					.map((k) => (
						<tr key={k}>
							<td>{UppercaseFirst(k)}</td>
							<td>
								<ClassBadge
									showSetOnHover={false}
									key={`${k}:${ugs.classes[k]}`}
									game={ugs.game}
									playtype={ugs.playtype}
									classSet={k}
									classValue={ugs.classes[k]!}
								/>
							</td>
						</tr>
					))}
				{ratings.map(([k, v]) => (
					<tr key={k}>
						<td>
							<QuickTooltip
								tooltipContent={
									<div>
										{gptConfig.profileRatingAlgDescriptions[k]}
										{k in gptConfig.scoreRatingAlgDescriptions &&
											gptConfig.idString !== "itg:Stamina" && (
												<>
													<Divider />({UppercaseFirst(k)}:{" "}
													{/* @ts-expect-error I know better. */}
													{gptConfig.scoreRatingAlgDescriptions[k]})
												</>
											)}
									</div>
								}
								wide
							>
								<div
									style={{
										textDecoration: "underline",
										textDecorationStyle: "dotted",
									}}
								>
									{UppercaseFirst(k)}
								</div>
							</QuickTooltip>
						</td>
						<td>{FormatGPTProfileRating(ugs.game, ugs.playtype, k as any, v)}</td>
					</tr>
				))}
			</>
		</MiniTable>
	);
}
