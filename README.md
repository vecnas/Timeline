# Timeline
Utility for sequential timed events with durations and interdependency
Sample usage:

Timeline.get("rotations").add().fromTo({val: oldRad}, {val: rad})
        .duration(app.settings.animationSpeed * 0.2).release(app.settings.animationSpeed * 0.05)
        .onUpdate(function() {(who.ui().content || who.ui()).css("transform", "rotate(" + cnt.val + "rad)")});
