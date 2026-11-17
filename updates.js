'use strict';
// Every new release needs a unique id and changes:{mods:0,major:0,minor:1}.
// See VERSIONING.md. Counts are cumulative; do not reset other components.
const GAME_UPDATES = [
 {id:'2026-11-17-idle-eye',changes:{mods:0,major:0,minor:1},date:'2026-11-17',title:'BF 눈·커럽션 대기 동작 수정',items:['BF 기타 두 번째 포즈의 눈을 보정했습니다.','캡처 포즈와 Escape에 추가했던 인위적인 상하 이동을 제거했습니다.','일반 캐릭터가 쉴 때는 모드 파일의 원본 대기 애니메이션을 사용합니다. 기타 대기 포즈는 유지합니다.']},
 {id:'2026-11-17-bf-guitar-hands',changes:{mods:0,major:0,minor:1},date:'2026-11-17',title:'BF 기타 포즈 손 위치 수정',items:['BF 기타 2·3·4번 포즈에서 양손을 주머니 밖으로 꺼내 기타 목과 줄을 잡도록 수정했습니다.','기타를 몸 앞에 배치하고 나머지 포즈는 유지했습니다.']},
 {id:'2026-11-17-captured-poses',changes:{mods:0,major:1,minor:0},date:'2026-11-17',title:'커럽션 방향별 캡처 동작',items:['영상의 방향별 캡처를 바탕으로 대기·왼쪽·아래·위·오른쪽 포즈를 복원했습니다.','기타 장면을 자동 반복 대신 입력한 방향과 롱노트 유지 상태에 연결했습니다.','마이크 노트와 기타 노트를 구분하고 가려진 얼굴·손·기타를 다른 캡처를 참고해 재구성했습니다. 복원 부분은 원본과 차이가 있을 수 있습니다.']},
 {id:'2026-11-16-mobile-portrait',changes:{mods:0,major:0,minor:1},date:'2026-11-16',title:'세로형 모바일 터치 플레이',items:['모바일 모드 버튼을 SOUND 버튼 옆으로 옮겼습니다.','모바일 모드를 켜면 세로 화면 아래 큰 화살표를 직접 터치할 수 있습니다. 동시 입력과 롱노트 누르기를 지원합니다.','모바일에서는 점프·회피 공격과 추가 조작 버튼을 제외하며, 모드를 끄면 기존 화면으로 돌아갑니다.']},
 {id:'2026-11-16-evil-guitar-chart',changes:{mods:0,major:1,minor:0},date:'2026-11-16',title:'Discharge 기타 구간 채보 복원',items:['영상의 보라·하늘·초록 원형 노트가 추출되지 않아 비어 있던 기타 구간 채보를 복원했습니다.','영상에서 이동 경로를 추적해 판정 시점을 추정했으며 원본과 오차가 있을 수 있습니다.']},
 {id:'2026-11-16-evil-proportions',changes:{mods:0,major:0,minor:1},date:'2026-11-16',title:'영상 재구성 캐릭터 비율 조정',items:['기타 캡처 캐릭터가 가로로 늘어나지 않도록 원본 가로·세로 비율을 유지합니다.','엄마와 스키드·펌프, Soul BF의 상대적인 크기를 조정했습니다.']},
 {id:'2026-11-16-evil-animation',changes:{mods:0,major:0,minor:1},date:'2026-11-16',title:'영상 재구성 캐릭터·동작 수정',items:['마지막 Daddy Dearest 전투의 피코·스키드와 펌프·엄마 등장 순서와 상대 변화를 조정했습니다.','눈빛 효과의 검은 영역이 무대 배경을 가리지 않도록 수정했습니다.','기타 장면을 24프레임 연속 캡처로 바꾸고 TV 동작이 매 박자 처음부터 반복되던 문제를 수정했습니다.','캡처 기반 동작과 전환 시점은 영상 재구성이므로 원본과 차이가 남아 있습니다.']},
 {id:'2026-11-16-evil-reference',changes:{mods:1,major:0,minor:0},date:'2026-11-16',title:'Corruption 영상 재구성 스테이지 추가',items:['Daddy Dearest 3개와 Soul BF 4개 스테이지를 별도 모드로 추가했습니다.','영상 음원과 추정 채보, 캐릭터·배경 전환 및 캡처 이미지를 적용했습니다.','원본 채보가 없어 판정 시점과 일부 동작·연출은 영상과 차이가 있습니다. 일반·저사양을 선택할 수 있습니다.']},
 {id:'2026-11-15-volume-keys',changes:{mods:0,major:0,minor:1},date:'2026-11-15',title:'볼륨 단축키 추가',items:['플레이 중 - 키로 볼륨을 낮추고 = 키로 높일 수 있습니다.','원본 VOLUME 이미지와 막대를 표시하며 볼륨 설정을 저장합니다.']},
 {id:'2026-11-15-mod-version',changes:{mods:0,major:0,minor:1},date:'2026-11-15',title:'모드 수 기준으로 버전 변경',items:['버전 첫 숫자는 곡 수 대신 추가된 모드 수로 계산합니다.','기본 곡과 저사양·회피 없음 변형은 별도 모드로 세지 않습니다.']},
 {id:'2026-11-15-version-display',changes:{mods:0,major:0,minor:1},date:'2026-11-15',title:'누적 버전 표시 추가',items:['상단에 곡 추가·큰 수정·작은 수정 누적 버전을 표시합니다.','기존 곡 목록과 Git 저장 기록을 기준으로 이전 변경도 집계했습니다.']},
 {id:'2026-11-15-flowey-quality',date:'2026-11-15',title:'플라위 하트 화질·보프 위치 수정',items:['회전 하트 이미지를 원본 픽셀을 보존하는 무손실 이미지로 교체했습니다.','보프 동작별 위치 보정에 원본 배율을 반영해 과도하게 흔들리는 현상을 줄였습니다.']},
 {id:'2026-11-14-ranking-names',date:'2026-11-14',title:'랭킹 닉네임 필터 추가',items:['부적절한 표현이 포함된 닉네임은 게임에서 등록을 차단하고 랭킹 목록에서도 숨깁니다.']},
 {id:'2026-11-14-lightning-combo',date:'2026-11-14',title:'번개 피격 콤보 유지',items:['번개에 맞아도 콤보가 끊기지 않도록 변경했습니다. 체력 피해는 그대로 적용됩니다.']},
 {id:'2026-11-14-sans-bones',date:'2026-11-14',title:'샌즈 뼈 연출 수정',items:['영상과 원본을 기준으로 긴 뼈의 크기, 빈틈 높이와 오른쪽에서 왼쪽으로 이동하는 경로를 수정했습니다.','반 박자마다 생성하며 구간 종료 후에도 이미 나온 뼈는 화면 밖까지 이동합니다.']},
 {id:'2026-11-14-hopes-finale',date:'2026-11-14',title:'Hopes and Dreams 마지막 구간 조정',items:['마지막 구간의 게임 진행 처리를 조정했습니다.']},
 {id:'2026-11-14-hopes-stars-sound',date:'2026-11-14',title:'큰 별·배경 번개와 피격음 추가',items:['Hopes and Dreams 원본 구간에 반 박자 간격의 큰 별과 배경 번개를 추가했습니다.','SPACE 회피 실패와 번개 피격 시 원본 피격음을 재생합니다.','효과음은 플레이 전에 준비하고 저사양 모드에서는 추가 연출을 생략합니다.']},
 {id:'2026-11-14-mobile-jump',date:'2026-11-14',title:'모바일 점프 버튼 설정',items:['점프 버튼은 기본으로 숨기고, 게임 화면 오른쪽 위 모바일 모드를 켰을 때만 표시합니다.','모바일 모드 선택은 저장되며, 꺼져 있어도 SPACE 키 점프는 사용할 수 있습니다.']},
 {id:'2026-11-14-fullscreen-dialogue',date:'2026-11-14',title:'전체화면 대사 표시 수정',items:['게임 화면만 모드에서도 곡 시작 전 대사와 다음·건너뛰기 버튼이 표시되도록 수정했습니다.']},
 {id:'2026-11-14-soul-damage',date:'2026-11-14',title:'하트 크기와 공격 피해 수정',items:['하트의 투명 여백을 제거해 더 크고 선명하게 표시합니다.','Sans의 뼈 비율을 조정하고 SPACE 공격에도 원본 뼈 이미지를 적용했습니다.','화면 갱신이 늦을 때 번개·SPACE 공격 피해가 누락되는 조건을 수정했습니다.','번개는 왼쪽부터 보라·하늘·초록·빨강으로 표시됩니다.']},
 {id:'2026-11-14-hopes-hazards',date:'2026-11-14',title:'Hopes and Dreams 연출 수정',items:['플레이 중 말풍선이 채보 뒤에 표시되도록 수정했습니다.','번개를 레인 중앙에 정렬하고 레인별 색상과 원본 비율을 적용했습니다.','SPACE 회피 함정을 원본 경고 테두리와 베기 애니메이션으로 변경했습니다.']},
 {id:'2026-11-14-undertale',date:'2026-11-14',title:'UNDERTALE 스테이지 추가',items:['튜토리얼, Asriel, Flowey, Sans 스테이지를 추가했습니다.','원본 채보·음악·캐릭터와 함정·회복 노트를 적용했습니다.','하트 이동, SPACE·터치 점프, 전투 대사와 공격 연출을 추가했습니다.','일반·저사양 모드를 제공하며, Flowey는 Normal 난이도로 플레이할 수 있습니다.','새 업데이트는 처음 접속할 때 한 번 안내하며, 왼쪽 위에서 내역을 다시 볼 수 있습니다.']},
 {id:'2026-11-11-galaxy',date:'2026-11-11',title:'갤럭시 채보 이동',items:['Cona·Underworld·Cyber에 노트와 판정 화살표 이동을 적용했습니다.','Underworld의 보라색 노트와 Cyber의 게임 화면 축소·이동 연출을 추가했습니다.','일반 모드는 모든 난이도에서 이동하며, 저사양 모드는 고정 채보를 유지합니다.']}
];

