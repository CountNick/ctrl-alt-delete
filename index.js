import renderStackedBars from './js/modules/renderStackedBars.js';
import renderPieChart from './js/modules/renderPieChart.js';

d3.tsv('./rawData4.txt')
    .then(data => {
        //return the data
        return data;
    })
    .then(data => transformData(data))
    .then(transformData => splitIntoArrays(transformData));
// .then(organiseData => renderStackedBars(organiseData));
   

//function for data transformation
function transformData(data){
    
    // console.log('original data: ', data);
    
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

function splitIntoArrays(data){
    //array to store the data for the normalised stacked bar chart
    const complete = [];
    //array to store the data for the piechart
    const pieData = [];
    const groupedBarData = [];
    const answerNo = [];
    // console.log('trans: ', data);


    //empty array for respondents with the three different origin groups
    const originTotal = [];

    //make a new array for the respondents that had contact with the police
    const answerYes = data.filter( object => {

        //if answer is yes, the respondent answered the wuestion and respondents origin is not unkown return the object to the answerYes array
        if(object.contact == 'Ja' && object.totStand != 'De respondent heeft deze vraag niet beantwoord' && object.herkomst != 'Onbekend') return object; 

        if(object.contact == 'Nee') answerNo.push(object);

    });

    for (let object in answerNo){
        answerNo[object].herkomst = 'geenContact';
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
    renderConsequenceChart();

    // console.log(transformStringToNumber(originNederlandsAnswerYes));
    // console.log(transformStringToNumber(originNietWestersAnswerYes));
    // console.log(transformStringToNumber(originWestersAnswerYes));

    // Save correct data (Zeer Oneens t/m Zeer eens -> 1 t/m 5) in const to use later
    const groupedbarDataNederlands = transformStringToNumber(originNederlandsAnswerYes);
    const groupedbarDataNietWesters = transformStringToNumber(originNietWestersAnswerYes);
    const groupedbarDataWesters = transformStringToNumber(originWestersAnswerYes);

    let nl = prepareGroupedBarData(groupedbarDataNederlands);
    let w = prepareGroupedBarData(groupedbarDataWesters);
    let nW = prepareGroupedBarData(groupedbarDataNietWesters);

    const beleefd = {};
    const luister = {};
    const rechtvaardig = {};

    groupedBarData.push(Object.assign(beleefd, nl[0], w[0], nW[0]));
    groupedBarData.push(Object.assign(luister, nl[1], w[1], nW[1]));
    groupedBarData.push(Object.assign(rechtvaardig, nl[2], w[2], nW[2]));

    //console.log('groupie', groupedBarData)

    // Grouped barchart
    // groupedBarData.push(prepareGroupedBarData(groupedbarDataNederlands));
    // groupedBarData.push(prepareGroupedBarData(groupedbarDataNietWesters));
    // groupedBarData.push(prepareGroupedBarData(groupedbarDataWesters));

    console.log('groupedBarData', groupedBarData);

    renderGroupedBarChart(groupedBarData);

    return pieData;
}

function prepareGroupedBarData(data) {

    const filterData = data.filter(d => {if (d.rechtvaardig != 'Geen antwoord') return d;});
    const filterData2 = filterData.filter(d => {if (d.luister != 'Geen antwoord') return d;});
    const filterData3 = filterData2.filter(d => {if (d.beleefd != 'Geen antwoord') return d;});

    let origin;
    
    filterData3.forEach(element => {
        //give origin the value of object.herkomst
        origin = element.herkomst;
    });

    const beleefdArray =[];
    const luisterArray =[];
    const rechtvaardigArray =[];



    filterData3.map(object => {
        beleefdArray.push(object.beleefd);
        luisterArray.push(object.luister);
        rechtvaardigArray.push(object.rechtvaardig);
    });

    function countTotal(arr) {
        return arr.reduce(function(a, b){
            return a + b;
        }, 0);
    }

    const totalBeleefd = countTotal(beleefdArray);
    const totalLuister = countTotal(luisterArray);
    const totalRechtvaardig = countTotal(rechtvaardigArray);

    // let cleanedObject = {origin: origin, beleefd: totalBeleefd / beleefdArray.length, luister: totalLuister / luisterArray.length, rechtvaardig: totalRechtvaardig / rechtvaardigArray.length};
    
    let beleefdObject = {stelling: 'beleefd', [origin]: totalBeleefd / beleefdArray.length};
    let luisterObject = {stelling: 'luister', [origin]: totalLuister / luisterArray.length};
    let rechtvaardigObject = {stelling: 'rechtvaardig', [origin]: totalRechtvaardig / rechtvaardigArray.length};
    
    console.log(beleefdObject);
    console.log(luisterObject);
    console.log(rechtvaardigObject);
    
    const complete = [];

    complete.push(beleefdObject);
    complete.push(luisterObject);
    complete.push(rechtvaardigObject);

    return complete;
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
    
    // console.log('Aantal: ', data.length);
    
    //return the newly made pieObject
    return pieObject;
}

function renderConsequenceChart(){

    const data = [
        {
            day: 'Nederlands',
            apples: 3
        },
        {
            day: 'Westers',
            apples: 10
        },
        {
            day: 'niet-Westers',
            apples: 15
        }
    ];

    //select the svg element in index.html
    const svg = d3.select('.people');
    //sets height and width to height and width of svg element
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    //sets x and y values to the values of amount and origin
    const xValue = d => d.apples;
    const yValue = d => d.day;
    const margin = { top: 40, right: 30, bottom: 150, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    //makes an ordinal color scale for each type
    // const color = d3.scaleOrdinal()
    //     .domain(['hasjpijpen', 'tabakspijpen', 'waterpijpen', 'pijpen (rookgerei)', 'opiumpijpen' ])
    //     .range([ '#FF0047', '#FF8600', '#6663D5', '#FFF800', '#29FF3E']);
    // const tooltip = d3.select('body').append('div').attr('class', 'toolTip');
        
    //sets the xScale with the values from d.amount
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, xValue)])
        .range([0, innerWidth])
        .nice();

    //for plotting the dots on the yaxis
    const yScale = d3.scaleBand()
        .domain(data.map(yValue))
        .range([innerHeight, 0])
        .padding(0.7);
            
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    //sets the y axis
    g.append('g')
        .call(d3.axisLeft(yScale)
            .ticks(data.length)
            .tickSize(-innerWidth))
        .select('.domain')
        .remove()
        .append('text')
        .attr('fill', 'black');
      
    //sets the bottom axis
    g.append('g')
        .call(d3.axisBottom(xScale)
            .tickSize(-innerHeight))
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
        // g.selectAll('circle')
        // .data(data)
        // .enter()
        //     .append('circle')
        //         .attr('cy', d => yScale(yValue(d)))
        //         .attr('cx', d => xScale(d3.range(0, xValue(d))))
        //         .attr('r', 0)
        //         .classed('classnaam', true)
        //         // .style('fill', d => { return color(d.type) } )
        //         .on('mousemove', function(d){
        //             tooltip
        //             .style('left', d3.event.pageX - 50 + 'px')
        //             .style('top', d3.event.pageY - 80 + 'px')
        //             .style('display', 'inline-block')
        //             .html((d.day) + '<br>' +d.apples +': ' + (d.apples));
        //             })
        //             .on('mouseout', function(){ tooltip.style('display', 'none');}).transition().duration(1000)
        //             .attr('r', 15)
                    
        g.append('g')
            .selectAll('g')
            .data(data)
            .join('g')
            .attr('transform', d => `translate(0, ${yScale(yValue(d))})`)
        // .attr('fill', d => color(d.key))
        // .attr('stroke', d => color(d.key))
            .style('opacity', 1)
            .selectAll('circles')
            .data(d => d3.range(0, d.apples))
            .join('circle')
            .style('opacity', .5)
            .attr('class', 'cirlce')
        //.attr("x", (d, i) => x(d.data.name))
            .attr('cx', d => xScale(d))
        // .attr('cy', d =>  console.log(yScale(d)))
            .attr('r', 10);
                    
    }
} 

