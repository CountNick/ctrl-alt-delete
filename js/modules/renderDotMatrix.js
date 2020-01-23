export default function renderDotMatrix(){

    const data = [
        {
            origin: 'Nederlands',
            waarschuwing: 29,
            arrest: 2,
            bekeuring: 22,
            anders: 4,
            niets: 34
        },
        {
            origin: 'Westers',
            waarschuwing: 25,
            arrest: 0,
            bekeuring: 19,
            anders: 13,
            niets: 47
        },
        {
            origin: 'niet-Westers',
            waarschuwing: 27,
            arrest: 5,
            bekeuring: 23,
            anders: 11,
            niets: 33
        }
    ];

    //select the svg element in index.html
    const svg = d3.select('.people');
    //sets height and width to height and width of svg element
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    //sets x and y values to the values of amount and origin
    const xValue = d => d.waarschuwing;
    const yValue = d => d.origin;
    const margin = { top: 40, right: 30, bottom: 150, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const color = d3.scaleOrdinal()
    // .domain('Nederlands', 'niet-Westers', 'Westers')
        .range([ '#494CA2', '#8186d5', '#c6cbef']);
        
    //sets the xScale with the values from d.amount
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, xValue)])
        .range([0, innerWidth])
        .nice();

    //for plotting the dots on the yaxis
    const yScale = d3.scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.7);
            
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);


    //initialize select button, and fire update function when changed
    d3.select('#selectButton')
        .on('change', selectionChanged);

    function selectionChanged(){

        let active;
        let dataFilter = data.map(d => {
                    
            if(this.value == 'waarschuwing') return active = d => d3.range(0, d.waarschuwing);
            if(this.value == 'arrest') return active = d => d3.range(0, d.arrest);
            if(this.value == 'bekeuring') return active = d => d3.range(0, d.bekeuring);
            if(this.value == 'anders') return active = d => d3.range(0, d.anders);
            if(this.value == 'niets') return active = d => d3.range(0, d.niets);

        });
        console.log('DF', dataFilter);

        let groups = d3.selectAll('.balls');
        let circles = groups.selectAll('circle').data(active);

        // console.log('circles: ', circles)

        // console.log('circlo:', circles)

        // console.log('groups', groups)

        // console.log('olaa', circle)
        // console.log('circles: ', circles)

        circles.join(
            enter => {
                    
                enter.append('circle')
                    .transition().duration(1000)         
                    .attr('r', 0)
                    .attr('cx', (d, i) => xScale(~~(d / 2)))
                    .attr('cy', (d, i) => i % 2 ? 24 : 0)
                    // .transition().duration(1000)
                    .attr('r', 10);
                    

                console.log('enta: ', enter);   

                // .join('circle')
                // .attr('cx', (d, i) => xScale(~~(d / 2)))
                // .attr('cy', (d, i) => i % 2 ? 24 : 0)
                // .attr('r', 15)
            },
            update => {
                    
                update
                    // .data(circle)
                    // .join('circle')
                    .transition().duration(1000)
                    .attr('r', 0)
                    .attr('cx', (d, i) => xScale(~~(d / 2)))
                    .attr('cy', (d, i) => i % 2 ? 24 : 0)
                    
                    .attr('r', 10);

                    

                console.log('update:', update);
            },
            exit => {
                exit
                    .transition().duration(1000)
                    .attr('r', 10)
                    .attr('cx', (d, i) => xScale(~~(d / 2)))
                    .attr('cy', (d, i) => i % 2 ? 24 : 0)
                    
                    .attr('r', 0);
            }
        );
    }

    //sets the y axis
    g.append('g')
        .call(d3.axisLeft(yScale))
        .select('.domain')
        .remove()
        .select('stroke')
        .remove()
        .append('text')
        .attr('fill', 'black')
        .attr('font-size', '1em');
      
    //sets the bottom axis
    g.append('g')
        
        .attr('transform', `translate(0, ${innerHeight})`)
        .append('text')
        .attr('y', 60)
        .attr('x', innerWidth / 7)
        .attr('fill', 'white')
        .text('Aantal keer op de 100 respondenten')
        .attr('font-size', '1em');

    //draw the circles on the chart
    drawCircles();
    //draw the legend 
    // drawLegend();
        
    //initialize select button, and fire update function when changed
    // d3.select('#selectButton')
    //     .on('change', selectionChanged);


    

    //Resource: https://jsfiddle.net/2xyjf4nu/1/
    //function that draws all circles with the data, this function gets invoked when renderGraph gets invoked
    function drawCircles(){
        
        const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([100, 0])
        .html(d => {
            console.log(d)
            //console.log(d[1] - d[0] == d.data.iContactedPolice)
            //console.log(data);
            // if(d[1] - d[0] == d.data.iContactedPolice ) console.log('dit wil je:', d)

            return '<h4>' + d + ' op de 100' + '</h4>';
            //return '<svg class= "tipPie" width = "350" height= "350"></svg>'
            // return renderPieChart(d);

        });
        g.call(tip)
        g.append('g')
            .selectAll('g')
            .data(data)
            .join('g')
            .attr('class', 'balls')

            .attr('fill', d =>  color(d.origin))
            .attr('transform', (d, i) => `translate(10, ${yScale(yValue(d))})`)
        // .attr('fill', d => color(d.key)).attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; })
        // .attr('stroke', d => color(d.key))
            .style('opacity', 1)
            .selectAll('circles')
            .data(d => d3.range(0, d.waarschuwing))
            .join('circle')

            //resource for placement: https://jsfiddle.net/5Lmjogqh/1/, https://bl.ocks.org/gabrielflorit/raw/867b3ef4cbc98dc3f55f92aa55ce1013/
            .attr('cx', (d, i) => xScale(~~(d / 2)))
            .attr('cy', (d, i) => i % 2 ? 24 : 0)
            // .style('fill', d => color(d))

            // .attr('cx', (d,i) => console.log(Math.floor(xScale(d) * i % 20)))
        // .attr('cy', d =>  console.log(yScale(d)))
            .attr('r', 10)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

                    
    }
} 