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
                    if (initialLoad) {
                        var centerPosition = proj4(proj4("EPSG:4326"), proj4(Config.view.epsg), position);
                        $.ajax("https://51.5.242.162/itsLGVhackathon/v1.0/Things?" +
                            "$expand=Locations,Datastreams/Observations&" +
                            "$top=100&" +
                            "$filter=geo.distance(Locations/location, geography'POINT ("
                            + position[0] + " " + position[1] + ")') lt 0.018",
                            {
                                success: function (data) {
                                    console.log(data);
                                    Radio.trigger("sensorthings", "addData", data.value);
                                    Radio.trigger("sensorthings", "notify", {});
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

        Radio.trigger("Util", "hideLoader");
    });
