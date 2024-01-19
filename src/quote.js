

export async function getQuoteText(ticker, env) {
	// utility lookups for cryptos
	const overrides = {
		'btc': 'btc/usd',
		'eth': 'eth/usd',
	}

	const stockSymbol = overrides[ticker.toLowerCase()] ?? ticker;

	const apiUrl = `https://api.twelvedata.com/quote?symbol=${stockSymbol}&apikey=${env.TWELVE_DATA_TOKEN}`
	const logoUrl = `https://api.twelvedata.com/logo?symbol=${stockSymbol}&apikey=${env.TWELVE_DATA_TOKEN}`
	const mktCapUrl = `https://api.polygon.io/v3/reference/tickers/${stockSymbol.toUpperCase()}?apiKey=${env.POLYGON_TOKEN}`

	const res = await fetch(apiUrl);
	const logoRes = await fetch(logoUrl);
	const mktCapRes = await fetch(mktCapUrl);

	const body = await res.json();
	const logoBody = await logoRes.json();
	const mktCapBody = await mktCapRes.json();

	console.log(body);
	console.log(logoBody);
	console.log(mktCapBody);

	const options = {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		timeZone: "America/New_York",
		timeZoneName: "shortGeneric",
	};

	const d = new Intl.DateTimeFormat("en-US", options).format(new Date(body.timestamp * 1000))
	const changePercent = body.percent_change ? Number(body.percent_change).toFixed(2) : 'N/A';
	const changeNum = Number(body.change)
	const change = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		changeNum
	)
	const close = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		Number(body.close)
	)
	const yearHigh = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		Number(body["fifty_two_week"]["high"])
	)
	const yearLow = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
		Number(body["fifty_two_week"]["low"])
	)
	const mktCap = Intl.NumberFormat('en-US', {
		notation: "compact",
		maximumFractionDigits: 2
	}).format(Number(mktCapBody.results.market_cap))

	const quoteString =
		`# ${body.name} - $${body.symbol}\n` +
		`${d}\n` +
		`**52wk High**  ${yearHigh}    **52wk Low:** ${yearLow}    **Mkt Cap:** ${mktCap}\n` +
		`## ${close}  (${change}, ${changePercent}%) ${changeNum > 0 ? '▲' : '▼'}`

	return {
		quote: quoteString, logoUrl: logoBody?.logo_base ?? logoBody?.url
	};
}
