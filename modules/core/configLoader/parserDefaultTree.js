define([
    "modules/core/configLoader/parser"
], function () {

    var Parser = require("modules/core/configLoader/parser"),
        DefaultTreeParser;

    DefaultTreeParser = Parser.extend({

        /**
         *
         */
        parseTree: function (layerList) {
            // Im Default-Tree(FHH-Atlas / GeoOnline) werden nur WMS angezeigt
            // Und nur Layer die min. einem Metadatensatz zugeordnet sind
            layerList = this.filterList(layerList);
            // Entfernt alle Layer, die bereits im Cache dargestellt werden
            layerList = this.deleteLayersIncludeCache(layerList);
            // Für Layer mit mehr als 1 Datensatz, wird pro Datensatz 1 zusätzlichen Layer erzeugt
            layerList = this.createLayerPerDataset(layerList);

            this.parseLayerList(layerList);

        },

        /**
         * Filtert alle Objekte aus der layerList, die kein WMS sind und min. einem Datensatz zugordnet sind
         * @param  {Object[]} layerList - Objekte aus der services.json
         * @return {Object[]} layerList - Objekte aus der services.json
         */
        filterList: function (layerList) {
            return _.filter(layerList, function (element) {
                return (element.datasets.length > 0 && element.typ === "WMS") ;
            });
        },

        /**
         * Entfernt alle Layer, die bereits im Cache dargestellt werden.
         * @param  {Object[]} layerList - Objekte aus der services.json
         * @return {Object[]} layerList - Objekte aus der services.json
         */
        deleteLayersIncludeCache: function (layerList) {
            var cacheLayerMetaIDs = [],
                cacheLayer = _.where(layerList, {cache: true});

            _.each(cacheLayer, function (layer) {
                cacheLayerMetaIDs.push(layer.datasets[0].md_id);
            });

            return _.reject(layerList, function (element) {
                return _.contains(cacheLayerMetaIDs, element.datasets[0].md_id) && element.cache === false;
            });
        },

        /**
         * Holt sich aus der layerList alle Objekte die mehr als einen Datensatz haben
         * Erzeugt pro Datensatz einen neuen Layer
         * @param  {Object[]} layerList - Objekte aus der services.json
         * @return {Object[]} layerList - Objekte aus der services.json die genau einem Datensatz zugeordnet sind
         */
        createLayerPerDataset: function (layerList) {
            var layerListPerDataset = _.filter(layerList, function (element) {
                return element.datasets.length > 1;
            });

            _.each(layerListPerDataset, function (layer) {
                _.each(layer.datasets, function (ds, key) {
                    var newLayer = _.clone(layer);

                    newLayer.id = layer.id + "_" + key;
                    newLayer.datasets = [ds];
                    layerList.push(newLayer);
                });
            });
            return _.filter(layerList, function (element) {
                return element.datasets.length === 1;
            });
        },

        /**
         * Erzeugt den Themen Baum aus der von Rawlaylist geparsten Services.json
         */
        parseLayerList: function (layerList) {

            var baseLayerIds = _.flatten(_.pluck(this.getBaselayer().Layer, "id")),
                // Unterscheidung nach Overlay und Baselayer
                typeGroup = _.groupBy(layerList, function (layer) {
                    return (_.contains(baseLayerIds, layer.id)) ? "baselayers" : "overlays";
                });
            // Models für die Hintergrundkarten erzeugen
            this.createBaselayer(layerList);
            // Models für die Fachdaten erzeugen
            this.groupDefaultTreeOverlays(typeGroup.overlays);
        },

        createBaselayer: function (layerList) {
            _.each(this.getBaselayer().Layer, function (layer) {
                if (_.isArray(layer.id)) {
                    layer = _.extend(this.mergeObjectsByIds(layer.id, layerList), _.omit(layer, "id"));
                }
                else {
                    layer = _.extend(_.findWhere(layerList, {id: layer.id}), _.omit(layer, "id"));
                }
                this.addItem(_.extend({type: "layer", parentId: "Baselayer", level: 0, isVisibleInTree: "true"}, layer));
            }, this);
        },

        /**
         * unterteilung der nach metaName groupierten Layer in Ordner und Layer
         * wenn eine MetaNameGroup nur einen Eintrag hat soll sie
         * als Layer und nicht als Ordner hinzugefügt werden
        */
        splitIntoFolderAndLayer: function (metaNameGroups, name) {
            var folder = [],
                layer = [],
                categories = {};

            _.each(metaNameGroups, function (group, groupname) {
                // Wenn eine Gruppe mehr als einen Eintrag hat -> Ordner erstellen
                if (Object.keys(group).length > 1) {
                    folder.push({
                        name: groupname,
                        layer: group,
                        id: this.createUniqId(groupname)
                    });
                }
                else {
                    layer.push(group[0]);
                }
                categories.folder = folder;
                categories.layer = layer;
                categories.id = this.createUniqId(name);
                categories.name = name;
            }, this);
            return categories;
        },
        /**
         * Gruppiert die Layer nach Kategorie und MetaName
         * @param  {Object} overlays die Fachdaten als Object
         */
        groupDefaultTreeOverlays: function (overlays) {
            var tree = {},
                categoryGroups = _.groupBy(overlays, function (layer) {
                    // Gruppierung nach Opendatakategorie
                    if (this.get("category") === "Opendata") {
                        return layer.datasets[0].kategorie_opendata[0];
                    }
                    // Gruppierung nach Inspirekategorie
                    else if (this.get("category") === "Inspire") {
                        return layer.datasets[0].kategorie_inspire[0];
                    }
                    else if (this.get("category") === "Behörde") {
                        return layer.datasets[0].kategorie_organisation;
                    }
                }, this);
           // Gruppierung nach MetaName
            _.each(categoryGroups, function (group, name) {
                var metaNameGroups = _.groupBy(group, function (layer) {
                    return layer.datasets[0].md_name;
                });
                // in Layer und Ordner unterteilen
                tree[name] = this.splitIntoFolderAndLayer(metaNameGroups, name);
            }, this);
            this.createModelsForDefaultTree(tree);
        },

        /**
         * Erzeugt alle Models für den DefaultTree
         * @param  {Object} tree aus den categorien und MetaNamen erzeugter Baum
         */
        createModelsForDefaultTree: function (tree) {
            var sortedKeys = Object.keys(tree).sort(),
                sortedCategories = [];

            _.each(sortedKeys, function (key) {
                sortedCategories.push(tree[key]);
            });
            // Kategorien erzeugen
            this.addItems(sortedCategories, {type: "folder", parentId: "Overlayer", level: 0, isInThemen: true, isVisibleInTree: "true", glyphicon: "glyphicon-plus-sign"});
            _.each(tree, function (category) {
                // Unterordner erzeugen
                this.addItems(category.folder, {type: "folder", parentId: category.id, isLeafFolder: true, level: 1, isInThemen: true, glyphicon: "glyphicon-plus-sign"});
                _.each(category.layer, function (layer) {
                    layer.name = layer.datasets[0].md_name;
                });
                // Layer dirket in Kategorien
                this.addItems(category.layer, {type: "layer", parentId: category.id, level: 1});
                _.each(category.folder, function (folder) {
                    // Layer in der untertesten Ebene erzeugen
                    this.addItems(folder.layer, {type: "layer", parentId: folder.id, level: 2});
                }, this);
            }, this);
        }
    });

    return DefaultTreeParser;
});
