import { ToCDNURL } from "util/api";
import { IsSupportedGame, IsSupportedPlaytype } from "util/asserts";
import { ChangeOpacity } from "util/color-opacity";
import { CreateChartLink } from "util/data";
import { NumericSOV } from "util/sorts";
import PlaytypeSelect from "app/pages/dashboard/games/_game/PlaytypeSelect";
import GPTChartPage from "app/pages/dashboard/games/_game/_playtype/GPTChartPage";
import GPTDevInfo from "app/pages/dashboard/games/_game/_playtype/GPTDevInfo";
import GPTLeaderboardsPage from "app/pages/dashboard/games/_game/_playtype/GPTLeaderboardsPage";
import GPTMainPage from "app/pages/dashboard/games/_game/_playtype/GPTMainPage";
import GPTSongsPage from "app/pages/dashboard/games/_game/_playtype/GPTSongsPage";
import { ErrorPage } from "app/pages/ErrorPage";
import ChartInfoFormat from "components/game/charts/ChartInfoFormat";
import { GPTBottomNav } from "components/game/GPTHeader";
import SongInfoFormat from "components/game/songs/SongInfoFormat";
import Card from "components/layout/page/Card";
import DebugContent from "components/util/DebugContent";
import Divider from "components/util/Divider";
import LinkButton from "components/util/LinkButton";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { BackgroundContext } from "context/BackgroundContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import {
	ChartDocument,
	FormatDifficulty,
	Game,
	GetGameConfig,
	GetGamePTConfig,
	SongDocument,
} from "tachi-common";
import { SongsReturn } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import { UGPTContextProvider } from "context/UGPTContext";
import { TargetsContextProvider } from "context/TargetsContext";
import QuestlinePage from "components/game/targets/QuestlinePage";
import QuestsPage from "components/game/targets/QuestsPage";
import ChartRedirector from "app/pages/dashboard/games/_game/_playtype/ChartRedirector";
import QuestPage from "components/game/targets/QuestPage";

export default function GameRoutes() {
	const { game } = useParams<{ game: string }>();
	const { setBackground } = useContext(BackgroundContext);

	if (!IsSupportedGame(game)) {
		return <ErrorPage statusCode={404} customMessage={`The game ${game} is not supported.`} />;
	}

	setBackground(ToCDNURL(`/game-banners/${game}`));

	const gameConfig = GetGameConfig(game);

	return (
		<Switch>
			<Route exact path="/games/:game">
				{gameConfig.validPlaytypes.length === 1 ? (
					<Redirect to={`/games/${game}/${gameConfig.validPlaytypes[0]}`} />
				) : (
					<PlaytypeSelect
						subheaderCrumbs={["Games", gameConfig.name]}
						subheaderTitle={`${gameConfig.name} Playtype Select`}
						base={`/games/${game}`}
						game={game}
					/>
				)}
			</Route>

			<Route path="/games/:game/:playtype">
				<UGPTContextProvider>
					<TargetsContextProvider>
						<GamePlaytypeRoutes game={game} />
					</TargetsContextProvider>
				</UGPTContextProvider>
			</Route>

			<Route path="*">
				<ErrorPage statusCode={404} />
			</Route>
		</Switch>
	);
}

function GamePlaytypeRoutes({ game }: { game: Game }) {
	const { playtype } = useParams<{ playtype: string }>();

	if (!IsSupportedPlaytype(game, playtype)) {
		return (
			<ErrorPage
				statusCode={400}
				customMessage={`The playtype ${playtype} is not supported.`}
			/>
		);
	}

	return (
		<>
			<div className="card">
				<GPTBottomNav baseUrl={`/games/${game}/${playtype}`} />
			</div>
			<Divider />
			<Switch>
				<Route exact path="/games/:game/:playtype">
					<GPTMainPage game={game} playtype={playtype} />
				</Route>

				<Route exact path="/games/:game/:playtype/charts">
					<Redirect to={`/games/${game}/${playtype}/songs`} />
				</Route>

				<Route exact path="/games/:game/:playtype/charts/:chartID">
					<ChartRedirector game={game} playtype={playtype} />
				</Route>

				<Route exact path="/games/:game/:playtype/songs">
					<GPTSongsPage game={game} playtype={playtype} />
				</Route>

				<Route path="/games/:game/:playtype/songs/:songID">
					<SongChartRoutes game={game} playtype={playtype} />
				</Route>

				<Route path="/games/:game/:playtype/(quests|questlines|goals)">
					<GPTQuestRoutes game={game} playtype={playtype} />
				</Route>

				<Route exact path="/games/:game/:playtype/leaderboards">
					<GPTLeaderboardsPage game={game} playtype={playtype} />
				</Route>
				<Route exact path="/games/:game/:playtype/dev-info">
					<GPTDevInfo game={game} playtype={playtype} />
				</Route>

				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
		</>
	);
}

