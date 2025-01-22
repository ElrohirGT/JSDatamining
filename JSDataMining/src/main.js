import * as d3 from "d3";

// console.log(dataPath);
d3.csv("/data.csv").then((frame) => {
	console.log(frame);
});
