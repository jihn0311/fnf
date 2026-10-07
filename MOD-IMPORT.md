# 세 모드 웹 이식 기록

사용자가 제공한 폴더의 데이터 파일을 변환했습니다. EXE는 실행하지 않았습니다.

## 곡 선택

- Virus R: Invade, Malfunction, R-Memory, The Battle of Robbery, Virus R, Warning, Test(보너스). 원본에 있는 EASY/NORMAL/HARD만 제공합니다.
- Deathmatch: Deathmatch 일반판, Evil판, Tutorial 일반판/Evil판(보너스). 일반/Evil의 서로 다른 음원과 채보를 개별 항목으로 보존합니다.
- Tainted Fate: Crush, Defeat, Destruction. 원본 Tainted 채보를 NORMAL 슬롯에서 제공합니다. 없는 쉬움/어려움 채보를 만들어 넣지는 않았습니다.

기존 15개 곡에 14개 항목을 더해 총 29개입니다. 일반 방향키/D F J K, 롱노트, 업/다운스크롤, 기존 판정 범위, 곡 속도/노트 속도, ESC 메뉴를 그대로 사용할 수 있습니다.
동일 시각·동일 방향의 중복 노트는 한 번의 입력으로 처리되도록 합쳤습니다. 절대 타임스탬프는 보존하며 겹치는 롱노트 꼬리만 다음 노트 직전으로 정리합니다.

## 이식된 연출

- Virus R: 원본 캐릭터/TV 캐릭터, 사이버/창 무대, 제공된 배경 스프라이트 애니메이션과 박자 반응.
- Deathmatch: 원본 캐릭터, 배경 캐릭터, 배경과 관객 애니메이션. 채보/이벤트의 캐릭터 교체, 화면 흔들림, 낙하/대체 idle 애니메이션. Evil의 HURT 노트는 누르면 체력 15%와 점수가 감소하고, 지나치면 MISS가 되지 않습니다. 검은색 × 노트를 피하세요.
- Crush: 로고·블러, 낙엽, 박자에 따른 카메라 기울기, 선택/꽃/거절 애니메이션, nou 효과음, 흰색/폭발 스프라이트와 플래시.
- Defeat: 도입 블러, 좌우 컷인, 배경 전환, 실루엣, 펄스 블러, 빨간 플래시, 캐릭터 전환. 연습 모드 해제 시 5 MISS에서 실패합니다.
- Destruction: 도입 암전·HUD 등장, 112박 레인 교체(플레이어가 왼쪽), 단계별 캐릭터/배경 전환, 색 분리·글리치, 흰 배경·BF 컷인·피날레, 마지막 문구, 단계별 게임오버 애니메이션, 종료 후 dumb.mp4.
- Destruction 실패 조건: 도입부 4 MISS 이후 다음 MISS에서 실패, 182~320박과 388박 이후 즉사, 안전 구간은 최소 체력 10%. 연습 모드에서는 실패 종료를 적용하지 않습니다.
- 효과와 트윈은 음악의 시간축을 사용합니다. 곡 속도 변경 시 함께 바뀌고 ESC 일시정지에서 멈추며 재시작 시 초기화됩니다. 게임오버 애니메이션만 곡 정지 후 짧게 재생됩니다.

## 원본과 다른 부분 / 미확인 사항

이 프로젝트는 원본 실행 파일을 실행하는 에뮬레이터가 아닙니다. Canvas에 맞춘 무대 배치/카메라/합성이라 픽셀 단위 모습은 다릅니다. 배경 레이어 배치와 일부 캐릭터 크기도 웹 화면에 맞춰 조정했습니다.

Virus R 및 Deathmatch 폴더에는 커스텀 엔진 소스가 없어 EXE 내부에 하드코딩된 추가 이벤트·화면 전환은 전부 확인할 수 없습니다. Virus R의 창 무대 배치는 제공된 리소스를 이용한 재구성입니다. 모든 원본 효과가 완전히 동일하게 이식되었다고 보장하지 않습니다. 원본 Haxe/PlayState 소스나 실행 영상이 있으면 남은 타이밍을 대조할 수 있습니다.

Tainted Fate의 제공된 Lua 이벤트 종류는 모두 처리했습니다. OpenFL 셰이더는 Canvas 블러/RGB 분리/스캔라인 변위로 재현하며, 카메라 줌/이동은 웹 무대에서 양쪽 레인이 보이도록 조정했습니다. 운영체제 창 제목 연출은 게임 화면의 문구로 표시합니다. 무작위 낙엽/글리치는 재시작 때 같은 모습을 보이도록 결정적인 패턴을 사용합니다.

