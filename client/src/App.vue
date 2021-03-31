<template>
  <div class="flexboxContainer">
    <div class="container1">
      <div class="countDownContainer">
        <h5>Next raid in</h5>
        <h4>{{countDown}}</h4>
      </div>
    </div>
    <div class="container2">
      <div>
        <h2 v-if="!ongoingRaid">{{raiderCount}}</h2>
        <h3 v-if="!ongoingRaid">people ready to raid!</h3>
        <div v-if ="ongoingRaid" class="centerElement" id="embedTwitchStream">
        </div>
      </div>
        <h5 style="color: #78F6BC;">Raiding small Twitch streamers</h5>
    </div>
    <div class="container3">
      <div>
        <h6>Invite friends to participate in the raid!</h6>
        <v-btn
          style="
          margin: 10px 0 40px;
          margin-left: 50%;
          transform: translateX(-50%);"
          @click="snackbar = true; copyURL();"
          elevation="24"
          rounded
        >
          <p>Copy link</p>
        </v-btn>
        <v-snackbar
          origin=""
          v-model="snackbar"
          timeout="600"
          content-class="text-center"
          transition="scale-transition"
        >
          <p>{{ text }}</p>
        </v-snackbar>
      </div>
    </div>
  </div>

</template>

<script> 
  import { io } from "socket.io-client";
  export default {
    data() {
      return {
        snackbar: false,
        text: `Link copied to clipboard`,
        countDown: 30,
        raiderCount: 97,
        ongoingRaid: false,
        player: null,
        socket: {},
        context: {},
      }
    },

  created() {
    this.socket = io("http://localhost:3000");
    this.countDownTimer();
  },

  methods: {
    copyURL: function() {
        var url = window.location.href;
        var urlInput = document.createElement("input");
        document.body.appendChild(urlInput);
        urlInput.value = url;
        urlInput.select();
        document.execCommand("copy");
        document.body.removeChild(urlInput);
      }, 

    countDownTimer: function() {
      if(this.countDown > 0) {
        setTimeout(() => {
          this.countDown -= 1
          this.countDownTimer()
        }, 1000)
      }
    }
  },

   

  mounted () {
    this.socket.on("countDown", data => {
      this.countDown = data;
    }); 

    const twitchImport = document.createElement("script");
    twitchImport.setAttribute(
      "src",
      "https://embed.twitch.tv/embed/v1.js"
    );
    twitchImport.async = true;
    document.head.appendChild(twitchImport)
    new Twitch.Embed("embedTwitchStream", {
      width: 1190,
      height: 480,
      channel: "esl_csgo",
      theme: "dark",
      muted: false,
    });
  },

  }
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800&display=swap');

html {
  min-height: 100vh;
  width: 100vw;
  background-color: #1F004D;
  font-family: 'Montserrat', sans-serif;
}

p {
  font-weight: 400;
  text-align: center;
}

h2 {
  color: #78F6BC;
  font-size: 12em;
  text-align: center;
  font-weight: 800;
}

h3 {
  color: #78F6BC;
  font-size: 3em;
  text-align: center;
  font-weight: 800;
}

h4 {
  font-weight: 800;
  color: #E5E5E5;
  font-size: 4em;
  text-align: center;
}

h5 {
  font-weight: 700;
  color: #E5E5E5;
  font-size: 1.4em;
  text-align: center;
}

h6 {
  font-weight: 700;
  color: #9B9B9B;
  font-size: 1em;
  text-align: center;
  margin-top: 10px;
}

v-snackbar p{
  text-align: center;
} 

.container1 {
  border-bottom-left-radius: 15px;
   border-bottom-right-radius: 15px;
  background-color: #373737;
  display: inline-block;
  box-shadow: 0 5px 20px black;
  width: 200px;
}

.countDownContainer {
  margin: 10px 30px;
}

.flexboxContainer {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100vh;
  gap: 40px;
}

v-btn {
  margin-left: 50%;
  transform: translateX(-50%);
  background-color: black;
}

</style>
