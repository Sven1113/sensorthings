define([
    'underscore',
    'backbone',
    'models/wfsstyle',
    'config'
], function (_, Backbone, WFSStyle, Config) {

    var StyleList = Backbone.Collection.extend({
        model: WFSStyle,
        parse: function (response) {
            /* Erzeuge nur von denen einen WfsStyle
            *  von denen auch in der Config-Datei
            *  ein Nennung vorliegt und nicht von allen
            *  Einträgen in der json-Datei
            */
            var idArray = new Array ();
            _.each(Config.layerIDs, function (wfsconfelement) {
                if (_.isArray(wfsconfelement.id)) { //Gruppenlayer
                    _.each(wfsconfelement.id, function (childlayer) {
                        if (_.has(childlayer, 'style')) {
                            idArray.push(childlayer.style);
                            idArray.push(childlayer.style + '_cluster');
                        }
                    });
                }
                else {
                    if (_.has(wfsconfelement, 'style')) {
                        idArray.push(wfsconfelement.style);
                        idArray.push(wfsconfelement.style + '_cluster');
                    }
                }
            });
            return _.filter(response, function (element) {
                if (_.contains(idArray, element.layerId)) {
                    _.extend(element, {
                        id: _.uniqueId('style_')
                    });
                    return element;
                }
            });
        },
        url: Config.styleConf,
        initialize: function () {
            this.fetch({
                cache: false,
                async: false,
                error: function () {
                    alert('Fehler beim Laden der ' + Config.styleConf);
                },
                success: function (collection) {
//                    console.log(collection);
                }
            });
        },
        returnModelById: function(layerId) {
            return _.find(this.models, function (slmodel) {
                if (slmodel.attributes.layerId === layerId) {
                    return slmodel;
                }
            });
        },
        returnModelByValue: function(layerId, styleFieldValue) {
            return _.find(this.models, function (slmodel) {
                if (slmodel.attributes.layerId === layerId && slmodel.attributes.styleFieldValue === styleFieldValue) {
                    return slmodel;
                }
            });
        }
    });
    return new StyleList();
});