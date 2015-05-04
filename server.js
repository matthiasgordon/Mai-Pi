var express = require('express');
 
var app = express();

var fs = require('fs');
var sys = require('util');
var exec = require('child_process').exec;

var temperature;
var volt;
var frequency;
var memory; //Prozentangabe des belegten SD-Karten Speichers

function populateData(res) {
	//populate temperature
	temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
	temperature = (temperature/1000).toPrecision(3);

	//populate volt
	volt = exec('/opt/vc/bin/vcgencmd measure_volts | tr -d "volt=" | tr -d "V" | head -c -1');
	
	//populate frequency
	frequency = exec('/opt/vc/bin/vcgencmd measure_clock arm | tr -d "frequency(45)="');

	//populate memory
	memory = exec('df -P | grep rootfs | tr -s " " " " | cut -d " " -f 5 | head -c -2');

	//wait for commands to finish
	volt.stdout.on("data", function(data) {
		volt = data;
		//console.log(volt);
		
	frequency.stdout.on("data",function(data) {
		frequency = data/1000000;
		//console.log(frequency);
	
	memory.stdout.on("data",function(data) {
		memory = data;
		//console.log(memory);

		sendData(res);
	});
	});
	});
}

function sendData(res) {
	res.send({
		  "status": [
		  	{"name": "last_temperature", "unit": "°c", "value": temperature},
		  	{"name": "cpu_frequency", "unit": "mhz", "value": frequency},
		  	{"name": "cpu_voltage", "unit": "v", "value": volt},
		  	{"name": "memory_usage", "unit": "%", "value": memory}
		    ]
		  });
    	console.log("JSON file sended");
}

app.get('/status', function(req, res) {
	populateData(res);
});

app.get('/test', function(req, res) {
	res.send({"test": "hello world!"});
});

app.get('/shutdown', function(req, res) {
    	exec("sudo shutdown -h now");
});

app.get('/reboot', function(req, res) {
    	exec("sudo reboot");
});

app.listen(3000);
console.log('Listening on port 3000...');
console.log('/status für Pi-Statusinfos als JSON');
console.log('/shutdown fürs Runterfahren');
console.log('/reboot für Neustart');
