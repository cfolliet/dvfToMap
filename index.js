const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');


function parse() {

    const data = [];

    fs.createReadStream(path.resolve('92012.csv'))
        .pipe(csv.parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', row => data.push(row))
        .on('end', rowCount => {
            console.log(`Parsed ${rowCount} rows`)
            filter(data)
        });
}

function filter(data) {
    const filters = [
        row => row.type_local == 'Maison' || row.type_local == 'Appartement',
        //row => row.valeur_fonciere < 780000,
        row => row.lot1_surface_carrez >= 100 || row.surface_reelle_bati >= 100,
        row => row.nombre_pieces_principales >= 5
    ]

    filters.forEach(condition => data = data.filter(condition))
    console.log(`Filtered ${data.length} rows`)
    //data.forEach(row => console.log('[', row.longitude, ',', row.latitude, '],'))
    toGeoJSON(data)
}

function toGeoJSON(data) {
    let result = {
        "type": "FeatureCollection",
        "features": []
    }

    data.forEach(row => {
        let feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [parseFloat(row.longitude), parseFloat(row.latitude)]
            }//,
            //"properties": {
            //    "prix": row.valeur_fonciere,
            //    "pieces": row.nombre_pieces_principales,
            //    "taille": row.lot1_surface_carrez || row.surface_reelle_bati
            //}
        }

        result.features.push(feature);
    })

    let url = `http://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(result))}`
    console.log(url)
}

parse();