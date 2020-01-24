import renderStackedBars from './js/modules/renderStackedBars.js';
import renderPieChart from './js/modules/renderPieChart.js';
import renderGroupedBarChart from './js/modules/renderGroupedBars.js';
import renderDotMatrix from './js/modules/renderDotMatrix.js';
import transformStringToNumber from './js/modules/transformData/transformStringToNumber.js';
import prepareGroupedBarData from './js/modules/transformData/prepareGroupedBarData.js';
import preparePieData from './js/modules/transformData/preparePieData.js';
import prepareNormalisedStackData from './js/modules/transformData/prepareNormalisedStackData.js';

d3.tsv('./rawData5.txt')
    .then(data => {
        //return the data
        return data;
    })
    .then(data => transformData(data))
    .then(transformData => splitIntoArrays(transformData));
// .then(organiseData => renderStackedBars(organiseData));
   
//function for data transformation
function transformData(data){
    
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
            controleAnders: object.polben_Anders,
            redenZelfContact: object.waarom_zelfben
        };
    });
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

    const total = answerNo.length + answerYes.length;
    
    complete.push(prepareNormalisedStackData(originNederlandsAnswerYes, answerYes));
    complete.push(prepareNormalisedStackData(originWestersAnswerYes, answerYes));
    complete.push(prepareNormalisedStackData(originNietWestersAnswerYes, answerYes));

    //fill the pieData array with each origin and it's corresponding value in percentage
    pieData.push(preparePieData(originNederlandsAnswerYes, total));
    pieData.push(preparePieData(originWestersAnswerYes, total));
    pieData.push(preparePieData(originNietWestersAnswerYes, total));
    pieData.push(preparePieData(answerNo, total));
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

    //render each graph with it's corresponding data
    renderPieChart(pieData);
    renderStackedBars(complete);
    renderDotMatrix();
    renderGroupedBarChart(groupedBarData);
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