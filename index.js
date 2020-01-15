import renderStackedBars from './js/modules/renderStackedBars.js';
import renderPieChart from './js/modules/renderPieChart.js';

d3.tsv('./rawData4.txt')
    .then(data => {
        //return the data
        return data;
    })
    .then(data => transformData(data))
    .then(transformData => organiseData(transformData));
// .then(organiseData => renderStackedBars(organiseData));
   

//function for data transformation
function transformData(data){
    
    console.log('original data: ', data);
    
    //make new array with modified objects
    const cleanedObjects = data.map(object => {
        //only return neccessary pairs 
        return {
            //rename keys for easier usage
            herkomst: object.Herkomst_def,
            vertrouwen: +object.rapportcijfer,
            contact: object.Contact_gehad,
            stadsDeel: object.Stadsdeel,
            totStand: object.Totstand,
            gevolgen: [
                object.polben_gevolg_anders,
                object.polben_gevolg_bekeuring,
                object.polben_gevolg_niets,
                object.Polben_arrestatie,
                object.polben_gevolg_waarschuwing
            ],
            beleefd: object.stel_beleefd,
            luister: object.stel_luisteren,
            rechtvaardig: object.stel_rechtvaardig,
            controleStraat: object.polben_Controlestraat,
            controleVerkeer: object.polben_Controleverkeer,
            controleVerkeerdStraat: object.polben_Verkeerdstraat,
            controleVerkeerdVerkeer: object.polben_Verkeerdverkeer,
            controlePraatjeMaken: object.polben_Praatje,
            controleAnders: object.polben_Anders
        };
    });

    //console.log('hiee',cleanedObjects)
    //return the cleaned objects
    return cleanedObjects;   
}

function organiseData(data){
    //array to store the data for the normalised stacked bar chart
    const complete = [];
    //array to store the data for the piechart
    const pieData = [];
    const answerNo = [];
    console.log('trans: ', data);


    //empty array for respondents with the three different origin groups
    const originTotal = [];
    const originTotalAnswerNo = [];

    //make a new array for the respondents that had contact with the police
    const answerYes = data.filter( object => {

        //if answer is yes, the respondent answered the wuestion and respondents origin is not unkown return the object to the answerYes array
        if(object.contact == 'Ja' && object.totStand != 'De respondent heeft deze vraag niet beantwoord' && object.herkomst != 'Onbekend') return object; 

        if(object.contact == 'Nee') answerNo.push(object);

    });

    for (let object in answerNo){
        console.log(answerNo[object].herkomst = 'geenContact')
    }
    
    //make a new array for respondents with a dutch origin
    const originNederlandsAnswerYes = answerYes.filter( object => {

        if (object.herkomst == 'Nederlands'){
            //push each object with this origin to originTotal
            originTotal.push(object);
            //return objects that match cryteria
            return object;
        }      
    });
    

    //make a new array for respondents with a dutch / western origin
    const originWestersAnswerYes = answerYes.filter(object => {

        if (object.herkomst == 'Westers'){
            //push each object with this origin to originTotal
            originTotal.push(object);
            //return objects that match cryteria
            return object;
        }
    });    
    //make a new array for respondents with a dutch / non-western origin
    const originNietWestersAnswerYes = answerYes.filter(object => {

        if(object.herkomst != 'Nederlands' && object.herkomst != 'Westers' && object.herkomst != 'Onbekend'){
            //push each object with this origin to originTotal
            object.herkomst = 'niet-Westers';
            //push each object with this origin to originTotal
            originTotal.push(object);
            //return objects that match cryteria
            return object;
        }
    });

    // console.log('Nietwesters', originNietWesters.length / answerYes.length * 100);
    // console.log('Nederlandsz', originNederlands.length / answerYes.length * 100);
    const total = answerNo.length + answerYes.length;
    
    complete.push(prepareNormalisedStackData(originNietWestersAnswerYes, answerYes));
    complete.push(prepareNormalisedStackData(originNederlandsAnswerYes, answerYes));
    complete.push(prepareNormalisedStackData(originWestersAnswerYes, answerYes));

    //fill the pieData array with each origin and it's corresponding value in percentage
    pieData.push(preparePieData(originNederlandsAnswerYes, total));
    pieData.push(preparePieData(originNietWestersAnswerYes, total));
    pieData.push(preparePieData(originWestersAnswerYes, total));
    pieData.push(preparePieData(answerNo, total));
    

    renderStackedBars(complete);
    renderPieChart(pieData);
    console.log(pieData);

    // const target = {}
    // const target2 = {}

    // let flattened = complete.flat()

    // flattened.map(d => {
        
    //     if(d.contactZoeker == "De politie kwam naar mij toe") Object.assign(target, d)
    //     else if(d.contactZoeker == "Ik ging naar de politie toe") Object.assign(target2, d)
        
    // })

    // arrayForStack.push(target)
    // arrayForStack.push(target2)

    // console.log('stackdata: ', arrayForStack)



    // // average trust grade per group
    // const averageGrade = [];
    // const total = [];
    // data.map(object => {
    //     if(object.vertrouwen === 99999) {
    //         //nothing
    //     }
    //     else {
    //         total.push(object.vertrouwen);
    //     }
    // });

    // const totalSum = function(arr){
    //     return arr.reduce(function(a, b){
    //         return a + b;
    //     }, 0);
    // };

    // averageGrade.push(totalSum(total) / (+total.length));
    // console.log('Gemiddeld totaal iedereen:' + averageGrade);

    

    // console.log('no: ', answerNo.length / total * 100);
    // console.log('yes: ', originNederlandsAnswerYes.length / total * 100);
    // console.log('yes: ', originNietWestersAnswerYes.length / total * 100);
    // console.log('no: ', originWestersAnswerYes.length / total * 100);

    return pieData;
}

