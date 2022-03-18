const margin = {top: 45, right: 30, bottom: 50, left: 80};
const width = 600; // Total width of the SVG parent
const height = 600; // Total height of the SVG parent
const padding = 1; // Vertical space between the bars of the histogram
const barsColor = 'steelblue';

// Load data here
d3.csv('../data/pay_by_gender_tennis.csv').then(data => {

  console.log(data);
	
  const earnings = []
  data.forEach(datum => {
    // Convert strings to numbers
	datum['earnings_USD_2019'] = parseFloat(datum['earnings_USD_2019']); 
    earnings.push(datum.earnings_USD_2019); // Populate the artists array
  });
	
  console.log(earnings);
  createHistogram(earnings);
});

// Create Histogram
const createHistogram = (earnings) => {
	
  const maxEarn = Math.ceil(d3.max(earnings)/1000000)*1000000;
	
  const bins = d3.bin()
    .domain([0, maxEarn])
    .thresholds(maxEarn/1000000)
    (earnings);
	
  console.log(bins);
  console.log(bins.length);
  console.log(d3.max(bins, d => d.length));
  console.log(d3.min(bins, d => d.length));
  console.log(d3.max(bins, d => d.x1));
	
  const maxBin = d3.max(bins, d => d.x1);
  const cntBin = bins.length;

  console.log("maxBin :" + maxBin);
  console.log("cntBin :" + cntBin);

  const binLengths = (bins, d => d.length);
  console.log(binLengths);

  const chart = d3.select('#viz')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewbox', [0, 0, width, height]);
		
  // X-Scale
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([0, width - margin.right- margin.left])
    .nice();

  // Y-Scale		
  const yScale = d3.scaleLinear()
    .domain([0, maxBin])
    .range([height - margin.bottom, margin.top]);
    //.nice;

  // Append axis	
  chart
    .append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale)
	  .ticks(maxBin/1000000)
	  .tickFormat(d3.format('~s')));
  
  chart
    .append('g')
    .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(10));

  // Add bars
  const bars = chart
    .selectAll('.bar')
    .data(bins)
    .join('g')
	  .attr('class', 'bar bar-earn');

  bars.append('rect')
    .attr('width', d => xScale(d.length))
	.attr('height', (height-margin.top-margin.bottom)/cntBin - padding)
	.attr('x', margin.left + 1)
	.attr('y', d => yScale(d.x1) + padding/2)
	.attr('fill', barsColor); 

  // Add curve
  const curveBins = [[]].concat(bins).concat([[]]);
    
  const myGenLine = d3.line()
    .x(d => xScale(d.length) + margin.left)
    .y((d, i) => {
  	  if(i === 0) {
  	    return yScale(0)
        }
      else if (i === curveBins.length - 1) {
        return yScale(maxBin)
        }
      else {
        return yScale(d.x0) + (yScale(d.x1) - yScale(d.x0) - padding)/2
        }
      }
    )
	.curve(d3.curveCatmullRom);

  chart
    .append('path')
	  .attr('d', myGenLine(curveBins))
	  .attr('fill', 'none')
	  .attr('stroke', 'red')
	  .attr('stroke-width', '2px');

  //Add area
  const myGenArea = d3.area()
    .x0(d => margin.left)
    .x1(d => xScale(d.length) + margin.left)
    .y((d, i) => {
      if(i === 0) {
        return yScale(0)
        }
      else if (i === curveBins.length - 1) {
        return yScale(maxBin)
        }
      else {
        return yScale(d.x0) + (yScale(d.x1) - yScale(d.x0) - padding)/2
        }
      }
    )
    .curve(d3.curveCatmullRom);

  chart
    .append('path')
	  .attr('d', myGenArea(curveBins))
	  .attr('fill', 'yellow')
	  .style("fill-opacity", .5);



};

// Create Split Violin Plot
const createViolin = () => {
  
};