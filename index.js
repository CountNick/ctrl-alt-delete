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

function splitIntoArrays(data){
    //array to store the data for the normalised stacked bar chart
    const complete = [];
    //array to store the data for the piechart
    const pieData = [];
    const answerNo = [];
    console.log('trans: ', data);


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

    renderConsequenceChart()

    console.log(transformStringToNumber(originNederlandsAnswerYes));
    console.log(transformStringToNumber(originNietWestersAnswerYes));
    console.log(transformStringToNumber(originWestersAnswerYes));

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

function renderConsequenceChart(){

    const svg = d3.select('.people');

    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const margin = { top: 40, right: 30, bottom: 150, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    let path = {
        fill: "rgba(102,140,77,.8)",
        stroke: "rgba(0,0,0,.4)",
        d: "M.08,318.24c0,17.46.16,34.93-.06,52.39a143.72,143.72,0,0,0,4,34.21,111.31,111.31,0,0,0,20.88,44c1.2,1.54,3,2.61,4.45,4,1.08,1,2.45,2.05,3,3.36a78.39,78.39,0,0,1,4.38,12.75c2.38,11.38,4.47,22.82,6.4,34.28,5.59,33.23,11,66.48,16.59,99.7a37.25,37.25,0,0,0,14.69,24.4,20.29,20.29,0,0,0,12.59,4.18c14.48-.09,29-.13,43.45,0a21.67,21.67,0,0,0,14.13-4.9c7.6-6,11.84-14.09,13.65-23.48,1.17-6.05,2-12.17,3-18.26q8.87-53,17.76-106A94.13,94.13,0,0,1,184.65,458c.71-1.7,1.64-3.84,3.08-4.6,3.8-2,6-5.31,8.33-8.58,15.29-21.6,21.59-46.09,21.9-72.12.42-36.11,0-72.23.16-108.34a65.31,65.31,0,0,0-8.05-32.42c-5.12-9.33-11.81-17.15-21.2-22.48a109.07,109.07,0,0,0-19.12-8.54A101.7,101.7,0,0,0,135.59,195c-19.35.26-38.7.07-58,.08-1.54,0-3.08,0-4.61.19-11.8,1.11-23,4.48-33.88,9-12.48,5.2-22.81,13-29.71,24.87C3.47,239.33-.17,250,0,261.93.29,280.69.08,299.47.08,318.24ZM195.27,88.56C195.83,40.61,156.88,1.43,109.75,0,58.8-1.46,19.1,39.58,18.52,87.23A88.71,88.71,0,0,0,105.76,177C155.71,177.64,195.87,136.74,195.27,88.56Z"
    };

    let dataset = [1, 7, 26, 11, 8, 18.5, 19.8, 30, 16, 4.5];
    
         	//create a scale, which we'll use to draw our axes
             let xScale = d3.scaleLinear()
             .domain([0, d3.max(dataset, function(d) { return d; })])
             .range([0, innerWidth]);

             console.log(xScale)
             		// piece of code that joins our complex svg data to the first dataset--d3 is amazing!!
      	var svgPaths = svg.selectAll(".bigtrees")
          .data(dataset)
          .enter()
          .append('path')
          .attr("class", ".bigtrees")
          .attr("d", path.d)
          .style("stroke", path.stroke)
          .style("fill", path.fill)
          //moving the svgs depending on the data--you might have to play around with this depending on the pixel width of your svg
          .attr("transform", function(d){return 'translate('+ (xScale(d)-48) + ')'});


                	//add the xAxis
      	// var xAxis = d3.svg.axis()
        //   .scale(xScale)
        //   .orient("bottom")
        //   .ticks(10);

        // svg.append("g")
        // 	.attr("class", "axis")
        // 	.attr("transform", "translate(0," + height + ")")
        //       .call(xAxis);
              
        svg.append('g')
        .style('font-size', '1rem')
        .call(d3.axisBottom(xScale))
        .attr('transform', `translate(0, ${innerHeight})`)
        .append('text')
        .style('font-size', '1rem')
        .attr('y', 40)
        .attr('x', innerWidth / 2)
        .attr('fill', 'white')
        .text('Percentage');


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