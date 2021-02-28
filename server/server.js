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

function sendPostRequest(req) {
    return new Promise((resolve, reject) => {
        request.post(req, (err, res) => {
            if (err) {
                console.log("Request failed: " + err)
                reject(err);
            } else {
                console.log(res.body);
                resolve(JSON.parse(res.body));
            }
        });
    })
}

function sendGetRequest(req) {
    return new Promise((resolve, reject) => {
        request.get(req, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(res.body));
            }
        });
    })
}

async function main() {
    var twitchTokenRequest = `https://id.twitch.tv/oauth2/token?client_id=${twitch_client_id}&client_secret=${twitch_secret}&grant_type=client_credentials`;
    let response = await sendPostRequest(twitchTokenRequest);
    twitchToken = response.access_token;

    getStreams = {
        url: `https://api.twitch.tv/helix/streams`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + twitchToken,
            "Client-Id": twitch_client_id
        }
    }

    var streams = await sendGetRequest(getStreams);
    console.log(streams);

        // for (i=0; 3 > i; i++) {
        //     sendGetRequest(getGames, answer => {
        //         console.log(answer.data[0]);
        //         console.log(answer.pagination.cursor)
        //         afterValue = answer.pagination.cursor;
        //     })
        //     await sleep(1000)
        // }
}

main();
