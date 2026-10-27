
## 2026-10-11
- 사용자 설정: 이후 요청과 수정 결과를 요약하고, 검증한 수정은 커밋·푸시한다.
- 요청: fnf selever 폴더에서 추가할 곡을 한 곡씩 질문.
- 확인: Casanova 음원과 Easy/Normal/Hard 채보 존재. Casanova 추가 여부 질문 중이며 아직 추가하지 않음.
- 선택: Casanova 추가 승인(y). 곡 선택을 계속하며 다음 후보 Gospel의 추가 여부를 질문한다. 아직 게임 파일에 추가하지 않음.
- Gospel 추가 및 선택 종료 승인(y). Casanova/Gospel을 추가하고 기존 Parish/Worship/Zavodila를 유지함.
- 추가 요청: 캐릭터 모습과 방향 확인. 원본 스프라이트의 셀레버, Lucifer 사르벤테, BF 및 4방향 동작 확인.
- 검증: 두 곡 음원 재생, Hard 채보(Casanova 643 / Gospel 603 플레이어 노트), 4방향 렌더링, 일반·저사양 배경 통과. Casanova Easy/Normal은 원본부터 48노트인 짧은 채보임.

- 공개 사이트에서 새 모드 캐릭터/배경이 보이지 않는다는 요청: 새 브라우저에서는 Casanova 이미지 13개 로딩 성공, HTTP 오류 없음. 이전 런타임 캐시 혼용을 막도록 모든 JS/CSS 주소에 내용 해시 버전을 적용.

- 요청: 영상 기준 Casanova 캐릭터 크기, 배경 구도, 특수효과, ALT 채보 적용.
- Casanova Hard를 casanova-alt.json으로 교체하고 기본 선택 Hard/BPM 131로 설정. Easy/Normal 원본은 유지. 플레이어 799노트 및 마지막 161.221초 ↓+↑ 1.947초 롱노트 검증.
- Casanova 전용 셀레버/GF/스피커 크기와 교회 배경 크롭 조정. 원본 circ 이미지로 상대 동시치기 기반 붉은 마법진/암전 웹 재현(원본 효과 타이밍 완전 일치는 미확인). 저사양은 구도만 적용하고 효과 제외.
- 검증: JavaScript 문법, 일반/저사양 렌더링, 이미지 14개 로딩, 누락 리소스/스크립트 오류 없음. JS/CSS 캐시 해시 갱신.

- 요청: 제공한 사르벤테 ALT 플레이 영상의 네 곡도 Casanova처럼 크기/배경/특수효과/ALT 채보 반영, Gospel 노트 모양 교체.
- Parish/Worship/Zavodila/Gospel Hard를 원본 -alt.json으로 교체하고 Hard 기본 선택. 플레이어 노트 207/299/482/650개. Easy/Normal 유지.
- 교회 구도와 Sarvente/Ruv/GF/스피커 크기 조정. Worship 붉은 색조/마법진, Zavodila 보컬 반응 흔들림, Gospel 회전 마법진/부유를 원본 이미지로 웹 재현. 원본 엔진 효과의 정확한 타이밍 복제는 아님.
- Gospel NOTE_assets2A 원본 십자가 스킨과 XML 좌표 적용: 판정선, 입력 발광, 네 방향 노트, 롱노트 몸통/꼬리. 저사양에서도 스킨 유지, 무대 특수효과 제외.
- 검증: 5곡 일반/저사양 및 업/다운 렌더링, Gospel 스킨의 다른 곡 전파 없음, 이미지 누락/페이지 오류 없음. test-game.cjs와 test-sustain-segments.cjs 통과.