//function that checks who initiated contact and returns a modified object containg: percentage and amount
function prepareNormalisedStackData(data, answerYes){
    //empty array to store objects where the police initated contact
    const policeContacted = [];
    //empty array to store objects where the respondent initated contact
    const iContacted = [];
    //empty variable to store object.herkomst in, this makes the function reusable
    let origin;
    
    data.forEach(element => {
        //give origin the value of object.herkomst
        origin = element.herkomst;
    });
    //map over the data given as a parameter to this function
    data.map(object => {
        //if police initiated contact push to policeContacted
        if(object.totStand == 'De politie kwam naar mij toe'){
            policeContacted.push(object.totStand);
        }//if respondent initiated contact push to iContacted 
        else if(object.totStand == 'Ik ging naar de politie toe'){
            iContacted.push(object.totStand);
        }
    });

    //
    let cleanedObject = {origin: origin, policeContactedMe: policeContacted.length / answerYes.length * 100, iContactedPolice: iContacted.length / answerYes.length * 100, amountIContactedPolice: iContacted.length, amountPoliceContactedMe: policeContacted.length};
    // complete.push({contactZoeker: 'De politie kwam naar mij toe', [origin]: policeContacted.length / answerYes.length * 100})
    // complete.push({contactZoeker: 'Ik ging naar de politie toe', [origin]: iContacted.length / answerYes.length * 100})

    //return the cleanedObject
    return cleanedObject;
}

//function that prepares data for a piechart, data still needs to be pushed in one array where this function gets called
function preparePieData(data, total){
    //empty variable to store the newly made object in
    let pieObject;
    //empty variable to store object.herkomst in, this makes the function reusable
    let origin;

    data.forEach(element => {
        //give origin the value of object.herkomst
        origin = element.herkomst;
    });
    //give pieObject a new object with values for origin and percentage
    pieObject = {origin: origin, percentage: data.length / total * 100};
    
    console.log('Aantal: ', data.length)
    
    //return the newly made pieObject
    return pieObject;
}

function renderStackedBars(data){

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

            return '<h4> Nederlander met '  + d.data.origin + 'e' + ' migratieachtergrond</h4><strong>Percentage:</strong> <span style=\'color:red\'>'+ transformToPercent((d[1] - d[0])) +'</span> <div id="tipDiv"></div>';
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
    const color = d3.scaleOrdinal()
        .range([ '#FFF33D', '#0048FF', ]);
        
    g.call(tip);

    g.append('g')
        .selectAll('g')
        .data(series)
        .join('g')
        .attr('fill', d => color(d.key))
        .selectAll('rect')
        .data(d => d)
        .join('rect')
        .attr('class', 'bar')
    //.attr("x", (d, i) => x(d.data.name))
        .attr('y', d => yScale(d.data.origin))
        .attr('x', d => xScale(d[0]))
        .attr('height', yScale.bandwidth())
        .attr('width', d => xScale(d[1]) - xScale(d[0]))
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

    function selectionChanged(){
        //change by click on radio button
        //chenge the normalised bars to stacked bars
        //stacked bars should have numbers 
        //x axis should have these numbers on axis
    }     
}

function renderPieChart(data) {
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
        .range(['#F45905', '#FF9933', '#FFCC99', 'grey' ]);

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

const button1 = document.getElementById('button-step1');
const button2 = document.getElementById('button-step2');
const button3 = document.getElementById('button-step3');
const button4 = document.getElementById('button-step4');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');

button1.addEventListener('click', function() {
    step1.classList.replace('hidden', 'visible');
    step2.classList.replace('visible', 'hidden');
    step3.classList.replace('visible', 'hidden');
    step4.classList.replace('visible', 'hidden');

    window.scrollTo(0, 1000);

    button1.classList.replace('inactive', 'active');
    button2.classList.replace('active', 'inactive');
    button3.classList.replace('active', 'inactive');
    button4.classList.replace('active', 'inactive');
});

button2.addEventListener('click', function() {
    step1.classList.replace('visible', 'hidden');
    step2.classList.replace('hidden', 'visible');
    step3.classList.replace('visible', 'hidden');
    step4.classList.replace('visible', 'hidden');

    window.scrollTo(0, 1000);

    button1.classList.replace('active', 'inactive');
    button2.classList.replace('inactive', 'active');
    button3.classList.replace('active', 'inactive');
    button4.classList.replace('active', 'inactive');
});

button3.addEventListener('click', function() {
    step1.classList.replace('visible', 'hidden');
    step2.classList.replace('visible', 'hidden');
    step3.classList.replace('hidden', 'visible');
    step4.classList.replace('visible', 'hidden');

    window.scrollTo(0, 1000);

    button1.classList.replace('active', 'inactive');
    button2.classList.replace('active', 'inactive');
    button3.classList.replace('inactive', 'active');
    button4.classList.replace('active', 'inactive');
});

button4.addEventListener('click', function() {
    step1.classList.replace('visible', 'hidden');
    step2.classList.replace('visible', 'hidden');
    step3.classList.replace('visible', 'hidden');
    step4.classList.replace('hidden', 'visible');

    window.scrollTo(0, 1000);

    button1.classList.replace('active', 'inactive');
    button2.classList.replace('active', 'inactive');
    button3.classList.replace('active', 'inactive');
    button4.classList.replace('inactive', 'active');
});