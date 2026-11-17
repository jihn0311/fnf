# 영상 캡처 기반 방향별 포즈 복원

2026-11-17. 대상: Corruption 영상 재구성 7개 스테이지.

- 영상 캡처 시점: evil-directional-reference-times.json. 기타 참고: Discharge 152~158초 연속 프레임, 110초 원형 노트 화면.
- 기존 영상 루프를 입력 방향별 idle/LEFT/DOWN/UP/RIGHT 이미지로 교체. 11개 고유 모습, 55개 포즈. dearest/dearestcanon은 clean-dad 포즈를 공유.
- 내장 이미지 생성 도구의 편집 경로로 캡처를 복원. 화살표·UI·배경 제거, 가려진 손·얼굴·기타·발은 다른 캡처를 참고해 재구성. 원본과 완전 일치하는 픽셀 복원이 아님.
- 사용한 프롬프트 원칙: supplied video capture를 원본으로 삼고 캐릭터 디자인/색/외곽선 보존; 각 행 동일 캐릭터의 대기·좌·하·상·우 포즈; 전체 몸, 고정 크기/발 기준, 투명 배경; 새 의상/효과/문자 금지. 기타 행은 Soul BF 오른쪽, BF 왼쪽 방향 유지.
- 이미지: assets/extra-mods/evil-reference/restored-{dad,guests,soul,guitar}.webp. 원본 생성 결과도 사용자 .codex/generated_images에 보존.
- 입력 판정이 actors 상태를 갱신하면 해당 포즈로 전환. 롱노트 동안 방향 유지, 박자 이동은 작게 적용. 원형 기타 노트에 captureGuitar 표시, 일반 마이크 노트와 분리.
- test-evil-reference.cjs: 7개 곡 일반/저사양 로딩, 5개 포즈 존재, 네 방향 실제 렌더링 차이, 기타/마이크 입력 전환, 비율 유지, 배포 자산 확인.
