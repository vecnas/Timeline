(function() {

  var timelines = {},
      debugMode = false;

  var Bus = function() {this._subscribers = {}};
  Bus.prototype.trigger = function(evtName, param) {
    if (! this._subscribers[evtName]) {
      return;
    }
    for (var i = 0; i < this._subscribers[evtName].length; i++) {
      this._subscribers[evtName][i].call(this, param);
    }
  };
  Bus.prototype.on = function(evtName, cb) {
    this._subscribers[evtName] = this._subscribers[evtName] || [];
    this._subscribers[evtName].push(cb);
  };

  var Event = function() {Bus.call(this)};
  Event.prototype = Object.create(Bus.prototype);
  // Event.prototype._startedAt = 0;
  // Event.prototype._duration = 0;
  // Event.prototype._startTime = 0;
  // Event.prototype._data = null;
  // Event.prototype._next = null;
  // Event.prototype._fit = null;
  Event.prototype.onStart = function(cb) {
    this.on("start", cb);
    return this;
  };
  Event.prototype.onUpdate = function(cb) {
    this.on("update", cb);
    return this;
  };
  Event.prototype.onComplete = function(cb) {
    this.on("complete", cb);
    return this;
  };
  Event.prototype.duration = function(val) {
    this._duration = Math.round(val);
    debugMode && jiant.logInfo("Timeline: duration", this, this._duration);
    return this;
  };
  Event.prototype.tag = function(val) {
    this._tag = val;
    debugMode && jiant.logInfo("Timeline: tag", this, this._tag);
    return this;
  };
  Event.prototype.fromTo = function(from, to) {
    this._from = from;
    this._to = to;
    this._fromBase = {};
    for (var key in from) {
      if (from.hasOwnProperty(key) && to.hasOwnProperty(key) && $.isNumeric(from[key]) && $.isNumeric(to[key])) {
        this._fromBase[key] = from[key];
      }
    }
    return this;
  };
  Event.prototype.release = function(val) {
    this._release = Math.round(val);
    debugMode && jiant.logInfo("Timeline: release", this, this._release);
    return this;
  };

  var Timeline = function() {
    Bus.call(this);
    this._active = [];
    this._lastActiveSize = 0;
  };
  Timeline.prototype = Object.create(Bus.prototype);
  // Timeline.prototype._active = [];
  // Timeline.prototype._last = null;
  // Timeline.prototype._first = null;
  Timeline.debug = function(val) {
    debugMode = val;
    jiant.logError("Timeline: debug enabled");
  };
  Timeline.prototype.add = function(obj) {
    var event = new Event();
    event._addTime = time();
    event._data = obj;
    if (this._last) {
      this._last._next = event;
    } else {
      this._first = event;
    }
    this._last = event;
    debugMode && jiant.logError("Timeline: added event", event);
    return event;
  };
  Timeline.prototype.isEmpty = function(cb) {
    return !this._lastActiveSize && !this._first;
  };
  Timeline.prototype.onEmpty = function(cb) {
    this.on("empty", cb);
    return this;
  };
  Timeline.get = function(name) {
    name = name || "default";
    if (!(name in timelines)) {
      timelines[name] = new Timeline();
    }
    return timelines[name];
  };

  requestAnimationFrame(update);

  function time() {
    return new Date().getTime();
  }

  function isTimeForNext(tline, tm, nextEvt) {
    var lastEvt = tline._active[tline._active.length - 1];
    var bool = ("_release" in lastEvt) ? (lastEvt._startedAt + lastEvt._release <= tm) : (lastEvt._startedAt + lastEvt._duration <= tm);
    if (bool && ("_tag" in nextEvt) && nextEvt._tag) {
      bool = tline._active.filter(function(evt) {return evt._tag == nextEvt._tag}).length == 0;
    }
    return bool;
  }

  function progressFromTo(evt, progress) {
    if (evt._from && evt._to) {
      for (var key in evt._fromBase) {
        if (evt._fromBase.hasOwnProperty(key)) {
          evt._from[key] = evt._fromBase[key] + progress * (evt._to[key] - evt._fromBase[key]);
        }
      }
    }
  }

  function activeSize(tline, tm) {
    return tline._active.filter(function(evt) {return ("_release" in evt) ? (evt._startedAt + evt._release) > tm : true}).length
      + (tline._first ? 1 : 0);
  }

  function update() {
    var key, newActiveSize, startedNow = 0, tline, nextEvt, i, toStop = [], tm = time(), someCompleted;
    for (key in timelines) {
      if (timelines.hasOwnProperty(key)) {
        tline = timelines[key];
        do {
          someCompleted = false;
          nextEvt = tline._first;
          while (nextEvt && (tline._active.length == 0 || isTimeForNext(tline, tm, nextEvt))) {
            tline._active.push(nextEvt);
            tline._first = tline._first._next;
            if (! tline._first) {
              tline._last = null;
            }
            nextEvt = tline._first;
          }
          for (i = 0; i < tline._active.length; i++) {
            var evt = tline._active[i],
              progress;
            if (! evt._startedAt) {
              debugMode && jiant.logInfo("Timeline: starting new event", evt);
              evt._startedAt = tm;
              evt.trigger("start");
              startedNow++;
            }
            progress = !evt._duration ? 1 : Math.min(tm - evt._startedAt, evt._duration) / evt._duration;
            progressFromTo(evt, progress);
            evt.trigger("update", progress);
            if (progress == 1) {
              someCompleted = true;
              if (evt._data && $.isFunction(evt._data)) {
                evt._data();
              }
              debugMode && jiant.logInfo("Timeline: completing event", evt);
              evt.trigger("complete");
              tline._active.splice(i, 1);
              i--;
            }
          }
        } while (someCompleted);
        newActiveSize = activeSize(tline, tm);
        if (tline._lastActiveSize + startedNow != 0 && newActiveSize == 0) {
          tline.trigger("empty");
        }
        tline._lastActiveSize = newActiveSize + startedNow;
      }
    }
    requestAnimationFrame(update);
  }

  if (typeof jiant !== "undefined") {
    jiant.module("timeline", function() {return Timeline});
  } else if (!window.Timeline) {
    window.Timeline = Timeline;
  }

})();
