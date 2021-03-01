//---------------------Initial Server Setup-------------------------//
var express = require("express");
var request = require('request');
var bodyParser = require('body-parser');
const port = 8000;

var app = express();
app.use(bodyParser.json())

// Variables
const maxViewers = 50; //Max viewers on stream for stream to be added to streamersContainer
const maxStreamers = 99; //Max streamers to be added to streamersContainer, if not 
var streamersContainer = []; //Container of streamers


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

//Functions to send post and get requests to twitch api, responds with a promise
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

//Main function, runs async to enable await for a promise from api-call functions
async function main() {
    
    //Get accesstoken
    var twitchTokenRequest = `https://id.twitch.tv/oauth2/token?client_id=${twitch_client_id}&client_secret=${twitch_secret}&grant_type=client_credentials`;
    var response = await sendPostRequest(twitchTokenRequest);
    var twitchToken = response.access_token;

    //Set parameters for get request to get streams
    var getStreams = {
        url: `https://api.twitch.tv/helix/streams`,
        headers: {
            "Authorization": "Bearer " + twitchToken,
            "Client-Id": twitch_client_id
        }
    }

    //While viewercount in first stream in data-response is higher than maxViewers go to next page
    var run = 0;
    do {
        streams = await sendGetRequest(getStreams);
        console.log("Run: " + run);
        run ++;
        getStreams.url = `https://api.twitch.tv/helix/streams?first=100&after=${streams.pagination.cursor}`;
    } while (streams.data[0].viewer_count > maxViewers)

    //When viewer_count is <= maxViewers go to the page before
    getStreams.url = `https://api.twitch.tv/helix/streams?first=100&before=${streams.pagination.cursor}`;
    streams = await sendGetRequest(getStreams);

    //Iterate through streams in data-reponse, and add the one with views >= maxViewers to streamersContainer
    for (let i = streams.data.length - 1; i > 0; i--) {
        console.log("For stamenet" + i);
        if (streams.data[i].viewer_count <= maxViewers && streamersContainer.length < maxStreamers) {
            streamersContainer.push(streams.data[i]);
            console.log("Added streamer with " + streams.data[i].viewer_count + " views to conainer. The container now contains " + streamersContainer.length + " streamers");
            continue;
        } else if (streams.data[i].viewer_count > maxViewers) {
            console.log("Viewer count is now " + streams.data[i].viewer_count + ". Stopping backchecking and skipping to next page");
            break;
        }
    }

    //Go to next page
    getStreams.url = `https://api.twitch.tv/helix/streams?first=100&after=${streams.pagination.cursor}`;
    streams = await sendGetRequest(getStreams);

    //Add streams to streamsContainer until maxStreamers is reached
    while (streamersContainer.length < maxStreamers) {
        if ((maxStreamers  - streamersContainer.length) < 100) {
            let streamersContainerSpace = maxStreamers  - streamersContainer.length;
            getStreams.url = `https://api.twitch.tv/helix/streams?first=${streamersContainerSpace}&after=${streams.pagination.cursor}`;
        } else {
            getStreams.url = `https://api.twitch.tv/helix/streams?first=100&after=${streams.pagination.cursor}`;
        }
        var streams = await sendGetRequest(getStreams);
        Array.prototype.push.apply(streamersContainer, streams.data);
        //console.log(streamersContainer);
        console.log("Added " + streams.data.length + " streamers to streamersContainer. There are now " + streamersContainer.length + " in the container");
    }

    
    console.log("Done. Captured " + streamersContainer.length + " streamers in container");
    console.log(streamersContainer);

    // for (i=0; 50 > i; i++) {
    //     var streams = await sendGetRequest(getStreams);
    //     getStreams.url = `https://api.twitch.tv/helix/streams?first=100&after=` + streams.pagination.cursor;
    //     console.log(streams.data[0]);
    // }


}

main();
