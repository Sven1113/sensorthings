define(function (require) {

var SnippetModel = require("modules/Snippets/model"),
    DropdownModel = SnippetModel.extend({
    defaults: _.extend({}, SnippetModel.prototype.defaults, {}),
    initialize: function () {
        this.superInitialize();
    },

    /**
     * set the dropdown value(s)
     * @param  {string[]} value
     */
    setValues: function (value) {
        this.set("values", value);
    },

    /**
     * get the dropdown value(s)
     * @return {string[]}
     */
    getValues: function () {
        return this.get("values");
    },
    setSelectedValues: function (snippetValues) {
        _.each(this.get("valuesCollection").models, function (valueModel) {
            if (_.contains(snippetValues, valueModel.get("value"))) {
                valueModel.set("isSelected", true);
            }
            else {
                valueModel.set("isSelected", false);
            }
        });
        this.trigger("valuesChanged");
    }
});

    return DropdownModel;
});
