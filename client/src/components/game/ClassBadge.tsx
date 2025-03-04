import { UppercaseFirst } from "util/misc";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import React from "react";
import { Badge } from "react-bootstrap";
import { GetGamePTConfig, IDStrings, integer } from "tachi-common";
import { GameClassSets } from "tachi-common/game-classes";
import { GamePT } from "types/react";

export default function ClassBadge<I extends IDStrings = IDStrings>({
	game,
	playtype,
	classSet,
	classValue,
	showSetOnHover = true,
}: {
	classSet: GameClassSets[I];
	classValue: integer;
	showSetOnHover?: boolean;
} & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const data = gptConfig.classHumanisedFormat[classSet][classValue];

	if (!data) {
		throw new Error(`Unknown class value ${classSet}:${classValue}`);
	}

	let badgeComponent;
	if (data.variant) {
		badgeComponent = (
			<Badge className="mx-2" variant={data.variant}>
				{data.display}
			</Badge>
		);
	} else if (data.css) {
		badgeComponent = (
			<Badge className="mx-2" style={data.css}>
				{data.display}
			</Badge>
		);
	} else {
		badgeComponent = (
			<Badge className="mx-2" variant="secondary">
				{data.display}
			</Badge>
		);
	}

	if (data.mouseover && showSetOnHover) {
		return (
			<QuickTooltip tooltipContent={`${UppercaseFirst(classSet)}: ${data.mouseover}`}>
				{badgeComponent}
			</QuickTooltip>
		);
	} else if (data.mouseover) {
		return <QuickTooltip tooltipContent={data.mouseover}>{badgeComponent}</QuickTooltip>;
	} else if (showSetOnHover) {
		<QuickTooltip tooltipContent={UppercaseFirst(classSet)}>{badgeComponent}</QuickTooltip>;
	}

	return badgeComponent;
}