## 2026-10-12
- 요청 7건: Casanova 자세 깜박임, GF 춤, Casanova/Gospel 배경 가시성, HOLD 문구 제거, BF 실패 모션, 전체 출력 화질, Zavodila 상하 흔들림.
- Survent 같은 방향 연속 노트에서 애니메이션 시작점 유지, 짧은 공백에서 idle 전환 완화(.36초), 고정 idle 기준점으로 프레임 정렬. GF는 좌우 춤을 박자마다 교대하며 native danceLeft/danceRight도 지원.
- 네 방향 native miss 애니메이션을 이름 규칙에 맞춰 선택(없는 캐릭터는 기존 모션 유지). Triple Trouble 방향 반전 매핑 보존. HOLD 문구 제거, 롱노트 판정 로직 유지.
- Casanova/Gospel 배경 확대율과 레인 음영 축소. Zavodila 인위적인 화면 흔들림 제거.
- 모든 곡 출력 캔버스에 화면 크기/DPR 기반 최대 2배 해상도와 고품질 보간 적용, 저사양은 1배. Survent 캐릭터 원본에서 2배 크기로 재변환, BF/GF 불필요 모션 제외, 이미지 내용 해시로 캐시 혼용 방지.
- 검증: test-game, test-sustain-segments, test-triple, test-mod-fixes 통과. 브라우저 GF 교대/BF miss/연속 노트/2240x1060 렌더링/저사양 전환 통과, 5곡 실제 시작·일시정지·정지 통과. test-extra-game은 기존 카운트다운 4개를 세지 않는 오래된 기대값(2 vs 6)에서 실패, 해당 테스트는 수정하지 않음.

## 2026-10-13 — Impostor grounding and shared runtime optimization
- Grounded standing Impostor opponents at visible foot baseline 465 (Defeat keeps its zoom-adjusted baseline). Ejected/ Esculent airborne/giant framing remains unchanged. Shared path covers normal and low-spec versions.
- WeakMap chart cursors skip completed prefixes in note judgments, hold pose selection and drawing. Prefix-max end-time lookup retains opponent sustain/short-tap receptor flashes without rescanning the entire chart. Removed held-key array allocation.
- Cache transformed Impostor layers, measure canvas display width only on resize, preserve high-resolution rendering, and decode Sonic images before play. Existing effects remain enabled in normal versions.
- Checks: test-game, test-sustain-segments, test-hurt-priority, test-mod-fixes and test-triple pass. New test-runtime-performance checks 75 mods x normal/low at start/middle/end, 150 paths, no page/resource errors; checks cursor replacement and long-hold prefix handling. Clean canvas screenshot reviewed for Sussus Moogus grounding.
- Synthetic completed-note traversal: 20,000 old notes over 500 calls, old opponent loop ~18.3 ms total vs new below timer resolution on this machine; this is a CPU microbenchmark, not an FPS or no-stutter guarantee.
- Updated browser cache hashes.

## 2026-10-13 — Selected Selever 2.1 charts and two tracks
- User selected Attack and Demonila. Added original instrumental/vocal stems and Easy/Normal/Hard charts, reusing existing Selever, BF, GF and Casanova church framing in normal/low-spec modes. New mod character art and scripted transformation/ghost-trail effects are not imported.
- Casanova now uses Selever 2.1 charts for all three difficulties; existing characters, stage, audio and visual effects retained. Both source Casanova stems are byte-identical to existing stems.
- Dedicated import-selever2.py emits a data-only overlay loaded after survent-mod.js, so original art import remains independent. Default Hard. Existing importer deduplicates simultaneous same-lane notes and trims overlapping same-lane holds.
- Hard player notes: Casanova 659, Demonila 413, Attack 736.
- Fixed missing-icon URL fallback during song selection.
- Validation: test-selever2 passes all source note-time/lane sets for 3 songs x 3 difficulties, character/audio preservation, six normal/low playback paths, decoded duration, source counts, start/middle/end drawing and pause/reset without missing resources. Reviewed Attack canvas capture; test-game and test-sustain-segments pass. Deployment manifest checked and cache hashes refreshed.

