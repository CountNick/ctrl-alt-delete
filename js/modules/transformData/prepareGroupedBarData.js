export default function prepareGroupedBarData(data) {

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
    
    // console.log(beleefdObject);
    // console.log(luisterObject);
    // console.log(rechtvaardigObject);
    
    const complete = [];

    complete.push(beleefdObject);
    complete.push(luisterObject);
    complete.push(rechtvaardigObject);

    return complete;
}