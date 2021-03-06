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

app.get('/', function (req, res) {
    res.send('<h2>my mid_server is running</h2>');
});

//  READ calendars
// --------------------------------------------------------------------
app.get("/calendars", function (request, response) {
    response.json(calendarsObj)
});

//  READ events
// --------------------------------------------------------------------
app.get("/events", function (request, response) {
    readEvents(response);
});

//  CREATE event
// --------------------------------------------------------------------
app.post("/events", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);
    console.log("post.request.body", request.body);
    // readEvents(response);
    return createEvent(request.body, response)
    // response.send(request.body);
});

//  DELETE event
// --------------------------------------------------------------------
app.delete("/events", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);
    console.log("delete.request.body", request.body);
    return deleteEvent(request.body, response);
    // response.send(request.body);
});

//  UPDATE event
// --------------------------------------------------------------------
app.put("/events", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);
    console.log("update.request.body", request.body);
    return updateEvent(request.body, response);
    // response.send(request.body);
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

function createEvent(data, response) {
    connection = mysql.createConnection(config);
    let dateStartObj = new Date(data.start);
    let dateEndObj = new Date(data.end);

    console.log("data.start:", dateStartObj);
    
    let dataArray = [data.calendarId, data.title, dateStartObj, dateEndObj, data.location];
    console.log("dataArray", dataArray);
    
    const sql = "INSERT INTO events(calendarId, title, start, end, location) VALUES(?, ?, ?, ?, ?)";
    connection.query(sql, dataArray, function (err, results) {
        if (err) return console.log(err);
        readEvents(response);
    });
}

function deleteEvent(data, response) {
    connection = mysql.createConnection(config);
    console.log("data.id", data.id);
    // execute will internally call prepare and query
    connection.execute(
        "DELETE FROM `events` WHERE `id` = ?",
        [data.id],
        function (err, results, fields) {
            if (err) return console.log(err);
            readEvents(response);
            console.log(results); // results contains rows returned by server
        }
    )
}

function updateEvent(data, response) {
    connection = mysql.createConnection(config);
    let dateStartObj = new Date(data.start);
    let dateEndObj = new Date(data.end);

    console.log("data.start:", dateStartObj);
    
    let dataArray = [data.calendarId, data.title, dateStartObj, dateEndObj, data.location, data.id];
    console.log("dataArray", dataArray);
    
    const sql = "UPDATE events SET calendarId=?, title=?, start=?, end=?, location=? WHERE id=?";
    connection.query(sql, dataArray, function (err, results) {
        if (err) return console.log(err);
        readEvents(response);
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