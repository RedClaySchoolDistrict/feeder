///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  "dojo/_base/declare",
  "dojo/_base/html",
  "dojo/query",
  "dojo/on",
  "dojo/_base/lang",
  "dijit/_WidgetsInTemplateMixin",
  "jimu/BaseWidget",
  "jimu/WidgetManager",
  "esri/tasks/IdentifyTask",
  "esri/tasks/IdentifyParameters",
  "esri/geometry/webMercatorUtils",
  "esri/geometry/Point",
  "esri/SpatialReference",
  "dojo/dom",
  "esri/symbols/Font",
  "esri/dijit/Legend",
  "jimu/LayerInfos/LayerInfos",
  "dojo/domReady!",
  //'jimu/loaderplugins/jquery-loader!https://code.jquery.com/jquery-1.11.2.min.js'
], function (
  //the html for the mobile version of this widget is located in index.html
  declare,
  html,
  query,
  on,
  lang,
  _WidgetsInTemplateMixin,
  BaseWidget,
  WidgetManager,
  IdentifyTask,
  IdentifyParameters,
  webMercatorUtils,
  Point,
  SpatialReference,
  dom,
  Font,
  Legend
) {
  var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {
    baseClass: "jimu-widget-FindSchool",
    // clasName: 'esri.widgets.About',

    _jimuLayerInfos: null,
    _hasContent: null,

    /*
      this function sets up the identifyTask, and also contains all of the html onclicks
    */
    postCreate: function () {
      //https://developers.arcgis.com/javascript/3/sandbox/sandbox.html?sample=find_drilldown
      var wm = WidgetManager.getInstance();
      const setResults = async (event) => {
        let results = { elementary: "", middle: "", high: "" };
        var query = {
          geometry: event,
          outFields: ["SCHOOL"],
        };
        await this.map.itemInfo.itemData.operationalLayers[4].layerObject
          .queryFeatures(query)
          .then((result) => {
            if (result.features.length < 1) {
              results.elementary = "Not in Red Clay";
            } else {
              results.elementary = result.features[0].attributes["SCHOOL"];
            }
          });
        await this.map.itemInfo.itemData.operationalLayers[3].layerObject
          .queryFeatures(query)
          .then((result) => {
            if (result.features.length < 1) {
              results.middle = "Not in Red Clay";
            } else {
              results.middle = result.features[0].attributes["SCHOOL"];
            }
          });
        await this.map.itemInfo.itemData.operationalLayers[2].layerObject
          .queryFeatures(query)
          .then((result) => {
            if (result.features.length < 1) {
              results.high = "Not in Red Clay";
            } else {
              results.high = result.features[0].attributes["SCHOOL"];
            }
          });
        document.getElementById("thirdgrade").value = results.elementary;
        document.getElementById("sixthgrade").value = results.middle;
        document.getElementById("ninthgrade").value = results.high;
      };

      // this.map.getLayer('redclayfeeder3_1680').hide();
      window.echeck = 0;
      window.mcheck = 0;
      window.hcheck = 0;
      window.helpcheck = 0;
      var span;
      on(
        this.map,
        "click",
        lang.hitch(this, function (evt) {
          var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
          var x = mp.x;
          var y = mp.y;
          var location = [x, y];

          var newGraphic = new esri.Graphic(
            esri.geometry.geographicToWebMercator(mp),
            new esri.symbol.SimpleMarkerSymbol().setColor([255, 255, 0, 100])
          );
          var tsym = new esri.symbol.TextSymbol("Your location")
            .setOffset(0, 10)
            .setFont(new Font("12pt").setWeight(Font.WEIGHT_BOLD));
          var text = new esri.Graphic(
            esri.geometry.geographicToWebMercator(mp),
            tsym
          );

          this.map.graphics.clear();

          //adds the label for where user clicks
          this.map.graphics.add(newGraphic);
          this.map.graphics.add(text);

          this.map.centerAndZoom(location, 15);

          lang.hitch(this, setResults(evt.mapPoint));
        })
      );

      on(
        wm.getWidgetById("widgets_Search_Widget_21").searchDijit,
        "select-result",
        lang.hitch(this, function (event) {
          this.map.graphics.clear();
          lang.hitch(this, setResults(event.result.feature.geometry));
          zoomcheck = true;
          window.res = undefined;
        })
      );

      on(
        this.zoomIn,
        "click",
        lang.hitch(this, function () {
          var z = this.map.getZoom();

          z += z / 10;
          z = Math.round(z);

          this.map.setZoom(z);
        })
      );

      on(
        this.helpButton,
        "click",
        lang.hitch(this, function () {
          var modal = document.getElementById("helpModal");

          if (window.helpcheck == 0) {
            modal.style.display = "block";
            window.helpcheck = 1;
          }
        })
      );

      on(
        this.mobileHelpButton,
        "click",
        lang.hitch(this, function () {
          var modal = document.getElementById("mobile-Help-Modal");

          if (window.helpcheck == 0) {
            modal.style.display = "block";
            window.helpcheck = 1;
          }
        })
      );

      on(
        this.close1,
        "click",
        lang.hitch(this, function () {
          var modal = document.getElementById("helpModal");
          modal.style.display = "none";
          window.helpcheck = 0;
        })
      );

      on(
        this.close,
        "click",
        lang.hitch(this, function () {
          var mobileModal = document.getElementById("mobile-Help-Modal");
          mobileModal.style.display = "none";
          window.helpcheck = 0;
        })
      );

      // Note this function keeps throwing errors on import
      // on(
      //   document.getElementById("closemobile"),
      //   "click",
      //   lang.hitch(this, function () {
      //     var modal = document.getElementById("helpModalMobile");
      //     modal.style.display = "none";
      //   })
      // );

      on(
        this.zoomOut,
        "click",
        lang.hitch(this, function () {
          var z = this.map.getZoom();

          z -= z / 10;
          z = Math.round(z);

          this.map.setZoom(z);
        })
      );

      //these onlclicks handle turning the layers on and off
      on(
        this.eButton,
        "click",
        lang.hitch(this, function () {
          console.log(window.echeck);
          if (window.echeck == 0) {
            this.map.getLayer("redclayelem_5314").show();
            this.map.getLayer("redclayschool2_4485").show();
            window.echeck = 1;
            this.map.getLayer("redclaymiddle_2857").hide();
            this.map.getLayer("redclayschool2_7950").hide();
            window.mcheck = 0;
            this.map.getLayer("redclayhighschool_8845").hide();
            this.map.getLayer("redclayschool2_7308").hide();
            window.hcheck = 0;
          } else if (window.echeck == 1) {
            this.map.getLayer("redclayelem_5314").hide();
            this.map.getLayer("redclayschool2_4485").hide();
            window.echeck = 0;
          }
        })
      );

      on(
        this.mButton,
        "click",
        lang.hitch(this, function () {
          if (window.mcheck == 0) {
            this.map.getLayer("redclaymiddle_2857").show();
            this.map.getLayer("redclayschool2_7950").show();
            window.mcheck = 1;
            this.map.getLayer("redclayelem_5314").hide();
            this.map.getLayer("redclayschool2_4485").hide();
            window.echeck = 0;
            this.map.getLayer("redclayhighschool_8845").hide();
            this.map.getLayer("redclayschool2_7308").hide();
            window.hcheck = 0;
          } else if (window.mcheck == 1) {
            this.map.getLayer("redclaymiddle_2857").hide();
            this.map.getLayer("redclayschool2_7950").hide();
            window.mcheck = 0;
          }
        })
      );
      on(
        this.hButton,
        "click",
        lang.hitch(this, function () {
          if (window.hcheck == 0) {
            this.map.getLayer("redclayhighschool_8845").show();
            this.map.getLayer("redclayschool2_7308").show();
            window.hcheck = 1;
            this.map.getLayer("redclayelem_5314").hide();
            this.map.getLayer("redclayschool2_4485").hide();
            window.echeck = 0;
            this.map.getLayer("redclaymiddle_2857").hide();
            this.map.getLayer("redclayschool2_7950").hide();
            window.mcheck = 0;
          } else if (window.hcheck == 1) {
            this.map.getLayer("redclayhighschool_8845").hide();
            this.map.getLayer("redclayschool2_7308").hide();
            window.hcheck = 0;
          }
        })
      );

      on(
        this.eButton2,
        "click",
        lang.hitch(this, function () {
          if (window.echeck == 0) {
            this.map.getLayer("redclayelem_5314").show();
            this.map.getLayer("redclayschool2_4485").show();
            window.echeck = 1;
            this.map.getLayer("redclaymiddle_2857").hide();
            this.map.getLayer("redclayschool2_7950").hide();
            window.mcheck = 0;
            this.map.getLayer("redclayhighschool_8845").hide();
            this.map.getLayer("redclayschool2_7308").hide();
            window.hcheck = 0;
          } else if (window.echeck == 1) {
            this.map.getLayer("redclayelem_5314").hide();
            this.map.getLayer("redclayschool2_4485").hide();
            window.echeck = 0;
          }
        })
      );
      on(
        this.mButton2,
        "click",
        lang.hitch(this, function () {
          if (window.mcheck == 0) {
            this.map.getLayer("redclaymiddle_2857").show();
            this.map.getLayer("redclayschool2_7950").show();
            window.mcheck = 1;
            this.map.getLayer("redclayelem_5314").hide();
            this.map.getLayer("redclayschool2_4485").hide();
            window.echeck = 0;
            this.map.getLayer("redclayhighschool_8845").hide();
            this.map.getLayer("redclayschool2_7308").hide();
            window.hcheck = 0;
          } else if (window.mcheck == 1) {
            this.map.getLayer("redclaymiddle_2857").hide();
            this.map.getLayer("redclayschool2_7950").hide();
            window.mcheck = 0;
          }
        })
      );

      on(
        this.hButton2,
        "click",
        lang.hitch(this, function () {
          if (window.hcheck == 0) {
            this.map.getLayer("redclayhighschool_8845").show();
            this.map.getLayer("redclayschool2_7308").show();
            window.hcheck = 1;
            this.map.getLayer("redclayelem_5314").hide();
            this.map.getLayer("redclayschool2_4485").hide();
            window.echeck = 0;
            this.map.getLayer("redclaymiddle_2857").hide();
            this.map.getLayer("redclayschool2_7950").hide();
            window.mcheck = 0;
          } else if (window.hcheck == 1) {
            this.map.getLayer("redclayhighschool_8845").hide();
            this.map.getLayer("redclayschool2_7308").hide();
            window.hcheck = 0;
          }
        })
      );
    },

    //this function will dynamically show and hide layers depending on the check flags,
    //the purpose of this function is to reduce the lines of repeated code above
    //figure out how to determine which check (h,e,or m) is 1 which will make it clear
    //what checks you turn off (to 0)
    layerChange: function (show1, show2, hide1, hide2, hide3, hide4, check) {
      window.checkarr = [window.echeck, window.mcheck, window.hcheck];
      if (check == 0) {
        this.map.getLayer(show1).show();
        this.map.getLayer(show2).show();
        this.map.getLayer(hide1).hide();
        this.map.getLayer(hide2).hide();
        this.map.getLayer(hide3).hide();
        this.map.getLayer(hide4).hide();
      }
    },

    onOpen: function () {
      var panel = this.getPanel();
      var pos = panel.position;
      pos.width = 360;
      pos.height = 450;
      panel.setPosition(pos);
      panel.panelManager.normalizePanel(panel);
      if (window.appInfo.isRunInMobile) {
        document
          .getElementById("helpModalMobile")
          .setAttribute("style", "display:block");
        var searchbar = document.getElementById("esri_dijit_Search_0_input");
        searchbar.style.fontSize = "16px";
      }
    },

    //this function packages the identifyTask results then displays them in the widget panel
    queryATT: function (results) {
      console.log(results);

      // this.thirdgrade.value = results.elementary;
      // this.sixthgrade.value = results.middle;
      // this.ninthgrade.value = results.high;
      // if (results[0].length === 0) {
      //   console.log("woot");
      //   this.thirdgrade.value = "Not in Red Clay";
      //   this.sixthgrade.value = "Not in Red Clay";
      //   this.ninthgrade.value = "Not in Red Clay";
      // } else {
      //   results.forEach((result) => {
      //     console.log(result);

      //     if (result.layerName == "Attendance Zone K to 5") {
      //       //alert(results[i].attributes['SCHOOL']);
      //       var mobile3 = result.attributes["SCHOOL"];
      //       this.thirdgrade.value = result.attributes["SCHOOL"];
      //     }

      //     if (result.layerName == "Attendance Zone 6 to 8") {
      //       //alert(results[i].attributes['SCHOOL']);
      //       var mobile6 = result.attributes["SCHOOL"];
      //       this.sixthgrade.value = result.attributes["SCHOOL"];
      //     }

      //     if (idResult.layerName == "Attendance Zone 9 to12") {
      //       //alert(results[i].attributes['SCHOOL']);
      //       var mobile9 = result.attributes["SCHOOL"];
      //       this.ninthgrade.value = result.attributes["SCHOOL"];
      //     }
      //   });
      // }

      //redclay dist id = 32
      // if (results[0].attributes["DIST_ID"] != 32) {
      //   this.thirdgrade.value = "Not in Red Clay";
      //   this.sixthgrade.value = "Not in Red Clay";
      //   this.ninthgrade.value = "Not in Red Clay";
      // }

      //handles refresh for search

      //if the application is running on a phone, this will send the resutls to the mobile panel
      // if (window.appInfo.isRunInMobile) {
      //   document
      //     .getElementById("thirdgrademobile")
      //     .setAttribute("value", mobile3);
      //   document
      //     .getElementById("sixthgrademobile")
      //     .setAttribute("value", mobile6);
      //   document
      //     .getElementById("ninthgrademobile")
      //     .setAttribute("value", mobile9);

      //   if (results[0].attributes["DIST_ID"] != 32) {
      //     document
      //       .getElementById("thirdgrademobile")
      //       .setAttribute("value", "Not in Red Clay");
      //     document
      //       .getElementById("sixthgrademobile")
      //       .setAttribute("value", "Not in Red Clay");
      //     document
      //       .getElementById("ninthgrademobile")
      //       .setAttribute("value", "Not in Red Clay");
      //   }

      //   document
      //     .getElementById("mobilePanel")
      //     .setAttribute("style", "display:block");
      // }
    },

    startup: function () {
      this.inherited(arguments);

      this.resize();
    },

    resize: function () {
      this._resizeContentImg();
    },

    _resizeContentImg: function () {
      if (this._hasContent) {
        html.empty(this.customContentNode);

        var aboutContent = html.toDom(this.config.about.aboutContent);
        html.place(aboutContent, this.customContentNode);
        // single node only(no DocumentFragment)
        if (
          this.customContentNode.nodeType &&
          this.customContentNode.nodeType === 1
        ) {
          var contentImgs = query("img", this.customContentNode);
          if (contentImgs && contentImgs.length) {
            contentImgs.forEach(
              lang.hitch(this, function (img) {
                var isNotLoaded =
                  "undefined" !== typeof img.complete && false === img.complete
                    ? true
                    : false;
                if (isNotLoaded) {
                  this.own(
                    on(
                      img,
                      "load",
                      lang.hitch(this, function () {
                        this._resizeImg(img);
                      })
                    )
                  );
                } else {
                  this._resizeImg(img);
                }
              })
            );
          }
        }
      }
    },
    _resizeImg: function (img) {
      var customBox = html.getContentBox(this.customContentNode);
      var imgSize = html.getContentBox(img);
      if (imgSize && imgSize.w && imgSize.w >= customBox.w) {
        html.setStyle(img, {
          maxWidth: customBox.w - 20 + "px", // prevent x scroll
          maxHeight: customBox.h - 40 + "px",
        });
      }
    },
  });
  return clazz;
});
