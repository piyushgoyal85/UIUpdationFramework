/**
 * Created by administrator on 27/8/14.
 */

var fabricModel = function() {
    var oThis = this;
        oThis.animationKick = ko.observable(false),
        imgArr = [],
        newImgArr = [];

    for (i=0;i<200;i++){
        imgArr.push({
            imageName:"test"+i,
            thumnailSrc:"http://img5.creyate.org/web-images/fabric/Thumbnails/"+i+".png"
        })
    }
    for(i = 200;i>0;i--){
        newImgArr.push({
            imageName:"test"+i,
            thumnailSrc:"http://img5.creyate.org/web-images/fabric/Thumbnails/"+i+".png"
        })
    }
    this.imgArray = ko.observableArray(imgArr);
    this.newImgArray = ko.observableArray(newImgArr);

    this.typeToShow = ko.observable("all");
    this.displayAdvancedOptions = ko.observable(false);

    this.jumbleImages = function(){
        var arr = oThis.imgArray();
        oThis.animationKick("true");
        arr.sort(function() {
            return 1 - Math.random();
        });
        console.time("domUpdate");
        oThis.imgArray(arr);
        console.timeEnd("domUpdate");

        console.time("eventRaised");
        $(oThis).trigger("jumbled");

    }
    $(oThis).on("jumbled",function(){
        console.timeEnd("eventRaised");
        var arr = oThis.newImgArray();
        oThis.animationKick("true");
        arr.sort(function() {
            return 1 - Math.random();
        });
        console.time("newdomUpdate");
        oThis.newImgArray(arr);
        console.timeEnd("newdomUpdate");

    })

    this.animationLoading = ko.pureComputed(function(){
        var imgClassName = oThis.animationKick()?"jumbleAnimation":"noAnimation";
        console.log(imgClassName);
        return imgClassName;
    })

    // Animation callbacks for the planets list
    this.showPlanetElement = function(elem) { if (elem.nodeType === 1) $(elem).hide().slideDown() }
    this.hidePlanetElement = function(elem) { if (elem.nodeType === 1) $(elem).slideUp(function() { $(elem).remove(); }) }
};

// Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
// Could be stored in a separate utility library
ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.utils.unwrapObservable(value) ? $(element).fadeIn() : $(element).fadeOut();
    }
};

ko.applyBindings(new fabricModel());