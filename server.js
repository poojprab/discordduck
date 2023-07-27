/*
const express = require('express');
const bodyParser = require('body-parser'); // Import body-parser to parse incoming JSON data
const app = express();
const port = 3000;

app.use(bodyParser.json()); // Parse JSON data

// Define a POST route to receive JSON data
app.get('/data.json', (req, res) => {
    //console.log('Received data:', req.body);
    //res.json({ message: 'Data received successfully!' });
    res.json({
        name: 'john',
        age: 30,
        occupation: 'hi'
    })
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
*/


/////////////////////

const express = require('express');
const bodyParser = require('body-parser'); // Import body-parser to parse incoming JSON data
const app = express();
const port = 3000;

app.use(bodyParser.json()); // Parse JSON data

// Define a POST route to receive JSON data
app.get('http://localhost:3000/data.json', (req, res) => {
    console.log('Received data:', req.body);
    res.json({ message: 'Data received successfully!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
