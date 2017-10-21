define(function (require) {

  var Model = require("modules/sensorthings/model");
  var Template = require("text!modules/sensorthings/template.html");

  SensorThings = Backbone.View.extend({
    model: new Model(),
    template: _.template(Template),
    className: "sensorthings",
    initialize: function () {
      this.listenTo(this.model, {
        "change:favorites": this.favoritesChanged,
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
    favoritesChanged: function () {
      console.log('favorites changed');
      this.reRender();
    }
  });

  return SensorThings;
});
