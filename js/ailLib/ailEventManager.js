/**
 * Created by Piyush on 25/8/14.
 */

(function(window){
    "use strict"
    if (!window.jQuery) {
        var jq = document.createElement('script'); jq.type = 'text/javascript';
        // Path to jquery.js file, eg. Google hosted version
        jq.src = '/vendor/jquery.-1.10.2.min.js';
        document.getElementsByTagName('head')[0].appendChild(jq);
    }

    var ailCentralEventBus =  window.centralEventBus = window["ailCentralEventBus"] || {};


    var _onEv = function(evtName, handler, obj){
            if(typeof handler === "function" && evtName)
                return (typeof obj === "object")?$(ailCentralEventBus).on(evtName, handler)
                        :$(obj).on(evtName, handler);
        },

        _triggerEv = function(evtName, messageArr, obj){

            if(typeof obj === "object"){
                $(obj).trigger(evtName, messageArr);
            }else{
                $(ailCentralEventBus).trigger(evtName, messageArr);
            }
        },

        events = {
        subscribe:_onEv,
        publish:_triggerEv
    }


})(this)