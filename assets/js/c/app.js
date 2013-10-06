define(["knockout-2.3.0","jquery","c/cast.sender"], function(ko,$,chromecast) {

        var model;

        function SenderPageModel(){
            this.applicationID="d6d488e8-7b35-4834-a4c9-935d660ab65c";
            this.ActivityStatus = ko.observable("Loading...");
            this.devices = ko.observableArray([]);
            this.selectedDevice=ko.observable({name:"(looking)",id:"",ipAddress:"",isTabProjected:null});
            this.PlayList = ko.observableArray([]);
        }


        SenderPageModel.prototype.parsePlayList = function(data){
            if (typeof data.apiVersion =="undefined" || data.apiVersion!="2.0" ){
                this.ActivityStatus("Unsupported Playlist Format");
                return;
            }
            var videofiles = data.data.items;
            for (var i = 0; i < videofiles.length; i++) {
                var obj = videofiles[i];
                var videofile = obj.video;
                this.PlayList.push(videofile);
            }
        }


         SenderPageModel.prototype.playOnChromeCast = function(item){
             chromecast.play(item.content.mp4)
                 .done(function(event){alert('played!');})
                 .fail(function(event){alert('failure')});
         }

        SenderPageModel.prototype.setCastingDevice = function(device){
            model.selectedDevice(device);
        }

        SenderPageModel.prototype.getCastingDevice = function(){
            return model.selectedDevice();
        };




        SenderPageModel.prototype.setReceivers = function(receivers){
            model.devices(receivers);
            if (receivers.length > 0){
                model.selectedDevice(model.devices()[0]);
            }
        };



        function init(config) {
            var result = $.Deferred();
            $.getJSON( config.playlist )
                .done(function( data ) {
                  result.resolve(data);
                });
            model = new SenderPageModel();
            ko.applyBindings(model);
            chromecast.ready(bindChromecast);
            return result;
        }

        function bindChromecast(){
            chromecast.init(model);
        }

        function run(data) {

            model.parsePlayList(data);

        }

        return {
            init: init,
            run: run
        }
    }
);