//transform strings to numbers
function transformStringToNumber(data){

    data.map(object => {

        if( object.beleefd == 'Helemaal mee oneens'){
            object.beleefd = 1;
        } else if(object.beleefd == 'Mee oneens'){
            object.beleefd = 2;
        } else if(object.beleefd == 'Niet mee eens en niet mee oneens'){
            object.beleefd = 3;
        } else if(object.beleefd == 'Mee eens'){
            object.beleefd = 4;
        } else if(object.beleefd == 'Helemaal mee eens'){
            object.beleefd = 5;
        } 

        if( object.luister == 'Helemaal mee oneens'){
            object.luister = 1;
        } else if(object.luister == 'Mee oneens'){
            object.luister = 2;
        } else if(object.luister == 'Niet mee eens en niet mee oneens'){
            object.luister = 3;
        } else if(object.luister == 'Mee eens'){
            object.luister = 4;
        } else if(object.luister == 'Helemaal mee eens'){
            object.luister = 5;
        }

        if( object.rechtvaardig == 'Helemaal mee oneens'){
            object.rechtvaardig = 1;
        } else if(object.rechtvaardig == 'Mee oneens'){
            object.rechtvaardig = 2;
        } else if(object.rechtvaardig == 'Niet mee eens en niet mee oneens'){
            object.rechtvaardig = 3;
        } else if(object.rechtvaardig == 'Mee eens'){
            object.rechtvaardig = 4;
        } else if(object.rechtvaardig == 'Helemaal mee eens'){
            object.rechtvaardig = 5;
        }
    });
    return data;
}

