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
  try{const response=await fetch(url,{...options,headers:{...headers,...options.headers},signal:controller.signal});if(!response.ok)throw new Error('request failed');return response.status===204?null:await response.json();}
  finally{clearTimeout(timer);}
 }
 async function refresh(){
  const id=++requestId,selected=mode();el('ranking-title').textContent=song.title+' · '+selected.difficulty.toUpperCase()+' · '+(selected.play_side==='echo'?'보프':'상대')+' · '+selected.rate+'×'+(selected.practice?' · 연습':'')+(selected.nightmare?' · 나이트메어':'');
  el('ranking-status').textContent='순위를 불러오는 중…';el('ranking-rows').replaceChildren();
  const params=new URLSearchParams({select:'nickname,score,accuracy,max_combo',order:'score.desc,accuracy.desc,created_at.asc',limit:'20'});
  for(const [name,value] of Object.entries(selected))params.set(name,'eq.'+value);
  try{const rows=await api(endpoint+'?'+params);if(id!==requestId)return;
   rows.forEach((row,index)=>{const tr=document.createElement('tr');for(const value of [index+1,row.nickname,Number(row.score).toLocaleString(),Number(row.accuracy).toFixed(1)+'%',row.max_combo]){const td=document.createElement('td');td.textContent=String(value);tr.appendChild(td);}el('ranking-rows').appendChild(tr);});
   el('ranking-status').textContent=rows.length?'상위 20개 기록 · 사용자 제출 기록 (플레이 진위 미검증)':'아직 기록이 없어. 첫 기록을 남겨봐!';
  }catch{if(id===requestId)el('ranking-status').textContent='온라인 순위를 불러오지 못했어. 잠시 후 새로고침해줘.';}
 }
 window.addEventListener('fnf:finished',event=>{
  pending=null;el('ranking-submit').disabled=true;
  if(event.detail.failed||event.detail.bot){el('ranking-submit-status').textContent='곡을 끝까지 직접 플레이하면 기록을 올릴 수 있어.';return;}
  pending={...event.detail.mode,score:event.detail.score,accuracy:event.detail.accuracy,max_combo:event.detail.max_combo,misses:event.detail.misses};
  el('ranking-submit-status').textContent='방금 완주한 기록: '+pending.score.toLocaleString()+'점. 닉네임을 입력하고 등록해줘.';
  el('ranking-submit').disabled=busy;
 });
 el('ranking-submit').addEventListener('click',async()=>{
  if(!pending||busy)return;
  const nickname=el('ranking-name').value.trim();if(!nickname||nickname.length>20){el('ranking-submit-status').textContent='닉네임은 1~20자로 입력해줘.';return;}
  const record=pending;busy=true;el('ranking-submit').disabled=true;
  el('ranking-submit-status').textContent='저장하는 중…';
  try{await api(endpoint,{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({...record,nickname})});if(pending===record){pending=null;el('ranking-submit-status').textContent='기록을 저장했어!';}void refresh();}
  catch{el('ranking-submit-status').textContent='저장하지 못했어. 연결을 확인하고 다시 눌러줘.';}
  finally{busy=false;el('ranking-submit').disabled=!pending;}
 });
 el('ranking-refresh').addEventListener('click',refresh);
 for(const id of ['song','performance-mode','difficulty','play-side','rate','practice','nightmare'])el(id)?.addEventListener('change',refresh);
 void refresh();
})();
