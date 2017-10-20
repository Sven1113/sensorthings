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
        "modules/alerting/view"
    ], function ($, Config, Util, RawLayerList, RestReaderList, Preparser, Map, ParametricURL, CRS, Autostarter, Alerting) {

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

                or.getOrientation();
            });
        });


        Radio.trigger("Util", "hideLoader");
    });
