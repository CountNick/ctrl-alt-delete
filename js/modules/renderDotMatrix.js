export default function renderDotMatrix(){

    const data = [
        {
            origin: 'Nederlands',
            boetes: 3,
            arrest: 6,
            beukeuring: 20,
            anders: 4,
            niets: 7
        },
        {
            origin: 'Westers',
            boetes: 30,
            arrest: 5,
            beukeuring: 5,
            anders: 20,
            niets: 10
        },
        {
            origin: 'niet-Westers',
            boetes: 15,
            arrest: 8,
            beukeuring: 14,
            anders: 20,
            niets: 30
        }
    ];

    //select the svg element in index.html
    const svg = d3.select('.people');
    //sets height and width to height and width of svg element
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    //sets x and y values to the values of amount and origin
    const xValue = d => d.boetes;
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
                    
                    if(this.value == 'boetes') return active = d => d3.range(0, d.boetes);
                    if(this.value == 'arrest') return active = d => d3.range(0, d.arrest);
                    if(this.value == 'bekeuring') return active = d => d3.range(0, d.beukeuring);
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
                    .attr('r', 10)
                    

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
                    
                    .attr('r', 10)

                    

                    console.log('update:', update)
                },
            exit => {
                    exit
                    .transition().duration(1000)
                    .attr('r', 10)
                    .attr('cx', (d, i) => xScale(~~(d / 2)))
                    .attr('cy', (d, i) => i % 2 ? 24 : 0)
                    
                    .attr('r', 0)
                }
            )
    }

    //sets the y axis
    g.append('g')
        .call(d3.axisLeft(yScale))
        .select('.domain')
        .remove()
        .select('stroke')
        .remove()
        .append('text')
        .attr('fill', 'black');
      
    //sets the bottom axis
    g.append('g')
        
        .attr('transform', `translate(0, ${innerHeight})`)
        .append('text')
        .attr('y', 60)
        .attr('x', innerWidth / 2)
        .attr('fill', 'white')
        .text('Aantal keer');

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
            .data(d => d3.range(0, d.arrest))
            .join('circle')

            //resource for placement: https://jsfiddle.net/5Lmjogqh/1/, https://bl.ocks.org/gabrielflorit/raw/867b3ef4cbc98dc3f55f92aa55ce1013/
            .attr('cx', (d, i) => xScale(~~(d / 2)))
            .attr('cy', (d, i) => i % 2 ? 24 : 0)
            // .style('fill', d => color(d))

            // .attr('cx', (d,i) => console.log(Math.floor(xScale(d) * i % 20)))
        // .attr('cy', d =>  console.log(yScale(d)))
            .attr('r', 10)
            .on('mouseover', function(d){
                console.log('fd', this)
            })
            // .on('mouseout', tip.hide);

                    
    }
} 