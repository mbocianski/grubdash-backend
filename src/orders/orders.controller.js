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


function orderExists(req, res, next){
    const {orderId} = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder){
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId} `
    })
}

function idInBodyMatches(req, res, next){
    const {data: {id} = {}} = req.body;
    if (id){
        const {orderId} = req.params;
        if (id === orderId){
            return next()
        }
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
        });
        // if not id provided, go to next
    } next();
}

function statusCheck(req, res, next){
    const {data: {status}} = req.body;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
    if (!status || !validStatus.includes(status)){
        next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        })
    }
    if (status === "delivered"){
        next({
            status: 400,
            message: "A delivered order cannot be changed"
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


function pendingCheck(req, res, next){
    const order = res.locals.order;
    const status = order.status;
    if (status !== "pending"){
        return next({
            status: 400,
            message: "An order cannot be deleted unless it is pending"
        })
    }
    next();
}

function read(req,res,next){
    res.json({data: res.locals.order})
}


function update(req,res){
    const order = res.locals.order
    const { data: {id, mobileNumber, dishes, deliverTo, status} = {} } = req.body;
        order.mobileNumber = mobileNumber;
        order.dishes = dishes;
        order.deliverTo = deliverTo;
        order.status = status;
        if (id){
            order.id = id
        };

    res.json({data: order})
}

function destroy(req, res) {
    const order = res.locals.order;
    const index = orders.indexOf(order)
    console.log("index", index)
    orders.splice(index, 1)
    console.log(`Deleted order # ${order.id}`)
    res.sendStatus(204);
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
    ],
    read: [orderExists, read],
    update: [
        orderExists,
        idInBodyMatches,
        statusCheck,
        propertyExists("mobileNumber"),
        propertyExists("deliverTo"),
        propertyExists("dishes"),
        dishValidation,
        dishQuantityCheck,
        update
    ],
    destroy: [orderExists, pendingCheck, destroy]
}