## 2026-10-13 — Nonlethal nightmare opponent drain
- Opponent note drain stops at 1 health. Health already below 1 stays unchanged; zero health is never revived. Player MISS/BAD and hazard damage still apply normally. Applies to all songs and both performance modes.
- test-nightmare checks normal drain, threshold crossing, 100 repeated hits, sub-floor health, zero health, lethal player judgments, disabled nightmare and invulnerability. test-game and test-sustain-segments pass. Updated browser cache hash.

## 2026-10-13 — A.G.O.T.I mod
- Added source freeplay order Screenplay, Parasite, A.G.O.T.I, Guns (bonus), original Inst/Voices and Easy/Normal/Hard charts, plus normal/low-spec entries and dedicated picker group.
- Imported normal/angry Agoti, original BF including misses, GF and rock GF. Uses original void/platform/pillar art in an adapted canvas layout. Large background atlases reduced to 320px reference height; low-spec prerenders a still background.
- A.G.O.T.I Lua: 10px cosine lane motion, 360-degree receptor turns at steps 120,248,375,632,696,824,952,1208 over 0.6s. Disabled for low-spec. Original engine easing, stage layout and animation offsets are approximations; story dialogue/cutscenes excluded.
- test-agoti passed four songs x three difficulties note time/lane match (1.1 microsecond rounding tolerance), sustain endpoints, 8 actual normal/low playback paths, stage start/middle/end, all singing directions, correct cast, note effects and pause/reset with no page/resource errors. Screenplay and angry stage captures reviewed. test-nightmare and test-game pass.
- Manifest and JS cache hashes updated.

## 2026-10-14 — Recent mod optimization and Selever transparency fix
- Confirmed Selever Up source frames 0003–0009 are entirely transparent, also visible in the compiled atlas. Hold the previous visible pose at those frame indices, preserving all 11 frames and animation duration. Optimized Selever atlas from 3 pages to 2; all frames now have visible pixels.
- Atlas importer shares identical source pixels/geometry across repeated frame names. Rebuilt Agoti at unchanged resolution: total decoded character pages ~502 MiB to ~240 MiB (not total gameplay memory). Source-frame order, chart data and offsets retained. Asset URLs now use content hashes.
- Selever atlas repacked at existing resolution, WebP quality 90. BF/GF lossless repacking increased downloads, so those assets/metadata remain unchanged. Existing Survent song/chart data remains unchanged.
- Limit extra-pack image loads/decodes to 3 workers; await all workers on failure before returning. Release previous decoded audio before preparing the next stage; show image progress separately from audio preparation. Playback still starts after image and full instrumental/vocal decoding, followed by scheduled countdown.
- test-agoti: all 8 normal/low playback paths and source charts passed. test-recent-loading: Casanova/Demonila/Attack normal/low playback passed with no page/resource errors. analysis/test-selever-frames verifies every pose and retained Up timing. Nightmare and sustain regressions passed. Manifest checked; cache hashes refreshed.

## 2026-10-14 — Disable miss poses
- Removed failure-pose triggers for ordinary misses, sustain misses and hurt notes. Existing singing poses complete normally; MISS feedback, score, combo, health and hazard penalties remain unchanged.
- test-game, test-sustain-segments, test-hurt-priority and test-nightmare pass. Refreshed script cache hashes.

## 2026-10-14 — D/F/J/K press counters
- Added independent visible keyboard press counts below score HUD inside the game. Counts playing-state D/F/J/K keydowns once per physical press, including empty hits; excludes held-key repeats, paused input, arrows and touch. Reset on a new start or song change.
- test-key-counts and test-game pass. Refreshed CSS/JS hashes.

## 2026-10-14 — Dense-chart hot paths
- Restrict keypress candidate scans to unfinished notes in the current 180ms judgment horizon. Preserve active-sustain precedence and normal-note priority over Deathmatch hazards.
- Remove per-note 8px Canvas shadow blur (atlas outlines remain) and skip save/translate/rotate/restore for unrotated arrows; retain custom skins, sustains and rotation effects.
- test-dense-notes: 160-note rendering both scroll directions; 19 predicate visits out of 20,000 notes. This is a functional/work-bound check, not a measured user-device FPS improvement. Judgment, hurt priority, sustain and key-count tests pass. Cache hash refreshed.

