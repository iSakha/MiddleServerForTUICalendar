"use strict";

console.log('hello, world!');

const express = require("express");
const mysql = require("mysql2");
const app = express();
let config = require('./config.js');
const cors = require("cors");

let connection = mysql.createConnection(config);

const PORT = 3055;


let calendarsObj;
let calendarsArray;
let calendarsArrId;
let eventsObj = {};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// создаем парсер для данных application/x-www-form-urlencoded
const urlencodedParser = express.urlencoded({ extended: false });


readCalendars();

function readCalendars() {
    connection.execute("SELECT * FROM calendars",
    function (err, results, fields) {
        if (err) {
            console.log('Check SSH tunnel!')
            return console.log("Error: " + err.message);
        }
        calendarsObj = results;
        console.log(calendarsObj);
        calendarsArray = [];
        calendarsArrId = [];
        for (let i = 0; i < calendarsObj.length; i++) {
            calendarsArray.push(calendarsObj[i].cal_name);
            calendarsArrId.push(calendarsObj[i].id);
        }
        console.log('calendars array:', calendarsArray);
        console.log('calendarsID array:', calendarsArrId);

        connection.end();
    });
}


// ====================================================================
//            Routing
// ====================================================================

app.get('/', function(req,res) {
    res.send('<h2>my mid_server is running</h2>');
});

//  READ calendars
// --------------------------------------------------------------------
app.post("/calendars", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);
    console.log(request.body);
    response.send(calendarsObj);
});

app.get("/calendars", function (request, response) {
    response.json(calendarsObj)
});

//  READ events
// --------------------------------------------------------------------
app.post("/events", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);
    readEvents(response);
});

function readEvents(response) {
    connection = mysql.createConnection(config);
    connection.execute("SELECT * FROM v_events",
    function (err, results, fields) {
        if (err) {
            console.log('Check SSH tunnel!')
            return console.log("Error: " + err.message);
        }
        eventsObj = results;
        console.log(eventsObj);
        response.send(eventsObj);
        connection.end();
    });   
}


//          S E R V E R
// --------------------------------------------------------------------
app.listen(PORT, err => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("listening on port", PORT);
});