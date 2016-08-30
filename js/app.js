define("app",
    [
    "jquery",
    "config",
    "modules/core/util",
    "modules/core/rawLayerList",
    "modules/restReader/collection",
    "modules/core/configLoader/preparser",
    "modules/core/map",
    "modules/core/parametricURL"
    ], function ($, Config, Util, RawLayerList, RestReaderList, Preparser, Map, ParametricURL) {

    // Core laden
    new RawLayerList();
    new Preparser();
    new ParametricURL();
    new Map();

    // Module laden
    require(["modules/menu/menuLoader"], function (MenuLoader) {
        new MenuLoader();
    });
    require(["modules/alerting/view"]);
    new RestReaderList();

    if (Config.allowParametricURL && Config.allowParametricURL === true && Config.zoomtofeature) {
        require(["modules/zoomtofeature/model"], function (ZoomToFeature) {
            new ZoomToFeature();
        });
    }

    // load customModules from config
    if (Config.customModules) {
        _.each(Config.customModules, function (element) {
            require([element], function (CustomModule) {
                new CustomModule();
            });
         });
    }

    // Macht noch Probleme
    // if (Config.attributions && Config.attributions === true) {
    //     require(["modules/attribution/view"], function (AttView) {
    //         new AttView();
    //     });
    // }

    if (Config.geoAPI && Config.geoAPI === true) {
        require(["geoapi"], function () {
        });
    }

    require([
        "config",
        "backbone.radio"
    ], function (Config, Radio) {

        if (Util.isAny()) {
            require(["modules/layerinformation/viewMobile"], function (MobileLayerInformationView) {
                new MobileLayerInformationView();
            });
        }
        else {
            require(["modules/layerinformation/view"], function (LayerInformationView) {
                new LayerInformationView();
            });
        }

        if (Config.footer && Config.footer.visibility === true) {
            require(["modules/footer/view"], function (FooterView) {
                new FooterView();
            });
        }

        if (typeof (Config.clickCounter) === "object" && Config.clickCounter.version !== "") {
            require(["modules/ClickCounter/view"], function (ClickCounterView) {
                new ClickCounterView();
            });
        }

        if (Config.mouseHover && Config.mouseHover === true) {
            require(["modules/mouseHover/view"], function (MouseHoverPopupView) {
                new MouseHoverPopupView();
            });
        }

        if (Config.quickHelp && Config.quickHelp === true) {
            require(["modules/quickhelp/view"], function (QuickHelpView) {
                new QuickHelpView();
            });
        }

        if (Config.scaleLine && Config.scaleLine === true) {
            require(["modules/scaleline/view"], function (ScaleLineView) {
                new ScaleLineView();
            });
        }

        require(["modules/window/view"], function (WindowView) {
            new WindowView();
        });

        // Tools
        _.each(Radio.request("Parser", "getItemsByAttributes", {type: "tool"}), function (tool) {
            switch (tool.id) {
                case "gfi": {
                    require(["modules/gfipopup/popup/view"], function (GFIPopupView) {
                        new GFIPopupView();
                    });
                    break;
                }
                case "coord": {
                    require(["modules/coordpopup/view"], function (CoordPopupView) {
                        new CoordPopupView();
                    });
                    break;
                }
                case "measure": {
                    require(["modules/tools/measure/view"], function (MeasureView) {
                        new MeasureView();
                    });
                    break;
                }
                case "draw": {
                    require(["modules/tools/draw/view"], function (DrawView) {
                        new DrawView();
                    });
                    break;
                }
                case "print": {
                    require(["modules/tools/print/view"], function (PrintView) {
                        new PrintView();
                    });
                    break;
                }
                case "parcelSearch": {
                    require(["modules/tools/parcelSearch/view"], function (ParcelSearchView) {
                        new ParcelSearchView();
                    });
                    break;
                }
                case "searchByCoord": {
                    require(["modules/tools/searchByCoord/view"], function (SearchByCoordView) {
                        new SearchByCoordView();
                    });
                    break;
                }
                case "saveSelection": {
                    require(["modules/tools/saveSelection/view"], function (SaveSelectionView) {
                        new SaveSelectionView();
                    });
                    break;
                }
                case "kmlimport": {
                    require(["modules/tools/kmlimport/view"], function (ImportView) {
                        new ImportView();
                    });
                    break;
                }
                case "wfsFeatureFilter": {
                    require(["modules/wfsfeaturefilter/view"], function (WFSFeatureFilterView) {
                        new WFSFeatureFilterView();
                    });
                    break;
                }
                case "treeFilter": {
                    require(["modules/treefilter/view"], function (TreeFilterView) {
                        new TreeFilterView();
                    });
                    break;
                }
                case "routing": {
                    require(["modules/viomRouting/view"], function (RoutingView) {
                        new RoutingView();
                    });
                    break;
                }
                case "contact": {
                    require(["modules/contact/view"], function (Contact) {
                        new Contact();
                    });
                    break;
                }
                case "addWMS": {
                    require(["modules/tools/addwms/view"], function (AddWMSView) {
                        new AddWMSView();
                    });
                    break;
                }
                case "featureLister": {
                    require(["modules/featurelister/view"], function (FeatureLister) {
                        new FeatureLister();
                    });
                    break;
                }
                case "legend": {
                    require(["modules/legend/view", "modules/legend/viewMobile", "modules/core/util"], function (LegendView, MobileLegendView, Util) {
                        if (Util.isAny()) {
                            new MobileLegendView();
                        }
                        else {
                            new LegendView();
                        }
                    });
                    break;
                }
                default: {
                    break;
                }
            }
        });

        require(["modules/controls/view"], function (ControlsView) {
            new ControlsView();
        });

        // controls
        _.each(Radio.request("Parser", "getItemsByAttributes", {type: "control"}), function (control) {
            switch (control.id) {
                case "toggleMenu": {
                    require(["modules/controls/togglemenu/view"], function (ToggleMenuControlView) {
                        new ToggleMenuControlView();
                    });
                    break;
                }
                case "zoom": {
                    require(["modules/controls/zoom/view"], function (ZoomControlView) {
                        new ZoomControlView();
                    });
                    break;
                }
                case "orientation": {
                    require(["modules/controls/orientation/view"], function (OrientationView) {
                        new OrientationView();
                    });
                    break;
                }
                case "poi": {
                    require(["modules/controls/orientation/poi/view"], function (PoiView) {
                        new PoiView();
                    });
                    break;
                }
                case "mousePosition": {
                    require(["modules/controls/mousePosition/view"], function (MousePositionView) {
                        new MousePositionView();
                    });
                    break;
                }
                case "fullScreen": {
                    require(["modules/controls/fullScreen/view"], function (FullScreenView) {
                        new FullScreenView();
                    });
                    break;
                }
                case "attributions": {
                    require(["modules/controls/attributions/view"], function (AttributionsView) {
                        new AttributionsView();
                    });
                    break;
                }
            }
        });

        require(["modules/mapMarker/view"], function (MapMarkerView) {
            new MapMarkerView();
        });

        if (_.has(Config, "searchBar") === true) {
            require(["modules/searchbar/view"], function (SearchbarView) {
                new SearchbarView(Config.searchBar, Config.searchBar.initString);
            });
        }

        require(["modules/tools/styleWMS/view"], function (StyleWMSView) {
            new StyleWMSView();
        });

        if (_.has(Config, "title") === true) {
            require(["modules/title/view"], function (TitleView) {
                new TitleView();
            });
        }

//        if (Config.menubar === true) {
//            require(["modules/menubar/view"], function () {
//                if ($.isArray(Config.menuItems.formular)) {
//                    $.each(Config.menuItems.formular, function (name, obj) {
//                        if (obj.title !== "" && obj.symbol !== "" && obj.modelname !== "") {
//                            require(["modules/formular/view"], function (FormularView) {
//                                new FormularView(obj.modelname, obj.title, obj.symbol);
//                            });
//                        }
//                    });
//                }
//            });
//        }
    });
    Util.hideLoader();
});
