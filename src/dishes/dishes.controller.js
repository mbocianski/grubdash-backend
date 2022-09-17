const { builtinModules } = require("module");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req,res){
    res.json({data: dishes});
}

//     function propertyNameExists(req, res, next){
//         const { data: {name, description, price, image_url} = {}, data } = req.body;
// //check for each property and add message to error array conditions are not met
//         const message = []
//         if (!name) message.push("Dish must include a name");
//         if (!description) message.push("Dish must include a description");
//         if (!price) message.push("Dish must include a price");
//         if (price <= 0 || isNaN(price)) message.push("Dish must have a price that is an integer greater than 0");
//         if (!image_url ) message.push("Dish must include a image_url");

//     if (message.length === 0 && data){
//         res.locals.dish = data;
//         return next();
//     }
//     next({
//         status: 400,
//         message: message.join(" / "), 
//     })
//     } 

function propertyExists(property){
    return function(req, res, next){
    const { data = {} } = req.body
    if(data[property]){
        return next();
    }
    next({
        status: 400,
        message: `Dish must include a ${property}`
    })       
}
}

function priceIsValid (req, res, next){
        const { data: {price} = {} } = req.body;
        if (!Number.isInteger(price) || price <= 0){
            return next({
                status: 400,
                message: "Dish must have a price that is an integer greater than 0"
    
            })
        }
       next();
    }

function dishExists(req, res, next){
    const {dishId} = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if (foundDish){
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `${dishId} does not exist`
    })
}



function create(req,res){
    const { data: {name, description, price, image_url} = {}} = req.body;
    newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url
}
    dishes.push(newDish);
    res.status(201).json({data: newDish})
     
}

function read(req, res){
    res.json({data: res.locals.dish})
}


module.exports = {
    list,
    create: [
        propertyExists("name"),
        propertyExists("description"),
        propertyExists("image_url"),
        propertyExists("price"),
        priceIsValid,
        create],
    read: [dishExists, read],
}
