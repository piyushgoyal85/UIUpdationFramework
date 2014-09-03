/**
 * Created by Piyush on 22/8/14.
 */
/*jshint boss: true, bitwise: true, curly: true, newcap: true, noarg: true, nonew: true, latedef: true, regexdash: true */
(function(window){
    "use strict"
    if (!window.jQuery) {
        var jq = document.createElement('script'); jq.type = 'text/javascript';
        // Path to jquery.js file, eg. Google hosted version
        jq.src = '/vendor/jquery.-1.10.2.min.js';
        document.getElementsByTagName('head')[0].appendChild(jq);
    }
    function ailDomManager(){

        function _domClassSelector(className){
            return $(className);
        }
        function _domDataSelector(dataAttrName, elType){
            return $(elType).data(dataAttrName);
        }
        var _getDomEls = function(type){
                switch(type){
                    case "class":
                        return _domClassSelector;
                        break;
                    case "data":
                        return _domDataSelector;
                        break;
                }
            },
        /*
                **** structure of props
                * {
                *   el:"div"/ template <div id="x" class="y">
                *   attr:{
                *       id:"a",
                *       class:"b",
                *       name:"c"
                *   }
                *   data:{
                *       name1:"",
                *       name2:""
                *   }
                *   events:{
                *       click:"",
                *       custom:""
                *   }
                *   appendToEl:"nodeName"
                * }
            */

            _createNewEls = function(props){
                if(typeof props === "object"){
                    var el,i;
                    if(!props.hasOwnProperty("template")){
                        el = $(props.el);
                        for (i in attr){
                            el.prop(i, attr[i]);
                        }
                        for (i in data){
                            el.data(i,data[i]);
                        }
                        for (i in events){
                            el.on(i,events[i]);
                        }
                    }else{
                        el = $(template);
                    }
                    if(props.hasOwnProperty("appendToEl")){
                        $(appendToEl).append(el);
                    }
                    return el;
                }
                return false;
            },

            _setDomProps = function(el, propName, propValue){
                if(typeof el === "object" && propName){
                    propvale?el.prop(propName,propValue):el.prop(propName,"");
                }

                return el;
            },
            dom = {
            getBulkElsbyClassName:_getDomEls("class"),
            getBulkElsbyDataAttrName:_getDomEls("data"),
            setProps:_setDomProps,
            create:_createNewEls
        }
    }
})(this)
