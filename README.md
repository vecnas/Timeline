# Timeline
Utility for sequential timed events with durations and interdependency. Uses requestAnimationFrame internally.
<br/>
Sample usage:

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

<b>get([nameOrDefault])</b> - return timeline with attached name, or default timeline. Multiple timelines executed in parallel, same timeline follows events settings.

<p>
Specific timeline object (retrieved by get()) members
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
