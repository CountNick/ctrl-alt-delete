export default function renderPieChart(data) {
    
    let transformToPercent = d3.format('.0%');
    const pie = d3.pie()
        .sort(null)
        .value(d => d.percentage);
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
    const svg = d3.select('.pie')
        .attr('viewBox', [-width / 2, -height / 2, width, height]);

    // console.log('arcs: ', arcs);
    
    const color = d3.scaleOrdinal()
        .range(['#F45905', '#FF9933', '#FFCC99', '#a3a3a3' ]);

    svg.append('g')
        .attr('stroke', 'white')
        .attr('class', 'pie')
        .selectAll('path')
        .data(arcs)
        .join('path')
        .attr('fill', d => color(d.data.origin))
        .attr('d', arc)
        .append('title')
        .text(d => d.data.origin + ': ' + d.data.percentage.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%');

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
            .text(d => d.data.percentage.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%'));

    return svg.node();
}