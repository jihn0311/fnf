# Dustin normal-mode restoration status

Normal mode now has separate native stage layers, special character poses, note skins, recovered hazard charts, timed chart events, literal script events/timer callbacks, video preparation and the supported mechanics below. Low-spec keeps its prior chart and assets.

Implemented controllers: Perseverance dodge, Broken Reality attack meter and drain, karma/hate/madness hazards, Avulsion SPACE drain phase, Lorem Ipsum QTE, Heatwave soul movement/shooting/bombs/blaster, Kinemorto bones and note motion. Heatwave minigame geometry and several visual effects are browser adaptations, not exact source-engine equivalents.

This repair fixes event chronology (including seeking), literal delayed callbacks and pipe-separated step cases, native actor/layer ordering, Heatwave Mettaton emergence, Avulsion Papyrus singing, foreground/background cover placement, and dodge cooldown. Papyrus idle shares its long lyric atlas to avoid loading the same sequence twice.

Still incomplete: arbitrary HScript expressions/conditions/tweens, native shader pipelines and particle choreography, precise camera follow/offset choreography, some stage-specific UI/audio cues and story branching. Character echo, TV/phantom/aberration state flags are not a complete renderer. This is not a claim of full source parity.

Validation: all 23 songs render at multiple times and reset when seeking; low-spec effect/video isolation and original note counts; timing-order, delayed-event, blackout-release, hazard-miss, karma, madness, attack, QTE and dodge regression tests; inspected Avulsion/Heatwave/Perseverance screenshots; intro video skip; existing game and play-mode tests; Corruption 12-variant regression with audio/video.
