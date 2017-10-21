define(function (require) {

  // var mqtt = require('mqtt');

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

      // // Create a client instance
      // var client = new Paho.MQTT.Client("51.5.242.162", 80, "clientId");

      // // set callback handlers
      // client.onConnectionLost = onConnectionLost;
      // client.onMessageArrived = onMessageArrived;

      // // connect the client
      // client.connect({ onSuccess: onConnect });

      // // called when the client connects
      // function onConnect() {
      //   // Once a connection has been made, make a subscription and send a message.
      //   console.log("onConnect");
      //   // client.subscribe("/World");
      //   // message = new Paho.MQTT.Message("Hello");
      //   // message.destinationName = "/World";
      //   // client.send(message);
      // }

      // called when the client loses its connection
      // function onConnectionLost(responseObject) {
      //   if (responseObject.errorCode !== 0) {
      //     console.log("onConnectionLost:" + responseObject.errorMessage);
      //   }
      // }

      // // called when a message arrives
      // function onMessageArrived(message) {
      //   console.log("onMessageArrived:" + message.payloadString);
      // }

      // var client = mqtt.connect('ws://test.mosquitto.org');

      // client.on('connect', function () {
      //   this.set('hasMqttConn', true);
      //   console.log('connected!');
      //   // client.subscribe('v1.0/Datastreams(2)/Observations');
      // });

      // client.on('message', function (topic, message) {
      //   console.log(message.toString());
      //   Radio.trigger("sensorthings", "newObservation", message.toString());
      // });
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
