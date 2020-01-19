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

            return '<h4> Nederlander met ' + d.data.origin + 'e' + ' migratieachtergrond</h4><strong>Percentage:</strong> <span style=\'color:red\'>' + transformToPercent((d[1] - d[0])) + '</span> <div id="tipSVG"></div>';
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
    // .domain('Nederlands', 'niet-Westers', 'Westers')
        .range([ '#494CA2', '#8186d5', '#c6cbef']);
        
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
        .attr('class', d => d.data.origin)
    //.attr("x", (d, i) => x(d.data.name))
        .attr('y', d => yScale(d.data.origin))
        .attr('x', d => xScale(d[0]))
        .attr('height', yScale.bandwidth())
        .attr('width', d => xScale(d[1]) - xScale(d[0]))
        // .attr('fill', d => console.log('fillieee', d[1] - d[0]))
        // .attr('stroke', d => {if (d[0]) return color(d)})
        .attr('fill', d => {if (d[1] == d[1] - d[0]) return color(d);})
        .attr('stroke', d => {if (d[1]) return color(d);})
        .attr('stroke-width', '3')
        // .attr('stroke', d => console.log('strook', d))
        // .attr('fill', d => {if (d[1]) return color(d)})
        // .attr('fill', d => console.log('hoooi', d[0]))
        .on('mouseover', function(d) {
            //chart in tooltip 
            
            //resource for data passing: https://github.com/caged/d3-tip/issues/231 comment by inovux
            //used this example: https://stackoverflow.com/questions/43904643/add-chart-to-tooltip-in-d3
            tip.show(d, this);
            // console.log('rararara: ', d.data);

            // let tipSVG = d3.select('#tipDiv')
            //     .append('svg')
            //     .attr('width', 200)
            //     .attr('height', 50);
      
            // tipSVG.append('rect')
            //     .attr('fill', 'steelblue')
            //     .attr('y', 10)
            //     .attr('width', 0)
            //     .attr('height', 30)
            //     .transition()
            //     .duration(1000)
            //     .attr('width', d.data.amountPoliceContactedMe);

            // tipSVG.append('text')
            //     .text(d.data.amountPoliceContactedMe)
            //     .attr('x', 10)
            //     .attr('y', 30)
            //     .transition()
            //     .duration(1000);
            const pie = d3.pie()
                .sort(null)
                .value(d => d.amountPoliceContactedMe);
            const width = 200;
            const height = 200;
            function test() {
                const radius = Math.min(width, height) / 2 * 0.8;
                return d3.arc().innerRadius(radius).outerRadius(radius);
            };
            const arcLabel = test();
            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(Math.min(width, height) / 2 - 1);
            const arcs = pie(data);
            const svg = d3.select('#tipSVG')
                .append('svg')
                .attr('viewBox', [-width / 2, -height / 2, width, height]);
        
            // console.log('arcs: ', arcs);
            
            const color = d3.scaleOrdinal()
                .range(['#494CA2', '#8186d5', '#c6cbef', '#a3a3a3' ]);
        
            svg.append('g')
                .attr('stroke', 'black')
                .attr('stroke-width', '2')
                .attr('class', 'pie')
                .selectAll('path')
                .data(arcs)
                .join('path')
                .attr('fill', color(d.data.origin))
                .attr('d', arc)
                .append('title')
                .text(d.data.origin + ': ' + d.data.amountPoliceContactedMe.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%')
                .style('text-anchor', 'middle');
        
            svg.append('g')
                .attr('font-family', 'sans-serif')
                .attr('font-size', 12)
                .attr('text-anchor', 'middle')
                .selectAll('text')
                .data(arcs)
                .join('text')
                .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
                .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append('tspan')
                    .attr('x', 0)
                    .attr('y', '0.7em')
                    .attr('fill-opacity', 0.7)
                    .text(d.data.amountPoliceContactedMe.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%'));
        
            return svg.node();
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