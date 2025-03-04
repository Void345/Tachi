import { ONE_DAY } from "util/constants/time";
import { CreateChartIDMap, CreateChartLink, CreateSongMap } from "util/data";
import { DistinctArr, NO_OP } from "util/misc";
import { NumericSOV, StrSOV } from "util/sorts";
import { GetScaleAchievedFn } from "util/tierlist";
import { FormatDate, FormatTime } from "util/time";
import { ChangeOpacity } from "util/color-opacity";
import FolderInfoHeader from "components/game/folder/FolderInfoHeader";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Card from "components/layout/page/Card";
import FolderTable from "components/tables/folders/FolderTable";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import ReferToUser from "components/util/ReferToUser";
import SelectLinkButton from "components/util/SelectLinkButton";
import useUGPTBase from "components/util/useUGPTBase";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { Link, Route, Switch, useParams } from "react-router-dom";
import {
	ChartDocument,
	ChartTierlistInfo,
	FormatDifficulty,
	FormatDifficultyShort,
	Game,
	GetGamePTConfig,
	GPTTierlists,
	IDStrings,
	integer,
	UserDocument,
	ScoreDocument,
	SongDocument,
	Playtype,
	COLOUR_SET,
} from "tachi-common";
import { UGPTFolderReturns } from "types/api-returns";
import { FolderDataset } from "types/tables";
import MiniTable from "components/tables/components/MiniTable";
import DifficultyCell from "components/tables/cells/DifficultyCell";
import FolderComparePage from "./FolderComparePage";
import FolderQuestsPage from "./FolderQuestsPage";

interface Props {
	reqUser: UserDocument;
	game: Game;
	playtype: Playtype;
}

export default function SpecificFolderPage({ reqUser, game, playtype }: Props) {
	const { folderID } = useParams<{ folderID: string }>();

	const { data, error } = useApiQuery<UGPTFolderReturns>(
		`/users/${reqUser.id}/games/${game}/${playtype}/folders/${folderID}`
	);

	const gptConfig = GetGamePTConfig(game, playtype);

	const folderDataset = useMemo(() => {
		if (!data) {
			return null;
		}

		const songMap = CreateSongMap(data.songs);
		const pbMap = CreateChartIDMap(data.pbs);

		const folderDataset: FolderDataset = [];

		for (const chart of data.charts) {
			folderDataset.push({
				...chart,
				__related: {
					pb: pbMap.get(chart.chartID) ?? null,
					song: songMap.get(chart.songID)!,
					user: reqUser,
				},
			});
		}

		folderDataset.sort(StrSOV((x) => x.__related.song.title));

		return folderDataset;
	}, [data]);

	const folderInfoHeader = useMemo(() => {
		if (!folderDataset || !data) {
			return <Loading />;
		}

		return (
			<FolderInfoHeader
				folderDataset={folderDataset}
				folderTitle={data.folder.title}
				game={game}
				playtype={playtype}
				reqUser={reqUser}
			/>
		);
	}, [folderDataset]);

	const base = `${useUGPTBase({ reqUser, game, playtype })}/folders/${folderID}`;

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data || !folderDataset) {
		return <Loading />;
	}

	return (
		<div className="row">
			<div className="col-12">{folderInfoHeader}</div>
			<div className="col-12">
				<Divider />
			</div>
			<div className="col-12 d-flex">
				<div className="btn-group d-flex w-100">
					<SelectLinkButton to={base}>
						<Icon type="table" />
						Normal View
					</SelectLinkButton>
					{gptConfig.tierlists.length !== 0 &&
						// temp: tierlist view sucks for BMS and PMS
						game !== "bms" &&
						game !== "pms" && (
							<SelectLinkButton to={`${base}/tierlist`}>
								<Icon type="sort-alpha-up" />
								Tierlist View
							</SelectLinkButton>
						)}
					<SelectLinkButton to={`${base}/timeline`}>
						<Icon type="stream" />
						Timeline View
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/compare`}>
						<Icon type="users" />
						Compare Against User
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/targets`}>
						<Icon type="scroll" />
						Goals & Quests
					</SelectLinkButton>
				</div>
			</div>
			<div className="col-12">
				<Divider />
			</div>
			<div className="col-12">
				<Switch>
					<Route exact path={base}>
						<FolderTable dataset={folderDataset} game={game} playtype={playtype} />
					</Route>
					<Route exact path={`${base}/tierlist`}>
						<TierlistBreakdown
							folderDataset={folderDataset}
							game={game}
							playtype={playtype}
							reqUser={reqUser}
							data={data}
						/>
					</Route>
					<Route exact path={`${base}/timeline`}>
						<TimelineView
							game={game}
							playtype={playtype}
							reqUser={reqUser}
							folderID={folderID}
						/>
					</Route>
					<Route exact path={`${base}/compare`}>
						<FolderComparePage
							game={game}
							playtype={playtype}
							reqUser={reqUser}
							folder={data.folder}
						/>
					</Route>
					<Route exact path={`${base}/targets`}>
						<FolderQuestsPage
							game={game}
							playtype={playtype}
							reqUser={reqUser}
							folder={data.folder}
						/>
					</Route>
				</Switch>
			</div>
		</div>
	);
}

