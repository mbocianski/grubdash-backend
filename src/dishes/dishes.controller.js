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
        message: `Dish does not exist: ${dishId} `
    })
}

function idInBodyMatches(req, res, next){
    const {data: {id} = {}} = req.body;
    if (id){
        const {dishId} = req.params;
        if (id === dishId){
            return next()
        }
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        });
    } next();
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

function update(req,res){
    const dish = res.locals.dish
    const { data: {id, name, description, price, image_url} = {} } = req.body;
        dish.name = name;
        dish.description = description;
        dish.price = price;
        dish.image_url = image_url;
        if (id){
            dish.id = id
        };

    res.json({data: dish})
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

    update: [
        dishExists,
        idInBodyMatches,
        propertyExists("name"),
        propertyExists("description"),
        propertyExists("image_url"),
        propertyExists("price"),
        priceIsValid,
        update

    ]
}
