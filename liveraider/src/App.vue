<template>
  <div>
    <div class="container1 centerElement">
      <div class="countDownContainer">
        <h5>Next raid in</h5>
        <h4>{{countDown}}</h4>
      </div>
    </div>
  <div class="container2">
    <div>
      <h2>{{raiderCount}}</h2>
      <h3>people ready to raid!</h3>
    </div>
      <h5 style="color: #78F6BC;">Raiding Twitch streamers with 0 viewers</h5>
  </div>
  <div class="container3">
    <div class="text-center ma-2">
      <h6 class="bottomText centerElement">Invite friends to participate in the raid!</h6>
      <v-btn
        @click="snackbar = true; copyURL();"
        class="centerElement"
        elevation="24"
        bottom
        absolute
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
  export default {
    data: () => ({
      snackbar: false,
      text: `Link copied to clipboard`,
      countDown: "1:22",
      raiderCount: 97
    }),

    methods: {
    copyURL: function() {
        var url = window.location.href;
        var urlInput = document.createElement("input");
        document.body.appendChild(urlInput);
        urlInput.value = url;
        urlInput.select();
        document.execCommand("copy");
        document.body.removeChild(urlInput);
      }
    }

  }
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800&display=swap');

html {
  min-height: 100vh;
  width: 100vw;
  background-color: #0d0020;
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

.centerElement {
  margin-left: 50%;
  transform: translateX(-50%);
}

.bottomText {
  position: absolute;
  bottom: 60px;
}

.container1 {
  border-bottom-left-radius: 15px;
   border-bottom-right-radius: 15px;
  background-color: #373737;
  display: inline-block;
  box-shadow: 0 5px 20px black;
}

.container2 {
  height: 70vh;
}

.container3 {
  height: 10vh;
}

.countDownContainer {
  margin: 10px 30px;
}
</style>
