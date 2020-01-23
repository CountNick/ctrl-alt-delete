//function that checks who initiated contact and returns a modified object containg: percentage and amount
export default function prepareNormalisedStackData(data, answerYes){

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

    let controleOnStreet = data.filter(d => d.controleStraat != 0 && d.controleStraat != 99999);
    let controleInTraffic = data.filter(d => d.controleVerkeer != 0 && d.controleVerkeer != 99999);
    let wrongOnStreet = data.filter(d => d.controleVerkeerdStraat != 0 && d.controleVerkeerdStraat != 99999);
    let wrongInTraffic = data.filter(d => d.controleVerkeerdVerkeer != 0 && d.controleVerkeerdVerkeer != 99999);
    let smallTalk = data.filter(d => d.controlePraatjeMaken != 0 && d.controlePraatjeMaken != 99999);
    let controleDifferent = data.filter(d => d.controleAnders != 0 && d.controleAnders != 99999);

    
    const totalControl = controleOnStreet.length + controleInTraffic.length + wrongOnStreet.length + wrongInTraffic.length + smallTalk.length + controleDifferent.length;

    let percentControle = (controleOnStreet.length + controleInTraffic.length) / totalControl * 100;
    // let percentControleTraffic = controleInTraffic.length / totalControl * 100;
    // let percentWrongOnStreet = wrongOnStreet.length / totalControl * 100;
    let percentWrong = (wrongOnStreet.length + wrongInTraffic.length) / totalControl * 100;
    // let percentWrongInTraffic = wrongInTraffic.length / totalControl * 100;
    let percentSmallTalk = smallTalk.length / totalControl * 100;
    let percentDifferent = controleDifferent.length / totalControl * 100;



    //map over the data given as a parameter to this function
    data.map(object => {
        //if police initiated contact push to policeContacted
        if(object.totStand == 'De politie kwam naar mij toe'){
            policeContacted.push(object);
        }//if respondent initiated contact push to iContacted 
        else if(object.totStand == 'Ik ging naar de politie toe'){
            iContacted.push(object);
        }
    });

    let zelfContact = iContacted.filter(d => d.redenZelfContact != 999999 && d.redenZelfContact != 'De respondent heeft deze vraag niet beantwoord' && d.redenZelfContact != 'Ik ging niet naar de politie toe');

    const anders = [];
    const slachtofferAangifte = [];
    const vroegHulp = [];
    const meldingMaken = [];
    const praatjeMaken = [];

    zelfContact.filter(d => {
        
        if(d.redenZelfContact == 'Anders, namelijk…') anders.push(d);

        if(d.redenZelfContact == 'Ik was slachtoffer van een misdaad of delict en deed hiervan aangifte') slachtofferAangifte.push(d);
        
        if(d.redenZelfContact == 'Ik vroeg de politie om hulp, advies of informatie') vroegHulp.push(d);
        
        if(d.redenZelfContact == 'Ik had iets gezien dat niet mag en maakte hiervan melding') meldingMaken.push(d);
        
        if(d.redenZelfContact == 'Ik maakte een praatje met een agent') praatjeMaken.push(d);
    
    });

    
    let percentAnders = anders.length / zelfContact.length * 100;
    let percentSlacht =  slachtofferAangifte.length / zelfContact.length * 100;
    let percentVroegHulp = vroegHulp.length / zelfContact.length * 100;
    let percentMelding =  meldingMaken.length / zelfContact.length * 100;
    let percentPraatje = praatjeMaken.length / zelfContact.length * 100;
    

    //
    let cleanedObject = {
        origin: origin,
        policeContactedMe: policeContacted.length / answerYes.length * 100,
        iContactedPolice: iContacted.length / answerYes.length * 100,
        amountIContactedPolice: iContacted.length,
        amountPoliceContactedMe: policeContacted.length,
        pieData: [
            {reden: 'Voor een controle', percentage: percentControle},
            {reden: 'Omdat ik (volgens de politie) iets verkeerd deed', percentage: percentWrong},
            {reden: 'De politie kwam naar mij toe om gewoon een praatje te maken', percentage: percentSmallTalk},
            {reden: 'Anders', percentage: percentDifferent}
        ],
        pieData2: [
            {reden: 'Ik was slachtoffer van een misdaad of delict en deed hiervan aangifte', percentage: percentSlacht},
            {reden: 'Ik vroeg de politie om hulp, advies of informatie', percentage: percentVroegHulp},
            {reden:'Ik had iets gezien dat niet mag en maakte hiervan een melding', percentage: percentMelding},
            {reden: 'Ik maakte een praatje met de agent', percentage: percentPraatje},
            {reden: 'Anders', percentage: percentAnders}
        ]};
    return cleanedObject;
}