## 2026-10-14 — Persistent illuminated keycaps
- D/F/J/K counts now accumulate across songs and restarts in localStorage for this browser. Writes coalesced once per second and flushed on focus loss/pagehide to avoid synchronous storage on every note. Storage errors safely retain in-memory counting.
- Square keycaps illuminate while their physical key is held, clearing on release/focus loss. Counts remain playing-only; repeat suppression retained.
- test-key-persistence verifies lighting, deferred persistence, reload and song switching. test-key-counts and test-game pass. Updated cache hashes.

## 2026-10-15 Sonic special-note designs
- Replaced generic ×/! overlays with Phantom and animated Static note atlases; preload only the types used in the selected chart. Low-spec uses a still frame.
- Source: https://github.com/hoaanhmine/Sonic-exe-full/tree/main/assets/preload/images (PHANTOMNOTE_assets and STATICNOTE_assets). Existing hit behavior unchanged.
- Verified browser loading/drawing for all four lanes in Too Slow and Triple Trouble, normal and low-spec; inspected rendered preview; JS syntax checks passed.

## 2026-10-16 Mario’s Madness and two-step song selection
- Added all 41 canonical audio/chart pairs from the supplied Mario’s Madness folder, including separately named old versions, with normal and low-spec entries. Imported original characters, available character-change/animation events, and source-derived opening backgrounds.
- Added ten mod cards with icons/names/counts. Choosing a card filters the track list to that pack; Back returns to cards. Kept normal/low filtering and Impostor story ordering. Selection stays locked during play.
- Imported Mario, monochrome, GB, NES, DS and Virtual note skins and used special poison/bomb/Boo/coin/water/bullet/mushroom assets. Pixel characters use their source enlargement and nearest-neighbor rendering.
- Source stage/note reference: https://github.com/Dewott2501/Mario-Madness . Native cutscenes, minigames and custom phase triggers are not fully ported. The song description and analysis/mario-import-report.json record this limitation; opening-stage backgrounds are static composites.
- Validation: 41 songs × normal/low at start/middle/end, all character and skin resources; 10-card filtering; actual Inst/Voices decode/play/pause/stop; settings lock; 390px menu width. Game, sustain, death-note priority and nightmare regressions passed. Visually inspected menu, Its a me, Golden Land, No Party and Paranoia. No missing character or used note-skin files.

## 2026-10-16 Per-mod song progress HUD
- Moved the time/progress display directly above the persistent D/F/J/K counters for all ten mod families and their low-spec entries. Added distinct pack colors and lightweight bar styling.
- Remaining time accounts for playback rate, clamps countdown/end states, and updates text only when changed. Progress transforms update at bounded chart-time intervals without layout reads.
- Mario variants use source-inspired stage colors and Mario/VCR fonts from https://github.com/Dewott2501/Mario-Madness/tree/main/assets/fonts . All packs retain the requested common bar location; these themes do not reproduce every native time gimmick.
- Verified all ten themes, Mario variants, low-spec entries, rate/countdown/completion, mobile and fullscreen placement with test-song-progress.cjs. Existing test-game.cjs passed. Inspected mobile/fullscreen screenshots.

## 2026-10-16 Mario story song order
- Ordered Mario normal/low lists by introduction, Island, Woodland, Cosmos, Heights, Classified, then All-Stars finale. Unbeatable and legacy/extra versions follow the story.
- Source: supplied assets/weeks/week1.json and https://github.com/Dewott2501/Mario-Madness/blob/main/source/CustomFreeplayState.hx world lists. Branching worlds are presented in the source menu order.
- Verified all 41 imported songs occur exactly once in ordering; normal/low ranks and finale placement pass. test-mario.cjs passes menu filtering and 41 normal/low scenes, skins and loading. Updated game script cache hash.

