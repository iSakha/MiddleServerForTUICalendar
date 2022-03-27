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
// app.post("/calendars", urlencodedParser, function (request, response) {
//     if (!request.body) return response.sendStatus(400);
//     console.log(request.body);
//     response.send(calendarsObj);
// });

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
    console.log(request.body);
    // readEvents(response);
    return createEvent(request.body, response)
});

//  DELETE event
// --------------------------------------------------------------------
// app.post("/events", urlencodedParser, function (request, response) {
//     if (!request.body) return response.sendStatus(400);
//     console.log(request.body);
//     // readEvents(response);
//     response.send(request.body);
// });


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
    let str = data.start;
    data.start = str.substr(0, 19);
    str = data.end;
    data.end = str.substr(0, 19);
    let dataArray = [data.calendarId, data.title, data.start, data.end, data.location];
    console.log("dataArray", dataArray);
    const sql = "INSERT INTO events(calendarId, title, start, end, location) VALUES(?, ?, ?, ?, ?)";
    connection.query(sql, dataArray, function (err, results) {
        if (err) return console.log(err);
        readEvents(response);
    });
}

function deleteEvent(data, response) {
    connection = mysql.createConnection(config);
    let dataArray = [data.id];
    console.log("dataArray", dataArray);
    // const sql = "DELETE FROM events(calendarId, title, start, end, location) VALUES(?, ?, ?, ?, ?)";
    // connection.query(sql, dataArray, function (err, results) {
    // if (err) return console.log(err);
    readEvents(response);
    //   });
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