function GPTQuestRoutes({ game, playtype }: GamePT) {
	return (
		<>
			<Switch>
				<Route exact path="/games/:game/:playtype/quests">
					<QuestsPage game={game} playtype={playtype} />
				</Route>

				<Route exact path="/games/:game/:playtype/questlines">
					<Redirect to={`/games/${game}/${playtype}/quests`} />
				</Route>

				<Route exact path="/games/:game/:playtype/questlines/:questlineID">
					<QuestlinePage game={game} playtype={playtype} />
				</Route>

				<Route exact path="/games/:game/:playtype/quests/:questID">
					<QuestPage game={game} playtype={playtype} />
				</Route>

				<Route exact path="/games/:game/:playtype/goals">
					<Redirect to={`/games/${game}/${playtype}/quests`} />
				</Route>
			</Switch>
		</>
	);
}

function SongChartRoutes({ game, playtype }: GamePT) {
	const { songID } = useParams<{ songID: string }>();

	const { data, error } = useApiQuery<SongsReturn>(`/games/${game}/${playtype}/songs/${songID}`);

	const { settings } = useContext(UserSettingsContext);

	const [activeChart, setActiveChart] = useState<ChartDocument | null>(null);

	useEffect(() => {
		setActiveChart(null);
	}, [game, playtype]);

	if (error) {
		return <ErrorPage statusCode={error.statusCode} customMessage={error.description} />;
	}

	if (!data) {
		return <Loading />;
	}

	if (data.charts.length === 0) {
		return (
			<ErrorPage
				statusCode={404}
				customMessage={"This song has no charts for this playtype."}
			/>
		);
	}

	if (data.charts.every((c) => c.playtype !== playtype)) {
		return <Redirect to={`/games/${game}/${data.charts[0].playtype}/songs/${data.song.id}`} />;
	}

	return (
		<>
			<SongInfoHeader
				game={game}
				playtype={playtype}
				{...data}
				activeChart={activeChart}
				setActiveChart={setActiveChart}
			/>
			<Divider />
			<Switch>
				<Route exact path="/games/:game/:playtype/songs/:songID">
					{/* Select the hardest chart for this. */}
					<Redirect
						to={`/games/${game}/${playtype}/songs/${data.song.id}/${
							data.charts.slice(0).sort(NumericSOV((x) => x.levelNum, true))[0]
								.difficulty
						}`}
					/>
				</Route>

				<Route path="/games/:game/:playtype/songs/:songID/:difficulty">
					<GPTChartPage
						game={game}
						playtype={playtype}
						song={data.song}
						chart={activeChart}
						setActiveChart={setActiveChart}
						allCharts={data.charts}
					/>
				</Route>

				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
			{settings?.preferences.developerMode && (
				<>
					<Divider />
					<Card header="Dev Info">
						<DebugContent data={data} />
					</Card>
				</>
			)}
		</>
	);
}

function SongInfoHeader({
	game,
	playtype,
	song,
	charts,
	activeChart,
	setActiveChart,
}: { activeChart: ChartDocument | null; setActiveChart: SetState<ChartDocument | null> } & GamePT &
	SongsReturn) {
	const gptConfig = GetGamePTConfig(game, playtype);

	// accidentally O(n^2) but this is a short list so who cares
	const sortedCharts = charts
		.slice(0)
		.sort(
			NumericSOV((x) =>
				gptConfig.difficulties.indexOf(
					game === "itg"
						? (x as ChartDocument<"itg:Stamina">).data.difficultyTag
						: x.difficulty
				)
			)
		);

	const [ImageCell, setImageCell] = useState<JSX.Element | null>(null);

	useEffect(() => {
		if (game === "popn") {
			setImageCell(
				<img
					src={ToCDNURL(
						`/misc/popn/banners/${
							(charts[0] as ChartDocument<"popn:9B">).data.inGameID
						}.png`
					)}
					className="w-100"
				/>
			);
		} else if (game === "itg") {
			const banner = (song as SongDocument<"itg">).data.banner;

			if (banner) {
				setImageCell(
					<img
						src={ToCDNURL(`/misc/itg/banners/${encodeURIComponent(banner)}.png`)}
						className="w-100"
					/>
				);
			}
		} else if ("displayVersion" in song.data) {
			setImageCell(
				<img
					// on error just hide this tbh
					onError={() => setImageCell(null)}
					src={ToCDNURL(`/game-icons/${game}/${song.data.displayVersion}`)}
					className="w-100"
				/>
			);
		}
	}, [game, song]);

	return (
		<Card header="Song Info">
			<Row
				className="align-items-center"
				style={{
					justifyContent: "space-evenly",
				}}
			>
				{ImageCell && (
					<Col xs={12} lg={3} className="text-center">
						{ImageCell}
					</Col>
				)}
				<Col xs={12} lg={4} className="text-center">
					<SongInfoFormat {...{ game, song, chart: activeChart }} />
				</Col>
				{game !== "bms" && game !== "pms" && (
					<Col xs={12} lg={3} className="text-center">
						<h5>Charts</h5>
						<hr />
						<div className="btn-group-vertical d-flex justify-content-center">
							{game === "iidx" ? (
								<IIDXDifficultyList
									{...{
										activeChart,
										charts: sortedCharts,
										game,
										playtype,
										setActiveChart,
										song,
									}}
								/>
							) : (
								<DifficultyList
									{...{
										activeChart,
										charts: sortedCharts,
										game,
										playtype,
										setActiveChart,
										song,
									}}
								/>
							)}
						</div>
					</Col>
				)}
				{activeChart && (
					<Col xs={12}>
						<Divider />
						<ChartInfoFormat playtype={playtype} chart={activeChart} game={game} />
					</Col>
				)}
			</Row>
		</Card>
	);
}

