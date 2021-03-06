define(function (require){
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        ExtendedFilter;

    ExtendedFilter = Backbone.Model.extend({
        defaults:{
            currentContent:{
                step: 1,
                name: "Bitte wählen Sie die Filteroption",
                layername: undefined,
                filtername: undefined,
                attribute: undefined,
                options: ["Neuen Filter erstellen"]
            },
            wfsList: [],
            currentFilterType: "Neuen Filter erstellen",
            currentFilters:[],
            ignoredKeys : Config.ignoredKeys,
            filterCounter: 1
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.checkStatus
            });
        },
        getDefaultContent: function () {
            return this.get("defaultContent");
        },
        getCurrentContent: function () {
            return this.get("currentContent");
        },
        setCurrentContent: function (val) {
            this.set("currentContent", val);
        },
        getCurrentFilterType: function () {
            return this.get("currentFilterType");
        },
        setCurrentFilterType: function (val) {
            this.set("currentFilterType", val);
        },
        getCurrentFilters: function () {
            return this.get("currentFilters");
        },
        setCurrentFilters: function (val) {
            this.set("currentFilters", val);
        },
        getFilterCounter: function () {
            return this.get("filterCounter");
        },
        setFilterCounter: function (val) {
            this.set("filterCounter", val);
        },
        getWfsList: function () {
            return this.get("wfsList");
        },
        setWfsList: function (val) {
            return this.set("wfsList", val);
        },
        checkStatus: function (args) {   // Fenstermanagement
            if (args[2].getId() === "extendedFilter") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        getLayers: function () {
            var layers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
                featureLayers = _.filter(layers, function (layer) {
                    return layer.get("layer").getSource().getFeatures().length > 0;
                }),
                filterLayers = _.filter(featureLayers, function (layer) {
                    return layer.get("extendedFilter");
                }),
                wfsList = [],
                attributes = [],
                attributes_with_values = [],
                values = [];

            _.each (filterLayers, function (layer) {
                _.each(layer.get("layer").getSource().getFeatures() [0].getKeys(), function(key){
                    if (!_.contains(this.get("ignoredKeys"),key.toUpperCase())) {
                        attributes.push(key);
                    }
                },this);
                _.each(attributes, function (attr) {
                    _.each(layer.get("layer").getSource().getFeatures(), function(feature){
                        values.push(feature.get(attr));
                    });
                    attributes_with_values.push({
                        attr : attr,
                        values : _.uniq(values)
                    });
                    values=[];
                });
                wfsList.push({
                    id: layer.id,
                    name: layer.get("name"),
                    layer: layer.get("layer"),
                    attributes: attributes_with_values
                });
                attributes = [];
                attributes_with_values = [];

            },this);
            this.set("wfsList", wfsList);
        },

        previousStep: function () {
            var currentContent = this.getCurrentContent(),
                step = currentContent.step,
                layername = currentContent.layername,
                currentFilterType = this.getCurrentFilterType(),
                content;

            if(step === 2){
                content = this.getDefaultContent();

            }
            else if (step === 3){
                step = step-2;
                content = this.step2(currentFilterType,step);
            }
            else if (step === 4){
                step = step-2;

                content = this.step3(layername,step);
            }
            this.setCurrentContent(content);
        },
        removeAttrFromFilter: function (evt) {
            var id = evt.currentTarget.id,
                filtername = id.split("__")[0],
                attr = id.split("__")[1],
                val = id.split("__")[2],
                currentFilters = this.getCurrentFilters(),
                filterToUpdate,
                attributesArray;

            for (var i=currentFilters.length-1; i>=0; i--) {
                if (currentFilters[i].layername === filtername) {
                    filterToUpdate = currentFilters.splice(i, 1)[0];
                    break;
                }
            }

            attributesArray = filterToUpdate.attributes;

            for (var i=attributesArray.length-1; i>=0; i--) {
                if (attributesArray[i].attribute === attr && attributesArray[i].value === val) {
                    attributesArray.splice(i, 1)[0];
                    break;
                }
            }
            if(attributesArray.length === 0){
                var counter = this.getFilterCounter();

                counter--;
                this.setFilterCounter(counter);
            }
            else{
                currentFilters.push({
                    layername: filtername,
                    attributes: attributesArray
                });
            }
            this.setCurrentFilters(currentFilters);

            if(currentFilters.length === 0){
                var content = this.getDefaultContent();

                content.options = ["Neuen Filter erstellen"];
                this.setCurrentContent(content);
            }

            this.filterLayers();
        },

        nextStep: function(evt) {
            var id = evt.currentTarget.id,
                val = $("#"+id).val(),
                currentContent = this.getCurrentContent(),
                step = currentContent.step,
                newContent;

            if(step === 1){ //Layer wählen oder Filter wählen
                newContent = this.step2(val, step);
            }
            else if (step === 2){ //Attribut wählen
                newContent = this.step3(val, step);
            }
            else if (step === 3){ //Wert wählen
                newContent = this.step4(val, step, currentContent.layername,currentContent.filtername);
            }
            else if (step === 4){ //auf default zurücksetzen
                newContent = this.getDefaultContent();
                this.setFilter(val, currentContent.layername ,currentContent.attribute,currentContent.filtername);
                this.filterLayers();
            }

            this.setCurrentContent(newContent);
        },

        getDefaultContent: function () {
            var content;

            content = {step: 1,
                       name: "Bitte wählen Sie die Filteroption",
                       layername: undefined,
                       filtername: undefined,
                       attribute: undefined,
                       options: ["Neuen Filter erstellen","Bestehenden Filter verfeinern"]
                      }
            return content;
        },

        step2: function (val, step) {
            var content,
                newStep = step,
                wfsList,
                options = [],
                currentFilters = [];

            newStep++;
            if(val === "Neuen Filter erstellen"){
                this.setCurrentFilterType("Neuen Filter erstellen");
                this.getLayers();
                wfsList = this.getWfsList();
                _.each(wfsList,function(layer){
                    options.push(layer.name);
                });
                content = {step: newStep,
                          name: "Bitte wählen Sie einen Layer",
                          layername: undefined,
                          attribute: undefined,
                          options: options}
            }
            else { //Filter erweitern
                this.setCurrentFilterType("Bestehenden Filter verfeinern");
                currentFilters = this.getCurrentFilters();
                _.each(currentFilters,function(filter){
                    options.push(filter.layername)
                });
                content = {step: newStep,
                          name: "Bitte wählen Sie einen Filter zum Verfeinern",
                          layername: undefined,
                          attribute: undefined,
                          options: options}

            }
            return content;
        },

        step3: function (val, step) {
            var content,
                newStep = step,
                wfsList = this.getWfsList(),
                options = [],
                layer;

            newStep++;
            this.getLayers();

            if(val.split(" ")[0] !== "Filter"){
                this.setCurrentFilterType("Neuen Filter erstellen");
                layer = _.findWhere(wfsList,{name : val});
            }
            else{
                this.setCurrentFilterType("Bestehenden Filter verfeinern");
                layer = _.findWhere(wfsList,{name : val.split(" ")[2]});

            }

            _.each(layer.attributes, function(attribute) {
                options.push(attribute.attr);
            });
            content = {step: newStep,
                        name: "Bitte wählen Sie ein Attribut",
                        layername: layer.name,
                        filtername: val,
                        attribute: undefined,
                        options: options};

            return content;
        },

        step4: function (val, step, layername, filtername) {
            var content,
                newStep = step,
                wfsList = this.getWfsList(),
                options = [],
                layer,
                attribute;

            newStep++;
            this.getLayers();
            layer = _.findWhere(wfsList,{name : layername});
            attribute = _.findWhere(layer.attributes,{attr: val});

            _.each(attribute.values,function(value){
                options.push(value);
            });
            content = {step: newStep,
                        name: "Bitte wählen Sie einen Wert",
                        layername: layer.name,
                        filtername: filtername,
                        attribute: val,
                        options: options}

            return content;
        },

        setFilter: function (val,layername, attribute, filtername) {
            var currentFilters = this.getCurrentFilters(),
                filterToUpdate,
                currentFilterType = this.getCurrentFilterType(),
                filtercounter = this.getFilterCounter(),
                attributesArray = [];

            if(currentFilterType === "Neuen Filter erstellen"){
                attributesArray = [];
                attributesArray.push({attribute:attribute,
                                     value: val});

                currentFilters.push({
                    layername:"Filter" + " " + filtercounter + " " + layername,
                    attributes: attributesArray
                });

                filtercounter++;
            }
            else {
                for (var i=currentFilters.length-1; i>=0; i--) {
                    if (currentFilters[i].layername === filtername) {
                        filterToUpdate = currentFilters.splice(i, 1)[0];
                        break;
                    }
                }

                attributesArray = filterToUpdate.attributes;
                attributesArray.push({attribute:attribute,
                                     value: val});

                currentFilters.push({
                    layername: filtername,
                    attributes: attributesArray
                });
            }
            this.setFilterCounter(filtercounter);
            this.setCurrentFilters(currentFilters);
            this.filterLayers();
        },

        filterLayers: function () {
            var currentFilters =  this.getCurrentFilters(),
                layers = this.getWfsList(),
                layer,
                features;

            _.each(layers,function(wfslayer){
                layer = wfslayer.layer;
                features = layer.getSource().getFeatures();

                if (layer.getStyle()) {
                    layer.defaultStyle = layer.getStyle();
                    layer.setStyle(null);
                }


                features.forEach(function(feature){
                    var featuredarstellen2 = true,
                        preVal2 = false;

                    _.each(currentFilters, function (filter){
                        var featuredarstellen = true,
                        preVal = true;

                        if(filter.layername.split(" ")[2] === wfslayer.name){
                            _.each(filter.attributes, function (attribute){
                                featuredarstellen = this.checkFeatureForFilter(feature, attribute);
                                if(preVal === true && featuredarstellen === true){
                                    featuredarstellen = true;
                                    preVal = true;
                                }
                                else{
                                    featuredarstellen = false;
                                    preVal = false;
                                }
                            }, this);

                            if(preVal2 === true || featuredarstellen === true){
                                featuredarstellen2 = true;
                                preVal2 = true;
                            }
                            else{
                                featuredarstellen2 = false;
                                preVal2 = false;
                            }
                        }
                    } ,this);

                    if (featuredarstellen2 === true) {
                        if (feature.defaultStyle) {
                            feature.setStyle(feature.defaultStyle);
                            delete feature.defaultStyle;
                        }
                        else {
                            feature.setStyle(layer.defaultStyle);
                        }
                    }
                    else if (featuredarstellen2 === false) {
                        feature.setStyle(null);
                    }
                }, this);

            }, this);

        },

        checkFeatureForFilter: function(feature, attr){
            var featuredarstellen = true,
                attributname = attr.attribute,
                attributvalue = attr.value,
                featurevalue0,
                featurevalue;

            var featureattribute = _.pick(feature.getProperties(), attributname);

            if (featureattribute && !_.isNull(featureattribute)) {
                featurevalue0 = _.values(featureattribute)[0];
                if (featurevalue0) {
                    featurevalue = featurevalue0.trim();
                    if (featurevalue !== attributvalue) {
                        featuredarstellen = false;
                    }
                }
            }
            return featuredarstellen;
        }
    });
    return ExtendedFilter;
});