## 2026-10-17 Mario scripted character transitions
- Flattened source PlayState character-changing Triggers into deterministic chart-time events, including Universal dispatch, nested All-Stars/Unbeatable cues and Demise's two-beat delay at the current BPM. Added 169 derived character/visibility/animation cues across 14 song entries, retaining source cue provenance in analysis/mario-character-report.json.
- Added missing transformation atlases and icon assets; preload scene transition characters and icons before play. All-Stars companions and Unbeatable companion actors have visibility and note-type singing routing. Normal and low-spec share the transformation timeline, and backwards seeks rebuild state without wall-clock timers.
- Incremental asset updater preserves existing audio, charts and backgrounds. Main Mario importer now also compiles the reviewed character triggers. Source: cached original https://github.com/Dewott2501/Mario-Madness/blob/main/source/PlayState.hx . This change ports character cues, not the full stage/cinematic/minigame/shader sequences; opening backgrounds remain static.
- Validation: test-mario-transitions passes 840 event boundary/reset checks across normal/low, explicit major-form fixtures, companion singing and 7 representative tracks' real drawing with no transition-time network requests. Visually inspected All-Stars finale and Promotion. test-mario passes all 41 normal/low scene/resource checks; game and sustain regressions pass. Compared every chart and audio reference against HEAD: unchanged. All-Stars decoded image footprint in headless test is approximately 455 MiB; preloading prevents transition downloads but is not a guarantee against device memory/GPU stalls.

