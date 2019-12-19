d3.tsv('./rawData.txt')
    .then(data => {
        return data
    })
    .then(data => transformData(data))

function transformData(data){

    

    const cleanedObjects = data.map(object => {
        return{
            vertrouwen: object.rapportcijfer, 
            contact: object.Contact_gehad,
            stadsDeel: object.Stadsdeel,
            totStand: object.Totstand
        }
    })
    
}