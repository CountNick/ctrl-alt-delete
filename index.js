d3.tsv('./rawData2.txt')
    .then(data => {
        //return the data
        return data
    })
    .then(data => transformData(data))
    .then(transformData => organiseData(transformData))
    //.then(organiseData => counter(organiseData))

//function for data transformation
function transformData(data){
    
    //console.log('original data: ', data)
    
    //make new array with modified objects
    const cleanedObjects = data.map(object => {
        //only return neccessary pairs 
        return{
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
            rechtvaardig: object.stel_rechtvaardig
        }
    })

    //console.log('hiee',cleanedObjects)
    //return the cleaned objects
    return cleanedObjects   
}

function organiseData(data){

    const originTotal = []

    const answerYes = data.filter( object => {

        if(object.contact == 'Ja' && object.totStand != 'De respondent heeft deze vraag niet beantwoord' && object.herkomst != 'Onbekend') return object 

    })

    
    const originNederlands = answerYes.filter( object => {

        if (object.herkomst == 'Nederlands'){

            originTotal.push(object)

            return object
        }      
    })


    const complete = []
    const arrayForStack = []
    
    const originWesters = answerYes.filter(object => {

        if (object.herkomst == 'Westers'){

            originTotal.push(object)

            return object
        }
    })

    

    console.log('westers', originWesters.length / answerYes.length * 100)

    const originNietWesters = answerYes.filter(object => {

        if(object.herkomst != 'Nederlands' && object.herkomst != 'Westers' && object.herkomst != 'Onbekend'){

            object.herkomst = 'niet-Westers'

            originTotal.push(object)

            return object
        }
    })

    console.log('Nietwesters', originNietWesters.length / answerYes.length * 100)

    complete.push(checkInitiatedContact(originNederlands, answerYes))
    complete.push(checkInitiatedContact(originWesters, answerYes))
    complete.push(checkInitiatedContact(originNietWesters, answerYes))

    const target = {}
    const target2 = {}

    let flattened = complete.flat()

    flattened.map(d => {
        
        if(d.contactZoeker == "De politie kwam naar mij toe") Object.assign(target, d)
        else if(d.contactZoeker == "Ik ging naar de politie toe") Object.assign(target2, d)
        
    })

    arrayForStack.push(target)
    arrayForStack.push(target2)

    console.log('stackdata: ', arrayForStack)

    return arrayForStack

}

function checkInitiatedContact(data, answerYes){

    const policeContacted = []
    const iContacted = []
    const complete = []

    let origin

    data.forEach(element => {
        origin = element.herkomst
    });

    data.map(object => {

        if(object.totStand == 'De politie kwam naar mij toe'){
            policeContacted.push(object.totStand)
        } else if(object.totStand == 'Ik ging naar de politie toe'){
            iContacted.push(object.totStand)
        }
    })

    // complete.push(policeContacted.length)
    // complete.push(iContacted.length)

    
    
    complete.push({contactZoeker: 'De politie kwam naar mij toe', [origin]: policeContacted.length / answerYes.length * 100})
    complete.push({contactZoeker: 'Ik ging naar de politie toe', [origin]: iContacted.length / answerYes.length * 100})

    return complete
}

//https://medium.com/@Dragonza/four-ways-to-chunk-an-array-e19c889eac4
function chunk(array, size) {
    const chunked_arr = [];
    for (let i = 0; i < array.length; i++) {
      const last = chunked_arr[chunked_arr.length - 1];
      if (!last || last.length === size) {
        chunked_arr.push([array[i]]);
      } else {
        last.push(array[i]);
      }
    }
    return chunked_arr;
}