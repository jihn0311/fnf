# Corruption+ web import

Six source tracks: Opening, Null and Void, CHKDSK, Access Denied, Bloodlust, Pretence. Original and available Safe charts are included. Opening has Inst only in source; the other five tracks include Voices. Opening video is muted, fully downloaded before play, and synchronized to chart time.

Character changes and selected scene transitions are translated from song HScript. Backgrounds are static composites of original art adapted to the browser stage; these are not pixel-perfect native camera layouts. Pretence fades are represented as view changes at their end steps. Some cinematic clips, shader/glitch filters, particles, note-field modifiers, and input-interference mechanics are not ported. The source senpaiNull sprites intentionally contain horizontal glitch imagery.

All required character sheets and backgrounds are decoded before play, including later scene changes in low-spec mode. Dense large character animations are sampled while preserving duration. Bloodlust decoded image memory measured approximately 108 MiB in browser, versus 142 MiB before sampling. Audio and video memory are additional.

Validation: test-corruption.cjs checks six tracks in normal/low modes, all available difficulty transitions, valid chart timing, non-silent audio decoding, opening seek and release. test-game.cjs checks shared gameplay regressions.
