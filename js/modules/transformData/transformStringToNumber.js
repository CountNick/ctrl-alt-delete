//transform strings to numbers
export default function transformStringToNumber(data){

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