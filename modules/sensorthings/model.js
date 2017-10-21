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

      var loc = "ws://10.80.5.9:8765";
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
      console.log(data);
    },
    handleObservation: function (observation) {
      var things = this.get('things');
      console.log(things);
      console.log(observation);
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
