const { del } = require("express/lib/application");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req,res){
    res.json({data: orders});
}

function propertyExists(property){
    return function(req, res, next){
    const { data = {} } = req.body
    if(data[property]){
        return next();
    }
    next({
        status: 400,
        message: `Order must include a ${property}`
    })       
}
}

function dishValidation(req,res,next){
    const { data: {dishes} = {} } = req.body;
    if (!Array.isArray(dishes) || dishes.length === 0){
        return next({
            status: 400,
            message: "Order must include at least one dish"

        })
    }
   next();
}

function dishQuantityCheck(req, res, next){
    const { data: {dishes} = {} } = req.body;
    const dishErrors = [];
    dishes.forEach((dish, index)=>{
        const qty = dish.quantity;
        if (!qty || qty <=0 || !Number.isInteger(qty)){
            dishErrors.push(`Dish ${index} must have a quantity that is an integer greater than 0`)
        }
    })

    if (dishErrors.length > 0){
        return next({
            status: 400,
            message: dishErrors.join(" / ")
        })
    }
   next();
}


function create(req,res){
    const { data: {deliverTo, mobileNumber, dishes} = {}} = req.body;
    newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes
}
    orders.push(newOrder);
    res.status(201).json({data: newOrder})
     
}


module.exports = {
    list,
    create: [
        propertyExists("mobileNumber"),
        propertyExists("deliverTo"),
        propertyExists("dishes"),
        dishValidation,
        dishQuantityCheck,
        create

    ]
}


