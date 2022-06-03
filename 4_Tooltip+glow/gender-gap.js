const margin = {top: 45, right: 30, bottom: 50, left: 80};
const width = 600; // Total width of the SVG parent
const height = 600; // Total height of the SVG parent
const padding = 1; // Vertical space between the bars of the histogram
const barsColor = 'steelblue';


// Load data here
d3.csv('../data/pay_by_gender_tennis.csv').then(data => {
/*   const earnings = []
  data.forEach(datum => {
    // Convert strings to numbers
	datum['earnings_USD_2019'] = parseFloat(datum['earnings_USD_2019']); 
    earnings.push(datum.earnings_USD_2019);
  });
	
  createHistogram(earnings); */

  createViolin(data);
  
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

  chart
    .append('text')
	  .attr('x', 1)
	  .attr('y', 1)
	  .attr('dy', '1em')
	  .style('font-size', '16px')
	  .text('Earnings of the top tennis players in 2019 (USD)');

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
const createViolin = (data) => {
  const earnings = [];
  const w_earnings = [];
  const m_earnings = [];
  
  const colors = {womenArea: '#A6BF4B', menArea: '#F2C53D'}
  const areaOpacity = .8;
  
  data.forEach(datum => {
    // Convert strings to numbers
	datum['earnings_USD_2019'] = parseFloat(datum['earnings_USD_2019']); 
    earnings.push(datum.earnings_USD_2019);
	if(datum['gender'] === 'men') {
	  m_earnings.push(datum.earnings_USD_2019)
	  }
	else {
	  w_earnings.push(datum.earnings_USD_2019)
	  }
  });

  const maxEarn = Math.ceil(d3.max(earnings)/1000000)*1000000;

  // Creating women earnings bins	
  const w_bins = d3.bin()
    .domain([0, maxEarn])
    .thresholds(maxEarn/1000000)
    (w_earnings);

  // Creating men earnings bins	
  const m_bins = d3.bin()
    .domain([0, maxEarn])
    .thresholds(maxEarn/1000000)
    (m_earnings);	

  // Gestting overall chart constants	
  const maxBin = d3.max(w_bins, d => d.x1);
  const cntBin = w_bins.length;
//  const w_binLengths = (w_bins, d => d.length);

  const chart = d3.select('#viz')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewbox', [0, 0, width, height]);
	
  // Add glow effect
   // Append container for the effect: defs
   const defs = chart.append('defs');

   // Add filter for the glow effect
   const filter = defs
      .append('filter')
         .attr('id', 'glow');
   filter
      .append('feGaussianBlur')
         .attr('stdDeviation', '3.5')
         .attr('result', 'coloredBlur');
   const feMerge = filter
      .append('feMerge');
   feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
   feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');


  // X-Scale
  const xScale = d3.scaleLinear()
    .domain([0, 2.15 * d3.max(w_bins.concat(m_bins), d => d.length)])
    .range([0, width - margin.right - margin.left])
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
    .call(d3.axisBottom(xScale).ticks(0)); 

  chart
    .append('text')
	  .attr('x', 1)
	  .attr('y', 1)
	  .attr('dy', '1em')
	  .style('font-size', '18px')
	  .style('font-weight', 700)
	  .text('Earnings of the top tennis players in 2019 (USD)');

/*
  // Using the xAxis above looks better than the 1px line below
  chart
    .append('line')
	.attr('x1', margin.left)
	.attr('x2', width - margin.right)
	.attr('y1', height - margin.bottom)
	.attr('y2', height - margin.bottom)
 	.attr('stroke', 'black')
	.attr('stroke-width', '1px'); */

  // Add women's area
  const w_curveBins = [[]].concat(w_bins).concat([[]]);
    
  const womenArea = d3.area()
    .x0(d => margin.left + (width - margin.right - margin.left)/2)
    .x1(d => (width - margin.right - margin.left)/2 - xScale(d.length) + margin.left)
    .y((d, i) => {
      if(i === 0) {
        return yScale(0)
        }
      else if (i === w_curveBins.length - 1) {
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
	  .attr('d', womenArea(w_curveBins))
	  .attr('fill', '#A6BF4B')
	  .style("fill-opacity", .8)
	  .style('filter', 'url(#glow)');;

  //Add men's area
  const m_curveBins = [[]].concat(m_bins).concat([[]]);
    
  const menArea = d3.area()
    .x0(d => margin.left + (width - margin.right - margin.left)/2)
    .x1(d => (width - margin.right - margin.left)/2 + xScale(d.length) + margin.left)
    .y((d, i) => {
      if(i === 0) {
        return yScale(0)
        }
      else if (i === m_curveBins.length - 1) {
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
	  .attr('d', menArea(m_curveBins))
	  .attr('fill', '#F2C53D')
	  .style("fill-opacity", .8)
	  .style('filter', 'url(#glow)');

  // Adding individual players
  const circlesRadius = 3;
  const circlesPadding = 1;
  const violinSymmetryAxisPosition = margin.left + (width - margin.right - margin.left)/2

  const simulation = d3.forceSimulation(data)
    .force('forceX', d3.forceX(violinSymmetryAxisPosition)
      .strength(0.1))
    .force('forceY', d3.forceY(d => yScale(d.earnings_USD_2019))
      .strength(10))
    .force('collide', d3.forceCollide(circlesRadius + circlesPadding))
    .force('axis', () => {

     // Loop through each data point
      data.forEach(d => {
        
        // If man and the circle's x position is on the left side of the violin
        if (d.gender === 'men' && d.x < violinSymmetryAxisPosition + circlesRadius) {
          // Increase velocity toward the right
          d.vx += 0.004 * d.x;
        }

        // If woman and the circle's x position is on the right side of the violin
        if (d.gender === 'women' && d.x > violinSymmetryAxisPosition - circlesRadius) {
          // Increase velocity toward the left
          d.vx -= 0.004 * d.x;
        }
      })
    })
	.stop()
    .tick(200);
  
  chart
    .append('g')
	  .selectAll('circle')
	  .data(data)
	  .join('circle')
	    .attr('cx', d => d.x)
		.attr('cy', d => d.y)
		.attr('r', circlesRadius)
		.attr('fill', d => (d.gender === 'men') ? '#BF9B30' : '#718233')
		.attr('stroke', d => {if (d.gender === 'men') {
			                   return '#BF9B30'
							}
							if (d.gender === 'women') {
							   return '#718233'
							}
		})
		.attr('fill-opacity', 0.6);
				
  // Legend
  const legend = {top: 10, left: 30};
  const rct = {width: 30, height: 15};
  
  chart
    .append('rect')
	  .attr('x', margin.left + legend.left)
      .attr('y', margin.top + legend.top)
      .attr('height', rct.height)
      .attr('width', rct.width)
      .attr('fill', colors.womenArea)
      .attr('fill-opacity', areaOpacity);
	
  chart
    .append('rect')
	  .attr('x', margin.left + legend.left)
      .attr('y', margin.top + legend.top + 6 + rct.height)
      .attr('height', rct.height)
      .attr('width', rct.width)
      .attr('fill', colors.menArea)
      .attr('fill-opacity', areaOpacity);

  chart
    .append('text')
	  .attr('x', margin.left + legend.left + 6 + rct.width)
      .attr('y', margin.top + legend.top + rct.height/2)
	  .attr("dy", ".35em")
	  .style('font-size', '12px')
      .text('Women');

  chart
    .append('text')
	  .attr('x', margin.left + legend.left + 6 + rct.width)
      .attr('y', margin.top + legend.top + 6 + rct.height + rct.height/2)
	  .attr("dy", ".35em")
	  .style('font-size', '12px')
      .text('Men');

  // Event handling: tooltip
  var tooltip = d3.select('div.tooltip');

  d3.selectAll('circle')
      .on('mouseover', (event, d) => {
		 handleMouseOver(event, d);
      })
	  .on('mouseout', (event, d) => {
          handleMouseOut()
      });
	  
  function handleMouseOver(event, d) { 
    tooltip.select('.name').text(d.name);
	tooltip.select('.home').text(d.country);
	tooltip
	  .select('.total-earnings-section')
	  .select('.total-earnings').text(d3.format(".4s")(d.earnings_USD_2019));
	tooltip
	  .style('top', event.pageY + "px")
	  .style('left', event.pageX + "px");
	tooltip.classed('visible', true); 
  }

  function handleMouseOut() {
    tooltip.classed('visible', false);
  }
  

};