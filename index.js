d3.tsv('./rawData.txt')
    .then(data => {
        //return the data
        return data
    })
    .then(data => transformData(data))
    .then(transformData => nestData(transformData))

//function for data transformation
function transformData(data){
    //make new array with modified objects
    const cleanedObjects = data.map(object => {
        //only return neccessary pairs 
        return{
            //rename keys for easier usage
            vertrouwen: +object.rapportcijfer, 
            contact: object.Contact_gehad,
            stadsDeel: object.Stadsdeel,
            totStand: object.Totstand
        }
    })

    console.log(cleanedObjects)
    //return the cleaned objects
    return cleanedObjects   
}

function nestData(data){
    //empty array to store each object answered with yes
    const yesArray = []
    //empty array to store each object answered with no
    const noArray = []
    //selects the ja button from the DOM
    const yesButton = document.getElementById("ja")
    //selects the no button from the DOM
    const noButton = document.getElementById("nee")
    
    //only values containing yes or no will be used in this program
    //loop through the array of objects
    for (let object in data){
        //if contact value equals ja push to the yes array
        if (data[object].contact == "Ja"){
            yesArray.push(data[object])
        } 
        //if contact value equals nee push to the no array
        else{
            noArray.push(data[object])
        }
    }
    //adds a click event to the yes button
    yesButton.addEventListener("click", function(){
        console.log(yesArray)
    })
    //adds a click event to the yes button
    noButton.addEventListener("click", function(){
        console.log(noArray)
    })

    //calculates the percentage of the yes array
    let percentYes = Math.floor((yesArray.length / data.length) *100);
    //calculates the percentage of the no array
    let percentNo = Math.floor((noArray.length / data.length) * 100);
    console.log('Wel contact: ', percentYes)
    console.log('geen contact: ', percentNo)

}