// Audited history through c105582; entries older than this baseline are already counted.
const GAME_VERSION_BASELINE={mods:17,major:32,minor:46};
const GAME_VERSION_TOTAL={...GAME_VERSION_BASELINE};
for(const entry of [...GAME_UPDATES].reverse()){if(!entry.changes)continue;for(const key of ['mods','major','minor']){const n=entry.changes[key]||0;if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid version increment');GAME_VERSION_TOTAL[key]+=n;}entry.version=Object.values(GAME_VERSION_TOTAL).join('.');}
const GAME_VERSION=Object.values(GAME_VERSION_TOTAL).join('.');

(()=>{
 const key='fnf.updates.lastSeen',latest=GAME_UPDATES[0],trigger=document.getElementById('open-updates'),dialog=document.getElementById('updates-dialog'),body=document.getElementById('updates-content'),title=document.getElementById('updates-title');
 const badge=document.getElementById('game-version');if(badge){badge.textContent='v'+GAME_VERSION;badge.title='모드 추가 '+GAME_VERSION_TOTAL.mods+' · 큰 수정 '+GAME_VERSION_TOTAL.major+' · 작은 수정 '+GAME_VERSION_TOTAL.minor;badge.setAttribute('aria-label',badge.title);}
 if(!latest||!trigger||!dialog)return;
 const read=()=>{try{const value=localStorage.getItem(key);if(value)return value;}catch{}try{return sessionStorage.getItem(key);}catch{return null;}};
 const remember=()=>{try{localStorage.setItem(key,latest.id);}catch{try{sessionStorage.setItem(key,latest.id);}catch{}}};
 function render(history){title.textContent=history?'업데이트 내역':'새로운 업데이트';body.replaceChildren();for(const entry of history?GAME_UPDATES:[latest]){const article=document.createElement('article'),date=document.createElement('time'),heading=document.createElement('h3'),list=document.createElement('ul');date.dateTime=entry.date;date.textContent=entry.date.replaceAll('-','.');heading.textContent=(entry.version?'v'+entry.version+' · ':'')+entry.title;for(const item of entry.items){const li=document.createElement('li');li.textContent=item;list.append(li);}article.append(date,heading,list);body.append(article);}dialog.scrollTop=0;}
 function open(history){if(dialog.open)return;render(history);dialog.showModal();remember();}
 trigger.addEventListener('click',async()=>{if(typeof state!=='undefined'&&state==='playing'&&typeof pause==='function')await pause();open(true);});
 document.getElementById('close-updates').addEventListener('click',()=>dialog.close());
 document.getElementById('updates-confirm').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 // Keep game shortcuts from firing while the modal owns keyboard focus.
 for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{if(dialog.open)e.stopPropagation();},true);
 if(read()!==latest.id)open(false);
})();
