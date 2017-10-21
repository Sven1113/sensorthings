define(function (require) {
  var SensorThings = Backbone.Model.extend({
    defaults: {
      favorites: []
    },
    initialize: function () {
      var channel = Radio.channel("sensorthings");

      channel.on({
        "toggleFavorite": this.toggleFavorite,
      }, this);
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

      this.set()
    }
  });
  return SensorThings;
});
