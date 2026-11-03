'use strict';
// Publishable key only. Never put a secret/service_role key in browser code.
(() => {
 const endpoint='https://vlkhiaeuzosdcvclempf.supabase.co/rest/v1/scores';
 const key='sb_publishable_3dwBx1CGfO6E-Nu9iSAJGw_Oln63Grv';
 const headers={apikey:key,'Content-Type':'application/json'};
 const el=id=>document.getElementById(id);
 let pending=null,busy=false,requestId=0;
 function mode(){return {song_id:song.lowSpec?songId+'-low':songId,difficulty:settings.difficulty,play_side:playerSide(),rate:settings.rate,practice:!!el('practice').checked,nightmare:!!el('nightmare').checked};}
 async function api(url,options={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch(url,{cache:'no-store',...options,headers:{...headers,...options.headers},signal:controller.signal});if(!response.ok){const error=new Error('request failed');error.status=response.status;throw error;}const body=await response.text();return body.trim()?JSON.parse(body):null;}
  finally{clearTimeout(timer);}
 }
 function recordLabel(row){return (SONGS[row.song_id]?.title||row.song_id||'')+' · '+(row.difficulty||'')+' · '+(row.play_side==='nova'?'상대':'보프')+' · '+(row.rate||1)+'×'+(row.practice?' · 연습':'')+(row.nightmare?' · 나이트메어':'');}
 async function refresh(){
  const id=++requestId,selected=mode(),all=el('ranking-view').value==='all',search=el('ranking-search').value.trim();el('ranking-order-heading').textContent='순위';el('ranking-title').textContent=song.title+' · '+selected.difficulty.toUpperCase()+' · '+(selected.play_side==='echo'?'보프':'상대')+' · '+selected.rate+'×'+(selected.practice?' · 연습':'')+(selected.nightmare?' · 나이트메어':'');
  if(all)el('ranking-title').textContent=song.title+' · 모든 플레이 조건'+(search?' · 닉네임: '+search:'');
  el('ranking-status').textContent='기록을 불러오는 중…';el('ranking-rows').replaceChildren();
  const params=new URLSearchParams({select:'nickname,score,accuracy,max_combo,misses,song_id,difficulty,play_side,rate,practice,nightmare',order:'score.desc,accuracy.desc,created_at.asc,id.asc',limit:'200'});
  params.set('song_id','eq.'+selected.song_id);
  if(!all)for(const [name,value] of Object.entries(selected))params.set(name,'eq.'+value);
  if(search)params.set('nickname','eq.'+search);
  try{const rows=[],seen=new Set(),target=all?100:20;
   for(let offset=0;rows.length<target;offset+=200){params.set('offset',String(offset));const page=await api(endpoint+'?'+params);if(id!==requestId)return;
    for(const row of page){const token=JSON.stringify([row.nickname,row.song_id,row.difficulty,row.play_side,Number(row.rate),!!row.practice,!!row.nightmare,Number(row.score),Number(row.accuracy),Number(row.max_combo),Number(row.misses)]);if(seen.has(token))continue;seen.add(token);rows.push(row);if(rows.length===target)break;}
    if(page.length<200)break;
   }
   rows.forEach((row,index)=>{const tr=document.createElement('tr');for(const value of [index+1,row.nickname,Number(row.score).toLocaleString(),Number(row.accuracy).toFixed(1)+'%',row.max_combo,recordLabel(row)]){const td=document.createElement('td');td.textContent=String(value);tr.appendChild(td);}el('ranking-rows').appendChild(tr);});
   el('ranking-status').textContent=rows.length?(all?'중복 제외 · 높은 점수순 상위 100개 · 서로 다른 조건의 점수는 직접 비교하지 않아요.':'중복 제외 · 상위 20개 기록 · 사용자 제출 기록 (플레이 진위 미검증)'):(search?'해당 닉네임의 기록이 없어요. 등록할 때 쓴 이름을 확인해주세요.':all?'아직 기록이 없어. 첫 기록을 남겨봐!':'현재 조건의 기록이 없어요. 전체 기록에서 다른 조건의 기록을 찾아보세요.');
  }catch{if(id===requestId)el('ranking-status').textContent='온라인 순위를 불러오지 못했어. 잠시 후 새로고침해줘.';}
 }
 window.addEventListener('fnf:finished',event=>{
  pending=null;el('online-ranking').classList.remove('record-ready');el('ranking-submit').disabled=true;
  if(event.detail.failed||event.detail.bot){el('ranking-submit-status').textContent='곡을 끝까지 직접 플레이하면 기록을 올릴 수 있어.';return;}
  pending={...event.detail.mode,score:event.detail.score,accuracy:event.detail.accuracy,max_combo:event.detail.max_combo,misses:event.detail.misses};
  el('ranking-submit-status').textContent='방금 완주한 기록: '+pending.score.toLocaleString()+'점. 닉네임을 입력하고 등록해줘.';
  el('ranking-submit').disabled=busy;el('online-ranking').classList.add('record-ready');
 });
 el('ranking-submit').addEventListener('click',async()=>{
  if(!pending||busy)return;
  const nickname=el('ranking-name').value.trim();if(!nickname||nickname.length>20){el('ranking-submit-status').textContent='닉네임은 1~20자로 입력해줘.';return;}
  const record=pending;busy=true;el('ranking-submit').disabled=true;
  el('ranking-submit-status').textContent='저장하는 중…';
  try{await api(endpoint,{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({...record,nickname})});if(pending===record){pending=null;el('online-ranking').classList.remove('record-ready');el('ranking-submit-status').textContent='기록을 저장했어!';}void refresh();}
  catch(error){el('ranking-submit-status').textContent=error.status===401||error.status===403?'서버에서 기록 등록 권한을 거절했어.':error.status===400?'기록 값이 서버의 허용 범위와 맞지 않아 등록하지 못했어.':error.status?'서버 오류로 등록하지 못했어 ('+error.status+'). 잠시 후 다시 눌러줘.':'서버 응답을 확인하지 못했어. 새로고침으로 기록이 올라갔는지 먼저 확인해줘.';}
  finally{busy=false;el('ranking-submit').disabled=!pending;}
 });
 el('open-ranking').addEventListener('click',()=>{if(state==='playing')pause();el('online-ranking').scrollIntoView({behavior:'smooth',block:'start'});el('ranking-heading').focus({preventScroll:true});void refresh();});
 el('ranking-view').addEventListener('change',refresh);
 el('ranking-search-button').addEventListener('click',refresh);
 el('ranking-search').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();void refresh();}});
 el('ranking-refresh').addEventListener('click',refresh);
 for(const id of ['song','performance-mode','difficulty','play-side','rate','practice','nightmare'])el(id)?.addEventListener('change',refresh);
 void refresh();
})();
