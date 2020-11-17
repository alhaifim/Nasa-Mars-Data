require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const {pick, maxBy} = require('lodash/fp')

const app = express()
const port = 9000


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// Send information about the rover
app.post('/roverInfo', async (req, res) => {
    try {
        res.send(await manifestsRover(req.body.roverName));

    } catch (err) {
        console.log('error:', err);
    }
})

// Fetching Manifest from NASA Apis
const manifestsRover = async (roverName) => {
    const URL=`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?&api_key=${process.env.API_KEY}`
    const res = await fetch(URL)
    const data = await res.json();
    const photo = maxBy((photo)=> photo.earth_date)(data.photo_manifest.photos);
    return {...pick(['name','landing_date','launch_date','status','max_date','max_sol','total_photos'])(data.photo_manifest),max_earth_date:photo.earth_date}
} 





// Fetching images from NASA Apis
app.post('/fetchImage', async (req, res) => {
    try {
        const URL=`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.roverName}/photos?earth_date=${req.body.earthDate}&api_key=${process.env.API_KEY}`;
        let data = await fetch(URL)
            .then(res => res.json())
            //send data
            res.send(data.photos)

    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`App listening on port ${port}!`))