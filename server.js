var express = require('express');
 
var app = express();

var fs = require('fs');
var sys = require('util');
var exec = require('child_process').exec;

var temperature;

setInterval(function(){
	temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
	temperature = ((temperature/1000).toPrecision(3)) + "C";
	//console.log(temperature);
}, 100);

app.get('/temp', function(req, res) {
    res.send({name: "last_temp", temp: temperature});
    console.log("Aktuelle Temperatur " + temperature + " abgerufen.");
});

app.get('/shutdown', function(req, res) {
    exec("shutdown -h now");
});

app.listen(3000);
console.log('Listening on port 3000...');
console.log('/temp für Temperatur');
console.log('/shutdown fürs Runterfahren');