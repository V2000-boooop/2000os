<script>
  // NIGHT FIGHT — fighter 2D arcade (DA Vincent 2000). 100% code, offline.
  // Standards du genre : lecture clavier par POSITION physique (e.code, AZERTY-safe),
  // touches REMAPPABLES + sauvegardées, marche avant/arrière décorrélée de la garde,
  // moveset (jab/direct/uppercut/pied bas/retourné/balayette/aériens/spécial) avec
  // startup/active/recovery + hitstun/blockstun/hitstop, VFX de frappe lisibles.
  // BRANCHEMENT SPRITES : dépose fighter_<perso>_<action>_<n>.webp dans /media/games/fight/,
  // renseigne le nb de frames dans SPRITE_SETS.frames → le lecteur multi-frames anime tout seul.
  import { onMount } from 'svelte';

  let { gameId = 'fight' } = $props();
  let host, canvasEl;
  let mode = $state('cpu');
  let showCtrl = $state(false);
  let remap = $state(null); // 'p1.left' etc. en cours de réattribution

  const C = { noir:'#0a0e1a', bleu:'#24596e', vert:'#4ad0a0', rouge:'#ff3140', jaune:'#ffb24a', violet:'#b06bff', blanc:'#f4f3ec', brun:'#241a0c', gris:'#dddcd4' };

  // n'indexer QUE les actions dont les frames existent (sinon fallback idle, zéro 404)
  const SPRITE_SETS = {
    belge:   { enabled:true, base:'/media/games/fight/fighter_belge_',   frames:{ idle:1, straight:1, roundhouse:1, jump:1, hit:1, ko:1, crouch:1, walk:3, special:1, win:8 }, h:152 },
    cantona: { enabled:true, base:'/media/games/fight/fighter_cantona_', frames:{ idle:1, straight:1, roundhouse:1, jump:1, hit:1, ko:1, crouch:1, walk:3, special:1 }, h:152 },
    element: { enabled:true, base:'/media/games/fight/fighter_element_', frames:{ idle:1, straight:1, roundhouse:1, jump:1, hit:1, ko:1, crouch:1, walk:3, special:1 }, h:152 },
    bride:   { enabled:true, base:'/media/games/fight/fighter_bride_',   frames:{ idle:1, straight:1, roundhouse:1, jump:1, hit:1, ko:1, crouch:1, walk:3, special:1 }, h:152 },
    voisin:  { enabled:true, base:'/media/games/fight/fighter_voisin_',  frames:{ idle:1, straight:1, roundhouse:1, jump:1, hit:1, ko:1, crouch:1, walk:3, special:1 }, h:152 },
    jesus:   { enabled:true, base:'/media/games/fight/fighter_jesus_',   frames:{ idle:1, straight:1, roundhouse:1, jump:1, hit:1, ko:1, crouch:1, walk:3, special:1 }, h:152 },
    alien:   { enabled:true, base:'/media/games/fight/fighter_alien_',   frames:{ idle:1 }, h:152 },
    clover:  { enabled:true, base:'/media/games/fight/fighter_clover_',  frames:{ idle:1, walk:3, crouch:1, jump:1, straight:1, roundhouse:1, hit:1, special:1, ko:1 }, h:152 },
    boss:    { enabled:true, base:'/media/games/fight/fighter_boss_',    frames:{ idle:1, straight:1, roundhouse:1, jump:1, hit:1, ko:1, crouch:1, walk:3, special:1 }, h:152 },
  };
  const PUNCHACT=new Set(['jab','straight','cpunch','jpunch']);
  const KICKACT=new Set(['lkick','roundhouse','sweep','jkick']);
  const SK=(jacket,jacket2,pants,cap,sneak,skin)=>({jacket,jacket2,pants,cap,sneak,skin});
  const ROSTER=[
    {key:'belge',   name:'LE BELGE',   skin:SK(C.violet,'#7d3fd0',C.noir,C.violet,C.blanc,'#e6b489')},
    {key:'cantona', name:'CANTONA',    skin:SK(C.rouge,'#b3202c',C.brun,C.jaune,C.jaune,'#d99c6b')},
    {key:'element', name:'RUBY RHOD',  skin:SK(C.jaune,C.brun,C.brun,C.blanc,'#111','#8a5a3c')},
    {key:'bride',   name:'KIDDO',      skin:SK(C.jaune,'#c9962f',C.jaune,C.jaune,C.blanc,'#e6b489')},
    {key:'voisin',  name:'JOSÉ BOVÉ',  skin:SK(C.brun,'#1a1a1a',C.bleu,C.brun,C.brun,'#d9a273')},
    {key:'jesus',   name:'JÉSUS',      skin:SK(C.blanc,C.rouge,C.blanc,C.brun,C.brun,'#e0b088')},
    {key:'alien',   name:'ALIEN',      skin:SK(C.violet,'#5a3fa0',C.bleu,'#2a1747','#111','#9a8cff')},
    {key:'clover',  name:'CLOVER',     skin:SK(C.rouge,'#c01f2b',C.rouge,C.jaune,'#1a1a1a','#f0c9a8')},
  ];
  const BOSS={key:'boss',name:'LE PATRON',skin:SK(C.rouge,'#7a0f16',C.noir,C.rouge,'#111','#c98f66')};
  // vitesse de marche par perso (agile > 1 > lourd) — flavor type "roster" de fighting game
  const WSPD={belge:1.0,cantona:1.06,element:1.0,bride:1.18,voisin:0.98,jesus:0.9,alien:1.0,clover:1.2,boss:0.95};
  // Décors (dessinés en code, DA Vincent 2000). Un stage par combat en mode arcade.
  const STAGES=[
    {sign:'RAVE EUSKADI',    sky:['#0a0e1a','#141033','#2a1747'], gr:['#160f2e','#0a0713'], grid:'#b06bff', accent:C.violet, win:[C.jaune,C.violet], moon:{c:C.jaune,r:16}, plats:[{x:110,y:120,w:58,src:'rave/enceintes.webp'},{x:810,y:120,w:58,src:'rave/enceintes.webp'},{x:460,y:98,w:120,src:'rave/podium.webp'}], layers:[{src:'rave/fond.webp',x:460,y:0,w:1700,depth:0.5},{src:'rave/foule.webp',x:460,y:-50,w:1300,depth:1.12,front:true}]},
    {sign:'PMU DES ARÈNES',  sky:['#06140e','#0b241a','#103228'], gr:['#0a1a12','#050d09'], grid:'#4ad0a0', accent:C.vert,   win:[C.vert,C.jaune],   moon:{c:C.jaune,r:12}, plats:[{x:110,y:120,w:58},{x:810,y:120,w:58},{x:460,y:98,w:120}], layers:[]},
    {sign:'PORT DE NUIT',    sky:['#04101f','#0a2036','#123048'], gr:['#0a1524','#05101a'], grid:'#3fe3ff', accent:'#3fe3ff', win:[C.jaune,C.blanc],   moon:{c:C.blanc,r:15}, plats:[{x:110,y:120,w:58},{x:810,y:120,w:58},{x:460,y:98,w:120}], layers:[]},
    {sign:'CATHÉDRALE',      sky:['#100a1a','#1a1226','#241830'], gr:['#17131f','#0a0812'], grid:'#8a6bd0', accent:C.jaune,  win:[C.rouge,'#3fe3ff'], moon:null, plats:[{x:110,y:120,w:58},{x:810,y:120,w:58},{x:460,y:98,w:120}], layers:[]},
    {sign:'CLUB 2000',       sky:['#060309','#120616','#1c0a20'], gr:['#120414','#060209'], grid:'#ff3fae', accent:'#ff3fae', win:['#ff3fae','#3fe3ff'], moon:null, plats:[{x:110,y:120,w:58},{x:810,y:120,w:58},{x:460,y:98,w:120}], layers:[]},
    {sign:'DUEL — LA RIDE',  sky:['#2a0f0a','#4a1a12','#6a2a18'], gr:['#2a140c','#160a06'], grid:'#ff6a3a', accent:C.rouge,  win:[C.jaune,C.rouge],  moon:{c:'#ffcaa0',r:22}, plats:[{x:110,y:120,w:58},{x:810,y:120,w:58},{x:460,y:98,w:120}], layers:[]},
  ];
  let sel1=$state(0), sel2=$state(1), selecting=$state(true), slot=$state(1), hoverI=$state(-1);

  // ---- Contrôles : positions physiques (e.code). Défauts standard 2 joueurs (LF2-like), AZERTY-safe. ----
  const DEF = {
    p1:{ left:'KeyA', right:'KeyD', up:'KeyW', down:'KeyS', punch:'KeyJ', kick:'KeyK', special:'KeyL' },
    p2:{ left:'ArrowLeft', right:'ArrowRight', up:'ArrowUp', down:'ArrowDown', punch:'Comma', kick:'Period', special:'Slash' },
  };
  let binds = $state(loadBinds());
  function loadBinds(){ try{ const s=JSON.parse(localStorage.getItem('nf_binds')); if(s&&s.p1&&s.p2) return s; }catch(e){} return structuredClone(DEF); }
  function saveBinds(){ try{ localStorage.setItem('nf_binds', JSON.stringify(binds)); }catch(e){} }
  function resetBinds(){ binds = structuredClone(DEF); saveBinds(); }
  // libellés physiques (AZERTY via KeyboardLayoutMap si dispo)
  let layout = $state({});
  const LBL = { ArrowLeft:'←', ArrowRight:'→', ArrowUp:'↑', ArrowDown:'↓', Comma:',', Period:'.', Slash:'/', Space:'espace', ShiftLeft:'⇧', ShiftRight:'⇧' };
  function keyLabel(code){ if(!code) return '—'; if(layout[code]) return layout[code].toUpperCase(); if(LBL[code]) return LBL[code]; return code.replace('Key','').replace('Digit',''); }

  onMount(() => {
    (async()=>{ try{ if(navigator.keyboard?.getLayoutMap){ const m=await navigator.keyboard.getLayoutMap(); layout=Object.fromEntries([...m]); } }catch(e){} })();

    const ctx = canvasEl.getContext('2d');
    let BW=480, BH=270, GY=210; const ARENA=920, MX=200, SKY=360; let cam={z:1,cx:460,cy:150}; // ARENA = largeur du ring (monde) ≠ BW (pixels canvas) ; caméra dynamique
    function resize(){ const w=host.clientWidth||640,h=host.clientHeight||400; BW=480; BH=Math.max(200,Math.round(BW*h/w)); canvasEl.width=BW; canvasEl.height=BH; GY=BH-58; ctx.imageSmoothingEnabled=false; buildBG(); }
    const ro=new ResizeObserver(resize); ro.observe(host);

    // ---- sprites ----
    const imgCache={};
    function spriteImg(k,action,n){ const set=SPRITE_SETS[k]; if(!set||!set.enabled) return null; const cnt=set.frames[action]; if(!cnt) return null; const idx=Math.min(cnt,Math.max(1,n)); const url=`${set.base}${action}_${idx}.webp`; let e=imgCache[url]; if(!e){e=imgCache[url]={img:new Image(),ok:false}; e.img.onload=()=>e.ok=true; e.img.src=url;} return e.ok?e.img:null; }

    // ---- fond ----
    let bg=document.createElement('canvas'), bx=bg.getContext('2d');
    const fxc=document.createElement('canvas'), fxx=fxc.getContext('2d'); // buffer pour le flash d'impact (silhouette blanche)
    function circle(g,x,y,r){g.beginPath();g.arc(x,y,r,0,7);g.fill();}
    let stageIdx=0;
    function buildBG(){ const S=STAGES[stageIdx]||STAGES[0]; bg.width=ARENA+2*MX; bg.height=BH+SKY; const g=bx;
      g.setTransform(1,0,0,1,MX,SKY); const L=-MX,R=ARENA+MX; // dessin en coords MONDE (x:0..ARENA, y:-SKY..BH)
      const sky=g.createLinearGradient(0,-SKY,0,GY+20); sky.addColorStop(0,S.sky[0]); sky.addColorStop(.6,S.sky[1]); sky.addColorStop(1,S.sky[2]); g.fillStyle=sky; g.fillRect(L,-SKY,R-L,GY+20+SKY);
      g.fillStyle=C.blanc; for(let i=0;i<380;i++) g.fillRect((L+Math.random()*(R-L))|0,(-SKY+Math.random()*(GY+SKY-70))|0,Math.random()<.3?2:1,1);
      if(S.moon){ g.fillStyle=S.moon.c; g.globalAlpha=.9; circle(g,ARENA-130,-70,S.moon.r); g.globalAlpha=1; g.fillStyle='rgba(255,255,255,0.08)'; circle(g,ARENA-130,-70,S.moon.r*1.9); }
      let x=L-10; while(x<R+10){const w=26+Math.random()*40,h=40+Math.random()*120; g.fillStyle='#0a0c1e'; g.fillRect(x,GY-h,w,h); for(let wy=GY-h+6;wy<GY-6;wy+=8)for(let wx=x+4;wx<x+w-4;wx+=7)if(Math.random()<.35){g.fillStyle=Math.random()<.5?S.win[0]:S.win[1];g.fillRect(wx,wy,3,3);} x+=w+4;}
      const gr=g.createLinearGradient(0,GY,0,BH); gr.addColorStop(0,S.gr[0]); gr.addColorStop(1,S.gr[1]); g.fillStyle=gr; g.fillRect(L,GY,R-L,BH-GY);
      g.strokeStyle=S.grid; g.globalAlpha=.8; g.lineWidth=2; g.beginPath(); g.moveTo(L,GY+1); g.lineTo(R,GY+1); g.stroke(); g.globalAlpha=.16; g.lineWidth=1; for(let i=-16;i<=16;i++){g.beginPath();g.moveTo(ARENA/2+i*30,GY);g.lineTo(ARENA/2+i*150,BH);g.stroke();} g.globalAlpha=1;
      g.setTransform(1,0,0,1,0,0);
    }
    function updateCam(dt){ const chH=150;
      const topY=Math.min(GY-f1.y, GY-f2.y)-chH-24, botY=GY+16;
      const leftX=Math.min(f1.x,f2.x)-72, rightX=Math.max(f1.x,f2.x)+72;
      const needW=Math.max(180,rightX-leftX), needH=Math.max(170,botY-topY);
      let z=Math.min(BW/needW, BH/needH); z=Math.max(0.44, Math.min(1.24, z));
      let cx=(leftX+rightX)/2, cy=(topY+botY)/2, hw=BW/(2*z), hh=BH/(2*z);
      cx = (ARENA+2*MX<2*hw) ? ARENA/2 : Math.max(-MX+hw, Math.min(ARENA+MX-hw, cx));
      cy = (BH+SKY<2*hh)  ? (BH-SKY)/2 : Math.max(-SKY+hh, Math.min(BH-hh, cy));
      const k=Math.min(1,dt*7); cam.z+=(z-cam.z)*k; cam.cx+=(cx-cam.cx)*k; cam.cy+=(cy-cam.cy)*k;
    }
    // niveau de sol sous f (0 = plancher, sinon hauteur d'une plateforme). One-way : n'accroche que par au-dessus, en descente, hors drop-through.
    function groundLevel(f,prevY){ let g=0; if((f.dropT||0)>0) return 0;
      const plats=(STAGES[stageIdx]&&STAGES[stageIdx].plats)||[];
      for(const p of plats){ if(Math.abs(f.x-p.x)<=p.w+8 && f.vy<=0 && prevY>=p.y-1 && p.y>g) g=p.y; }
      return g; }
    resize();

    // ---- SFX WebAudio (pas de fichier requis) ----
    let ac=null; function AC(){ if(!ac){ try{ ac=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return ac; }
    // sons par FICHIERS (déposer /media/games/fight/sfx/<type>.wav) → sinon fallback bips synthé
    const sfxCache={}, sfxOk={};
    function sfxFile(type){ let a=sfxCache[type]; if(a===undefined){ a=new Audio(`/media/games/fight/sfx/${type}.wav`); a.preload='auto'; a.addEventListener('canplaythrough',()=>sfxOk[type]=true); a.addEventListener('error',()=>sfxOk[type]=false); sfxCache[type]=a; } return sfxOk[type]?a:null; }
    let _nb=null; function noiseBuf(a){ if(!_nb){ _nb=a.createBuffer(1,(a.sampleRate*0.5)|0,a.sampleRate); const d=_nb.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; } return _nb; }
    function sfx(type){ const f=sfxFile(type); if(f){ try{ const c=f.cloneNode(); c.volume=0.6; c.play().catch(()=>{}); return; }catch(e){} }
      const a=AC(); if(!a) return; const t=a.currentTime;
      const tone=(w,f0,f1,dur,vol)=>{ const o=a.createOscillator(),g=a.createGain(); o.type=w; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+dur+.03); };
      const noise=(dur,vol,ft,freq,q)=>{ const n=a.createBufferSource(); n.buffer=noiseBuf(a); const bp=a.createBiquadFilter(); bp.type=ft; bp.frequency.value=freq; if(q)bp.Q.value=q; const g=a.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur); n.connect(bp); bp.connect(g); g.connect(a.destination); n.start(t); n.stop(t+dur+.03); };
      if(type==='hit'){ noise(.11,.5,'bandpass',1300,1.2); tone('sine',230,80,.13,.55); }              // poing sec (claque + thump)
      else if(type==='heavy'){ noise(.2,.6,'lowpass',900,1); tone('sine',150,42,.24,.7); tone('square',95,45,.1,.25); } // gros impact
      else if(type==='block'){ noise(.06,.4,'highpass',2600,1); tone('square',600,500,.05,.15); }         // garde (tac)
      else if(type==='whoosh'){ noise(.17,.34,'bandpass',950,3); }                                        // coup dans le vide
      else if(type==='jump'){ tone('sine',260,640,.12,.32); }                                             // saut
      else if(type==='ko'){ noise(.42,.6,'lowpass',700,1); tone('sawtooth',200,32,.5,.55); tone('sine',120,30,.5,.4); } // K.O. lourd
      else if(type==='super'){ tone('square',180,900,.5,.4); noise(.5,.32,'bandpass',1500,2); tone('sine',80,60,.5,.4); } // spéciale
      else { tone('square',200,80,.1,.3); } }
    // ---- musique de stage (fichiers ; silence si absents) ----
    let musMenu=null,musFight=null,musBoss=null,curMus=null;
    function music(name){ try{
      if(!musMenu){ musMenu =new Audio('/media/games/fight/music/menu.webm');  musMenu.loop=true;  musMenu.volume=0.36;   // MENU (ancien "son fight 1")
                     musFight=new Audio('/media/games/fight/music/fight.webm'); musFight.loop=true; musFight.volume=0.44;  // MATCH (8-Bit Chill)
                     musBoss =new Audio('/media/games/fight/music/boss.webm');  musBoss.loop=true;  musBoss.volume=0.46; } // BOSS
      const want = name==='menu'?musMenu:(name==='boss'?musBoss:(name==='fight'?musFight:null));
      if(curMus && curMus!==want){ curMus.pause(); curMus.currentTime=0; }
      curMus=want; if(want) want.play().catch(()=>{});
    }catch(e){} }
    function stopMusic(){ try{ if(curMus){curMus.pause(); curMus.currentTime=0; curMus=null;} }catch(e){} }

    // ---- clavier (par position physique) ----
    const codes=new Set(); let prevCodes=new Set();
    function anyBind(code){ for(const p of ['p1','p2']) for(const k in binds[p]) if(binds[p][k]===code) return true; return false; }
    function onDown(e){ const ae=document.activeElement; if(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
      if(remap){ e.preventDefault(); const [p,k]=remap.split('.'); binds[p][k]=e.code; binds={...binds}; saveBinds(); remap=null; return; }
      if(anyBind(e.code)){ e.preventDefault(); codes.add(e.code); AC(); } }
    function onUp(e){ codes.delete(e.code); }
    window.addEventListener('keydown',onDown); window.addEventListener('keyup',onUp);
    const K=(code)=>codes.has(code);

    // ---- constantes ----
    const SPEEDF=250, SPEEDB=185, DASH=460, GRAV=-1780, JUMP=800, JVXF=235, JVXB=200, FLOORW=38; // marche rapide (ring doublé) + dash ; saut haut, apex ~180px
    const clampX=(x)=>Math.max(FLOORW,Math.min(ARENA-FLOORW,x));
    // portées > SEP (pushbox) pour que les coups CONNECTENT à distance de contact
    const MOVES={
      jab:{kind:'punch',h:'high',dur:.24,hit:[.06,.14],range:58,dmg:5,kb:16,stun:.2,heavy:0,cancel:1},
      straight:{kind:'punch',h:'high',dur:.4,hit:[.13,.23],range:70,dmg:9,kb:46,stun:.3,heavy:1},
      cpunch:{kind:'punch',h:'high',dur:.4,hit:[.1,.2],range:58,dmg:8,kb:24,stun:.34,heavy:1,launch:true},
      jpunch:{kind:'punch',h:'high',dur:.45,hit:[.05,.32],range:56,dmg:8,kb:26,stun:.3,heavy:0,air:1},
      lkick:{kind:'kick',h:'low',dur:.28,hit:[.08,.17],range:64,dmg:6,kb:22,stun:.24,heavy:0,cancel:1},
      roundhouse:{kind:'kick',h:'high',dur:.5,hit:[.17,.3],range:82,dmg:12,kb:68,stun:.36,heavy:1},
      sweep:{kind:'kick',h:'low',dur:.44,hit:[.15,.28],range:74,dmg:9,kb:30,stun:.4,heavy:1,knockdown:1},
      jkick:{kind:'kick',h:'high',dur:.48,hit:[.05,.34],range:60,dmg:10,kb:30,stun:.3,heavy:0,air:1},
      special:{kind:'special',h:'high',dur:.8,hit:[.16,.52],range:96,dmg:24,kb:84,stun:.7,heavy:1,knockdown:true},
    };
    const SEP=44; // pushbox : distance mini entre les 2 combattants
    function mk(x,face,skin,key){ return {x,y:0,vy:0,jvx:0,dashT:0,dashV:0,support:0,dropT:0,grounded:true,flash:0,jbuf:0,coyote:0,hp:100,meter:0,face,vface:face,skin,key,st:'idle',t:0,ph:Math.random()*6,atk:null,cd:0,stun:0,ai:0,buf:null,cancel:0,dustT:0,combo:0,comboT:0,
      P:{crouch:0,torso:0,head:0,shL:.5,elL:1,shR:-.5,elR:1,hipL:.2,knL:.3,hipR:-.2,knR:.3,spin:0}}; }
    let f1,f2;
    // rounds (best-of-3)
    let phase='intro', roundNo=1, wins1=0, wins2=0, roundT=60, banner='', bannerT=0, phaseT=0, ladder=[], ladderI=0;
    let hitstop=0, shake=0, parts=[], neonOn=1, neonT=0, nowT=0, superFx=null;

    // ---- mode ARCADE : échelle d'adversaires CPU, décor par combat, boss final ----
    function oppDef(){ return mode==='arcade' ? (ladder[ladderI]||ROSTER[sel2]) : ROSTER[sel2]; }
    function shuffleA(a){ for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];} return a; }
    function startArcade(){ const idx=shuffleA(ROSTER.map((r,i)=>i).filter(i=>i!==sel1)).slice(0,4); const st=shuffleA([0,1,2,3,4]); ladder=idx.map((ri,k)=>({...ROSTER[ri],stage:st[k%st.length]})); ladder.push({...BOSS,stage:5}); ladderI=0; stageIdx=ladder[0].stage; buildBG(); selecting=false; paused=false; newRound(true); }
    function newRound(full){ if(full){wins1=0;wins2=0;roundNo=1;} const A=ROSTER[sel1],B=oppDef(); if(full) music(B&&B.key==='boss'?'boss':'fight'); f1=mk(300,1,A.skin,A.key); f1.name=A.name; f2=mk(620,-1,B.skin,B.key); f2.name=B.name; roundT=60; phase='intro'; phaseT=1.2; banner='ROUND '+roundNo; bannerT=1.2; focus(); }
    function focus(){ canvasEl&&canvasEl.focus&&canvasEl.focus(); }

    // ---- input → move ----
    function dirOf(f,map){ const toward=f._opp>f.x?map.right:map.left, away=f._opp>f.x?map.left:map.right; return {fwd:K(toward),back:K(away),down:K(map.down),up:K(map.up)}; }
    function chooseMove(f,d,btn){ if(f.y>(f.support||0)+0.5) return btn==='punch'?'jpunch':'jkick'; if(d.down) return btn==='punch'?'cpunch':'sweep'; if(d.fwd) return btn==='punch'?'straight':'roundhouse'; return btn==='punch'?'jab':'lkick'; }
    function canAct(f){ return !(f.st==='ko'||f.st==='knockdown'||f.st==='getup'||f.stun>0); }
    function startMove(f,name){ const busy=f.atk||f.cd>0; if(!canAct(f)) return; if(busy && !(f.cancel>0 && MOVES[name])) return; const M=MOVES[name]; if(M.air&&f.y<=(f.support||0)+0.5) return; f.atk={name,M,t:0,landed:false,last:-9}; f.st=name; f.cd=M.dur+.08; f.cancel=0; sfx('whoosh'); }
    // SPÉCIALE (combo P-P-K-K ou touche spécial) : finisher + flash plein écran qui sonne l'adversaire
    function triggerSpecial(f){ if(!canAct(f)) return; const M=MOVES.special; f.atk={name:'special',M,t:0,landed:false,last:-9}; f.st='special'; f.cd=M.dur+.5; f.cmb=[]; superFx={x:f.x,t:0}; sfx('super'); shake=Math.max(shake,7); hitstop=Math.max(hitstop,0.14); }

    function control(f,o,map,dt){
      f._opp=o.x;
      if(!canAct(f)){ f._vx=0; f._blk=false; f._crouch=false; return; }
      const d=dirOf(f,map); const grounded=!!f.grounded;
      if(grounded && (f.support||0)>0 && K(map.down) && !prevCodes.has(map.down)){ f.dropT=0.22; f.y-=3; f.support=0; f.grounded=false; } // drop-through (Melee soft platform)
      // buffer d'attaque (ne rien perdre pendant la recovery) + détection du combo P-P-K-K
      for(const b of ['punch','kick','special']) if(K(map[b])&&!prevCodes.has(map[b])){ f.buf={b,t:0};
        if(b==='punch'||b==='kick'){ f.cmb=(f.cmb||[]).filter(e=>nowT-e.t<1.4); f.cmb.push({b,t:nowT}); if(f.cmb.length>4) f.cmb=f.cmb.slice(-4);
          if(f.cmb.length===4 && f.cmb[0].b==='punch'&&f.cmb[1].b==='punch'&&f.cmb[2].b==='kick'&&f.cmb[3].b==='kick'){ f.cmb=[]; f.doSpecial=true; } } }
      if(f.doSpecial){ f.doSpecial=false; f.buf=null; triggerSpecial(f); }
      // prise = poing+pied ensemble, au corps à corps
      if(grounded && K(map.punch)&&K(map.kick) && Math.abs(o.x-f.x)<40 && canAct(o) && o.grounded){ doThrow(f,o); f.buf=null; }
      if(f.buf){ f.buf.t+=dt; if(f.buf.t>.16) f.buf=null; }
      if(f.buf && !f.atk && (f.cd<=0||f.cancel>0)){ const b=f.buf.b; f.buf=null; if(b==='special') triggerSpecial(f); else startMove(f,chooseMove(f,d,b)); }
      // déplacement — TOUJOURS possible (arrière inclus). Pas de blocage par la garde.
      // dash / back-dash : double-tap ← ou → (burst rapide, annulable en saut ou attaque)
      for(const side of ['left','right']){ if(K(map[side])&&!prevCodes.has(map[side])){ if(grounded && f['tap'+side]!=null && nowT-f['tap'+side]<0.24 && !f.atk && (f.dashT||0)<=0){ const dir=side==='right'?1:-1; f.dashT=0.20; f.dashV=dir*DASH*(dir===f.face?1:0.82); sfx('whoosh'); spark(f.x,GY-6,'#7c8bd0',6); } f['tap'+side]=nowT; } }
      // saut BUFFERISÉ + COYOTE TIME (jouabilité) : l'input up est mémorisé 0.12s, et on peut sauter 0.09s après avoir quitté une plateforme
      if((f.coyote||0)>0) f.coyote-=dt;
      if(K(map.up)&&!prevCodes.has(map.up)) f.jbuf=0.12;
      if((f.jbuf||0)>0) f.jbuf-=dt;
      let vx=0; const dashing=(f.dashT||0)>0 && grounded && !f.atk;
      if(dashing){ f.dashT-=dt; vx=f.dashV; }
      else if(!f.atk && grounded && !d.down){ const ws=WSPD[f.key]||1, sf=SPEEDF*ws, sb=SPEEDB*ws; if(K(map.left)) vx-=(f._opp<f.x?sf:sb); if(K(map.right)) vx+=(f._opp>f.x?sf:sb); }
      if((f.jbuf||0)>0 && !f.atk && (grounded || (f.coyote||0)>0)){ f.vy=JUMP; f.jvx=dashing?f.dashV*0.75:(d.fwd?f.face*JVXF:(d.back?-f.face*JVXB:0)); f.dashT=0; f.jbuf=0; f.coyote=0; f.grounded=false; sfx('jump'); }
      f._ff=(!grounded && d.down && f.vy<0); // fast-fall
      f._vx=vx; f._blk=grounded && d.back && !f.atk && (f.dashT||0)<=0; f._crouch=grounded && d.down && !f.atk;
    }
    function ai(f,o,dt){
      f._opp=o.x; if(!canAct(f)){f._vx=0;f._blk=false;f._crouch=false;return;}
      f.ai-=dt; const dist=Math.abs(o.x-f.x); let vx=0,blk=false,crouch=false;
      if(!f.atk){
        if(o.y>(o.support||0)+8 && dist<72 && Math.random()<0.7){ startMove(f,'cpunch'); } // anti-air (pas systématique)
        else if(o.atk && dist<70 && Math.random()<0.22){ blk=true; } // garde (moins souvent)
        else if(f.grounded && dist>92 && dist<210 && f.ai<=0 && Math.random()<0.14){ f.vy=JUMP; f.jvx=f.face*JVXF; f.ai=0.6; } // saut d'approche
        else if(dist>70){ vx=(o.x>f.x?1:-1)*SPEEDF*0.92; }         // approche (footsies)
        else if(f.ai<=0){ const r=Math.random();
          if(dist>48){ r<.5?startMove(f,'roundhouse'):startMove(f,'sweep'); }
          else { r<.35?startMove(f,'straight'):r<.6?startMove(f,'jab'):r<.8?startMove(f,'lkick'):(Math.random()<0.4?triggerSpecial(f):startMove(f,'sweep')); }
          f.ai=0.32+Math.random()*0.4;
        } else if(dist<30 && Math.random()<0.02){ doThrow(f,o); }
      }
      f._vx=blk?0:vx; f._blk=blk; f._crouch=crouch;
    }
    function doThrow(a,o){ if(!canAct(a)||a.atk) return; sfx('heavy'); a.cd=0.5; o.hp-=10; o.st='knockdown'; o.t=0; o.vy=170; o.vx=0; o.x=Math.max(FLOORW,Math.min(ARENA-FLOORW,a.x-a.face*30)); a.x=Math.max(FLOORW,Math.min(ARENA-FLOORW,o.x+a.face*30)); o.face=a.x>=o.x?1:-1; addMeter(a,8); shake=Math.max(shake,5); spark((a.x+o.x)/2,GY-50,C.violet,10); if(o.hp<=0){o.hp=0;o.st='ko';o.t=0;o.vy=170;} }
    function addMeter(f,v){ f.meter=Math.min(100,f.meter+v); }

    function hurt(a,o,M,isSuper){
      addMeter(a,4); addMeter(o,2);
      if(o._blk && o.grounded){ a.combo=0; o.hp-=Math.max(1,(M.dmg*0.12)|0); o.stun=Math.max(o.stun,.16); addMeter(o,3); sfx('block'); spark((a.x+o.x)/2,GY-70-o.y,C.vert,5); shake=Math.max(shake,2); o.x=Math.max(FLOORW,Math.min(ARENA-FLOORW,o.x+a.face*8)); return; }
      a.combo=(a.combo||0)+1; a.comboT=0; o.combo=0; o.flash=Math.max(o.flash||0,0.10); const scale=Math.max(0.45,1-(a.combo-1)*0.11);
      const dmg=M.dmg*(isSuper?2.4:1)*scale; o.hp-=dmg; o.stun=M.stun; o.x=Math.max(FLOORW,Math.min(ARENA-FLOORW,o.x+a.face*M.kb)); a.cancel=M.cancel?0.24:0;
      sfx(M.heavy||isSuper?'heavy':'hit'); spark((a.x+o.x)/2,GY-58-o.y+(M.h==='low'?18:0),M.kind==='kick'?C.jaune:C.rouge,M.heavy?16:10);
      shake=Math.max(shake,isSuper?9:M.heavy?6:3); hitstop=Math.max(hitstop,isSuper?0.1:M.heavy?0.07:0.04);
      if(o.hp<=0){o.hp=0;o.st='ko';o.t=0;o.vy=180;o.jvx=0;o.atk=null;return;}
      if(M.knockdown){o.st='knockdown';o.t=0;o.vy=150;o.vx=a.face*40;o.jvx=0;o.atk=null;}
      else if(M.launch){o.st='hit';o.vy=150;o.jvx=0;o.atk=null;}
      else {o.st='hit';o.atk=null;}
    }
    function step(f,o,dt){
      if(f.st==='ko'){ f.t+=dt; f.y=0; f.vy=0; return; }  // reste au sol (sprite couché)
      if(f.st==='win'){ f.t+=dt; f.y=0; f.vy=0; return; }  // pose de victoire (anim en boucle, gérée par frameFor)
      f.cd=Math.max(0,f.cd-dt); f.stun=Math.max(0,f.stun-dt); f.cancel=Math.max(0,f.cancel-dt); if(f.flash>0) f.flash-=dt;
      if(f.st==='knockdown'){ f.t+=dt; f.vy+=GRAV*dt; f.y+=f.vy*dt; if(f.y<=0){f.y=0;f.vy=0;} if(f.t>.9){f.st='getup';f.t=0;} f.face=o.x>=f.x?1:-1; f.vface=f.face; return; }
      if(f.st==='getup'){ f.t+=dt; if(f.t>.35) f.st='idle'; f.face=o.x>=f.x?1:-1; f.vface=f.face; return; }
      const sup=f.support||0; const _air=(f.y>sup+0.5)||f.vy>0; const _hvx=_air?(f.jvx||0):(f._vx||0); // en l'air : trajectoire engagée (jvx figé)
      f.x=clampX(f.x+_hvx*dt);
      if((f.dropT||0)>0) f.dropT-=dt;
      const pg=f.grounded, prevY=f.y; f.vy+=GRAV*dt*(f._ff && f.vy<0 ? 2.2 : 1); f.y+=f.vy*dt; // fast-fall = gravité renforcée en descente
      const g=groundLevel(f,prevY);
      if(f.y<=g){ const wasAir=prevY>g+0.5; f.y=g; f.vy=0; f.support=g; f.grounded=true; if(wasAir){ f.cd=Math.max(f.cd,0.07); f.jvx=0; } }
      else { f.grounded=false; if(f.vy>0) f.support=0; if(pg && f.vy<=0 && (f.dropT||0)<=0) f.coyote=0.09; } // coyote : vient de quitter le sol/plateforme
      f.face=o.x>=f.x?1:-1;
      if(f.atk){ const A=f.atk,M=A.M; A.t+=dt; const active=A.t>=M.hit[0]&&A.t<=M.hit[1];
        if(active){ const d=Math.abs(o.x-f.x),front=Math.sign(o.x-f.x)===f.face,reach=d<=M.range&&Math.abs(o.y-f.y)<54;
          if(front&&reach&&o.st!=='ko'){ if(M.multi){ if(A.t-A.last>=M.multi){A.last=A.t; hurt(f,o,M,A.super);} } else if(!A.landed){A.landed=true; hurt(f,o,M,A.super);} } }
        if(A.t>=M.dur){ f.atk=null; if(f.st!=='ko') f.st='idle'; }
      } else if(f.stun>0) f.st='hit';
      else if(f.y>(f.support||0)+0.5) f.st='jump';  // "en l'air" = au-dessus du support (sol OU plateforme)
      else if(f._crouch) f.st='crouch';
      else if(Math.abs(f._vx||0)>1){ f.st=((f._vx>0)===(o.x>f.x))?'walk':'walkb';
        f.dustT-=dt; if(f.dustT<=0){f.dustT=0.16; parts.push({x:f.x-f.face*6,y:GY,vx:-f.face*15,vy:-8,life:.28,col:'#3a2b55'});} }
      else if(f._blk) f.st='block';
      else f.st='idle';
      // regard VISUEL : la tête suit le sens de la marche/du saut ; sinon face à l'adversaire
      f.vface = (f.st==='walk'||f.st==='walkb') ? (((f._vx||0)>=0)?1:-1)
              : (f.y>0 && (f.jvx||0)!==0) ? (((f.jvx||0)>0)?1:-1)
              : f.face;
    }
    function spark(x,y,col,n){ for(let i=0;i<n;i++){const a=Math.random()*7,s=30+Math.random()*90;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,life:.3+Math.random()*.25,col});} }

    // ---- poses (rig fallback) ----
    const lerp=(a,b,t)=>a+(b-a)*t;
    function target(f){ const s={crouch:0,torso:0,head:0,shL:.5,elL:1,shR:-.5,elR:1,hipL:.2,knL:.3,hipR:-.2,knR:.3,spin:0}; const st=f.st;
      if(f.atk){ const A=f.atk,M=A.M,p=A.t/M.dur,k=Math.sin(Math.min(1,p*1.25)*Math.PI);
        if(M.kind==='special'){s.spin=p*Math.PI*3;s.hipR=-1.2;s.knR=-.2;s.shL=1;s.shR=1;return s;}
        if(M.kind==='punch'){ if(A.name==='cpunch'){s.crouch=4*(1-k);s.shR=-2*k;s.elR=1-k;s.torso=.05;} else {s.torso=.12*k;s.shR=-1.55*k;s.elR=1-k;s.shL=.7;s.hipR=-.3-.15*k*M.heavy;} }
        else { if(A.name==='sweep'){s.crouch=10;s.hipR=-1.5*k;s.knR=.1;s.torso=-.1;s.shL=1;s.shR=.6;} else if(A.name==='roundhouse'){s.hipR=-1.5*k;s.knR=.3-.3*k;s.torso=-.2*k;s.shL=.9;s.shR=.7;} else {s.hipR=-1*k;s.knR=.3-.2*k;s.shL=.8;s.shR=-.4;} }
        return s; }
      if(st==='idle'){s.torso=.03*Math.sin(f.ph*.9);s.shL=.55;s.shR=-.55;}
      else if(st==='walk'||st==='walkb'){const w=Math.sin(f.ph);s.hipL=.5*w;s.knL=.3+.3*Math.max(0,w);s.hipR=-.5*w;s.knR=.3+.3*Math.max(0,-w);s.torso=st==='walkb'?-.05:.05;s.shL=.5-.25*w;s.shR=-.5-.25*w;}
      else if(st==='jump'){s.hipL=.7;s.knL=1.1;s.hipR=.5;s.knR=1;s.shL=1;s.shR=1;s.torso=.08;}
      else if(st==='crouch'){s.crouch=12;s.hipL=.9;s.knL=1.3;s.hipR=-.9;s.knR=1.3;s.shL=.9;s.shR=-.9;s.torso=.05;}
      else if(st==='block'){s.crouch=4;s.shL=1.4;s.elL=1.6;s.shR=1.3;s.elR=1.6;s.torso=-.06;}
      else if(st==='hit'){s.torso=-.35;s.head=-.4;s.shL=1.2;s.shR=-1;s.crouch=2;}
      else if(st==='knockdown'||st==='ko'){s.crouch=6;} else if(st==='getup'){s.crouch=8;s.torso=.1;}
      return s; }
    function poseLerp(f,dt){ const t=target(f),s=Math.min(1,dt*18),P=f.P; for(const k in t)P[k]=lerp(P[k],t[k],s); }

    function limb(x1,y1,x2,y2,w,m,sh){ctx.lineCap='round';ctx.strokeStyle=sh;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle=m;ctx.lineWidth=Math.max(1,w-2);ctx.beginPath();ctx.moveTo(x1,y1-.5);ctx.lineTo(x2,y2-.5);ctx.stroke();}
    function cF(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
    function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
    function arm(x,y,shA,elA,S,fx,back){const ex=x+Math.sin(fx*shA)*14,ey=y+Math.cos(shA)*14,hx=ex+Math.sin(fx*(shA+elA))*13,hy=ey+Math.cos(shA+elA)*13,sh=back?'#0c0f1c':'#000';limb(x,y,ex,ey,8,back?S.jacket2:S.jacket,sh);limb(ex,ey,hx,hy,6,S.skin,'#00000033');ctx.fillStyle=back?'#c98f66':S.skin;cF(hx,hy,4);}
    function drawRig(f){ const S=f.skin,P=f.P,fx=f.vface,baseY=GY-f.y,hipY=baseY-46+P.crouch; const set=SPRITE_SETS[f.key],RS=(set&&set.h?set.h:150)/90; ctx.save();ctx.translate(0,14*RS);ctx.translate(f.x,baseY);ctx.scale(RS,RS); if(f.st==='ko')ctx.rotate(fx*Math.min(1.4,f.t*4)); else if(f.st==='knockdown')ctx.rotate(fx*Math.min(1.2,f.t*3)); else if(P.spin)ctx.rotate(fx*P.spin); ctx.translate(-f.x,-baseY); const hip={x:f.x,y:hipY},ang=a=>fx*a;
      function leg(hA,kA){const kx=hip.x+Math.sin(ang(hA))*16,ky=hip.y+Math.cos(hA)*16,fxx=kx+Math.sin(ang(hA+kA))*18,fyy=ky+Math.cos(hA+kA)*18;limb(hip.x,hip.y,kx,ky,10,S.pants,'#000');limb(kx,ky,fxx,fyy,8,S.pants,'#000');ctx.fillStyle=S.sneak;ctx.fillRect(fxx-6,fyy-3,12,6);}
      leg(P.hipL,P.knL);leg(P.hipR,P.knR);
      ctx.save();ctx.translate(hip.x,hip.y);ctx.rotate(ang(P.torso));ctx.fillStyle=S.jacket;rr(-11,-32,22,32,4);ctx.fill();ctx.fillStyle=S.jacket2;rr(-11,-32,8,32,3);ctx.fill();ctx.restore();
      const sh={x:hip.x,y:hipY-30}; arm(sh.x,sh.y,P.shL,P.elL,S,fx,true);
      const hx=sh.x+Math.sin(ang(P.torso+P.head))*2,hy=sh.y-8; ctx.fillStyle=S.skin;rr(hx-6,hy-11,12,12,3);ctx.fill();ctx.fillStyle=S.cap;rr(hx-7,hy-13,14,5,2);ctx.fill();ctx.fillRect(hx+(fx>0?2:-9),hy-9,7,2);ctx.fillStyle=C.jaune;ctx.fillRect(hx+(fx>0?1:-3),hy-6,2,2);
      arm(sh.x,sh.y,P.shR,P.elR,S,fx,false); ctx.restore(); }

    function frameFor(f,action){ const set=SPRITE_SETS[f.key]; const cnt=set.frames[action]||1; if(cnt<=1) return 1;
      if(action==='win'){ const fps=7,hold=0.85,cyc=cnt/fps+hold,tt=f.t%cyc,fr=Math.floor(tt*fps); return fr>=cnt?cnt:1+fr; } // boucle victoire + légère pause en fin de boucle
      if(action==='walk'){ return 1+Math.floor((f.walkDist||0)/15)%cnt; } // frames liées à la distance (anti-patinage) ; le corps suit déjà le sens (vface)
      if(action==='idle') return 1+(((f.ph*1.2)|0)%cnt);
      if(f.atk){ return 1+Math.min(cnt-1, (f.atk.t/f.atk.M.dur*cnt)|0); }
      return 1+((f.t*10)|0)%cnt; }
    function actKey(set,f){ const a=f.atk?f.atk.name:f.st;
      if(set.frames[a]) return a;
      if(a==='walkb'&&set.frames.walk) return 'walk';
      if(a==='special'&&set.frames.roundhouse) return 'roundhouse';
      if(PUNCHACT.has(a)&&set.frames.straight) return 'straight';
      if(KICKACT.has(a)){ if(set.frames.roundhouse) return 'roundhouse'; if(set.frames.kick) return 'kick'; }
      if(set.frames[f.st]) return f.st; return 'idle'; }
    function drawFighter(f){ const set=SPRITE_SETS[f.key];
      if(set&&set.enabled){ const key=actKey(set,f);
        const img=spriteImg(f.key,key,frameFor(f,key));
        if(img && key==='ko'){ const dw=Math.min(set.h*1.7,BW*0.5),dh=img.height/img.width*dw,fx=f.face; ctx.save(); ctx.translate(f.x,GY); ctx.scale(fx,1); ctx.drawImage(img,-dw*0.5,-dh,dw,dh); ctx.restore(); return; }
        if(img){ const s=Math.min(set.h,BH*0.62)/620,w=img.width*s,dh=img.height*s,fx=f.vface; let bob=0,rot=0,sx=1,sy=1,lung=0;
          if(f.st==='walk'||f.st==='walkb'){ const wd=(f.walkDist||0); bob=-Math.abs(Math.sin(wd*0.14))*3.4; lung=Math.sin(wd*0.14)*f.vface*1.2; } else if(f.st==='idle') bob=Math.sin(f.ph*.9)*-1;
          else if(f.st==='block') sy=.82; else if(f.st==='knockdown') rot=fx*Math.min(1.2,f.t*3);
          else if(f.atk){ const p=f.atk.t/f.atk.M.dur,k=Math.sin(Math.min(1,p*1.3)*Math.PI); lung=fx*k*(f.atk.M.heavy?16:10); sx=1+.05*k; }
          if((f.dashT||0)>0){ rot += (f.dashV>0?1:-1)*0.16; lung += (f.dashV>0?1:-1)*7; } // inclinaison dash (par-dessus l'état courant)
          ctx.save();ctx.translate(f.x,GY-f.y);ctx.translate(lung,bob);ctx.rotate(rot);ctx.scale(fx*sx,sy);ctx.drawImage(img,-w/2,-dh,w,dh);
          if((f.flash||0)>0){ fxc.width=img.width; fxc.height=img.height; fxx.clearRect(0,0,img.width,img.height); fxx.globalCompositeOperation='source-over'; fxx.drawImage(img,0,0); fxx.globalCompositeOperation='source-atop'; fxx.fillStyle='#fff'; fxx.fillRect(0,0,img.width,img.height); fxx.globalCompositeOperation='source-over'; ctx.globalAlpha=Math.min(0.9,f.flash*8); ctx.drawImage(fxc,-w/2,-dh,w,dh); ctx.globalAlpha=1; }
          ctx.restore(); return; } }
      drawRig(f); }
    // VFX de frappe (lisible même sans frame d'attaque)
    function drawStrike(f){ if(!f.atk) return; const A=f.atk,M=A.M,p=Math.min(1,A.t/M.dur),active=A.t>=M.hit[0]&&A.t<=M.hit[1],fx=f.face,by=GY-f.y; const cy=M.h==='low'?by-16:by-72, col=M.kind==='kick'?C.jaune:(M.kind==='special'?C.violet:'#fff'); ctx.save();ctx.lineCap='round';
      if(M.kind==='special'){ ctx.globalAlpha=.85;ctx.strokeStyle=col;ctx.lineWidth=4; for(let i=0;i<3;i++){const a=A.t*20+i*2.1;ctx.beginPath();ctx.arc(f.x,by-42,M.range*0.7,a,a+1.1);ctx.stroke();} }
      else { const k=Math.sin(Math.min(1,p*1.25)*Math.PI),tip=f.x+fx*M.range*(0.35+0.65*k),a0=fx>0?-0.7:Math.PI+0.7,a1=fx>0?0.5:Math.PI-0.5;
        ctx.globalAlpha=active?0.9:0.3;ctx.strokeStyle=col;ctx.lineWidth=active?5:2;ctx.beginPath();ctx.arc(f.x+fx*M.range*0.2,cy,M.range*0.8,a0,a1,fx<0);ctx.stroke();
        if(k>0.25){ctx.globalAlpha=1;ctx.fillStyle=col;cF(tip,cy,M.heavy?7:5);} }
      ctx.restore(); }
    function shadow(f){ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.ellipse(f.x,GY-(f.support||0)+2,16-Math.min(10,(f.y-(f.support||0))/12),4,0,0,7);ctx.fill();}
    // ---- décor par couches (sprites déposés dans /media/games/fight/stages/) ----
    function stageImg(src){ if(!src) return null; const url='/media/games/fight/stages/'+src; let e=imgCache[url]; if(!e){e=imgCache[url]={img:new Image(),ok:false}; e.img.onload=()=>e.ok=true; e.img.src=url;} return e.ok?e.img:null; }
    function drawLayers(front){ const S=STAGES[stageIdx]; if(!S||!S.layers) return; for(const L of S.layers){ if(!!L.front!==!!front) continue; const img=stageImg(L.src); if(!img) continue; const depth=L.depth||1, px=(cam.cx-ARENA/2)*(1-depth), w=L.w||img.width, h=img.height*(w/img.width), by=GY-(L.y||0), lx=(L.x==null?ARENA/2:L.x)-w/2+px; ctx.drawImage(img,lx,by-h,w,h); } } // L.y = hauteur du BAS du calque au-dessus du sol
    function drawPlats(){ const S=STAGES[stageIdx]; if(!S||!S.plats) return; const ac=S.accent||C.violet; for(const p of S.plats){ const y=GY-p.y,x0=p.x-p.w,img=stageImg(p.src); if(img){ const s=(2*p.w)/img.width; ctx.drawImage(img,x0,y,2*p.w,img.height*s); continue; } /* sprite: bord HAUT = surface */ ctx.save(); ctx.shadowColor=ac; ctx.shadowBlur=10; ctx.fillStyle='#0c1024'; ctx.fillRect(x0,y,2*p.w,8); ctx.fillStyle=ac; ctx.fillRect(x0,y,2*p.w,2); ctx.globalAlpha=.45; ctx.fillRect(x0,y+7,2*p.w,1); ctx.restore(); } }
    function bar(x,hp,meter,right){ const w=180,h=10,y=12; ctx.fillStyle='#000';ctx.fillRect(x-1,y-1,w+2,h+2);ctx.fillStyle='#10142e';ctx.fillRect(x,y,w,h);const fw=w*Math.max(0,hp)/100;const grd=ctx.createLinearGradient(x,0,x+w,0);if(right){grd.addColorStop(0,C.jaune);grd.addColorStop(1,C.rouge);}else{grd.addColorStop(0,C.vert);grd.addColorStop(1,'#3fe3ff');}ctx.fillStyle=grd;if(right)ctx.fillRect(x+w-fw,y,fw,h);else ctx.fillRect(x,y,fw,h);ctx.strokeStyle='#4a5590';ctx.strokeRect(x+.5,y+.5,w-1,h-1);
      // super meter
      const my=y+h+2,mw=w*0.6,mx=right?x+w-mw:x; ctx.fillStyle='#1a1030';ctx.fillRect(mx,my,mw,4); ctx.fillStyle=meter>=100?C.jaune:C.violet; const mf=mw*Math.min(1,meter/100); ctx.fillRect(right?mx+mw-mf:mx,my,mf,4); }
    function pips(x,n,right){ for(let i=0;i<2;i++){ ctx.fillStyle=i<n?C.jaune:'#333a5a'; const px=right?x-i*10:x+i*10; ctx.fillRect(px,30,7,7);} }
    function text(s,x,y,size,col,glow){ctx.font=`900 ${size}px "Courier New",monospace`;ctx.textAlign='center';if(glow){ctx.shadowColor=glow;ctx.shadowBlur=12;}ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.shadowBlur=0;}

    // ---- preview / sélection ----
    let paused=true;
    function buildPreview(){ const A=ROSTER[sel1],B=ROSTER[sel2]; f1=mk(300,1,A.skin,A.key); f1.name=A.name; f2=mk(620,-1,B.skin,B.key); f2.name=B.name; }
    apiPreview=buildPreview;
    apiFight=()=>{ if(mode==='arcade'){ startArcade(); return; } selecting=false; paused=false; newRound(true); };
    apiOpenSelect=()=>{ selecting=true; paused=true; music('menu'); buildPreview(); focus(); };

    // ---- boucle + rounds ----
    let raf=0,last=performance.now(); buildPreview();
    if(selecting) music('menu');  // musique du MENU dès l'ouverture
    { const kick=()=>{ if(selecting) music('menu'); }; window.addEventListener('pointerdown',kick,{once:true}); } // relance au 1er clic (autoplay)
    function endRound(){ const w=f1.hp>f2.hp?1:f2.hp>f1.hp?2:0; if(w===1)wins1++; else if(w===2)wins2++;
      const W=w===1?f1:(w===2?f2:null), L=w===1?f2:f1; if(W && W.st!=='ko'){ W.st='win'; W.t=0; W.atk=null; W.vface=W.face=(L.x>=W.x?1:-1); } // le gagnant passe en pose de victoire
      banner=w===0?'ÉGALITÉ':(w===1?f1.name:f2.name)+' GAGNE LE ROUND'; bannerT=999; phase='roundend'; phaseT=1.9; sfx('ko'); }
    function frame(now){ raf=requestAnimationFrame(frame); let dt=Math.min(.05,(now-last)/1000); last=now; nowT+=dt;
      neonT+=dt; if(neonT>.08){neonT=0;neonOn=Math.random()<.06?(.4+Math.random()*.3):1;}
      if(paused){ f1.ph+=dt*3; f2.ph+=dt*3; poseLerp(f1,dt); poseLerp(f2,dt); ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#05070f';ctx.fillRect(0,0,BW,BH); ctx.drawImage(bg,-MX,-SKY); drawLayers(false); drawPlats(); ctx.globalAlpha=neonOn;text(STAGES[stageIdx].sign,ARENA/2,58,16,STAGES[stageIdx].accent,STAGES[stageIdx].accent);ctx.globalAlpha=1; shadow(f1);shadow(f2); drawFighter(f1);drawFighter(f2); drawLayers(true); return; }
      if(phase==='intro'){ phaseT-=dt; if(phaseT<=0){phase='fight';banner='FIGHT!';bannerT=.9;} }
      else if(phase==='fight'){
        if(hitstop>0){hitstop-=dt;} else {
          control(f1,f2,binds.p1,dt); if(mode==='2p') control(f2,f1,binds.p2,dt); else ai(f2,f1,dt);
          step(f1,f2,dt); step(f2,f1,dt);
          { const d=f2.x-f1.x, ad=Math.abs(d); if(ad<SEP && f1.st!=='ko'&&f2.st!=='ko' && f1.grounded && f2.grounded && Math.abs(f1.y-f2.y)<24){ const push=(SEP-ad)/2, s=d>=0?1:-1; f1.x=clampX(f1.x-s*push); f2.x=clampX(f2.x+s*push); } }
          f1.comboT+=dt; if(f1.comboT>1.2)f1.combo=0; f2.comboT+=dt; if(f2.comboT>1.2)f2.combo=0;
          roundT-=dt;
          if(f1.st==='ko'||f2.st==='ko'||roundT<=0) endRound();
        }
      } else if(phase==='roundend'){ phaseT-=dt; step(f1,f2,dt); step(f2,f1,dt); if(phaseT<=0){ if(wins1>=2||wins2>=2){ const pWon=wins1>=2; if(mode==='arcade'){ if(!pWon){phase='gameover';banner='GAME OVER';bannerT=999;sfx('ko');} else if(ladderI>=ladder.length-1){phase='victory';banner='CHAMPION 2000 !';bannerT=999;sfx('super');} else {phase='matchwin';banner=f1.name+' VAINC '+f2.name;bannerT=999;phaseT=2.2;sfx('super');} } else { phase='matchend';banner=(pWon?f1.name:f2.name)+' REMPORTE LE MATCH';bannerT=999;sfx('super'); } } else {roundNo++;newRound(false);} } }
      else if(phase==='matchwin'){ phaseT-=dt; step(f1,f2,dt); step(f2,f1,dt); if(phaseT<=0){ ladderI++; stageIdx=(ladder[ladderI]||ladder[0]).stage; buildBG(); newRound(true); } }
      else if(phase==='matchend'||phase==='victory'||phase==='gameover'){ step(f1,f2,dt); step(f2,f1,dt); } // le gagnant continue sa pose de victoire en boucle
      prevCodes=new Set(codes);
      f1.ph+=dt*3; f2.ph+=dt*3;
      f1.walkDist=(f1.walkDist||0)+Math.abs(f1.x-(f1._px??f1.x)); f1._px=f1.x; f2.walkDist=(f2.walkDist||0)+Math.abs(f2.x-(f2._px??f2.x)); f2._px=f2.x;
      poseLerp(f1,dt); poseLerp(f2,dt);
      parts.forEach(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;}); parts=parts.filter(p=>p.life>0); shake=Math.max(0,shake-dt*24);
      updateCam(dt);
      const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;
      ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#05070f'; ctx.fillRect(0,0,BW,BH);
      ctx.save(); ctx.setTransform(cam.z,0,0,cam.z, BW/2+(sx|0)-cam.cx*cam.z, BH/2+(sy|0)-cam.cy*cam.z); ctx.drawImage(bg,-MX,-SKY);
      drawLayers(false); drawPlats();
      ctx.globalAlpha=neonOn;text(STAGES[stageIdx].sign,ARENA/2,58,16,STAGES[stageIdx].accent,STAGES[stageIdx].accent);ctx.globalAlpha=1;
      shadow(f1);shadow(f2); const order=f1.y<=f2.y?[f1,f2]:[f2,f1]; drawFighter(order[0]);drawStrike(order[0]);drawFighter(order[1]);drawStrike(order[1]);
      drawLayers(true);
      parts.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.col;ctx.fillRect(p.x|0,p.y|0,2,2);});ctx.globalAlpha=1; ctx.restore();
      if(superFx){ superFx.t+=dt; const a=Math.max(0,1-superFx.t/0.85);
        ctx.fillStyle='rgba(255,255,255,'+(0.6*a)+')'; ctx.fillRect(0,0,BW,BH);
        ctx.strokeStyle='rgba(176,107,255,'+a+')'; for(let i=0;i<3;i++){ const r=superFx.t*300-i*48; if(r>0){ctx.lineWidth=4;ctx.beginPath();ctx.arc(superFx.x,GY-50,r,0,7);ctx.stroke();} }
        shake=Math.max(shake,4*a); if(superFx.t>0.85) superFx=null; }
      bar(10,f1.hp,f1.meter,false); bar(BW-190,f2.hp,f2.meter,true);
      pips(196,wins1,false); pips(BW-196,wins2,true);
      text(Math.max(0,Math.ceil(roundT)),BW/2,22,18,C.jaune,C.jaune);
      ctx.font='bold 9px "Courier New",monospace';ctx.textAlign='left';ctx.fillStyle=C.blanc;ctx.fillText(f1.name||'',10,34);ctx.textAlign='right';ctx.fillText((f2.name||'')+(mode==='2p'?'':' (CPU)'),BW-10,34); if(mode==='arcade'){ctx.textAlign='center';ctx.fillStyle=STAGES[stageIdx].accent;ctx.fillText('ARCADE '+(ladderI+1)+'/'+ladder.length,BW/2,46);}
      ctx.font='900 13px "Courier New",monospace'; if(f1.combo>=2){ctx.textAlign='left';ctx.fillStyle=C.jaune;ctx.fillText(f1.combo+' HITS',12,58);} if(f2.combo>=2){ctx.textAlign='right';ctx.fillStyle=C.jaune;ctx.fillText(f2.combo+' HITS',BW-12,58);}
      if(bannerT>0){bannerT-=dt; const big=phase==='matchend'||phase==='roundend'; text(banner,BW/2,BH*0.44,big?24:30,big?C.jaune:C.blanc,big?C.jaune:C.rouge);}
    }
    raf=requestAnimationFrame(frame);
    apiStart=()=>{ if(mode==='arcade'){startArcade();} else newRound(true); }; apiMode=(m)=>{ mode=m; if(m==='arcade'){startArcade();} else newRound(true); };
    return ()=>{ cancelAnimationFrame(raf); ro.disconnect(); stopMusic(); window.removeEventListener('keydown',onDown); window.removeEventListener('keyup',onUp); };
  });
  let apiStart=()=>{}, apiMode=()=>{}, apiPreview=()=>{}, apiFight=()=>{}, apiOpenSelect=()=>{};
  function pick(i){ if(slot===1) sel1=i; else sel2=i; apiPreview(); slot = slot===1?2:1; }
  const ROWS=[['up','↑ haut'],['down','↓ bas'],['left','← gauche'],['right','→ droite'],['punch','poing'],['kick','pied'],['special','spécial']];
