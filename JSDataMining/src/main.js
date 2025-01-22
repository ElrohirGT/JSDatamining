import * as d3 from "d3";

function createChart(data, xProperty, yProperty) {
	// Declare the chart dimensions and margins.
	const width = 928;
	const height = 500;
	const marginTop = 30;
	const marginRight = 0;
	const marginBottom = 30;
	const marginLeft = 40;

	// Declare the x (horizontal position) scale.
	const x = d3
		.scaleBand()
		.domain(
			d3.groupSort(
				data,
				([d]) => -d[yProperty], // descending frequency
				(d) => d[xProperty],
			),
		)
		.range([marginLeft, width - marginRight])
		.padding(0.1);

	// Declare the y (vertical position) scale.
	const y = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d[yProperty])])
		.range([height - marginBottom, marginTop]);

	// Create the SVG container.
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("style", "max-width: 100%; height: auto;");

	// Add a rect for each bar.
	svg
		.append("g")
		.attr("fill", "steelblue")
		.selectAll()
		.data(data)
		.join("rect")
		.attr("x", (d) => x(d[xProperty]))
		.attr("y", (d) => y(d[yProperty]))
		.attr("height", (d) => y(0) - y(d[yProperty]))
		.attr("width", x.bandwidth());

	// Add the x-axis and label.
	svg
		.append("g")
		.attr("transform", `translate(0,${height - marginBottom})`)
		.call(d3.axisBottom(x).tickSizeOuter(0));

	// Add the y-axis and label, and remove the domain line.
	svg
		.append("g")
		.attr("transform", `translate(${marginLeft},0)`)
		.call(d3.axisLeft(y).tickFormat((y) => (y * 100).toFixed()))
		.call((g) => g.select(".domain").remove())
		.call((g) =>
			g
				.append("text")
				.attr("x", -marginLeft)
				.attr("y", 10)
				.attr("fill", "currentColor")
				.attr("text-anchor", "start")
				.text("↑ Frequency (%)"),
		);

	// Return the SVG element.
	return svg.node();
}

// console.log(dataPath);
d3.csv("/data.csv").then((frame) => {
	console.log(frame);

	const carrosCompletos = frame
		.filter((it) => {
			try {
				let n = parseFloat(it.normalized_losses);
				return !Number.isNaN(n);
			} catch {
				return false;
			}
		})
		.map((it) => {
			let n = parseFloat(it.normalized_losses);
			return {
				...it,
				normalized_losses: n,
			};
		});
	console.log(carrosCompletos);

	const min = d3.min(carrosCompletos, (it) => it.normalized_losses);
	console.log(`Minimum price: ${min}`);

	const max = d3.max(carrosCompletos, (it) => it.normalized_losses);
	console.log(`Maximum price: ${max}`);

	const mappedNormalized = carrosCompletos.map((it) => {
		const normalized_losses = it.normalized_losses / max;
		return {
			...it,
			normalized_losses,
		};
	});
	console.log(mappedNormalized);

	const svg = createChart(mappedNormalized, "make", "normalized_losses");
	document.getElementById("app").appendChild(svg);
});
