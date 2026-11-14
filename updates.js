'use strict';
// Add a new entry with a unique id whenever a user-facing update is published.
const GAME_UPDATES = [
 {id:'2026-11-14-hopes-stars-sound',date:'2026-11-14',title:'큰 별·배경 번개와 피격음 추가',items:['Hopes and Dreams 원본 구간에 반 박자 간격의 큰 별과 배경 번개를 추가했습니다.','SPACE 회피 실패와 번개 피격 시 원본 피격음을 재생합니다.','효과음은 플레이 전에 준비하고 저사양 모드에서는 추가 연출을 생략합니다.']},
 {id:'2026-11-14-mobile-jump',date:'2026-11-14',title:'모바일 점프 버튼 설정',items:['점프 버튼은 기본으로 숨기고, 게임 화면 오른쪽 위 모바일 모드를 켰을 때만 표시합니다.','모바일 모드 선택은 저장되며, 꺼져 있어도 SPACE 키 점프는 사용할 수 있습니다.']},
 {id:'2026-11-14-fullscreen-dialogue',date:'2026-11-14',title:'전체화면 대사 표시 수정',items:['게임 화면만 모드에서도 곡 시작 전 대사와 다음·건너뛰기 버튼이 표시되도록 수정했습니다.']},
 {id:'2026-11-14-soul-damage',date:'2026-11-14',title:'하트 크기와 공격 피해 수정',items:['하트의 투명 여백을 제거해 더 크고 선명하게 표시합니다.','Sans의 뼈 비율을 조정하고 SPACE 공격에도 원본 뼈 이미지를 적용했습니다.','화면 갱신이 늦을 때 번개·SPACE 공격 피해가 누락되는 조건을 수정했습니다.','번개는 왼쪽부터 보라·하늘·초록·빨강으로 표시됩니다.']},
 {id:'2026-11-14-hopes-hazards',date:'2026-11-14',title:'Hopes and Dreams 연출 수정',items:['플레이 중 말풍선이 채보 뒤에 표시되도록 수정했습니다.','번개를 레인 중앙에 정렬하고 레인별 색상과 원본 비율을 적용했습니다.','SPACE 회피 함정을 원본 경고 테두리와 베기 애니메이션으로 변경했습니다.']},
 {id:'2026-11-14-undertale',date:'2026-11-14',title:'UNDERTALE 스테이지 추가',items:['튜토리얼, Asriel, Flowey, Sans 스테이지를 추가했습니다.','원본 채보·음악·캐릭터와 함정·회복 노트를 적용했습니다.','하트 이동, SPACE·터치 점프, 전투 대사와 공격 연출을 추가했습니다.','일반·저사양 모드를 제공하며, Flowey는 Normal 난이도로 플레이할 수 있습니다.','새 업데이트는 처음 접속할 때 한 번 안내하며, 왼쪽 위에서 내역을 다시 볼 수 있습니다.']},
 {id:'2026-11-11-galaxy',date:'2026-11-11',title:'갤럭시 채보 이동',items:['Cona·Underworld·Cyber에 노트와 판정 화살표 이동을 적용했습니다.','Underworld의 보라색 노트와 Cyber의 게임 화면 축소·이동 연출을 추가했습니다.','일반 모드는 모든 난이도에서 이동하며, 저사양 모드는 고정 채보를 유지합니다.']}
];
(()=>{
 const key='fnf.updates.lastSeen',latest=GAME_UPDATES[0],trigger=document.getElementById('open-updates'),dialog=document.getElementById('updates-dialog'),body=document.getElementById('updates-content'),title=document.getElementById('updates-title');
 if(!latest||!trigger||!dialog)return;
 const read=()=>{try{const value=localStorage.getItem(key);if(value)return value;}catch{}try{return sessionStorage.getItem(key);}catch{return null;}};
 const remember=()=>{try{localStorage.setItem(key,latest.id);}catch{try{sessionStorage.setItem(key,latest.id);}catch{}}};
 function render(history){title.textContent=history?'업데이트 내역':'새로운 업데이트';body.replaceChildren();for(const entry of history?GAME_UPDATES:[latest]){const article=document.createElement('article'),date=document.createElement('time'),heading=document.createElement('h3'),list=document.createElement('ul');date.dateTime=entry.date;date.textContent=entry.date.replaceAll('-','.');heading.textContent=entry.title;for(const item of entry.items){const li=document.createElement('li');li.textContent=item;list.append(li);}article.append(date,heading,list);body.append(article);}dialog.scrollTop=0;}
 function open(history){if(dialog.open)return;render(history);dialog.showModal();remember();}
 trigger.addEventListener('click',async()=>{if(typeof state!=='undefined'&&state==='playing'&&typeof pause==='function')await pause();open(true);});
 document.getElementById('close-updates').addEventListener('click',()=>dialog.close());
 document.getElementById('updates-confirm').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 // Keep game shortcuts from firing while the modal owns keyboard focus.
 for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{if(dialog.open)e.stopPropagation();},true);
 if(read()!==latest.id)open(false);
})();