</script>

<div class="game" bind:this={host}>
  <canvas bind:this={canvasEl}></canvas>

  {#if selecting}
    <div class="select">
      <div class="sel-title">CHOISISSEZ VOTRE COMBATTANT</div>
      <div class="sel-body">
        <div class="slotcard p1" class:act={slot===1} onclick={()=>slot=1} role="button" tabindex="0">
          <div class="slot-lbl">JOUEUR 1</div>
          <img src="/media/games/fight/fighter_{ROSTER[sel1].key}_idle_1.webp" alt={ROSTER[sel1].name} draggable="false" onload={(e)=>e.currentTarget.style.visibility='visible'} onerror={(e)=>e.currentTarget.style.visibility='hidden'} />
          <div class="slot-name">{ROSTER[sel1].name}</div>
        </div>

        <div class="grid">
          {#each ROSTER as r, i}
            <button class="cell" class:p1={sel1===i} class:p2={sel2===i} class:hover={hoverI===i}
              onmouseenter={()=>hoverI=i} onmouseleave={()=>hoverI=-1} onclick={()=>pick(i)}>
              <img src="/media/games/fight/fighter_{r.key}_idle_1.webp" alt={r.name} draggable="false" onload={(e)=>e.currentTarget.style.visibility='visible'} onerror={(e)=>e.currentTarget.style.visibility='hidden'} />
              <span>{r.name}</span>
            </button>
          {/each}
        </div>

        <div class="slotcard p2" class:act={slot===2} onclick={()=>slot=2} role="button" tabindex="0">
          <div class="slot-lbl">{mode==='2p'?'JOUEUR 2':(mode==='arcade'?'ÉCHELLE CPU':'CPU')}</div>
          <img src="/media/games/fight/fighter_{ROSTER[sel2].key}_idle_1.webp" alt={ROSTER[sel2].name} draggable="false" onload={(e)=>e.currentTarget.style.visibility='visible'} onerror={(e)=>e.currentTarget.style.visibility='hidden'} />
          <div class="slot-name">{ROSTER[sel2].name}</div>
        </div>
      </div>
      <div class="sel-foot">
        <div class="modes">
          <button class:on={mode==='cpu'} onclick={()=>mode='cpu'}>1P vs CPU</button>
          <button class:on={mode==='2p'} onclick={()=>mode='2p'}>2 JOUEURS</button>
          <button class:on={mode==='arcade'} onclick={()=>mode='arcade'}>ARCADE</button>
        </div>
        <span class="sel-hint">Clic sur un combattant = l'assigner à l'emplacement actif (J1/J2). Survole pour voir.</span>
        <button class="fight" onclick={()=>apiFight()}>{mode==='arcade'?'DÉMARRER ARCADE ▶':'COMBATTRE ▶'}</button>
      </div>
    </div>
  {/if}

  {#if showCtrl}
    <div class="ctrl">
      <div class="ctrl-h"><b>TOUCHES</b> <button onclick={()=>{resetBinds();}}>réinitialiser</button> <button onclick={()=>{showCtrl=false;remap=null;}}>fermer</button></div>
      <div class="ctrl-cols">
        {#each ['p1','p2'] as p}
          <div class="ctrl-col">
            <div class="ctrl-t">{p==='p1'?'JOUEUR 1 — Le Belge':'JOUEUR 2 — Cantona'}</div>
            {#each ROWS as [k,lbl]}
              <div class="ctrl-row"><span>{lbl}</span>
                <button class:listen={remap===p+'.'+k} onclick={()=>remap=p+'.'+k}>{remap===p+'.'+k?'…':keyLabel(binds[p][k])}</button>
              </div>
            {/each}
          </div>
        {/each}
      </div>
      <div class="ctrl-note">Astuce : « arrière » recule ET garde quand on se fait toucher. Poing+Pied ensemble = prise.</div>
    </div>
  {/if}

  <div class="bottom">
    <div class="modes">
      <button class:on={mode==='cpu'} onclick={()=>apiMode('cpu')}>1P vs CPU</button>
      <button class:on={mode==='2p'} onclick={()=>apiMode('2p')}>2 JOUEURS</button>
      <button class:on={mode==='arcade'} onclick={()=>apiMode('arcade')}>ARCADE</button>
    </div>
    <button class="sel" onclick={()=>apiOpenSelect()}>⚔ PERSOS</button>
    <button class="rematch" onclick={()=>apiStart()}>↻</button>
    <button onclick={()=>{showCtrl=!showCtrl;}}>⌨</button>
    <span class="help">J1 {keyLabel(binds.p1.up)}{keyLabel(binds.p1.left)}{keyLabel(binds.p1.down)}{keyLabel(binds.p1.right)} · {keyLabel(binds.p1.punch)}/{keyLabel(binds.p1.kick)}/{keyLabel(binds.p1.special)}{mode==='2p'?`   J2 ↑←↓→ · ${keyLabel(binds.p2.punch)}/${keyLabel(binds.p2.kick)}/${keyLabel(binds.p2.special)}`:''}</span>
  </div>
</div>

<style>
  .game{position:absolute;inset:0;overflow:hidden;background:#0a0e1a;font-family:inherit;}
  canvas{display:block;width:100%;height:calc(100% - 26px);image-rendering:pixelated;outline:none;background:#0a0e1a;}
  .bottom{position:absolute;left:0;right:0;bottom:0;height:26px;display:flex;align-items:center;gap:8px;padding:0 8px;background:#0a0e1a;border-top:1px solid #2a3566;}
  .modes{display:flex;gap:4px;}
  .bottom button{font-family:inherit;font-size:10px;letter-spacing:.03em;padding:2px 7px;color:#cdd6ff;background:#141a38;border:1px solid #35407a;cursor:pointer;}
  .bottom button:hover{border-color:#b06bff;}
  .modes button.on{background:#24306a;color:#fff;border-color:#b06bff;}
  .rematch{color:#ffe8b0;}
  .help{margin-left:auto;font-size:9px;color:#7f8ac0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .ctrl{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);z-index:5;background:#0c1024;border:1.5px solid #35407a;box-shadow:0 6px 24px rgba(0,0,0,.6);padding:12px 14px;color:#dfe6ff;font-size:11px;width:340px;max-width:92%;}
  .ctrl-h{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
  .ctrl-h b{letter-spacing:.12em;color:#fff;flex:1;}
  .ctrl-h button{font:inherit;font-size:10px;padding:2px 7px;background:#141a38;border:1px solid #35407a;color:#cdd6ff;cursor:pointer;}
  .ctrl-cols{display:flex;gap:14px;}
  .ctrl-col{flex:1;}
  .ctrl-t{font-size:9.5px;color:#9fb0ee;letter-spacing:.06em;margin-bottom:5px;}
  .ctrl-row{display:flex;align-items:center;justify-content:space-between;margin:3px 0;}
  .ctrl-row span{color:#aab4e0;}
  .ctrl-row button{font:inherit;font-size:10px;min-width:38px;padding:2px 6px;background:#1b2350;border:1px solid #46508c;color:#fff;cursor:pointer;text-transform:uppercase;}
  .ctrl-row button.listen{background:#b06bff;color:#0a0e1a;border-color:#b06bff;}
  .ctrl-note{margin-top:8px;font-size:9px;color:#7f8ac0;line-height:1.4;}
  /* ---- écran de sélection ---- */
  .select{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(10,14,26,.94),rgba(20,16,51,.96));color:#dfe6ff;}
  .sel-title{text-align:center;font-size:13px;letter-spacing:.2em;color:#fff;padding:8px 0 4px;text-shadow:0 0 10px #b06bff;}
  .sel-body{flex:1;display:flex;align-items:stretch;gap:8px;padding:4px 8px;min-height:0;}
  .slotcard{width:20%;min-width:96px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;border:1.5px solid #35407a;background:#0c1024;padding:4px;cursor:pointer;position:relative;}
  .slotcard.p1{border-color:#3f6bff;} .slotcard.p2{border-color:#ff3fae;}
  .slotcard.act{box-shadow:0 0 0 2px #fff inset;}
  .slot-lbl{font-size:9px;letter-spacing:.12em;color:#9fb0ee;}
  .slotcard.p1 .slot-lbl{color:#7fb0ff;} .slotcard.p2 .slot-lbl{color:#ff9ec6;}
  .slotcard img{flex:1;min-height:0;width:100%;object-fit:contain;object-position:bottom;image-rendering:pixelated;}
  .slot-name{font-size:11px;font-weight:800;color:#fff;letter-spacing:.04em;text-align:center;}
  .grid{flex:1;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:1fr;gap:6px;overflow:auto;align-content:start;}
  .cell{position:relative;border:1.5px solid #2a3566;background:#0e1330;padding:2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;overflow:hidden;transition:transform .08s,border-color .08s;}
  .cell img{width:100%;height:100%;object-fit:contain;object-position:bottom;image-rendering:pixelated;pointer-events:none;}
  .cell span{position:absolute;left:0;right:0;bottom:0;font-size:8.5px;text-align:center;background:rgba(6,9,20,.75);color:#cdd6ff;padding:1px 0;}
  .cell:hover,.cell.hover{border-color:#b06bff;transform:translateY(-2px);}
  .cell.p1{border-color:#3f6bff;box-shadow:0 0 8px rgba(63,107,255,.5);}
  .cell.p2{border-color:#ff3fae;box-shadow:0 0 8px rgba(255,63,174,.5);}
  .cell.p1.p2{border-image:linear-gradient(90deg,#3f6bff,#ff3fae) 1;}
  .sel-foot{display:flex;align-items:center;gap:10px;padding:6px 10px;border-top:1px solid #2a3566;}
  .sel-foot .modes button{font:inherit;font-size:10px;padding:3px 8px;color:#cdd6ff;background:#141a38;border:1px solid #35407a;cursor:pointer;}
  .sel-foot .modes button.on{background:#24306a;color:#fff;border-color:#b06bff;}
  .sel-hint{flex:1;font-size:9px;color:#7f8ac0;}
  .fight{font:inherit;font-size:13px;font-weight:900;letter-spacing:.1em;padding:6px 16px;color:#0a0e1a;background:linear-gradient(90deg,#ffe8b0,#ffb24a);border:none;cursor:pointer;box-shadow:0 0 14px rgba(255,178,74,.5);}
  .fight:hover{filter:brightness(1.1);}
</style>
