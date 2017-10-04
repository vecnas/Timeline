# Timeline
Utility for sequential timed events with durations and interdependency. Uses requestAnimationFrame internally.
<br/>

<h3>Sample usage</h3>

<pre>
Timeline.get("rotations").add()
        .fromTo({val: oldRad}, {val: rad})
        .duration(app.settings.animationSpeed * 0.2)
        .release(app.settings.animationSpeed * 0.05)
        .onUpdate(function() {
                (who.ui().content || who.ui()).css("transform", "rotate(" + cnt.val + "rad)")
        });
</pre>

<h3>Timeline members</h3>

<b>get([nameOrDefault])</b> - returns timeline with attached name, or default timeline. Multiple timelines executed in parallel, same timeline follows events settings.

<p>
Specific timeline object is retrieved by get(). It contains following members:
<ul>
<li>
<b>add(obj)</b> - adds new event onto timeline, obj is optional, just assiociated data, may be anything
</li>
<li>
<b>isEmpty()</b> - checks is any event still scheduled in timeline
</li>
<li>
<b>onEmpty(cb)</b> - executes callback when empty
</li>
</ul>

<h3>Event members</h3>
Event is added by calling add() on specific timeline. It contains following members:
<ul>
<li>
<b>onStart(cb)</b> - callback on event start
</li>
<li>
<b>onUpdate(cb)</b> - callback on event update, accepts progress parameter
</li>
<li>
<b>onComplete(cb)</b> - callback on event completion
</li>
<li>
<b>duration(ms)</b> - duration of event, in milliseconds
</li>
<li>
<b>tag(name)</b> - internal events dependency by tag, similar to different timelines
</li>
<li>
<b>fromTo(objFrom, objTo)</b> - object to iterate, similar field names are looked and progressed according to current progress during event update
</li>
<li>
<b>release(ms)</b> - release delay, if release should be performed before event completion, in milliseconds. Next event starts just after releasing current event
</li>
</ul>
