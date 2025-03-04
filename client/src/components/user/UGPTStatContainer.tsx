import { APIFetchV1 } from "util/api";
import Loading from "components/util/Loading";
import React from "react";
import { useQuery } from "react-query";
import { integer, ShowcaseStatDetails } from "tachi-common";
import { UGPTPreferenceStatsReturn } from "types/api-returns";
import { UGPT } from "types/react";
import { StatDisplay } from "./UGPTStatShowcase";

export default function UGPTStatContainer({
	stat,
	reqUser,
	game,
	playtype,
	shouldFetchCompareID,
}: { stat: ShowcaseStatDetails; shouldFetchCompareID?: integer } & UGPT) {
	const searchParams = new URLSearchParams();

	searchParams.set("mode", stat.mode);
	searchParams.set("property", stat.property);

	if (stat.mode === "chart") {
		searchParams.set("chartID", stat.chartID);
	} else if (stat.mode === "folder") {
		searchParams.set(
			"folderID",
			Array.isArray(stat.folderID) ? stat.folderID.join(",") : stat.folderID
		);
		searchParams.set("gte", stat.gte.toString());
	}

	const { data, error } = useQuery(
		`/users/${reqUser.id}/games/${game}/${playtype}/showcase/custom?${searchParams.toString()}`,
		async () => {
			const res = await APIFetchV1<UGPTPreferenceStatsReturn>(
				`/users/${
					reqUser.id
				}/games/${game}/${playtype}/showcase/custom?${searchParams.toString()}`
			);

			if (!res.success) {
				throw new Error(res.description);
			}

			if (shouldFetchCompareID) {
				const res2 = await APIFetchV1<UGPTPreferenceStatsReturn>(
					`/users/${shouldFetchCompareID}/games/${game}/${playtype}/showcase/custom?${searchParams.toString()}`
				);

				if (!res2.success) {
					throw new Error(res2.description);
				}

				return { data: res.body, compareData: res2.body };
			}

			return { data: res.body };
		}
	);

	if (error) {
		return <>{(error as any).description}</>;
	}

	if (!data) {
		return <Loading />;
	}

	return (
		<StatDisplay
			reqUser={reqUser}
			game={game}
			playtype={playtype}
			statData={data.data}
			compareData={data.compareData}
		/>
	);
}
