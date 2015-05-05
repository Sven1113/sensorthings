define([
    "jquery",
    "underscore",
    "backbone",
    "text!modules/layer/Layer.html",
    "eventbus"
], function ($, _, Backbone, LayerTemplate, EventBus) {

    var LayerView = Backbone.View.extend({
        className : "list-group-item",
        tagName: "li",
        template: _.template(LayerTemplate),
        initialize: function () {
            this.listenTo(this.model, "change:visibility", this.render);
            this.listenTo(this.model, "change:transparence", this.render);
            this.listenTo(this.model, "change:settings", this.render);
            this.listenTo(this.model, "change:isInScaleRange", this.toggleStyle);
        },
        events: {
            "click .plus": "upTransparence",
            "click .minus": "downTransparence",
            "click .info": "getMetadata",
            "click .check, .unchecked, .layer-name": "toggleVisibility",
            "click .up": "moveModelUp",
            "click .down": "moveModelDown",
            "click .refresh": "toggleSettings"
        },
        moveModelUp: function () {
            this.model.moveUp();
        },
        moveModelDown: function () {
            this.model.moveDown();
        },
        upTransparence: function () {
            this.model.setUpTransparence(10);
        },
        downTransparence: function () {
            this.model.setDownTransparence(10);
        },
        toggleVisibility: function () {
            this.model.toggleVisibility();
        },
        getMetadata: function () {
            this.model.openMetadata();
            // if (locations.fhhnet) {
            //     window.open("http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + this.model.get("metaID"), "_blank");
            // }
            // else {
            //     window.open("http://metaver.de/trefferanzeige?docuuid=" + this.model.get("metaID"), "_blank");
            // }
        },
        toggleSettings: function () {
            this.model.toggleSettings();
        },
        toggleStyle: function () {
            if (this.model.get("isInScaleRange") === true) {
                this.$el.css("color", "#333333");
            }
            else {
                this.$el.css("color", "#cdcdcd");
            }
        },
        render: function () {
            if (this.model.get("displayInTree") !== false) {
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));
                return this;
            }else {
                return "";
            }
        }
    });

    return LayerView;
});