(function() {

    function fade(e, duration, direction, /* 'in', 'out' */ easing, /* func */ complete /* callback */) {
        
        // Set default values for parameters
        if (easing === undefined) easing = linear;
        if (complete === undefined) complete = function(){};
        
        var percentComplete = 0;
        var opacity = parseFloat(e.style.opacity);
        if (opacity < 0) opacity = 0;
        if (opacity > 1) opacity = 1;
        var startOpacity = opacity;
        var framerate = 60;
        var startTime = (new Date()).getTime();
        
        function animate() {
            if (percentComplete >= 1.0) {
                return complete();
            }
            
            var elapsedTime = (new Date()).getTime() - startTime;
            percentComplete = elapsedTime / duration;
            
            var easing_options = {elapsedTime: elapsedTime, startValue: null, endValue: 1, totalDuration: duration}
            
            if (direction === "in") {
                easing_options.startValue = startOpacity;
                opacity = easing(easing_options);
            }
            else if (direction === 'out') {
                easing_options.startValue = 1 - startOpacity;
                opacity = 1 - easing(easing_options);
            };
            e.style.opacity = opacity;
            //console.log(e.src, opacity);
            setTimeout(animate, 1000/framerate);
        }
        
        setTimeout(animate, 1000/framerate);
    };

    function fadeIn(e, duration, easing, complete) {
        fade(e, duration, 'in', easing, complete);
    }
                    
    function fadeOut(e, duration, easing, complete) {
        fade(e, duration, 'out', easing, complete);
    };

    // testing fade functions 

    var linear = function(options) {
        var elapsedTime = options.elapsedTime;
        var startValue = options.startValue;
        var endValue = options.endValue;
        var totalDuration = options.totalDuration;
        
        var difference = endValue - startValue;
        
        var result = startValue + ((elapsedTime / totalDuration) * difference)
        
        return result
    };

    //fadeIn(document.getElementById("hello"), 1000, linear, function(){ alert('complete')});


    // end testing


    // utility iterator
    function Cycle(arraylike) {
        this.values = arraylike;
        this.index = null;
    }

    Cycle.prototype._resetIndex = function() {
        this.index = this.index % this.values.length;
    };

    Cycle.prototype.next = function() {
        if (this.index === null) {
            this.index = 0;
        }
        else {
            this.index += 1;
            this._resetIndex();
        }
        return this.values[this.index]
    };

    Cycle.prototype.previous = function() {
        
        this.index = (this.index === null ? 0 : this.index) + (this.values.length - 1)
        this._resetIndex();
        return this.values[this.index];
    };

    Cycle.prototype.current = function() {
        return (this.index !== null ? this.values[this.index] : this.next())
    };
           
    function Fader(options /* container, fadeSpeed, pauseLength */) {
        this.container = document.getElementById(options.container);
        var ch = this.container.children
        
        ch[0].style.opacity = 1;
        ch[0].style.position = "absolute";
        ch[0].style.top = "5px";
        ch[0].style.left = "5px";
        
        for (i = 1; i < ch.length; i++) {
            ch[i].style.opacity = 0;
            ch[i].style.position = "absolute";
            ch[i].style.top = "5px";
            ch[i].style.left = "5px";
        }
        
        this.slides = new Cycle(ch);
        this.fadeSpeed = options.fadeSpeed;
        this.pauseLength = options.pauseLength;
    }
                
    Fader.prototype.start = function() {
        var self = this;
        var fadeSpeed = this.fadeSpeed;
        var pauseLength = this.pauseLength;
        setTimeout(function() {
            fadeOut(self.slides.next(), fadeSpeed);
            fadeIn(self.slides.next(), fadeSpeed);
            self.timer = setInterval(function() {
                fadeOut(self.slides.current(), fadeSpeed);
                fadeIn(self.slides.next(), fadeSpeed);
            }, fadeSpeed + pauseLength)
        }, pauseLength);
    };

    Fader.prototype.stop = function() {
        clearInterval(this.timer);
        this.slides.previous();
    };
    
    var exports = {
        fadeIn: fadeIn,
        fadeOut: fadeOut,
        noConflict: noConflict,
        Fader: Fader
    };
    
    var noConflictName = window['fadeLib'];
    function noConflict() {
        window['fadeLib'] = noConflictName;
        return exports;
    }
    
    window['fadeLib'] = exports;

})();
