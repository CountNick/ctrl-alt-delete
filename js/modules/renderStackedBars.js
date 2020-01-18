export default function renderStackedBars(data){

    console.log('data: ', data);

    let stack = d3.stack()
        .keys(['iContactedPolice', 'policeContactedMe'])
        .order(d3.stackOrderAscending)
        .offset(d3.stackOffsetExpand);

    let stack2 = d3.stack()
        .keys(['amountIContactedPolice', 'amountPoliceContactedMe'])
        .order(d3.stackOrderAscending)
        .offset(d3.stackOffsetNone);

    let series = stack(data);

    let series2 = stack2(data);

    let transformToPercent = d3.format('.0%');

    console.log('series: ', series);

    console.log('series 2: ', series2);

    const svg = d3.select('.stack');

    const width = +svg.attr('width');
    const height = +svg.attr('height');


    
    const yValue = d => d.origin;

    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-55, 0])
        .html(d => {
            
            //console.log(d[1] - d[0] == d.data.iContactedPolice)
            //console.log(data);
            // if(d[1] - d[0] == d.data.iContactedPolice ) console.log('dit wil je:', d)

            return '<h4> Nederlander met ' + d.data.origin + 'e' + ' migratieachtergrond</h4><strong>Percentage:</strong> <span style=\'color:red\'>' + transformToPercent((d[1] - d[0])) + '</span> <div id="tipDiv"></div>';
            //return '<svg class= "tipPie" width = "350" height= "350"></svg>'
            // return renderPieChart(d);

        });
        // .append('svg')
        // .attr('width', 350);

    const margin = { top: 40, right: 30, bottom: 150, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
        .range([0, innerWidth])
        .nice();

    const yScale = d3.scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.3);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    //append a new group for the y axis and set it on the left side
    g.append('g')
        .style('font-size', '1rem')
        .call(d3.axisLeft(yScale)
            .tickSize('0'));
    // .append('text')
    // .style('font-size', '1rem')
    // .style('transform', 'rotate(-90deg)')
    // .attr('y', innerHeight / 2)
    // // .attr('x', 500)
    // .attr('fill', 'white')
            
    // .text('Nederlanders');

    //append a new group for the x axis and set it at as the bottom axis
    g.append('g')
        .style('font-size', '1rem')
        .call(d3.axisBottom(xScale)
            .tickSize(-innerHeight)
            .tickFormat(transformToPercent))
        .style('stroke-dasharray', ('3, 3'))
        .attr('transform', `translate(0, ${innerHeight})`)
        .append('text')
        .style('font-size', '1rem')
        .attr('y', 40)
        .attr('x', innerWidth / 2)
        .attr('fill', 'white')
        .text('Percentage');

    //makes an ordinal color scale for each type
    // const color = d3.scaleOrdinal()
    //     .range([ '#FFF33D', '#0048FF', ]);
    //makes an ordinal color scale for each type
    const color = d3.scaleOrdinal()
    .domain('niet-Westers', 'Nederlands', 'Westers')
        .range([ '#8186d5', '#494CA2', '#c6cbef']);
        
    g.call(tip);

    g.append('g')
        .selectAll('g')
        .data(series)
        .join('g')
        // .attr('fill', d => color(d.key))
        // .attr('stroke', d => color(d.key))
        // .attr('fill', d => {if (d.index == 0) return color(d)})
        // .attr('stroke', d => {if (d.index == 1) return color(d)})
        .style('opacity', 1)
        .selectAll('rect')
        .data(d => d)
        .join('rect')
        // .style('opacity', .5)
        .attr('class', 'bar')
    //.attr("x", (d, i) => x(d.data.name))
        .attr('y', d => yScale(d.data.origin))
        .attr('x', d => xScale(d[0]))
        .attr('height', yScale.bandwidth())
        .attr('width', d => xScale(d[1]) - xScale(d[0]))
        // .attr('fill', d => console.log('fillieee', d))
        .attr('fill', d => {if (d[0]) return color(d)})
        .attr('stroke', d => {if (d[1]) return color(d)})
        .on('mouseover', function(d) {
            //chart in tooltip 
            
            //resource for data passing: https://github.com/caged/d3-tip/issues/231 comment by inovux
            //used this example: https://stackoverflow.com/questions/43904643/add-chart-to-tooltip-in-d3
            tip.show(d, this);

            console.log('rararara: ', d.data);

            let tipSVG = d3.select('#tipDiv')
                .append('svg')
                .attr('width', 200)
                .attr('height', 50);
      
            tipSVG.append('rect')
                .attr('fill', 'steelblue')
                .attr('y', 10)
                .attr('width', 0)
                .attr('height', 30)
                .transition()
                .duration(1000)
                .attr('width', d.data.amountPoliceContactedMe);

            tipSVG.append('text')
                .text(d.data.amountPoliceContactedMe)
                .attr('x', 10)
                .attr('y', 30)
                .transition()
                .duration(1000);
        })
        .on('mouseout', tip.hide)

    //g.selectAll("rect")
        .append('text')
        .attr('height', yScale.bandwidth())
        .attr('class', 'up')
        .attr('y', d => yScale(d.data.origin))
        .attr('x', d => xScale(d[0]))
        .attr('text-anchor', 'left')
        .text( d => transformToPercent(d[1] - d[0]))
        .style('fill', '#FFFFFF');

    const legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; })
        .on('mouseenter', d => {
            console.log(d);
        });
    legend.append('rect')
        .attr('x', 630 + innerWidth /3)
        .attr('y', innerHeight / 2 +70)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

    // function selectionChanged(){
    //change by click on radio button
    //chenge the normalised bars to stacked bars
    //stacked bars should have numbers 
    //x axis should have these numbers on axis
    // }     
}