
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
