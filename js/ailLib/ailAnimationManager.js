/**
 * Created by Piyush on 25/8/14.
 */


(function(){
    "use strict"

    if (!window.jQuery) {
        var jq = document.createElement('script'); jq.type = 'text/javascript';
        // Path to jquery.js file, eg. Google hosted version
        jq.src = '/vendor/jquery.-1.10.2.min.js';
        document.getElementsByTagName('head')[0].appendChild(jq);
    }

    var _animateEase = function(props){
            if(typeof props === "object"){
                var el = props.el,
                    duration = props.animDuration,
                    length = props.animLength,
                    progressionX1 = props.progression1.x1,
                    progressionY1 = props.progression1.y1,
                    progressionX2 = props.progression2.x2,
                    progressionY2 = props.progression2.y2

                    $(el).css({"transition-duration":duration,
                        "transform":translate(length),
                        "transition-timing-function":
                            cubic-bezier(progressionX1,progressionY1,progressionX2,progressionY2
                        )})

            }
        },
        _animateCustomEase = function(el, duration, length, progression){
            var props = {
                el: el,
                animDuartion: duration,
                animLength: length,
                progression1:{
                    x1:progression.x1,
                    y1:progression.y1
                },
                progression2:{
                    x2:progression.x2,
                    y2:progression.y2
                }

            }

            _animateEase(props);
        },
        _animateEaseIn = function(el, duration, length){
            var props = {
                el: el,
                animDuartion: duration,
                animLength: length,
                progression1:{
                    x1:0.42,
                    y1:0
                },
                progression2:{
                    x2:1,
                    y2:1
                }

            }

            _animateEase(props);
        },
        _animateEaseOut = function(el, duration, length){
            var props = {
                el: el,
                animDuartion: duration,
                animLength: length,
                progression1:{
                    x1:0,
                    y1:0
                },
                progression2:{
                    x2:0.58,
                    y2:1
                }

            }

            _animateEase(props);
        },
        _animateEaseInOut = function(el, duration, length){
            var props = {
                el: el,
                animDuartion: duration,
                animLength: length,
                progression1:{
                    x1:0.42,
                    y1:0
                },
                progression2:{
                    x2:.58,
                    y2:1
                }

            }

            _animateEase(props);

        },
        ailAnimate = {
        customEase:_animateCustomEase,
        easeIn:_animateEaseIn,
        easeOut: _animateEaseOut,
        easeInOut: _animateEaseInOut
    }
})()