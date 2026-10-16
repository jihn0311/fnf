"""Translate reviewed PlayState.hx character cues into chart-time events.
Source: Dewott2501/Mario-Madness, source/PlayState.hx lines 9489-14069.
No native code is executed. Timed callbacks are flattened for pause/seek/rate safety.
Stage cinematics and shaders are deliberately independent from this character pass.
"""
import math

def compile_mario_events(song, events):
    result=[]
    bpm=float(song['bpm']); elapsed=0; tempo=[(0,bpm)]
    for sec in song.get('notes',[]):
        if sec.get('changeBPM') and float(sec.get('bpm') or 0)>0:
            bpm=float(sec['bpm']);tempo.append((elapsed,bpm))
        elapsed+=float(sec.get('lengthInSteps',16))*60/bpm/4
    def num(value):
        try:
            n=float(value);return n if math.isfinite(n) else 0
        except (ValueError,TypeError):return 0
    for e in events:
        name=e['name']
        if name=='Triggers Universal':name='Triggers '+song['song'].removesuffix(' Old')
        if not name.startswith('Triggers '):continue
        name=name[9:].lower();a=num(e['v1']);b=num(e['v2']);t=e['time']
        def emit(kind,side,value,delay=0):
            result.append({'time':round(t+delay,6),'name':kind,'v1':str(side),'v2':str(value),'marioDerived':True,'sourceTrigger':[e['name'],e['v1'],e['v2']]})
        def swap(side,char,delay=0):emit('Change Character',side,char,delay)
        def visible(side,show,delay=0):emit('Mario Visibility',side,'1' if show else '0',delay)
        def anim(side,pose,delay=0):emit('Play Animation',pose,side,delay)
        if name=='all-stars':
            if a==2:
                if b==0:
                    swap(1,'omega');swap(0,'bf_behind');visible('gf',False)
                elif b==1:swap(2,'lg2');visible('gf',True)
                elif b==2:swap(1,'w4r');visible('nova',True)
                elif b==3:emit('Mario Guest','guest','y0shi');visible('guest',True)
                elif b==7:visible('nova',False)
            elif a==3 and b==0:
                swap(0,'bfASsad');swap(1,'gx');visible('nova',True);visible('gf',False);visible('guest',False)
            elif a==4:
                if b==0:
                    swap(0,'bf_ultrafinale');swap(1,'mario_ultra2');visible('nova',True)
                elif b==2:swap(0,'bf_ultrafinale2');visible('nova',False)
                elif b==6:
                    swap(0,'bf_ultrafinale3');swap(1,'mario_ultra3');visible('nova',True)
        elif name=='powerdown' and a==5:
            swap(1,'mxV2');swap(2,'gfnew')
        elif name=='demise' and a in (1,2):
            current=next(v for at,v in reversed(tempo) if at<=t)
            delay=120/current
            swap(1,'mx_demiseUG' if a==1 else 'mx_demise',delay)
            swap(0,'bf_demiseUG' if a==1 else 'bf_demise',delay)
        elif name=='starman slaughter':
            if a==2:visible('gf',True)
            elif a==4:
                swap(2,'yoshi-exe',1.5);swap(1,'peach-exe',3.34);visible('nova',False,3.34)
            elif a==7:visible('nova',True,2.5833)
            elif a==10:visible('nova',False,1.875)
            elif a==11:visible('gf',False,3.9583)
            elif a==12:
                swap(1,'mariohorror-melt');visible('nova',True);anim('dad','jump');anim('dad','fall',1.4);anim('dad','singDOWN',1.75)
        elif name in ('nourishing blood','grand dad'):
            if a==0:swap(0,'bfcave');swap(2,'gfcave');swap(1,'grandcave')
            elif a==1:swap(0,'bfGD');swap(2,'gfGD');swap(1,'grand')
        elif name=='no hope':
            if a==0:swap(1,'devilmariotalk');anim('dad','talk')
            elif a in (1,2):emit('Alt Idle Animation','dad','-alt' if a==1 else '')
        elif name=='race traitors':
            if a==0:swap(1,'racet1')
            elif a==1 and e['v2']:swap(1,e['v2'])
        elif name=='promotion':
            if a==1:swap(1,'stanley');visible('echo',False);visible('gf',False)
            elif a==5:anim('dad','depression')
        elif name=='abandoned' and a==10:swap(1,'luigi_fountain3d');swap(0,'bf-back3d')
        elif name=='the end':
            if a in (9,9.5):visible('echo',False)
            if a==9.5:swap(1,'costumedark');anim('dad','wahoo')
        elif name=='dark forest':
            if a==0:swap(1,'peachtalk1');anim('dad','talk')
            elif a==1:swap(1,'peachthe')
            elif a==2:swap(1,'peachtheG')
        elif name=='overdue' and a==7:swap(0,'pico_run');visible('gf',False)
        elif name=='unbeatable':
            if a==2:swap(1,'hunter');visible('nova',True)
            elif a==5:swap(1,'koopa');visible('nova',True)
            elif a==5.5:swap(1,'mrSYS');visible('nova',True)
            elif a==6:
                if b==0:swap(1,'hunter');visible('nova',True)
                elif b==1:swap(2,'hunter');visible('gf',True);visible('nova',False)
                elif b==2:swap(1,'mrSYS');visible('nova',True)
            elif a==7:
                swap(1,'koopa' if b==0 else 'mrSYSwb');visible('nova',True)
                if b==1:emit('Mario Guest','guest','koopa');visible('guest',True)
            elif a==11 and b==4:swap(1,'koopa');visible('nova',True)
            elif a==16:swap(1,'mrSYS',.5);visible('nova',True,.5)
            elif a==17:
                if b==0:
                    visible('gf',False);visible('guest',False);visible('lakitu',False);visible('gyromite',False)
                elif b==1:swap(1,'mrSYSwb')
                elif b==2:swap(1,'mrSYS')
            elif a==20:
                swap(1,'mrSYSwb' if b==1 else 'mrSYS');visible('nova',True)
                emit('Mario Guest','lakitu','web-lakitu');emit('Mario Guest','gyromite','web-gyromite');visible('lakitu',True);visible('gyromite',True)
                visible('gf',b==1);visible('guest',b==1)
                if b==1:emit('Mario Guest','guest','koopa')
            elif a==23:
                if b in (0,1):swap(1,'hunter' if b==0 else 'koopa');visible('nova',True)
                else:
                    visible('nova',False)
                    target='gyromite' if b==2 else 'lakitu'
                    emit('Mario Guest',target,'web-'+target);visible(target,True)
                if b!=2:visible('gyromite',False)
                if b!=3:visible('lakitu',False)
            elif a==24:swap(1,'mrSYS');visible('nova',False)
            elif a==25:visible('nova',False);visible('gf',False);visible('guest',False)
            elif a==27:
                if b==1:emit('Mario Guest','guest','koopa');visible('guest',True)
                elif b==3:visible('gf',True)
                elif b in (0,2):
                    target='lakitu' if b==0 else 'gyromite';emit('Mario Guest',target,'web-'+target);visible(target,True)
    return result
