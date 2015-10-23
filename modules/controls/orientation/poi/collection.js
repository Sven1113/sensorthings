define([
    "backbone",
    "modules/controls/orientation/poi/feature/model",
    "eventbus",
    "config",
    "openlayers"
], function (Backbone, PointOfInterest, EventBus, Config, ol) {

    var PointOfInterestList = Backbone.Collection.extend({
        initialize: function () {
            EventBus.on("setModel", this.setModel, this);
        },
        comparator: "distance",
        setModel: function (clusterFeature, styleList, maxDist, newCenter, layer) {
            // Cluster-WFS
            if (clusterFeature.getProperties().features) {
            _.each(clusterFeature.getProperties().features, function (feature) {
                var name = feature.getProperties().name,
                    kategorie = feature.get(layer.attributes.styleField),
                    lineStringArray = [];

                lineStringArray.push(newCenter);
                var poiObject = feature.getGeometry().getCoordinates();

                if (poiObject.length === 3) {
                    poiObject.pop();
                }
                var xCoord = poiObject[0],
                    yCoord = poiObject[1];

                lineStringArray.push(poiObject);
                var lineString = new ol.geom.LineString(lineStringArray),
                    distance = Math.round(lineString.getLength()),
                    img;

                if (kategorie !== undefined) {
                    img = _.find(styleList.models, function (num) {
                        return num.attributes.styleFieldValue === kategorie;
                    });
                }
                else {
                    img = _.find(styleList.models, function (num) {
                        return num.attributes.layerId === layer.attributes.id;
                    });
                }
                if (distance <= maxDist && img) {
                    this.add(new PointOfInterest({
                        name: name,
                        kategorie: kategorie,
                        distance: distance,
                        img: img.get("imagepath") + img.get("imagename"),
                        xCoord: xCoord,
                        yCoord: yCoord
                    }));
                    }
            }, this);
            }
            // WFS ohne Cluster
            else {
                var feature = clusterFeature,
                    name = feature.getProperties().name,
                    lineStringArray = [];

                lineStringArray.push(newCenter);
                var poiObject = feature.getGeometry().getCoordinates();

                if (poiObject.length === 3) {
                    poiObject.pop();
                }
                var xCoord = poiObject[0],
                    yCoord = poiObject[1];

                lineStringArray.push(poiObject);
                var lineString = new ol.geom.LineString(lineStringArray),
                    distance = Math.round(lineString.getLength()),
                    img = _.find(styleList.models, function (num) {
                        return num.attributes.layerId == layer.attributes.id;
                    });

                if (distance <= maxDist) {
                    this.add(new PointOfInterest({
                        name: name,
                        distance: distance,
                        img: img.get("imagepath") + img.get("imagename"),
                        xCoord: xCoord,
                        yCoord: yCoord
                    }));
                }
            };
        },
        removeAllModels: function () {
            this.reset();
        }
    });

    return new PointOfInterestList();
});
