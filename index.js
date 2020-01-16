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
    // const groupedbarDataNietWesters = transformStringToNumber(originNietWestersAnswerYes);
    // const groupedbarDataWesters = transformStringToNumber(originWestersAnswerYes);

    // Grouped barchart
    groupedBarData.push(prepareGroupedBarData(groupedbarDataNederlands));
    // groupedBarData.push(prepareGroupedBarData(groupedbarDataNietWesters));
    // groupedBarData.push(prepareGroupedBarData(groupedbarDataWesters));

    console.log('groupedbardata', groupedBarData);

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

    return pieData;
}

function prepareGroupedBarData(data) {
    
    console.log('aantal obs:', data.length)
    
    // let filteredData = [];
    
    const filterData = data.filter(d => {if (d.rechtvaardig != 'Geen antwoord') return d;})
    const filterData2 = filterData.filter(d => {if (d.luister != 'Geen antwoord') return d;})
    const filterData3 = filterData2.filter(d => {if (d.beleefd != 'Geen antwoord') return d;})


    // data.filter(object => {
    //     if(object.beleefd == !'Geen antwoord') {
    //         filteredData.push(object);
    //     }
    //     else if(object.luister == !'Geen antwoord') {
    //         filteredData.push(object);
    //     }
    //     else if(object.rechtvaardig == 'Geen antwoord') {
    //         filteredData.push(object);
    //     }; 
    // });

    // console.log(filteredData)
    console.log('tesst', filterData.length);
    console.log('tesst', filterData2.length);
    console.log('tesst', filterData3.length);

    let origin;
    
    filteredData.forEach(element => {
        //give origin the value of object.herkomst
        origin = element.herkomst;
    });



    filteredData.map(object => {
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
    console.log('Gemiddeldes beleefd: ' + totalBeleefd / beleefdArray.length);
    console.log('Gemiddeldes luister: ' + totalLuister / luisterArray.length);
    console.log('Gemiddeldes rechtvaardig: ' + totalLuister / luisterArray.length);

    let cleanedObject = {origin: origin, beleefd: totalBeleefd / beleefdArray.length, luister: totalLuister / luisterArray.length, rechtvaardig: totalRechtvaardig / rechtvaardigArray.length};
    return cleanedObject;
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
            day: 1,
            apples: 3
        },
        {
            day: 2,
            apples: 10
        },
        {
            day: 3,
            apples: 15
        },
        {
            day: 4,
            apples: 2
        },
        {
            day: 5,
            apples: 10
        },
        {
            day: 6,
            apples: 19
        },
        {
            day: 7,
            apples: 20
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
    const tooltip = d3.select('body').append('div').attr('class', 'toolTip');
        
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
        .text('Aantal pijpen');

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

// function renderGroupedBarChart(data) {
//     const svg = d3.select('.groupedBars');
  
//     svg.append("g")
//       .selectAll("g")
//       .data(data)
//       .join("g")
//         .attr("transform", d => `translate(${x0(d[groupKey])},0)`)
//       .selectAll("rect")
//       .data(d => keys.map(key => ({key, value: d[key]})))
//       .join("rect")
//         .attr("x", d => x1(d.key))
//         .attr("y", d => y(d.value))
//         .attr("width", x1.bandwidth())
//         .attr("height", d => y(0) - y(d.value))
//         .attr("fill", d => color(d.key));
  
//     svg.append("g")
//         .call(xAxis);
  
//     svg.append("g")
//         .call(yAxis);
  
//     svg.append("g")
//         .call(legend);
  
//     return svg.node();
// }

// function legend(svg) {
//     const g = svg
//         .attr("transform", `translate(${width},0)`)
//         .attr("text-anchor", "end")
//         .attr("font-family", "sans-serif")
//         .attr("font-size", 10)
//       .selectAll("g")
//       .data(color.domain().slice().reverse())
//       .join("g")
//         .attr("transform", (d, i) => `translate(0,${i * 20})`);
  
//     g.append("rect")
//         .attr("x", -19)
//         .attr("width", 19)
//         .attr("height", 19)
//         .attr("fill", color);
  
//     g.append("text")
//         .attr("x", -24)
//         .attr("y", 9.5)
//         .attr("dy", "0.35em")
//         .text(d => d);
// }

// const legend = legend(svg)

// const x0 = d3.scaleBand()
//     .domain(data.map(d => d[groupKey]))
//     .rangeRound([margin.left, width - margin.right])
//     .paddingInner(0.1)

// const x1 = d3.scaleBand()
//     .domain(keys)
//     .rangeRound([0, x0.bandwidth()])
//     .padding(0.05)

// const y = d3.scaleLinear()
//     .domain([0, d3.max(data, d => d3.max(keys, key => d[key]))]).nice()
//     .rangeRound([height - margin.bottom, margin.top])

// const color = d3.scaleOrdinal()
//     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])

// function xaxis(g) {
//     g.attr("transform", `translate(0,${height - margin.bottom})`)
//         .call(d3.axisBottom(x0).tickSizeOuter(0))
//         .call(g => g.select(".domain").remove())
// }

// const xAxis = xaxis(g)

// function yaxis(g) {
//     g.attr("transform", `translate(${margin.left},0)`)
//         .call(d3.axisLeft(y).ticks(null, "s"))
//         .call(g => g.select(".domain").remove())
//         .call(g => g.select(".tick:last-of-type text").clone()
//             .attr("x", 3)
//             .attr("text-anchor", "start")
//             .attr("font-weight", "bold")
//             .text(data.y))
// }

// const yAxis = yaxis(g)




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