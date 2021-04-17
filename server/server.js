//---------------------Initial Server Setup-------------------------//
const request = require('request');
const express = require("express");
const http = require("http").Server(express);
const io = require('socket.io')(http, {
    cors: {
      origin: '*',
    }
  });

var raiderCount = 0;

var countDown = 10;
io.on("connection", socket => {
    socket.emit("countDown", countDown);
    io.emit("raiderCount", raiderCount);
    console.log("Sent data");
    raiderCount++;
    console.log("Raider Joined " + raiderCount);
    socket.on("disconnect", () => {
      raiderCount--;
      io.emit("raiderCount", raiderCount);
      console.log("Raider Left " + raiderCount);
    })
});


http.listen(3000, () => {
    console.log("Server is listening...");
})

setInterval(() => {
  if (countDown <= 0) return;
  countDown--;
  console.log("countDown server " + countDown);
}, 1000)


// Variables
const maxViewers = 10; //Max viewers on stream for stream to be added to streamersContainer
const maxStreamers = 10; //Max streamers to be added to streamersContainer, if not 
var streamersContainer = []; //Container of streamers


//Defining api validation information 
const twitch_client_id = 'sxkje3xw0k02b984j3zgclfr8n4mnb';
const twitch_secret    = 'nhp0xdl4eglzhn0pga8rte7n7p1t4m';


//Functions to send post and get requests to twitch api, responds with a promise
function sendPostRequest(req) {
    return new Promise((resolve, reject) => {
        request.post(req, (err, res) => {
            if (err) {
                console.log("Request failed: " + err)
                reject(err);
            } else {
                console.log(res.body);
                resolve(JSON.parse(res.body)); //test wether this is needed when bodyparser is set to JSON
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
    var run = 1;
    do {
        var streams = await sendGetRequest(getStreams);
        console.log("Searching for streams with or less than " + maxViewers + " viewers. Streams Checked: " + run + "00");
        run ++;
        getStreams.url = `https://api.twitch.tv/helix/streams?first=100&after=${streams.pagination.cursor}`;
    } while (streams.data[0].viewer_count > maxViewers)

    //When viewer_count is <= maxViewers go to the page before
    getStreams.url = `https://api.twitch.tv/helix/streams?first=100&before=${streams.pagination.cursor}`;
    streams = await sendGetRequest(getStreams);

    //Iterate through streams in data-reponse, and add the ones with views >= maxViewers to streamersContainer
    for (let i = streams.data.length - 1; i > 0; i--) {
        if (streams.data[i].viewer_count <= maxViewers && streamersContainer.length < maxStreamers) {
            streamersContainer.push(streams.data[i]);
            console.log("Added streamer with " + streams.data[i].viewer_count + " views to conainer. The container now contains " + streamersContainer.length + " streamers");
            continue;
        } else {
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
        streams = await sendGetRequest(getStreams);
        Array.prototype.push.apply(streamersContainer, streams.data);
        console.log("Added " + streams.data.length + " streamers to streamersContainer. There are now " + streamersContainer.length + " in the container");
    }

    console.log("Done. Captured " + streamersContainer.length + " streamers in container");
    console.log(streamersContainer);
    io.emit("streamUserName", streamersContainer[0].user_login);
    streamersContainer.splice(0,1);

}


main();
setInterval(() => {
  main();
}, 100000)


