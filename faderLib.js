(function() {

    function fade(e, duration, direction, /* 'in', 'out' */ easing, /* func */ complete /* callback */) {
        
        // Set default values for parameters
        if (easing === undefined) easing = linear;
        if (complete === undefined) complete = function(){};

        // initialise counter values
        var percentComplete = 0;
        var opacity = parseFloat(e.style.opacity);
        if (opacity < 0) opacity = 0;
        if (opacity > 1) opacity = 1;
        
        // initialise values that stay constant throughout execution
        var startOpacity = opacity;
        var framerate = 60;
        var startTime = (new Date()).getTime();
        
        function animate() {
            if (percentComplete >= 1.0) {
                return complete();
            }
            
            var elapsedTime = (new Date()).getTime() - startTime;
            percentComplete = elapsedTime / duration;
            
            var easing_options = {elapsedTime: elapsedTime, endValue: 1, totalDuration: duration}
            
            if (direction === "in") {
                easing_options.startValue = startOpacity;
                opacity = easing(easing_options);
            }
            else if (direction === 'out') {
                easing_options.startValue = 1 - startOpacity;
                opacity = 1 - easing(easing_options); 
            };
            e.style.opacity = opacity;
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

    // default easing function
    var linear = function(options) {
        var elapsedTime = options.elapsedTime;
        var startValue = options.startValue;
        var endValue = options.endValue;
        var totalDuration = options.totalDuration;
        
        var difference = endValue - startValue;
        
        var result = startValue + ((elapsedTime / totalDuration) * difference)
        
        return result
    };

    // Utility. Bidirectional circular iterator.
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


    // The main fader constructor. Fades through the child elements of a
    // container div on a continual loop.
    function Fader(options /* container, fadeLength, pauseLength */) {
        this.container = document.getElementById(options.container);
        var ch = this.container.children
        
        // Initialise opacity and position for child Elements of the
        // container div
        ch[0].style.opacity = 1;
        ch[0].style.position = "absolute";
        ch[0].style.top = "0px";
        ch[0].style.left = "0px";
        
        for (i = 1; i < ch.length; i++) {
            ch[i].style.opacity = 0;
            ch[i].style.position = "absolute";
            ch[i].style.top = "0px";
            ch[i].style.left = "0px";
        }
        
        this.slides = new Cycle(ch);
        this.fadeLength = options.fadeLength;
        this.pauseLength = options.pauseLength;
    }
                
    Fader.prototype.start = function() {
        var self = this;
        var fadeLength = this.fadeLength;
        var pauseLength = this.pauseLength;
        setTimeout(function() {
            fadeOut(self.slides.next(), fadeLength);
            fadeIn(self.slides.next(), fadeLength);
            self.timer = setInterval(function() {
                fadeOut(self.slides.current(), fadeLength);
                fadeIn(self.slides.next(), fadeLength);
            }, fadeLength + pauseLength)
        }, pauseLength);
    };

    Fader.prototype.stop = function() {
        clearInterval(this.timer);
        this.slides.previous();
    };
    
    // Exported object
    var exports = {
        fadeIn: fadeIn,
        fadeOut: fadeOut,
        noConflict: noConflict,
        Fader: Fader
    };
    
    // Mechanism to remove naming conflicts if another module exports
    // the name Fader
    var noConflictName = window['fadeLib'];
    function noConflict() {
        window['fadeLib'] = noConflictName;
        return exports;
    }
    
    // Export public interface
    window['fadeLib'] = exports;

})();