function renderGroupedBarChart(data) {

    console.log('groupie: ', data);

    const svg = d3.select('.groupedBars');

    const width = +svg.attr('width');
    const height = +svg.attr('height');
    //const yValue = d => d.origin;
    const margin = { top: 40, right: 30, bottom: 150, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const keys = ['Nederlands', 'Westers', 'niet-Westers'];
    const groupKey = 'stelling';

    const formatXScale = d3.format(',.0f');

    const y0 = d3.scaleBand()
        .domain(data.map(d => d[groupKey]))
        .rangeRound([0, innerHeight ])
        .paddingInner(0.1);

    console.log('y0: ', y0.domain())

    const y1 = d3.scaleBand()
    .domain(keys)
    .rangeRound([0, y0.bandwidth()])
    .padding(0.07)

    console.log('y1', y1.domain())

    const xScale = d3.scaleLinear()
    .domain([0, 5]).nice()
    // .domain([d3.max(data, d => d3.max(keys, key => d[key])), 0]).nice()
    .range([0, innerWidth])
    .nice();

    // console.log('schalX', xScale.domain())

    // const yScale = d3.scaleBand()
    //     .domain(data.map(yValue))
    //     .range([0, innerHeight])
    //     .padding(0.3);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    //append a new group for the y axis and set it on the left side
    g.append('g')
        .style('font-size', '1rem')
        .call(d3.axisLeft(y0)
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
        .tickValues([0,1,2,3,4,5]))
    .style('stroke-dasharray', ('3, 3'))
    .attr('transform', `translate(0, ${innerHeight})`)
    .append('text')
    .style('font-size', '1rem')
    .attr('y', 40)
    .attr('x', innerWidth / 2)
    .attr('fill', 'white')
    .text('Gemiddelde score');

//makes an ordinal color scale for each type
const color = d3.scaleOrdinal()
    .range([ '#494CA2', '#8186d5', '#c6cbef']);
    
    // g.call(tip);

g.append('g')
    .selectAll('g')
    .data(data)
    .join('g')
    .attr('transform', d => `translate(0,${y0(d[groupKey])})`)
    // .attr('fill', d => color(d.key))
    // .attr('stroke', d => color(d.key))
    // .style('opacity', 1)
    .selectAll('rect')
    .data(d => keys.map(key => ({key, value: d[key]})))
    .join('rect')
    // .style('fill', 'purple')
    // .attr('class', 'bar')
//.attr("x", (d, i) => x(d.data.name))
    .attr('y', d => y1(d.key))
    .attr('x', d => xScale(d))
    .attr('height', y1.bandwidth())
    .attr('width', d => xScale(d.value) - xScale(0))
    .attr('fill', d => color(d.key))

}




const button1 = document.getElementById('button-step1');
const button2 = document.getElementById('button-step2');
const button3 = document.getElementById('button-step3');
const button4 = document.getElementById('button-step4');
const button5 = document.getElementById('button-step5');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');
const step5 = document.getElementById('step5');

button1.addEventListener('click', function() {
    step1.classList.replace('hidden', 'visible');
    step2.classList.replace('visible', 'hidden');
    step3.classList.replace('visible', 'hidden');
    step4.classList.replace('visible', 'hidden');
    step5.classList.replace('visible', 'hidden');

    window.scrollTo(0, 1000);

    button1.classList.replace('inactive', 'active');
    button2.classList.replace('active', 'inactive');
    button3.classList.replace('active', 'inactive');
    button4.classList.replace('active', 'inactive');
    button5.classList.replace('active', 'inactive');
});

button2.addEventListener('click', function() {
    step1.classList.replace('visible', 'hidden');
    step2.classList.replace('hidden', 'visible');
    step3.classList.replace('visible', 'hidden');
    step4.classList.replace('visible', 'hidden');
    step5.classList.replace('visible', 'hidden');

    window.scrollTo(0, 1000);

    button1.classList.replace('active', 'inactive');
    button2.classList.replace('inactive', 'active');
    button3.classList.replace('active', 'inactive');
    button4.classList.replace('active', 'inactive');
    button5.classList.replace('active', 'inactive');
});

button3.addEventListener('click', function() {
    step1.classList.replace('visible', 'hidden');
    step2.classList.replace('visible', 'hidden');
    step3.classList.replace('hidden', 'visible');
    step4.classList.replace('visible', 'hidden');
    step5.classList.replace('visible', 'hidden');

    window.scrollTo(0, 1000);

    button1.classList.replace('active', 'inactive');
    button2.classList.replace('active', 'inactive');
    button3.classList.replace('inactive', 'active');
    button4.classList.replace('active', 'inactive');
    button5.classList.replace('active', 'inactive');
});

button4.addEventListener('click', function() {
    step1.classList.replace('visible', 'hidden');
    step2.classList.replace('visible', 'hidden');
    step3.classList.replace('visible', 'hidden');
    step4.classList.replace('hidden', 'visible');
    step5.classList.replace('visible', 'hidden');

    window.scrollTo(0, 1000);

    button1.classList.replace('active', 'inactive');
    button2.classList.replace('active', 'inactive');
    button3.classList.replace('active', 'inactive');
    button4.classList.replace('inactive', 'active');
    button5.classList.replace('active', 'inactive');
});

button5.addEventListener('click', function() {
    step1.classList.replace('visible', 'hidden');
    step2.classList.replace('visible', 'hidden');
    step3.classList.replace('visible', 'hidden');
    step4.classList.replace('visible', 'hidden');
    step5.classList.replace('hidden', 'visible');

    window.scrollTo(0, 1000);

    button1.classList.replace('active', 'inactive');
    button2.classList.replace('active', 'inactive');
    button3.classList.replace('active', 'inactive');
    button4.classList.replace('active', 'inactive');
    button5.classList.replace('inactive', 'active');
});