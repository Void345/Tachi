import { TachiConfig } from "lib/config";
import React from "react";
import { ToCDNURL } from "util/api";

export default function SiteWordmark({ width = "256px" }) {
	return (
		<div className="text-center mb-10 mb-lg-10">
			<img src={ToCDNURL("/logos/logo-wordmark.png")} alt={TachiConfig.name} width={width} />
		</div>
	);
}
