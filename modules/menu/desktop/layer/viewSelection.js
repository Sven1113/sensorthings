define([
    "backbone",
    "text!modules/menu/desktop/layer/templateSelection.html",
    "text!modules/menu/desktop/layer/templateSettings.html",
    "backbone.radio"
], function () {

    var Backbone = require("backbone"),
        Template = require("text!modules/menu/desktop/layer/templateSelection.html"),
        TemplateSettings = require("text!modules/menu/desktop/layer/templateSettings.html"),
        Radio = require("backbone.radio"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "layer-item list-group-item",
        template: _.template(Template),
        templateSettings: _.template(TemplateSettings),
        events: {
            "click .glyphicon-check, .title": "toggleIsVisibleInMap",
            "click .glyphicon-unchecked": "toggleIsVisibleInMap",
            "click .glyphicon-info-sign": "showLayerInformation",
            "click .glyphicon-remove-circle": "removeFromSelection",
            "click .glyphicon-cog": "toggleIsSettingVisible",
            "click .arrows > .glyphicon-arrow-up": "moveModelUp",
            "click .arrows > .glyphicon-arrow-down": "moveModelDown",
            "click .glyphicon-plus-sign": "incTransparency",
            "click .glyphicon-minus-sign": "decTransparency",
            "click .glyphicon-picture": "openStyleWMS"
        },
        initialize: function () {
             this.listenTo(this.model, {
                "change:isVisibleInMap": this.rerender,
                "change:isSettingVisible": this.renderSetting,
                "change:transparency": this.rerender,
                "change:isOutOfRange": this.toggleColor
            });
            this.render();
            this.toggleColor(this.model, this.model.getIsOutOfRange());
        },

        render: function () {
            var selector = $("ul#SelectedLayer"),
                attr = this.model.toJSON();

            selector.prepend(this.$el.html(this.template(attr)));
            if (this.model.getIsSettingVisible() === true) {
                this.$el.append(this.templateSettings(attr));
            }
        },
        rerender: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            if (this.model.getIsSettingVisible() === true) {
                this.$el.append(this.templateSettings(attr));
            }
        },

        /**
         * Zeichnet die Einstellungen (Transparenz, Metainfos, ...)
         */
        renderSetting: function () {
            var attr = this.model.toJSON();

            // Slide-Animation templateSetting
            if (this.model.getIsSettingVisible() === false) {
                // Animation Zahnrad
                this.$(".glyphicon-cog").toggleClass("rotate rotate-back");
                this.$el.find(".layer-settings").slideUp("slow", function () {
                    $(this).remove();
                });
            }
            else {
                this.$(".glyphicon-cog").toggleClass("rotate-back rotate");
                this.$el.append(this.templateSettings(attr));
                this.$el.find(".layer-settings").hide();
                this.$el.find(".layer-settings").slideDown();
            }
        },

        toggleIsSelected: function () {
            this.model.toggleIsSelected();
        },

        removeFromSelection: function () {
            this.model.setIsSettingVisible(false);
            this.model.setIsSelected(false);
            this.$el.remove();
        },

        toggleIsVisibleInMap: function () {
            this.model.toggleIsVisibleInMap();
        },

        showLayerInformation: function () {
            this.model.showLayerInformation();
            // Navigation wird geschlossen
            $("div.collapse.navbar-collapse").removeClass("in");
        },

        toggleIsSettingVisible: function () {
            this.model.toggleIsSettingVisible();
        },

        moveModelDown: function () {
            this.model.moveDown();
        },

        moveModelUp: function () {
            this.model.moveUp();
        },
        incTransparency: function () {
            this.model.incTransparency(10);
        },
        decTransparency: function () {
            this.model.decTransparency(10);
        },
        openStyleWMS: function () {
            Radio.trigger("StyleWMS", "openStyleWMS", this.model);
            $(".nav li:first-child").removeClass("open");
        },
       /**
         * Wenn der Layer außerhalb seines Maßstabsberreich ist, wenn die view ausgegraut und nicht anklickbar
         */
        toggleColor: function (model, value) {
            if (model.has("minScale") === true) {
                if (value === true) {
                    this.$el.addClass("disabled");
                    this.$el.find("*").css("pointer-events","none");
                    this.$el.find("*").css("cursor","not-allowed");
                    this.$el.attr("title","Layer wird in dieser Zoomstufe nicht angezeigt");
                }
                else {
                    this.$el.removeClass("disabled");
                    this.$el.find("*").css("pointer-events","auto");
                    this.$el.find("*").css("cursor","pointer");
                    this.$el.attr("title","");
                }
            }
        }
    });

    return LayerView;
});
