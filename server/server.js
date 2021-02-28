var express = require("express");
var request = require('request');
var bodyParser = require('body-parser');
const port = 8000;

var app = express();
app.use(bodyParser.json())
//---------------------Initial Server Setup-------------------------//


//Defining api validation information 
const twitch_client_id = 'sxkje3xw0k02b984j3zgclfr8n4mnb';
const twitch_secret    = 'nhp0xdl4eglzhn0pga8rte7n7p1t4m';
const session_secret   = '<some secret here>';
const callback_url     = '<your redirect url here>';

//See if server is running on port
app.get('/', (req, res) => {
    res.send(`Hi! Server is listening on port ${port}`)
});


app.listen(port); //Start listening

//Functions to send request to twitch api. Returns answer as javascript object
function sendPostRequest(req, answer) {
    request.post(req, function (err, res) {
        if (err) throw err;
        answer(JSON.parse(res.body));
    });
}

function sendGetRequest(req, answer) {
    request.get(req, function (err, res) {
        if (err) throw err;
        answer(JSON.parse(res.body));
    });
}

//Sleep function - delete when promise in request is implemented
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Sends request to twitch api to get access token
var twitchTokenRequest = `https://id.twitch.tv/oauth2/token?client_id=${twitch_client_id}&client_secret=${twitch_secret}&grant_type=client_credentials`;
sendPostRequest(twitchTokenRequest, answer => {
    twitchToken = answer.access_token;
});

async function main() {
    await sleep(1000);
        var afterValue = "";
        getGames = {
            url: `https://api.twitch.tv/helix/streams?first=3&after=${afterValue}`,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + twitchToken,
                "Client-Id": twitch_client_id
            }
        }
        for (i=0; 3 > i; i++) {
            sendGetRequest(getGames, answer => {
                console.log(answer.data[0]);
                console.log(answer.pagination.cursor)
                afterValue = answer.pagination.cursor;
            })
            await sleep(1000)
        }
}

main();



 // console.log(getGames.after)
        // p.then((answer) =>{
        //     getGames.after
        // });

 // let p = new Promise((resolve, reject) => {
    //     sendGetRequest(getGames, answer => {
    //         getGames.after = answer.pagination.cursor;
    //         console.log(answer.data[0]);
    //         resolve(answer);
    //     })
    // });



 // request.get(getGames, function (err, res) {
        //     if (err) throw err; 
        //     console.log(res.body);
        // })