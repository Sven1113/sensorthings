define(function (require) {

  var Model = require("modules/sensorthings/model"),
    Template = require("text!modules/sensorthings/template.html"),
    Radio = require("backbone.radio"),
    Config = require("config"),
    ol = require("openlayers"),
    proj4 = require("proj4");

  SensorThings = Backbone.View.extend({
    model: new Model(),
    template: _.template(Template),
    className: "sensorthings",
    initialize: function () {
      this.listenTo(this.model, {
        "change:favorites": this.favoritesChanged,
        "change:things": this.updateThings
      }, this);
      this.render();
    },
    render: function () {
      this.$el.html(this.template({ model: this.model }));
      $(".lgv-container").append(this.$el);

    },
    reRender: function () {
      this.$el.replaceWith(this.template({ model: this.model }));
    },
    updateThings: function () {
      console.log('update things!');
      var things = this.model.get('things')
      var overlays = this.model.get('overlays');
      var map = Radio.request("Map", "getMap");
      // clean up any currently visible overlays
      _.forEach(overlays, function (o) {
        map.removeOverlay(o);
      });
      newOverlays = overlays.slice();
      _.forEach(things, function (thing) {
        var x = document.createElement("div");
        var os = thing.Datastreams[0].Observations;
        x.setAttribute("class", "marker " + os[os.length - 1].result);
        x.setAttribute("id", "m" + thing["@iot.id"]);
          x.onclick = function () {
              var modal = document.getElementById("modal");
              if(modal.getAttribute("style") === "") {
                  modal.setAttribute("style","display: none");
                  while (modal.firstChild) {
                      modal.removeChild(modal.firstChild);
                  }
              } else {
                  var text = document.createElement("div");
                  text.textContent = thing.properties["location_name"];
                  modal.appendChild(text);
                  modal.setAttribute("style", "");
              }
              console.log("clicked" + thing["@iot.id"]);
          };
          var xy = thing.Locations[0].location.geometry.coordinates;
        var pos = proj4(proj4("EPSG:4326"), proj4(Config.view.epsg), xy);
        var overlay = map.addOverlay(new ol.Overlay({
          position: pos,
          positioning: 'center-center',
          element: x
        }));
        newOverlays.push(overlay);
      });
      this.model.set('overlays', newOverlays);
    },
    favoritesChanged: function () {
      console.log('favorites changed');
      this.reRender();
    },
    mkNotification: function () {
      var nText = "Ladestation frei";
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      }

      // Let's check whether notification permissions have already been granted
      else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification("Hi there!");
      }

      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== "denied") {
        Notification.requestPermission(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            var notification = new Notification("Hi there!");
          }
        });
      }
    }

  });

  return SensorThings;
});
