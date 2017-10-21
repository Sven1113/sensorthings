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
        "newObservation": this.handleObservation
      }, this);

      var loc = "ws://10.80.5.9:8766";
      var socket = new WebSocket(loc);
      socket.onopen = function () {
        console.log('websocket says hi!');
      }
      socket.onmessage = function (evt) {
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
      console.log(data);
    },
    handleObservation: function (observation) {
      var obs = JSON.parse(observation);
      var things = this.get('things');
      var dataStreamId = obs['@iot.id'];
      var idx = _.findIndex(things, function (t) {
        return t.Datastreams[0]['@iot.id'] === dataStreamId;
      });
      if (idx >= 0) {
        var changedThing = things[idx];
        var oldObservations = changedThing.Datastreams[0].Observations;
        oldObservations.push(obs);
        var newThings = things.slice(idx, 1);
        newThings.push(changedThing);
        console.log(things);
        console.log(newThings);
        this.set('things', newThings);
      } else {
        console.log(obs);
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
    }
  });
  return SensorThings;
});