function TimelineView({ game, playtype, reqUser, folderID }: Props & { folderID: string }) {
	const gptConfig = GetGamePTConfig(game, playtype);
	const [type, setType] = useState<"lamp" | "grade">(gptConfig.scoreBucket);
	const [value, setValue] = useState<integer>(
		type === "grade"
			? gptConfig.grades.indexOf(gptConfig.clearGrade)
			: gptConfig.lamps.indexOf(gptConfig.clearLamp)
	);

	useEffect(() => {
		setValue(
			type === "grade"
				? gptConfig.grades.indexOf(gptConfig.clearGrade)
				: gptConfig.lamps.indexOf(gptConfig.clearLamp)
		);
	}, [type]);

	return (
		<>
			<Card header="Timeline View">
				<div className="row">
					<div className="col-12">
						<h5 className="text-center">
							The timeline view shows the order in which you achieved something in a
							folder! You can choose the criteria up here.
						</h5>
						<Divider />
					</div>
					<div className="col-12 col-lg-6">
						<Form.Control
							as="select"
							value={type}
							onChange={(e) => setType(e.target.value as "grade" | "lamp")}
						>
							<option value="grade">Grades</option>
							<option value="lamp">Lamps</option>
						</Form.Control>
					</div>
					<div className="col-12 col-lg-6">
						<Form.Control
							as="select"
							value={value}
							onChange={(e) => setValue(Number(e.target.value))}
						>
							{type === "grade"
								? gptConfig.grades.map((e, i) => (
										<option key={e} value={i}>
											{e}
										</option>
								  ))
								: gptConfig.lamps.map((e, i) => (
										<option key={e} value={i}>
											{e}
										</option>
								  ))}
						</Form.Control>
					</div>
				</div>
			</Card>
			<Divider />
			<TimelineMain {...{ reqUser, game, playtype, folderID, type, value }} />
		</>
	);
}