type Props = { song: SongDocument } & {
	activeChart: ChartDocument | null;
	setActiveChart: SetState<ChartDocument | null>;
} & GamePT;

function DifficultyButton({
	chart,
	game,
	playtype,
	setActiveChart,
	activeChart,
}: Props & { chart: ChartDocument }) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const diffTag =
		game === "itg"
			? (chart as ChartDocument<"itg:Stamina">).data.difficultyTag
			: chart.difficulty;

	return (
		<LinkButton
			onClick={() => setActiveChart(chart)}
			className="btn-secondary"
			key={chart.chartID}
			to={CreateChartLink(chart, game)}
			style={{
				backgroundColor: gptConfig.difficultyColours[diffTag]
					? ChangeOpacity(
							gptConfig.difficultyColours[diffTag]!,
							activeChart?.chartID === chart.chartID ? 0.4 : 0.2
					  )
					: undefined,
			}}
		>
			{activeChart?.chartID === chart.chartID ? (
				<strong>
					{FormatDifficulty(chart, game)}
					{chart.isPrimary ? (
						""
					) : (
						<>
							{" "}
							<Muted>{chart.versions.join("/")}</Muted>
						</>
					)}
				</strong>
			) : (
				<>
					{FormatDifficulty(chart, game)}
					{chart.isPrimary ? (
						""
					) : (
						<>
							{" "}
							<Muted>{chart.versions.join("/")}</Muted>
						</>
					)}
				</>
			)}
		</LinkButton>
	);
}

function DifficultyList({
	charts,
	song,
	activeChart,
	setActiveChart,
	game,
	playtype,
}: {
	charts: ChartDocument[];
} & Props) {
	return (
		<>
			{charts.map((e) => (
				<DifficultyButton
					activeChart={activeChart}
					setActiveChart={setActiveChart}
					game={game}
					playtype={playtype}
					song={song}
					chart={e}
					key={e.chartID}
				/>
			))}
		</>
	);
}

/**
 * We need some special handling for IIDX Special Difficulties.
 * Thanks.
 */
function IIDXDifficultyList({
	charts,
	song,
	activeChart,
	setActiveChart,
	game,
	playtype,
}: {
	charts: ChartDocument[];
} & Props) {
	const { settings } = useLUGPTSettings<"iidx:SP" | "iidx:DP">();

	const [set, setSet] = useState<null | "All Scratch" | "Kichiku" | "Kiraku">(null);

	if (
		!(activeChart as ChartDocument<"iidx:SP" | "iidx:DP">)?.data["2dxtraSet"] &&
		!settings?.preferences.gameSpecific.display2DXTra
	) {
		return (
			<DifficultyList
				{...{
					charts: charts.filter(
						// @ts-expect-error hack
						(e: ChartDocument<"iidx:SP" | "iidx:DP">) => e.data["2dxtraSet"] === null
					),
					song,
					activeChart,
					setActiveChart,
					game,
					playtype,
				}}
			/>
		);
	}

	return (
		<>
			<div className="btn-group">
				<SelectButton value={set} setValue={setSet} id={null}>
					Normal
				</SelectButton>
				<SelectButton value={set} setValue={setSet} id="All Scratch">
					All Scr.
				</SelectButton>
				<SelectButton value={set} setValue={setSet} id="Kichiku">
					Kichiku
				</SelectButton>
				<SelectButton value={set} setValue={setSet} id="Kiraku">
					Kiraku
				</SelectButton>
			</div>
			<DifficultyList
				{...{
					charts: charts.filter(
						// @ts-expect-error hack
						(e: ChartDocument<"iidx:SP" | "iidx:DP">) =>
							set ? e.difficulty.startsWith(set) : e.data["2dxtraSet"] === null
					),
					song,
					activeChart,
					setActiveChart,
					game,
					playtype,
				}}
			/>
		</>
	);
}