## 2026-10-17 All-Stars stage transitions
- Added source-derived Act 2, Act 3, Act 4, second-perspective spotlight and finale stage composites. Switch times are read from the original chart: 105.6, 224, 350.4, 454.4 and 479.95 seconds. The old All-Stars version stays unchanged.
- A single opaque selected phase replaces the opening background; low-spec also selects phases instead of retaining its startup snapshot. Preload all phase textures before play. Normal mode adds a compact eight-frame native lightning sheet in the finale; low-spec omits lightning.
- Source setup/phase references: cached Mario-Madness PlayState.hx lines 3735-3944 and 9815-10260. Stage layers are composited into the web game's fixed wide view, using still animation frames; native camera choreography, moving background actors, floating debris and cinematic memory overlays are not fully reproduced.
- test-allstars-stages passes all five boundaries in normal/low, one-background rendering, backwards seek, no transition-time requests and legacy isolation. test-mario-transitions and test-game pass. Visually inspected Act 2/3 composites and Act 3/solo/finale in-game screenshots. Background files total ~164 KB plus lightning; added decoded textures ~14 MiB. Refreshed cache hashes and asset manifest.
## 2026-10-21 All-Stars supplied video reference
- Compared the supplied Gitsuna All-Stars video at representative Act 1/2/3/4, solo, finale and ending timestamps. Corrected per-phase actor positions and scales, centered back-facing BF in Act 2, smaller BF in Act 4 and enlarged cropped finale portraits. Removed duplicate opening pipe.
- Added native Act 3 lyric poses, Act 4 intro and red ending animation, floating props and solo memory overlays using original mod assets and original chart trigger times. Hide notes and character labels during normal-mode cinematics; verified no player notes occur in those windows. Low-spec retains phase backgrounds/layout but omits animated cinematic effects.
- Preload presentation assets before play; normal All-Stars decoded image footprint measured ~543 MiB. Cinematic sheets sample at 8 fps, Act 3 lyric poses are still frames, and fixed wide framing is an adaptation rather than full native camera/choreography reproduction.
- Validation: reference-based normal/low layout and cinema tests, no hidden playable notes or transition-time requests, all phase-boundary checks, 840 character transition/reset checks, seven representative Mario tracks and game regression tests pass. Inspected in-game intro, ending and representative phase screenshots. Refreshed asset manifest and browser cache hashes.
## 2026-10-21 Stronger nightmare
- Doubled opponent-note health drain from 0.45 to 0.9 across songs. Retained minimum health 1 for opponent drain, Destruction invulnerability and player recovery 1.4. Updated setting text and game cache hash.
- Validation: test-game.cjs passes; inspected unchanged minimum-health clamp and invulnerability guard.
## 2026-10-24 All-Stars chord poses and Act 3 motion
- No Animation chart notes now skip animation initiation instead of cancelling the active pose. Apply this to player heads, sustain re-press/held poses and opponent heads, preserving scoring and health behavior. The solo chord at 456.8 contains one animated and one No Animation sustain.
- Replaced normal Act 3 static composites with native body/head animation frames at 8 fps, starting from original phase/lyric cues. Preload atlas pages before play; low-spec retains static images and does not request the animation pages. Generator integrated into the existing stage build.
- Validation: actual solo chord inputs in both orders, sustained pose retention, changing background frames, normal/low phase boundaries and backwards seek, no transition downloads/browser errors, 840 character-transition checks and game regressions pass. Visually inspected the lyric scene. Added ~7.2 MB encoded assets; measured full normal All-Stars decoded textures ~787 MiB, so this does not eliminate memory pressure on low-memory devices.
## 2026-10-25 Garcello pack
- Imported Headache, Nerves, Release and Fading in story order from the supplied SeoS assets. Added a dedicated mod card/icon, Easy/Normal/Hard source charts, original instrumental/vocal tracks, four Garcello forms, native BF/GF animation atlases and night/ghost/dawn alley composites. General low-spec and nightmare controls also apply.
- Fading's source JSON includes 335 unique notes per difficulty beyond its 43.2-second audio. Excluded those unreachable leftovers and bounded sustains/sections to audio duration. Report preserves counts in analysis/garcello-import-report.json.
- Preload only the chosen scene, deduplicate atlas frames, and cache low-spec backgrounds. Story dialogue, pre/post-song cutscenes and native scripted cough/smoke sequences are not ported; this adds playable song adaptations.
- Validation: four songs x normal/low render/load checks, all difficulty note bounds, four animation directions, story-order mod picker, no mid-play image requests, all eight audio tracks browser-decoded, no page errors, and test-game regressions pass. Visually reviewed Headache and Fading canvas renders.
## 2026-10-26 Kapi Arcade Showdown
- Imported Wocky, Beathoven, Hairball, Nyaw and bonus Flatzone in the supplied week order. Added a separate mod card, original instrumental/vocal tracks, source difficulty charts, Kapi/angry Kapi/Game & Watch and pack-specific BF/GF.
- Added original stage layers, animated lights/crowds, chart camera/animation events, opponent/player note and receptor skins, and cached static low-spec backgrounds. Shared nightmare and other controls remain available. Story dialogue, pre-song stomp and custom scripted events are not fully ported; framing is adapted to the web canvas.
- Repaired unescaped ampersand in the supplied G&W XML during import without modifying source files. Trimmed oversized transparent frame margins and anchored G&W at the floor. Cropped the intended Flatzone scene from its packed background image instead of displaying the entire sheet. Explicit dance idle anchors keep GF and G&W stable.
- Validation: test-kapi.cjs passes all five normal/low scenes, source difficulty note bounds, mod picker story order, directional animation drawing, ten browser-decoded audio tracks, no mid-play requests or browser errors. test-game passes. Visually reviewed Wocky, Hairball and corrected Flatzone. Refreshed asset manifest and cache hashes.

