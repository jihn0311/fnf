const result=document.querySelector('#result');
document.querySelector('#analyze').onclick=async()=>{
 const button=document.querySelector('#analyze');button.disabled=true;
 try{
  result.textContent='MP3 해독 중…';
  const audio=new AudioContext();const buffer=await audio.decodeAudioData(await (await fetch('/assets/self-embodiment.mp3')).arrayBuffer());
  const rate=11025,offline=new OfflineAudioContext(3,Math.ceil(buffer.duration*rate),rate),source=offline.createBufferSource();source.buffer=buffer;
  const merger=offline.createChannelMerger(3);
  // Three isolated frequency bands for onset and sustain measurements.
  const low=offline.createBiquadFilter();low.type='lowpass';low.frequency.value=180;
  const mid=offline.createBiquadFilter();mid.type='bandpass';mid.frequency.value=900;mid.Q.value=.5;
  const high=offline.createBiquadFilter();high.type='highpass';high.frequency.value=2500;
  for(const [i,filter] of [low,mid,high].entries()){source.connect(filter);filter.connect(merger,0,i);}merger.connect(offline.destination);source.start();
  result.textContent='주파수 대역별 강세 분석 중…';const rendered=await offline.startRendering(),channels=[0,1,2].map(i=>rendered.getChannelData(i));
  const hop=110,window=440,frames=[];
  for(let at=0;at<rendered.length;at+=hop){
    const bands=channels.map(samples=>{let sum=0;for(let j=at;j<Math.min(at+window,samples.length);j++)sum+=samples[j]*samples[j];return Math.sqrt(sum/Math.min(window,samples.length-at));});
    frames.push(bands.map(v=>Number(v.toFixed(6))));
  }
  const data={duration:buffer.duration,sampleRate:buffer.sampleRate,channels:buffer.numberOfChannels,hop:hop/rate,window:window/rate,frames};
  const saved=await fetch('/analysis-results',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!saved.ok)throw Error('분석 저장 실패');
  result.textContent=JSON.stringify({status:'분석 완료',duration:data.duration,sampleRate:data.sampleRate,frames:frames.length},null,2);await audio.close();
 }catch(error){result.textContent='분석 오류: '+error.message;button.disabled=false;}
};
