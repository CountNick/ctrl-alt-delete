//function that prepares data for a piechart, data still needs to be pushed in one array where this function gets called
export default function preparePieData(data, total){
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