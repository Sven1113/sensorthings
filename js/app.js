define("app",
    [
        "jquery",
        "config",
        "modules/core/util",
        "modules/core/rawLayerList",
        "modules/restReader/collection",
        "modules/core/configLoader/preparser",
        "modules/core/map",
        "modules/core/parametricURL",
        "modules/core/crs",
        "modules/core/autostarter",
        "modules/alerting/view",
        "proj4"
    ], function ($, Config, Util, RawLayerList, RestReaderList, Preparser, Map, ParametricURL, CRS, Autostarter, Alerting, proj4) {

        // Core laden
        // new Autostarter();
        new Util();
        new RawLayerList();
        new ParametricURL();
        new Preparser();
        new CRS();
        new Map();

        require(["modules/sensorthings/view"], function (SensorThings) {
            new SensorThings();
        });

        require(["modules/controls/view"], function (Controls) {
            var Ctl = new Controls();

            var row = Ctl.addRow("orientation");

            require(["modules/controls/orientation/view"], function (Orientation) {
                var or = new Orientation({ el: row });
                var initialLoad = true;

                or.getOrientation();
                Radio.on("geolocation", "position", function (position) {
                    console.log(position);
                    if (initialLoad) {
                        var centerPosition = proj4(proj4("EPSG:4326"), proj4(Config.view.epsg), position);
                        $.ajax("https://51.5.242.162/itsLGVhackathon/v1.0/Things?$expand=Locations&$filter=geo.distance(Locations/location, geography'POINT ("
                            + position[0] + " " + position[1] + ")') lt 0.018",
                            {
                                success: function (data) {
                                    var map = Radio.request("Map", "getMap");
                                    _.forEach(data.value, function (thing) {
                                        var x = document.createElement("div");
                                        x.setAttribute("class", "marker");
                                        var xy = thing.Locations[0].location.geometry.coordinates;
                                        var pos = proj4(proj4("EPSG:4326"), proj4(Config.view.epsg), xy);
                                        map.addOverlay(new ol.Overlay({
                                            position: pos,
                                            positioning: 'center-center',
                                            element: x
                                        }));


                                        // Vienna marker
                                        // var marker = new ol.Overlay({
                                        //     position: pos,
                                        //     positioning: 'center-center',
                                        //     element: document.getElementById('marker'),
                                        //     stopEvent: false
                                        // });
                                        // map.addOverlay(marker);
                                        //
                                        // // Vienna label
                                        // var vienna = new ol.Overlay({
                                        //     position: pos,
                                        //     positioning: 'center-center',
                                        //     element: document.getElementById('vienna')
                                        // });
                                        // map.addOverlay(vienna);


                                    });
                                    console.log(data);
                                },
                                xhrFields: {
                                    withCredentials: false
                                }
                            }
                        );

                        Radio.trigger("MapView", "setCenter", centerPosition, 6);
                        initialLoad = false;
                    }
                });
            });
        });

        // http://51.5.242.162/itsLGVhackathon/v1.0/Things?$expand=Locations&$filter=geo.distance(Locations/location, geography'POINT (9.9879648 53.5481662)') lt 0.018
        Radio.trigger("Util", "hideLoader");
    });
