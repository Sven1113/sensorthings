define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        MapView = require("modules/core/mapView"),
        Map;

     Map = Backbone.Model.extend({

        /**
         *
         */
        defaults: {
            initalLoading: 0
        },

        /**
        *
        */
        initialize: function () {
            this.listenTo(this, "change:initalLoading", this.initalLoadingChanged);
            var channel = Radio.channel("Map"),
                mapView = new MapView(),
                mapHeight;

            channel.reply({
                "getLayers": this.getLayers,
                "getWGS84MapSizeBBOX": this.getWGS84MapSizeBBOX,
                "createLayerIfNotExists": this.createLayerIfNotExists,
                "getEventPixel": this.getEventPixel,
                "hasFeatureAtPixel": this.hasFeatureAtPixel,
                "getSize": this.getSize,
                "getPixelFromCoordinate": this.getPixelFromCoordinate,
                "getMap": this.getMap
            }, this);

            channel.on({
                "addLayer": this.addLayer,
                "addLayerToIndex": this.addLayerToIndex,
                "addOverlay": this.addOverlay,
                "addInteraction": this.addInteraction,
                "addControl": this.addControl,
                "removeLayer": this.removeLayer,
                "removeOverlay": this.removeOverlay,
                "removeInteraction": this.removeInteraction,
                "setBBox": this.setBBox,
                "render": this.render,
                "zoomToExtent": this.zoomToExtent,
                "zoomToFilteredFeatures": this.zoomToFilteredFeatures,
                "createVectorLayer": this.createVectorLayer,
                "addLoadingLayer": this.addLoadingLayer,
                "removeLoadingLayer": this.removeLoadingLayer,
                "registerListener": this.registerListener,
                "unregisterListener": this.unregisterListener,
                "forEachFeatureAtPixel": this.forEachFeatureAtPixel,
                "updateSize": function () {
                    this.getMap().updateSize();
                }
            }, this);

            this.listenTo(this, {
                "change:vectorLayer": function (model, value) {
                    this.addLayerToIndex([value, 0]);
                }
            });

            this.set("view", mapView.get("view"));

            this.set("map", new ol.Map({
                logo: null,
                renderer: "canvas",
                target: "map",
                view: this.get("view"),
                controls: [],
                interactions: ol.interaction.defaults({altShiftDragRotate: false, pinchRotate: false})
            }));

            Radio.trigger("zoomtofeature", "zoomtoid");
            Radio.trigger("ModelList", "addInitialyNeededModels");

            mapHeight = $(".lgv-container").height() - $("#main-nav").height();
            $("#map").css("height", mapHeight + "px");
            this.stopMouseMoveEvent();
        },

        /**
         * Findet einen Layer über seinen Namen und gibt ihn zurück
         * @param  {string} layerName - Name des Layers
         * @return {ol.layer}
         */
        getLayerByName: function (layerName) {
            var layers = this.get("map").getLayers().getArray(),
                layer = _.find(layers, function (layer) {
                    return layer.get("name") === layerName;
                });

            return layer;
        },

        /**
         * Erstellt einen Vectorlayer
         * @param {string} layerName - Name des Vectorlayers
         */
        createVectorLayer: function (layerName) {
            var layer = new ol.layer.Vector({
                source: new ol.source.Vector({useSpatialIndex: false}),
                alwaysOnTop: true,
                name: layerName
            });

            this.setVectorLayer(layer);
        },

        setVectorLayer: function (value) {
            this.set("vectorLayer", value);
        },

        getVectorLayer: function () {
            return this.get("vectorLayer");
        },

        getLayers: function () {
            return this.get("map").getLayers();
        },

        render: function () {
            this.get("map").render();
        },

        setBBox: function (bbox) {
            this.set("bbox", bbox);
            this.BBoxToMap(this.get("bbox"));
        },
        BBoxToMap: function (bbox) {
            if (bbox) {
                this.get("view").fit(bbox, this.get("map").getSize());
            }
        },

        getWGS84MapSizeBBOX: function () {
            var bbox = this.get("view").calculateExtent(this.get("map").getSize()),
                firstCoord = [bbox[0], bbox[1]],
                secondCoord = [bbox[2], bbox[3]],
                firstCoordTransform = Radio.request("CRS", "transform", {fromCRS: "EPSG:25832", toCRS: "EPSG:4326", point: firstCoord}),
                secondCoordTransform = Radio.request("CRS", "transform", {fromCRS: "EPSG:25832", toCRS: "EPSG:4326", point: secondCoord});

            return [firstCoordTransform[0], firstCoordTransform[1], secondCoordTransform[0], secondCoordTransform[1]];
        },

        getMap: function () {
            return this.get("map");
        },

        /**
         * Registriert Listener für bestimmte Events auf der Karte
         * Siehe http://openlayers.org/en/latest/apidoc/ol.Map.html
         * @param {String} event - Der Eventtyp
         * @param {Function} callback - Die Callback Funktion
         * @param {Object} context
         */
        registerListener: function (event, callback, context) {
            this.getMap().on(event, callback, context);
        },

        /**
         * Meldet Listener auf bestimmte Events ab
         * @param {String} event - Der Eventtyp
         * @param {Function} callback - Die Callback Funktion
         * @param {Object} context
         */
        unregisterListener: function (event, callback, context) {
            this.getMap().un(event, callback, context);
        },

        /**
         * Gibt die Kartenpixelposition für ein Browser-Event relative zum Viewport zurück
         * @param  {Event} evt - Mouse Events | Keyboard Events | ...
         * @return {ol.Pixel}
         */
        getEventPixel: function (evt) {
            return this.getMap().getEventPixel(evt);
        },

        /**
         * Gibt die Pixelposition im Viewport zu einer Koordinate zurück
         * @param  {ol.Coordinate} value
         * @return {ol.Pixel}
         */
        getPixelFromCoordinate: function (value) {
            return this.getMap().getPixelFromCoordinate(value);
        },

        /**
         * Ermittelt ob Features ein Pixel im Viewport schneiden
         * @param  {ol.Pixel} pixel
         * @return {Boolean}
         */
        hasFeatureAtPixel: function (pixel) {
            return this.getMap().hasFeatureAtPixel(pixel);
        },

        /**
         * Iteriert über alle Features, die ein Pixel auf dem Viewport schneiden
         * @param  {ol.Pixel} pixel
         * @param  {Function} callback - Die Feature Callback Funktion
         */
        forEachFeatureAtPixel: function (pixel, callback) {
            this.getMap().forEachFeatureAtPixel(pixel, callback);
        },

        /**
        * Interaction-Handling
        */
        addInteraction: function (interaction) {
            this.get("map").addInteraction(interaction);
        },
        removeInteraction: function (interaction) {
            this.get("map").removeInteraction(interaction);
        },
        /**
        * Overlay-Handling
        */
        addOverlay: function (overlay) {
            this.get("map").addOverlay(overlay);
        },
        /**
        */
        removeOverlay: function (overlay) {
            this.get("map").removeOverlay(overlay);
        },
        /**
        * Control-Handling
        */
        addControl: function (control) {
            this.get("map").addControl(control);
        },
        removeControl: function (control) {
            this.get("map").removeControl(control);
        },
        /**
        * Layer-Handling
        */
        addLayer: function (layer) {
            var layerList,
                firstVectorLayer,
                index;

            // Alle Layer
            layerList = this.get("map").getLayers().getArray();
            // der erste Vectorlayer in der Liste
            firstVectorLayer = _.find(layerList, function (layer) {
                return layer instanceof ol.layer.Vector;
            });
            // Index vom ersten VectorLayer in der Layerlist
            index = _.indexOf(layerList, firstVectorLayer);
            if (index !== -1 && _.has(firstVectorLayer, "id") === false) {
                // Füge den Layer vor dem ersten Vectorlayer hinzu. --> damit bleiben die Vectorlayer(Messen, Zeichnen,...) immer oben auf der Karte
                this.get("map").getLayers().insertAt(index, layer);
            }
            else {
                this.get("map").getLayers().push(layer);
            }
        },

        /**
        */
        removeLayer: function (layer) {
            this.get("map").removeLayer(layer);
        },

        /**
         * Bewegt den Layer auf der Karte an die vorhergesehene Position
         * @param {Array} args - [0] = Layer, [1] = Index
         */
         addLayerToIndex: function (args) {
            var layer = args[0],
                index = args[1],
                layersCollection = this.get("map").getLayers();

            layersCollection.remove(layer);
            layersCollection.insertAt(index, layer);
            this.setImportDrawMeasureLayersOnTop(layersCollection);

            // Laden des Layers überwachen
            if (layer instanceof ol.layer.Group) {
                layer.getLayers().forEach(function (singleLayer) {
                    singleLayer.getSource().on("wmsloadend", function () {
                        Radio.trigger("Map", "removeLoadingLayer");
                    });
                    singleLayer.getSource().on("wmsloadstart", function () {
                        Radio.trigger("Map", "addLoadingLayer");
                    });
                });
            }
            else {
                layer.getSource().on("wmsloadend", function () {
                    Radio.trigger("Map", "removeLoadingLayer");
                });
                layer.getSource().on("wmsloadstart", function () {
                    Radio.trigger("Map", "addLoadingLayer");
                });
            }
        },

        // verschiebt die layer nach oben, die alwaysOnTop=true haben (measure, import/draw)
        setImportDrawMeasureLayersOnTop: function (layers) {
            var layersOnTop = _.filter(layers.getArray(), function (layer) {
                return layer.get("alwaysOnTop") === true;
            });

            _.each(layersOnTop, function (layer) {
                layers.remove(layer);
                layers.push(layer);
            });
        },

        zoomToExtent: function (extent, options) {
            this.get("view").fit(extent, this.get("map").getSize(), options);
        },

        zoomToFilteredFeatures: function (ids, layerId) {
            var extent,
                features,
                layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId, type: "layer"}),
                layerFeatures = [];

            if (!_.isUndefined(layer) && !_.isUndefined(layer.get("layer").getSource())) {
                layerFeatures = layer.get("layer").getSource().getFeatures();
            }
            features = _.filter(layerFeatures, function (feature) {
                return _.contains(ids, feature.getId());
            });
            if (features.length > 0) {
                extent = this.calculateExtent(features);
                this.zoomToExtent(extent);
            }
        },
        calculateExtent: function (features) {
            // extent = [xMin, yMin, xMax, yMax]
            var extent = [9999999, 9999999, 0, 0];

            _.each(features, function (feature) {
                var featureExtent = feature.getGeometry().getExtent();

                if (feature.getId() === "APP_STAATLICHE_SCHULEN_4099") {
                    return;
                }
                (featureExtent[0] < extent[0]) && (extent[0] = featureExtent[0]);
                (featureExtent[1] < extent[1]) && (extent[1] = featureExtent[1]);
                (featureExtent[2] > extent[2]) && (extent[2] = featureExtent[2]);
                (featureExtent[3] > extent[3]) && (extent[3] = featureExtent[3]);
            });
            return extent;
        },
        /**
         * Gibt die Größe in Pixel der Karte zurück.
         * @return {ol.Size} - Ein Array mit zwei Zahlen [width, height]
         */
        getSize: function () {
            return this.getMap().getSize();
        },

        addLoadingLayer: function () {
            this.set("initalLoading", this.get("initalLoading") + 1);
        },
        removeLoadingLayer: function () {
            this.set("initalLoading", this.get("initalLoading") - 1);
        },
        /**
         * Initiales Laden. "initalLoading" wird layerübergreifend hochgezählt, wenn mehrere Tiles abgefragt werden und wieder heruntergezählt, wenn die Tiles geladen wurden.
         * Listener wird anschließend gestoppt, damit nur beim initialen Laden der Loader angezeigt wird - nicht bei zoom/pan
         */
        initalLoadingChanged: function () {
            var num = this.get("initalLoading");

            if (num > 0) {
                Radio.trigger("Util", "showLoader");
            }
            else if (num === 0) {
                Radio.trigger("Util", "hideLoader");
                this.stopListening(this, "change:initalLoading");
            }
        },
        // Prüft ob der Layer mit dem Namen "Name" schon existiert und verwendet ihn, wenn nicht, erstellt er neuen Layer
        createLayerIfNotExists: function (name) {
            var layers = this.getLayers(),
                found = false,
                resultLayer = {};

            _.each(layers.getArray(), function (layer) {
                if (layer.get("name") === name) {
                    found = true;
                    resultLayer = layer;
                }
            }, this);

            if (!found) {
                var source = new ol.source.Vector({useSpatialIndex: false}),
                    layer = new ol.layer.Vector({
                    name: name,
                    source: source,
                    alwaysOnTop: true
                });

                resultLayer = layer;
                Radio.trigger("Map", "addLayerToIndex", [layer, layers.getArray().length]);
            }
            return resultLayer;
        },
        /**
         * Der ol-overlaycontainer-stopevent Container stoppt nicht jedes Event.
         * Unter anderem das Mousemove Event. Das übernimmt diese Methode.
         *
         * @see {@link https://github.com/openlayers/openlayers/issues/4953}
         */
        stopMouseMoveEvent: function () {
            // Firefox & Safari.
            $(".ol-overlaycontainer-stopevent").on("mousemove", function (evt) {
                evt.stopPropagation();
            });
            $(".ol-overlaycontainer-stopevent").on("touchmove", function (evt) {
                evt.stopPropagation();
            });
            $(".ol-overlaycontainer-stopevent").on("pointermove", function (evt) {
                evt.stopPropagation();
            });
        }
    });

    return Map;
});
