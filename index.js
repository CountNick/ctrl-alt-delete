import renderStackedBars from './js/modules/renderStackedBars.js';
import renderPieChart from './js/modules/renderPieChart.js';

d3.tsv('./rawData4.txt')
    .then(data => {
        //return the data
        return data;
    })
    .then(data => splitIntoArrays(data))
    .then(splitIntoArrays => splitIntoArrays(transformData));
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