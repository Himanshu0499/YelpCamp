

const mongoose = require('mongoose');
const campgrounds = require('../models/campgrounds');
const cities = require('./cities');
const {descriptors, places, images} = require('./seedHelpers')


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex : true
})
.then(() =>{
    console.log("Datbase Connected!");
})
.catch( err => {
    console.log("Connection failed",err)
})


// using single line arrow function to return random element from an array
const randomArray = array => array[Math.floor(Math.random() * array.length)]

const seeds = async() =>{
    await campgrounds.deleteMany({})   
    for(let i = 0; i <= 45; i++){
        //generating ramdom number for cities
        const random1000 = Math.floor(Math.random() * 1000); 
        //creating random price
        const price = Math.floor(Math.random() * 5000) + 1000; 
        const location = `${cities[random1000].city}, ${cities[random1000].state}`;          
        //creating new camp
        const camp = new campgrounds({
            location : location,
            geometry : {
                type : "Point",
                coordinates : [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            title : `${randomArray(descriptors)} ${randomArray(places)}`,
            description : 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquid vitae aperiam laborum? Voluptates explicabo nisi ab. Accusantium officiis quibusdam veritatis non molestias? Earum vero quaerat non. Fugit laborum sunt necessitatibus.',
            price,
            date : Date().toString().slice(4, 10),
            owner : '60edafb256fc3c0560ab0223',
            images : [randomArray(images), randomArray(images)]
        });
        await camp.save();
    }
}

seeds().then(() => {
    mongoose.connection.close()
})