Deathmatch 숫자형 노트는 [Psych Engine 0.4.2의 이전 채보 호환표](https://github.com/ShadowMario/FNF-PsychEngine/blob/0.4.2/source/editors/ChartingState.hx)에 따라 1=Alt Animation, 3=Hurt Note로 해석했습니다. [Hurt Note 정의](https://github.com/ShadowMario/FNF-PsychEngine/blob/0.4.2/source/Note.hx)와 제공된 HURTNOTE_assets를 사용합니다. 커스텀 CorruptEngine의 변경 여부는 소스가 없어 확인할 수 없습니다. 웹 게임의 기존 롱노트 단위 판정을 유지하므로 HURT 롱노트도 머리에서 한 번 피해를 처리합니다.

미참조 개인/개발용 영상과 EXE는 배포하지 않습니다.

## 재생성 / 검사

- `analysis/import-extra-mods.py`: 원본 폴더에서 음원/채보/스프라이트 변환. Pillow 필요.
- `--charts-only`: 기존 변환 아트를 재사용하고 채보/메타데이터 갱신. 이미지 원본 변경 시 이 옵션을 빼고 전체 변환하세요.
- `extra-mods.js`: 곡/아트 데이터, `extra-runtime.js`: 타임라인/효과 런타임.
- `analysis/extra-import-report.json`: 곡별 길이, 난이도/진영별 노트 수와 이벤트 수.
- `node test-extra-game.cjs`: 실제 14곡 디코딩, 동기화, 정지/재시작, 배속, 이벤트/특수 노트/실패/엔딩 검사.
- `node test-extra-browser.cjs`: 모든 새 무대와 주요 타임라인 장면 렌더링 검사.
- `node build-deploy.cjs`: dist 및 배포 ZIP 갱신.

## Triple Trouble 전환 수정 (2026-10-07)

기존 코드는 노트의 singer 번호를 캐릭터 교체로 취급해 Tails로 자주 되돌아갔고, Xenophanes 자리에 Cycles의 SONIC_X(Lord X)를 사용했습니다. 원본 Beast 및 BFPhase3_Perspective / Flipped 아트가 빠져 있었습니다.

이제 [Sonic.exe 2.0 PlayState의 stepHit](https://github.com/FlexMasterOfficial/Sonic.exe-source-2.0/blob/main/source/PlayState.hx)과 [Character 애니메이션 정의](https://github.com/FlexMasterOfficial/Sonic.exe-source-2.0/blob/main/source/Character.hx)에 맞춰 음악 시간으로 전환합니다. 일반/어려움 모두 2832스텝에서 146→166 BPM 변화를 반영합니다.

| 시작 스텝 | 약 시간 | 상대 / BF |
| --- | --- | --- |
| 0 | 0:00 | Tails / 일반 BF |
| 1040 | 1:46.849 | 왼쪽 Xenophanes / BF 뒤쪽 시점 |
| 1296 | 2:13.151 | 오른쪽 Knuckles / 왼쪽 BF |
| 2320 | 3:58.356 | 오른쪽 Xenophanes / 반대쪽 BF 뒤쪽 시점 |
| 2823 | 4:50.034 | 왼쪽 Eggman / 오른쪽 BF |
| 4111 | 6:46.531 | 왼쪽 Xenophanes / BF 뒤쪽 시점 |

1296/2823스텝에서 원본처럼 5초 동안 레인을 교환/복귀합니다. 화살표 입력 방향 자체는 유지합니다. 체력바 이름/아이콘도 상대와 함께 바뀝니다. 모양과 방향을 원본에 맞추되 화면상의 크기·배치는 웹 무대용입니다.

재생성: 기존 Sonic 아트 변환을 실행했다면 그 다음 `python analysis/fix-triple-art.py`를 실행합니다. `node test-triple.cjs`는 전환 직전/직후, 노트 번호와 전환 분리, 양쪽 레인/아이콘, BPM 변화, 배속/일시정지/재시작을 검사합니다.

## Deathmatch 가시성·방향 수정 (2026-10-07)

요청에 따라 Deathmatch의 검은 군중 장식(stagepeople/frontpeople)과 화면을 어둡게 가리는 vignette를 렌더링에서 제거했습니다. 캐릭터 교체 시에도 플레이어 위치의 좌우 반전을 적용해 상대를 바라보게 했습니다. 다른 모드의 방향 설정은 유지합니다. 일반판 여섯 전환 장면을 브라우저에서 확인했습니다.

## Virus R 중앙 구도 (2026-10-07)

제공된 원본 스크린샷에 따라 `virus-virus-r` 곡에서는 R만 중앙 창 안에 크게 표시하고, BF와 GF는 숨깁니다. 캐릭터 확대는 중앙 창 안에서 잘라 표시하며 노트 입력과 상단 체력바는 유지합니다. 다른 Virus R 수록곡의 무대 배치는 바꾸지 않았습니다.

## Silly Billy V-Slice port
Imported source Hard chart (1027 player / 1103 opponent notes), instrumental and both vocal stems. Character animations, shrink state, mirror break, lyric text, blackouts, center lanes and original video overlays are adapted. Camera effects are approximate; The 272-frame Adobe Animate lyric-character opening is converted by analysis/import-silly-lyrics.py, followed by the original video. Notes remain above videos and blackouts during playable sections. Source scripts are read as data, not executed. Rebuild with analysis/import-silly.py.