function TimelineMain({
	reqUser,
	game,
	playtype,
	folderID,
	type,
	value,
}: Props & {
	folderID: string;
	type: "grade" | "lamp";
	value: integer;
}) {
	const { data, error } = useApiQuery<{
		scores: ScoreDocument[];
		songs: SongDocument[];
		charts: ChartDocument[];
	}>(
		`/users/${reqUser.id}/games/${game}/${playtype}/folders/${folderID}/timeline?criteriaValue=${value}&criteriaType=${type}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const scoreDataset = [];

	const songMap = CreateSongMap(data.songs);
	const chartMap = CreateChartIDMap(data.charts);

	for (const score of data.scores) {
		scoreDataset.push({
			...score,
			__related: {
				song: songMap.get(score.songID)!,
				chart: chartMap.get(score.chartID)!,
			},
		});
	}

	scoreDataset.sort(NumericSOV((x) => x.timeAchieved ?? Infinity));

	const elements = [];

	let lastDay = 0;
	let index = 1;
	let hasHitNulls = false;

	for (const scoreData of scoreDataset) {
		if (scoreData.timeAchieved !== null) {
			// Insane hack to floor a date to the beginning of that
			// day.
			const dayNum = new Date(scoreData.timeAchieved).setHours(0, 0, 0, 0);

			if (!lastDay || lastDay !== dayNum) {
				lastDay = dayNum;
				elements.push(
					<TimelineDivider>{FormatDate(scoreData.timeAchieved)}</TimelineDivider>
				);
			}
		} else if (!hasHitNulls) {
			elements.push(<TimelineDivider>Unknown Time</TimelineDivider>);
			hasHitNulls = true;
		}

		elements.push(
			<TimelineElement index={index} scoreData={scoreData} key={scoreData.scoreID} />
		);
		index++;
	}

	return (
		<>
			<div className="text-center">
				<h1 className="display-4">Total Progress</h1>
				<h1 className="display-4">
					{data.scores.length}
					<span className="text-muted" style={{ fontSize: "1.1rem" }}>
						/{data.charts.length}
					</span>
				</h1>
			</div>
			<Divider />
			<div className="timeline timeline-2">
				<div className="timeline-bar"></div>
				{elements}
			</div>
			<Divider />
			<div className="text-center">
				<h1 className="display-4">Total Progress</h1>
				<h1 className="display-4">
					{data.scores.length}
					<span className="text-muted" style={{ fontSize: "1.1rem" }}>
						/{data.charts.length}
					</span>
				</h1>
			</div>
		</>
	);
}

function TimelineDivider({ children }: { children: string }) {
	return (
		<div className="w-100 text-center my-4">
			<h4>{children}</h4>
		</div>
	);
}

function TimelineElement({
	scoreData,
	index,
}: {
	index: integer;
	scoreData: ScoreDocument & {
		__related: {
			song: SongDocument;
			chart: ChartDocument;
		};
	};
}) {
	return (
		<div className="timeline-item">
			<span className="timeline-badge bg-primary"></span>
			<div className="timeline-content d-flex align-items-center justify-content-between">
				<span className="mr-3" style={{ fontSize: "1.15rem" }}>
					<b>#{index}</b>:{" "}
					<Link
						to={CreateChartLink(scoreData.__related.chart, scoreData.game)}
						className="gentle-link"
					>
						{scoreData.__related.song.title}{" "}
						{FormatDifficulty(scoreData.__related.chart, scoreData.game)}
					</Link>
					{Date.now() - scoreData.timeAdded < ONE_DAY && (
						<span className="ml-2 label label-inline label-primary font-weight-bolder">
							NEW!
						</span>
					)}
				</span>
				<span className="text-muted font-italic text-right">
					{scoreData.timeAchieved === null
						? "Unknown Time"
						: FormatTime(scoreData.timeAchieved)}
				</span>
			</div>
		</div>
	);
}

type InfoProps = Props & {
	folderDataset: FolderDataset;
	data: UGPTFolderReturns;
};

function TierlistBreakdown({ game, folderDataset, playtype, reqUser }: InfoProps) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const formik = useFormik({
		initialValues: {
			__hideAchieved: false,
			...Object.fromEntries(gptConfig.tierlists.map((e) => [e, true])),
		} as { __hideAchieved: boolean } & Partial<Record<GPTTierlists[IDStrings], true>>,
		onSubmit: NO_OP,
	});

	const tierlistInfo = useMemo(
		() => FolderDatasetToTierlistInfo(folderDataset, game, playtype, formik.values),
		[formik.values]
	);

	const dataMap = CreateChartIDMap(folderDataset);

	return (
		<Row>
			<Col xs={12}>
				<Card header="Tierlist View Configuration">
					<span>Here you can select what tierlist blocks to show!</span>
					<Divider />
					{gptConfig.tierlists.length > 1 &&
						gptConfig.tierlists.map((e) => (
							<>
								<Form.Check
									key={e}
									type="checkbox"
									id={e}
									checked={formik.values[e]}
									onChange={formik.handleChange}
									label={e}
								/>
								<Form.Text>{gptConfig.tierlistDescriptions[e]}</Form.Text>
							</>
						))}

					<Form.Check
						type="checkbox"
						id="__hideAchieved"
						checked={formik.values.__hideAchieved}
						onChange={formik.handleChange}
						label="Hide Achieved"
					/>
					<Form.Text>Hide achieved elements of the tierlist.</Form.Text>
				</Card>
			</Col>
			<Col xs={12}>
				<Divider />
			</Col>
			<Col xs={12}>
				<TierlistInfoLadder
					tierlistInfo={tierlistInfo}
					dataMap={dataMap}
					game={game}
					playtype={playtype}
					reqUser={reqUser}
				/>
			</Col>
		</Row>
	);
}

const NO_TIERLIST_DATA_VALUE = {
	text: "No Tierlist Info",
	value: 0,
};

function TierlistInfoLadder({
	tierlistInfo,
	dataMap,
	game,
	playtype,
	reqUser,
}: {
	tierlistInfo: NullableTierlistInfo[];
	dataMap: Map<string, FolderDataset[0]>;
	game: Game;
	playtype: Playtype;
	reqUser: UserDocument;
}) {
	const buckets: TierlistInfo[][] = useMemo(() => {
		const buckets: TierlistInfo[][] = [];
		let currentBucket: TierlistInfo[] = [];
		const noDataBucket: TierlistInfo[] = [];

		let lastValue;
		for (const tl of tierlistInfo) {
			if (tl.data === null) {
				noDataBucket.push({
					achieved: tl.achieved,
					chartID: tl.chartID,
					data: NO_TIERLIST_DATA_VALUE,
					key: tl.key,
				});
				continue;
			}

			// no longer nullable
			const tlx = tl as TierlistInfo;

			if (lastValue && tlx.data.value !== lastValue) {
				buckets.push(currentBucket);
				currentBucket = [tlx];
			} else {
				currentBucket.push(tlx);
			}
			lastValue = tlx.data.value;
		}

		if (currentBucket.length) {
			buckets.push(currentBucket);
		}

		buckets.push(noDataBucket);

		return buckets;
	}, [tierlistInfo]);

	const gptConfig = GetGamePTConfig(game, playtype);

	for (const bucket of buckets) {
		bucket.sort(NumericSOV((x) => gptConfig.tierlists.indexOf(x.key), true));
	}

	if (tierlistInfo.length === 0) {
		return <Row className="justify-content-center">Got no tierlist data to show you!</Row>;
	}

	return (
		<Row className="text-center">
			{buckets
				.filter((e) => e.length > 0)
				.map((bucket, i) => (
					<React.Fragment key={i}>
						<Col className="ladder-header" xs={12}>
							{bucket[0].data!.value} (
							{DistinctArr(
								bucket.map((e) =>
									gptConfig.tierlists.length === 1
										? e.data.text
										: `${e.key}: ${e.data.text}`
								)
							).join(", ")}
							)
						</Col>

						<TierlistBucket {...{ bucket, dataMap, game, playtype, reqUser }} />
					</React.Fragment>
				))}
		</Row>
	);
}

function TierlistBucket({
	bucket,
	dataMap,
	game,
	reqUser,
}: {
	dataMap: Map<string, FolderDataset[0]>;
	game: Game;
	playtype: Playtype;
	reqUser: UserDocument;
	bucket: TierlistInfo[];
}) {
	// xs view is tabular
	if (window.screen.width <= 576) {
		return (
			<MiniTable>
				{bucket.map((tierlistInfo, i) => (
					<TierlistInfoBucketValues
						tierlistInfo={tierlistInfo}
						key={`${tierlistInfo.chartID}-${tierlistInfo.key}`}
						game={game}
						dataMap={dataMap}
						bucket={bucket}
						i={i}
						reqUser={reqUser}
					/>
				))}
			</MiniTable>
		);
	}

	return (
		<>
			{bucket.map((tierlistInfo, i) => (
				<TierlistInfoBucketValues
					tierlistInfo={tierlistInfo}
					key={`${tierlistInfo.chartID}-${tierlistInfo.key}`}
					game={game}
					dataMap={dataMap}
					bucket={bucket}
					i={i}
					reqUser={reqUser}
				/>
			))}
		</>
	);
}

function TierlistInfoBucketValues({
	tierlistInfo,
	game,
	dataMap,
	bucket,
	i,
	reqUser,
}: {
	tierlistInfo: TierlistInfo;
	bucket: TierlistInfo[];
	dataMap: Map<string, FolderDataset[0]>;
	game: Game;
	i: integer;
	reqUser: UserDocument;
}) {
	const data = dataMap.get(tierlistInfo.chartID)!;

	const lastKey = bucket[i - 1];

	let statusClass;

	switch (tierlistInfo.achieved) {
		case AchievedStatuses.ACHIEVED:
			statusClass = "achieved";
			break;
		case AchievedStatuses.FAILED:
			statusClass = "unachieved";
			break;
		case AchievedStatuses.NOT_PLAYED:
		case AchievedStatuses.SCORE_BASED:
			statusClass = "";
	}

	// xs view
	if (window.screen.width <= 576) {
		return (
			<tr>
				<DifficultyCell game={game} chart={data} alwaysShort noTierlist />
				<td className="text-left">
					<Link className="gentle-link" to={CreateChartLink(data, game)}>
						{data.__related.song.title}
					</Link>{" "}
					<br />
					<div>
						{tierlistInfo.key} ({tierlistInfo.data.text})
						{tierlistInfo.data.individualDifference && (
							<span className="ml-1">
								<Icon type="balance-scale-left" />
							</span>
						)}
					</div>
				</td>
				<TierlistInfoCell tierlistInfo={tierlistInfo} />
			</tr>
		);
	}

	return (
		<>
			{lastKey && lastKey.key !== tierlistInfo.key && <Col xl={12} className="my-2" />}
			<Col
				className={`ladder-element ${
					i % 12 < 6 ? "ladder-element-dark" : ""
				} ladder-element-${statusClass} d-none d-sm-block`}
				xs={12}
				sm={6}
				md={4}
				lg={3}
				xl={2}
			>
				<Link className="gentle-link" to={CreateChartLink(data, game)}>
					{data.__related.song.title}
				</Link>{" "}
				{FormatDifficultyShort(data, game)}
				<Divider className="my-2" />
				{tierlistInfo.key} ({tierlistInfo.data.text})
				{tierlistInfo.data.individualDifference && (
					<>
						<br />

						<div className="mt-1">
							<QuickTooltip tooltipContent="Individual Difference - The difficulty of this varies massively between people!">
								<span>
									<Icon type="balance-scale-left" />
								</span>
							</QuickTooltip>
						</div>
					</>
				)}
				<Divider className="my-2" />
				<Muted>
					<ReferToUser reqUser={reqUser} />{" "}
					{tierlistInfo.achieved === AchievedStatuses.NOT_PLAYED
						? "Not Played"
						: tierlistInfo.achieved === AchievedStatuses.SCORE_BASED
						? data.__related.pb!.scoreData.grade
						: data.__related.pb!.scoreData.lamp}
				</Muted>
			</Col>
		</>
	);
}

function TierlistInfoCell({ tierlistInfo }: { tierlistInfo: TierlistInfo }) {
	let colour;
	let text;

	if (
		tierlistInfo.achieved === AchievedStatuses.NOT_PLAYED ||
		tierlistInfo.achieved === AchievedStatuses.FAILED
	) {
		colour = COLOUR_SET.red;
		text = "✗";
	} else {
		colour = COLOUR_SET.green;
		text = "✓";
	}

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(colour, 0.2),
				width: "60px",
				minWidth: "60px",
				maxWidth: "60px",
			}}
		>
			{text}
		</td>
	);
}

interface NullableTierlistInfo {
	chartID: string;
	key: GPTTierlists[IDStrings];
	data: ChartTierlistInfo | null;
	achieved: AchievedStatuses;
}

interface TierlistInfo {
	chartID: string;
	key: GPTTierlists[IDStrings];
	data: ChartTierlistInfo;
	achieved: AchievedStatuses;
}

enum AchievedStatuses {
	NOT_PLAYED,
	FAILED,
	ACHIEVED,
	SCORE_BASED,
}

function FolderDatasetToTierlistInfo(
	folderDataset: FolderDataset,
	game: Game,
	playtype: Playtype,
	options: Partial<Record<GPTTierlists[IDStrings], boolean>> & { __hideAchieved: boolean }
) {
	const tierlistInfo: NullableTierlistInfo[] = [];

	const tierlistKeys: GPTTierlists[IDStrings][] = [];

	for (const k in options) {
		if (k === "__hideAchieved") {
			continue;
		}

		const key = k as GPTTierlists[IDStrings];
		if (options[key]) {
			tierlistKeys.push(key);
		}
	}

	for (const data of folderDataset) {
		for (const key of tierlistKeys) {
			let achieved: AchievedStatuses;

			if (!data.__related.pb) {
				achieved = AchievedStatuses.NOT_PLAYED;
			} else {
				const fn = GetScaleAchievedFn(game, playtype, key);

				if (fn) {
					achieved = fn(data.__related.pb)
						? AchievedStatuses.ACHIEVED
						: AchievedStatuses.FAILED;
				} else {
					achieved = AchievedStatuses.SCORE_BASED;
				}
			}

			if (options.__hideAchieved && achieved === AchievedStatuses.ACHIEVED) {
				continue;
			}

			tierlistInfo.push({
				chartID: data.chartID,
				key,
				data: data.tierlistInfo[key] ?? null,
				achieved,
			});
		}
	}

	return tierlistInfo.sort(NumericSOV((x) => (x.data ? x.data.value : -Infinity), true));
}
