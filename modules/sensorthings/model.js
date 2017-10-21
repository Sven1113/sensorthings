define(function (require) {
  var SensorThings = Backbone.Model.extend({
    defaults: {
      favorites: [],
      things: [],
      overlays: []
    },
    initialize: function () {
      var channel = Radio.channel("sensorthings");

      channel.on({
        "toggleFavorite": this.toggleFavorite,
        "addData": this.setInitialData,
        "newObservation": this.handleObservation,
        "notify": this.mkNotification
      }, this);

      var loc = "ws://10.80.5.9:8767";
      var socket = new WebSocket(loc);
      socket.onopen = function () {
        console.log('websocket says hi!');
      }
      socket.onmessage = function (evt) {
        console.log(evt.data);
        Radio.trigger("sensorthings", "newObservation", event.data);
      }
      socket.onerror = function (error) {
        console.log(error);
      }
      socket.onclose = function () {
        console.log('websocket says bye!');
      }
    },
    setInitialData: function (data) {
      this.set('things', data);
    },
    handleObservation: function (observation) {
      var obs = JSON.parse(observation);

      // TODO: hardcode demo datastream id
      if (obs['@iot.id'] === '') {
        this.mkNotification();
      }

      var things = this.get('things');
      var k = Object.keys(obs);
      var dataStreamId = k[0];
      console.log(dataStreamId);
      console.log(things);
      var idx = _.findIndex(things, function (t) {
        return t.Datastreams[0]['@iot.id'] === dataStreamId;
      });
      if (idx >= 0) {
        var changedThing = things[idx];
        console.log(changedThing);
        var oldObservations = changedThing.Datastreams[0].Observations;
        oldObservations.push(obs[dataStreamId]);
        var newThings = things.slice(idx, 1);
        newThings.push(changedThing);
        console.log(things);
        console.log(newThings);
        this.set('things', newThings);
      }
    },
    toggleFavorite: function (thing) {
      var favs = this.get('favorites');
      var idx = _.findIndex(favs, function (a) {
        return a.id === thing.id;
      });

      if (idx >= 0) {
        var newFavs = favs.slice(idx, 1);
        this.set('favorites', newFavs);
      } else {
        favs.push(thing);
        this.set('favorites', favs);
      }
    },
    mkNotification: function () {
      var nText = "Ladestation frei";
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      }

      // Let's check whether notification permissions have already been granted
      else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(nText);
      }

      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== "denied") {
        Notification.requestPermission(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            var notification = new Notification(nText);
          }
        });
      }
    }
  });
  return SensorThings;
});
