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
            }, this);
            this.render();
        },
        render: function () {
            this.$el.html(this.template({model: this.model}));
            $(".lgv-container").append(this.$el);

        },
        reRender: function () {
            this.$el.replaceWith(this.template({model: this.model}));
        },
        favoritesChanged: function () {
            console.log('favorites changed');
            this.reRender();
        }
    });

    return SensorThings;
});