## 2026-10-26 Camellia mod
- Added 18 songs in supplied week order with original audio and Normal/Hard/Maniac charts (Tutorial has Maniac only, reused for each selection). Excluded Sync Test. Converted 8-key osu charts into opponent/player four-lane charts; retained simultaneous notes and sustains, removed exact duplicates and notes beyond audio duration.
- Added Camellia selector/icon, per-song difficulty labels, studio/concert backgrounds, normal/low-spec support, Botan and Halloween character variants. Prebaked native Adobe symbol animations into WebP atlases, including both MX and M3D affine transforms; fixed GF part positioning.
- Current stage rendering uses static native composites; source dialogue, scripted camera/light effects and GF-specific vocal charts are not ported.
- Validation: test-camellia.cjs passes all 18 songs in normal/low modes, all chart bounds, audio decoding, four-direction rendering, picker order, no late image fetches and no page errors. test-game.cjs passes. Visually inspected studio, concert/Botan and Halloween scenes. Refreshed browser cache hashes.

## 2026-10-26 GF flicker and Kapi expansion/performance
- Fixed Camellia normal/Halloween GF danceLeft index 30 exceeding its source timeline. Clamp to the final source frame, preserving pose timing instead of rendering transparent pixels. Pixel checks cover every idle/left/right frame.
- Reduced Kapi atlas resolution toward displayed sizes while compensating render scale; only import used spectator dance animations. Nyaw character/background decoded memory fell from 174.52 to 71.16 MiB (note skins excluded). Cache foreground/background composites until source animation frames change; 120 rendered frames required 42 composite rebuilds. This is a resource/render-work reduction, not a measured FPS guarantee on the user's device.
- Added supplied assets-directory songs Meowgen, Scratch Post, Sanctuary and Pyoro (nine Kapi songs total), native chart/audio/characters and static stage layers, preloaded Sanctuary character switches. Pyoro's invisible opponent/spectator are native blank sheets. Adapted malformed legacy event rows. Fuzzy Distortion has only MP3s and no chart, so excluded rather than inventing notes. Custom imageflash effects/dialogue remain unported.
- Added image-content cache tags so updated atlases refresh on existing browsers; importer writes them on regeneration. Validation: nine songs normal/low, audio decoding, all difficulty chart bounds, transition preload, cache work/memory checks, general gameplay regression and both GF dance cycles pass; inspected additional-song scenes.

## 2026-10-27 Configurable play keys
- Added four key-binding buttons accepting physical letter/number keys, duplicate rejection, Escape cancellation and default reset. Persist bindings in localStorage; retain arrow aliases, pause shortcuts and per-lane cumulative counts. Update keycaps, touch buttons, hint and lane labels. Rebinding pauses active play and releases held inputs.
- Validation: game regression and browser rebinding/persistence/counter/release/arrow/reset checks pass. Refreshed script/style cache hashes.

## 2026-10-27 Visible key settings entry
- Added highlighted keyboard settings button beside Sound. Move existing controls into a labelled native modal with close button/Escape and automatic focus handling. Opening during play pauses; modal input does not trigger gameplay.
- Validation: browser open/close, rebinding, persistence, pause-on-open and default reset checks plus game regression pass. Refreshed cache hashes.

## 2026-10-27 Normal-mode scroll frame pressure
- Investigated note positioning: movement uses absolute audio time; general modes do not periodically alter speed. Retained native Impostor scroll events and special lane motion. High-DPI normal rendering previously used four times the logical pixels.
- Cap normal canvas scale at 1.25, use medium image resampling, and reduce once to logical resolution after sustained slow animation frames (15/45 over 22ms). Ignore pauses/tab stalls and never raise resolution again mid-song; reset budget on song start. This reduces rendering pressure without time-smoothing or delaying judgments/notes.
- Headless Edge 1920px/DPR2 forced-readback probe averages: Nyaw 51.7→27.7ms, Ghost 37.2→21.0ms, Casanova 76.3→49.6ms; includes first-frame costs and readback, not a user-device FPS claim. User-specific song/segment not yet provided.
- Validation: test-scroll-stability.cjs, test-game.cjs and test-dense-notes.cjs pass; audio-time-linear note movement, fallback/hysteresis, paused frames and dense 160-note drawing verified.
