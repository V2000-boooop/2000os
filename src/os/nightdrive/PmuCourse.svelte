<script>
  // PMU — course hippique/animale + paris (télé du PMU). Piste LONGUE, caméra qui suit,
  // vainqueur ALÉATOIRE (forme + coups de speed → dépassements), décor en calques
  // (ciel/arènes, gradins+public, piste, coureurs) + bêtises en premier plan.
  // Coureurs éditables : courses.js. Sprites par-dessus : /media/nightdrive/pmu/course/<key>_run_<n>.webp
  import { onMount } from 'svelte';
  import { COURSE } from './courses.js';

  const V = { vert:'#4ad0a0', rouge:'#ff3140', jaune:'#ffb24a', violet:'#b06bff', blanc:'#f4f3ec', noir:'#0a0e1a', brun:'#241a0c' };
  let canvasEl;
  let phase = $state('bet');            // 'bet' | 'race' | 'result'
  let cagnotte = $state(load());
  let pick = $state(-1);   // personne à l'ouverture — le premier clic fait l'effet de surprise
  let mise = $state(5);
  let msg = $state('');
  let winner = $state(-1);
  const P = COURSE.partants;

  function load(){ try{ const v=+localStorage.getItem('pmu_cagnotte'); if(v>0) return v; }catch(e){} return COURSE.cagnotteInit; }
  function save(){ try{ localStorage.setItem('pmu_cagnotte', String(cagnotte)); }catch(e){} }

  // ---- musique du tiercé : MENU pendant les paris, MUSIQUE pendant la course, CRI à la victoire ----
  let pmuMenu=null, pmuRace=null, pmuCur=null;
  function pmuMusic(which){ if(typeof Audio==='undefined') return; try{
    if(!pmuMenu){ pmuMenu=new Audio('/media/nightdrive/pmu/tierce_menu.webm'); pmuMenu.loop=true; pmuMenu.volume=0.5;
                  pmuRace=new Audio('/media/nightdrive/pmu/tierce_course.webm'); pmuRace.loop=true; pmuRace.volume=0.55; }
    const want = which==='menu'?pmuMenu:(which==='race'?pmuRace:null);
    if(pmuCur && pmuCur!==want){ pmuCur.pause(); pmuCur.currentTime=0; }
    pmuCur=want; if(want) want.play().catch(()=>{});
  }catch(e){} }
  // jingles de fin (sons de Vincent) : victoire ou défaite — un seul à la fois,
  // coupé net si on relance une course pendant qu'il joue encore.
  let jingle=null;
  function stopJingle(){ if(jingle){ try{ jingle.pause(); }catch(e){} jingle=null; } }
  function pmuJingle(file,vol){ try{ stopJingle(); jingle=new Audio(file); jingle.volume=vol; jingle.play().catch(()=>{}); }catch(e){} }
  $effect(() => { if(phase==='bet') pmuMusic('menu'); else if(phase==='race') pmuMusic('race'); else pmuMusic(null); if(phase!=='result') stopJingle(); });
  onMount(() => { const k=()=>{ if(phase==='bet') pmuMusic('menu'); }; window.addEventListener('pointerdown',k,{once:true}); return ()=>{ window.removeEventListener('pointerdown',k); pmuMusic(null); stopJingle(); }; });

  onMount(() => {
    const ctx = canvasEl.getContext('2d');
    const BW=540, BH=300, SS=2; // SS = super-échantillonnage : rendu interne 1080×600, tes sprites gardent leur qualité peinte (SS=1 pour revenir au gros pixel)
    canvasEl.width=BW*SS; canvasEl.height=BH*SS; ctx.scale(SS,SS); ctx.imageSmoothingEnabled=true; // format large (TV), moins serré
    const MARGIN=40, FIN=1400, HORIZON=172, TRIB_H=112;  // calques : CIEL fixe (0..HORIZON, derrière) · TRIBUNE détourée à son ratio natif, tuilée + parallaxe (bas posé sur l'horizon) · PISTE qui défile (HORIZON..BH). Assets normalisés par tools/build_pmu_course.py (It36).
    const imgCache={};
    function sprite(k,n){ const u=`${COURSE.base}${k}_run_${n}.webp`; let e=imgCache[u]; if(!e){e=imgCache[u]={img:new Image(),ok:false};e.img.onload=()=>e.ok=true;e.img.src=u;} return e.ok?e.img:null; }
    function deco(name){ const u=`${COURSE.base}${name}.webp`; let e=imgCache[u]; if(!e){e=imgCache[u]={img:new Image(),ok:false};e.img.onload=()=>e.ok=true;e.img.src=u;} return e.ok?e.img:null; }
    function tile(img,y,h,off){ if(!img) return; const w=img.width*(h/img.height); off=((off%w)+w)%w; for(let x=-off; x<BW+2; x+=w) ctx.drawImage(img,x,y,w+1,h); }
    function tileSlice(img,sy,sh,dy,dh,off){ if(!img) return; const w=img.width*(dh/sh); off=((off%w)+w)%w; for(let x=-off; x<BW+2; x+=w) ctx.drawImage(img,0,sy,img.width,sh, x,dy, w+1,dh); }
    const stars2=[]; for(let i=0;i<26;i++) stars2.push({x:Math.random()*BW, y:Math.random()*(HORIZON-TRIB_H+14), p:Math.random()*6});
    // bips du compte à rebours + cloche d'arrivée (WebAudio, GAME_FEEL §8 — pas de fichier)
    let actx=null; function beep(f,d){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const o=actx.createOscillator(), g=actx.createGain(); o.type='square'; o.frequency.value=f; g.gain.value=0.055; o.connect(g); g.connect(actx.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime+d); o.stop(actx.currentTime+d); }catch(e){} }
    // bêtises premier plan (world x)
    const props=[{x:180,t:'bottle'},{x:520,t:'beret'},{x:760,t:'pigeon'},{x:1000,t:'cone'},{x:340,t:'ticket'},{x:1150,t:'bottle'}];

    let R=[], raf=0, last=performance.now(), placeN=0, camX=0, resolved=false, t=0, gt=0;
    let count=0, hitT=0, flashT=0, dust=[], conf=[];   // départ 3-2-1 · gel photo-finish · flash ligne · poussière · confettis
    let selT=1, lastPick=pick;                          // glissade « character select » du cavalier choisi
    function laneY(i){ const top=HORIZON+18, gap=(BH-20-top)/P.length; return top+gap*i+gap*0.55; }
    function reset(){ placeN=0; winner=-1; resolved=false; camX=0; t=0; count=0; hitT=0; flashT=0; dust.length=0; conf.length=0;
      R = P.map((p)=>({...p, wx:Math.random()*26, done:false, place:0, form:0.82+Math.random()*0.36, surge:0, surgeCd:Math.random()*1.6, bob:Math.random()*6})); }

    function startRace(){ if(phase!=='bet') return; if(pick<0){ msg='Choisis ton cavalier !'; return; } mise=Math.max(COURSE.miseMin,Math.min(COURSE.miseMax,mise|0)); if(mise>cagnotte) mise=cagnotte;
      if(cagnotte<COURSE.miseMin){ msg='Plus de jetons !'; return; } cagnotte-=mise; save(); reset(); count=2.4; phase='race'; msg=''; }
    function finishRace(){ phase='result'; const won=winner===pick;
      [...R].filter(r=>!r.done).sort((a,b)=>b.wx-a.wx).forEach(r=>{ r.place=++placeN; }); // complète le classement (podium)
      if(won){ const g=Math.round(mise*P[pick].cote); cagnotte+=g; msg=`GAGNÉ +${g} — ${P[pick].nom}`; pmuJingle('/media/nightdrive/pmu/tierce_victoire.webm',0.75);
        conf=Array.from({length:70},()=>({x:Math.random()*BW, y:-Math.random()*140, vy:34+Math.random()*52, ph:Math.random()*6, col:[V.vert,V.jaune,V.rouge,V.violet,V.blanc][Math.random()*5|0]})); } // pluie de confettis arcade
      else { msg=`PERDU — ${P[winner].nom} l'emporte`; pmuJingle('/media/nightdrive/pmu/tierce_defaite.webm',0.65); } save(); }
    function replay(){ if(phase==='result'){ phase='bet'; msg=''; reset(); } }
    reset();

    // ---- dessin ----
    function drawProp(pr, sx, gy){
      ctx.save(); ctx.translate(sx, gy);
      if(pr.t==='bottle'){ ctx.fillStyle='#2a5a2a'; ctx.fillRect(-2,-12,4,12); ctx.fillRect(-3,-4,6,4); ctx.fillStyle='#cfe'; ctx.globalAlpha=.3; ctx.fillRect(-2,-11,1,9); ctx.globalAlpha=1; }
      else if(pr.t==='beret'){ ctx.fillStyle=V.noir; ctx.beginPath(); ctx.ellipse(0,-2,7,3,0,0,7); ctx.fill(); ctx.fillRect(-1,-4,2,2); }
      else if(pr.t==='pigeon'){ const b=Math.sin(t*6)*2; ctx.fillStyle='#8a90a0'; ctx.beginPath(); ctx.ellipse(0,-4,5,3.5,0,0,7); ctx.fill(); ctx.fillStyle='#6a7080'; ctx.beginPath(); ctx.ellipse(4,-6-b,2.5,2.5,0,0,7); ctx.fill(); ctx.fillStyle=V.jaune; ctx.fillRect(6,-6-b,2,1); }
      else if(pr.t==='cone'){ ctx.fillStyle='#ff7a3a'; ctx.beginPath(); ctx.moveTo(0,-12); ctx.lineTo(5,0); ctx.lineTo(-5,0); ctx.closePath(); ctx.fill(); ctx.fillStyle=V.blanc; ctx.fillRect(-4,-6,8,2); }
      else if(pr.t==='ticket'){ ctx.fillStyle='#e8e0c0'; ctx.save(); ctx.rotate(Math.sin(t+pr.x)*0.2); ctx.fillRect(-4,-3,8,5); ctx.fillStyle='#a99'; ctx.fillRect(-3,-2,6,1); ctx.restore(); }
      ctx.restore();
    }
    function drawRunner(r,i,leader){
      let sx=MARGIN+(r.wx-camX), y=laneY(i); if(sx<-70||sx>BW+70) return;
      let img=null;
      if(r.frames>0){
        if(phase==='result') img = deco(`${r.key}_${(winner>=0&&R[winner]===r)?'win':'lose'}_1`);
        else if(phase==='bet' && i===pick) img = deco(`${r.key}_run_${1+(Math.floor(gt*5)%r.frames)}`); // la star piaffe sur place
        else img = deco(`${r.key}_run_${1+((r.wx/16|0)%r.frames)}`);
      }
      if(img){ // taille en perspective : couloir du haut = loin (petit), couloir du bas = près (grand) + réglage `taille` par partant (courses.js)
        let h=Math.round(62*(0.82+0.38*(i/Math.max(1,P.length-1)))*(r.taille||1));
        let bob=0, star=(phase==='bet' && i===pick);
        if(star){ // CHARACTER SELECT : le choisi glisse au centre, grossit (ease-out) et rebondit doucement
          const e=1-Math.pow(1-selT,3);
          sx += (BW*0.5-sx)*e; y += (HORIZON+86-y)*e; h = Math.round(h+(104-h)*e);
          bob = Math.sin(gt*2.6)*2*e;
        }
        const w=img.width/img.height*h;
        if(star){ // ombre portée double (cœur + pénombre), qui respire à l'inverse du rebond
          const e2=1-Math.pow(1-selT,3), k=1-(bob+2)*0.045;
          ctx.save(); ctx.fillStyle='#000';
          ctx.globalAlpha=0.16*e2; ctx.beginPath(); ctx.ellipse(sx+3,y+6,w*0.52*k,6.5,0,0,7); ctx.fill();
          ctx.globalAlpha=0.42;    ctx.beginPath(); ctx.ellipse(sx+1,y+5,w*0.36*k,4.5,0,0,7); ctx.fill();
          ctx.restore();
        } else { ctx.save(); ctx.globalAlpha=0.4; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(sx,y+5,w*0.34,4,0,0,7); ctx.fill(); ctx.restore(); } // ombre au sol → détache du décor chargé
        // à l'arrivée aussi tout reste vivant : le gagnant fait des petits bonds, les perdants se balancent
        let yOff=0;
        if(phase==='result'){ yOff = (winner>=0 && R[winner]===r) ? -Math.abs(Math.sin(gt*5))*4 : Math.sin(gt*1.6+i)*1.2; }
        ctx.drawImage(img, sx-w*0.5, y-h+8+yOff+bob, w, h);
        if(phase==='race' && r.surge>0.5 && !r.done){ ctx.save(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.lineCap='butt'; for(let k=0;k<3;k++){ const sy2=y-16-k*13; ctx.beginPath(); ctx.moveTo(sx-w*0.55,sy2); ctx.lineTo(sx-w*0.55-11-r.surge*13,sy2); ctx.stroke(); } ctx.restore(); } // speed-lines DURES (SF2)
        // signalétique rétro — plaquettes numéro PIXEL (chips)
        if(phase==='bet'){ // aux paris : chip dans l'herbe + cadre 1P qui CLIGNOTE net (blink 2 frames)
          const cy2=y+9; ctx.save();
          ctx.fillStyle=r.col; ctx.fillRect(sx-5,cy2,10,10);
          ctx.strokeStyle='#0a0e1a'; ctx.lineWidth=1; ctx.strokeRect(sx-5.5,cy2+0.5,11,10);
          ctx.fillStyle='#0a0e1a'; ctx.font='bold 8px monospace'; ctx.textAlign='center'; ctx.fillText(String(i+1),sx,cy2+8);
          if(i===pick && Math.floor(gt*4)%2===0){ ctx.strokeStyle=V.blanc; ctx.lineWidth=1; ctx.strokeRect(sx-7,cy2-2,14,15); } // curseur = cadre blanc clignotant, PAS de flèche
          ctx.restore();
        } else { // COURSE/ARRIVÉE : plaquette numéro dure au-dessus de CHAQUE cheval → on les suit ; aucun curseur de sélection
          const py=y-h+1; ctx.save();
          ctx.fillStyle='#0a0e1a'; ctx.fillRect(sx-7,py-9,14,11);
          ctx.fillStyle=r.col; ctx.fillRect(sx-6,py-8,12,9);
          ctx.fillStyle='#0a0e1a'; ctx.font='bold 8px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(i+1),sx,py-3); ctx.textBaseline='alphabetic';
          ctx.restore();
        } }
      else {
        const bob = phase==='race'? Math.sin(r.wx*0.35+r.bob)*1.3 : 0; const yy=y-8+bob;
        ctx.fillStyle=r.col; ctx.beginPath(); ctx.ellipse(sx,yy,12,5.5,0,0,7); ctx.fill();
        ctx.fillRect(sx+9,yy-8,4,9); ctx.beginPath(); ctx.ellipse(sx+12,yy-9,4,3.2,0,0,7); ctx.fill();
        ctx.strokeStyle=r.col; ctx.lineWidth=2.2; ctx.lineCap='round'; const ph=r.wx*0.35+r.bob, sw=phase==='race'?Math.sin(ph)*3.4:1.6;
        ctx.beginPath(); ctx.moveTo(sx-6,yy+2); ctx.lineTo(sx-6+sw,yy+8); ctx.moveTo(sx+6,yy+2); ctx.lineTo(sx+6-sw,yy+8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx-11,yy-2); ctx.lineTo(sx-16,yy-4+Math.sin(ph)*2); ctx.stroke();
        ctx.fillStyle=V.noir; ctx.fillRect(sx-3,yy-3,7,6); ctx.fillStyle=V.blanc; ctx.font='6px monospace'; ctx.textAlign='center'; ctx.fillText(i+1,sx+0.5,yy+2);
      }
      if(leader){ ctx.fillStyle=V.jaune; ctx.font='bold 7px monospace'; ctx.textAlign='center'; ctx.fillText('▲',sx,y-34); }
    }
    function draw(){
      // ---- DÉCOR EN CALQUES : ciel fixe (derrière) → tribune tuilée + parallaxe → piste qui défile ----
      const nearFin = phase==='race' && !resolved && R.some(r=>r.wx>FIN-220); // le public se lève quand ça va se jouer
      const cs = phase==='result' ? (winner===pick?'hype':'sad') : ((winner>=0||nearFin)?'hype':'idle');
      // RYTHMES À L'ANCIENNE : jamais une foule figée — 2 poses alternées, tempo selon l'émotion.
      // hype = saute (bras haut/bas, 280 ms) · sad = s'affaisse lentement (700 ms) · idle = respire (450 ms)
      const nowMs = performance.now(); let crowdImg, tribBob = 0;
      if(cs==='hype'){ const f=Math.floor(nowMs/280)%2; crowdImg = f ? deco('pmu_stage_hype_1') : (deco('pmu_stage_idle_1')||deco('pmu_stage_hype_1')); tribBob = f ? -1 : 0; }
      else if(cs==='sad'){ const f=Math.floor(nowMs/700)%2; crowdImg = f ? deco('pmu_stage_sad_1') : (deco('pmu_stage_idle_2')||deco('pmu_stage_sad_1')); }
      else { crowdImg = deco('pmu_stage_idle_'+(1+(Math.floor(nowMs/450)%2))) || deco('pmu_stage_idle_1'); }
      const sky = deco('pmu_sky');
      const trk = deco('pmu_track');
      // 1) CIEL — dessiné UNE fois, plein cadre, jamais tuilé (pas de cathédrale qui se répète)
      if(sky){ const sh=sky.height*(BW/sky.width); ctx.drawImage(sky,0,0,BW,Math.max(sh,HORIZON)); }
      else { const g=ctx.createLinearGradient(0,0,0,HORIZON); g.addColorStop(0,'#0a0e1a'); g.addColorStop(1,'#12281c'); ctx.fillStyle=g; ctx.fillRect(0,0,BW,HORIZON); ctx.fillStyle=V.jaune; ctx.globalAlpha=.85; ctx.beginPath(); ctx.arc(BW-70,26,11,0,7); ctx.fill(); ctx.globalAlpha=1; }
      // nuages + étoiles au-dessus des tribunes (vie dans le ciel)
      for(let i=0;i<4;i++){ const cw=64+i*22, cx=((gt*(7+i*3)+i*150)%(BW+cw))-cw/2, cy=10+i*8; ctx.fillStyle='rgba(190,205,235,0.05)'; ctx.beginPath(); ctx.ellipse(cx,cy,cw,9,0,0,7); ctx.fill(); }
      for(const s of stars2){ const a=0.35+0.55*Math.abs(Math.sin(gt*2+s.p)); ctx.fillStyle='rgba(255,255,255,'+a+')'; ctx.fillRect(s.x|0,s.y|0,1,1); }
      // 2) TRIBUNE — ratio natif (jamais écrasée), tuilée, parallaxe lente, bas posé sur l'horizon
      if(crowdImg){ tile(crowdImg, HORIZON-TRIB_H+tribBob, TRIB_H, camX*0.28); } // le saut = 1 pixel de rebond, pile sur le tempo
      // 3) PISTE — tuilée horizontalement, défile avec la caméra
      if(trk){ tile(trk,HORIZON,BH-HORIZON,camX); }
      else {
        ctx.fillStyle='#123a26'; ctx.fillRect(0,HORIZON,BW,BH-HORIZON);
        ctx.strokeStyle='rgba(74,208,160,0.18)'; ctx.lineWidth=1; for(let i=0;i<=P.length;i++){ const top=HORIZON+16, y=top+((BH-24-top)/P.length)*i; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(BW,y); ctx.stroke(); }
      }
      // poussière des sabots (derrière les coureurs)
      for(const d of dust){ ctx.fillStyle=`rgba(150,110,70,${Math.max(0,d.life)*0.5})`; const dx=MARGIN+(d.x-camX); ctx.beginPath(); ctx.arc(dx,d.y,d.s*(1.6-d.life),0,7); ctx.fill(); }
      // ligne d'arrivée (damier) à FIN
      { const sx=MARGIN+(FIN-camX); if(sx>-8&&sx<BW+8){ for(let y=HORIZON;y<BH-12;y+=6) for(let c=0;c<2;c++){ ctx.fillStyle=((y/6|0)+c)%2?V.blanc:'#111'; ctx.fillRect(sx+c*4,y,4,6);} ctx.fillStyle=V.rouge; ctx.fillRect(sx,HORIZON-10,2,10); } }
      // coureurs — aux paris, le choisi est dessiné EN DERNIER (au-dessus, star de l'écran)
      const lead = R.reduce((a,b)=>b.wx>a.wx?b:a, R[0]);
      R.forEach((r,i)=>{ if(!(phase==='bet' && i===pick)) drawRunner(r,i, r===lead && phase==='race'); });
      if(phase==='bet' && R[pick]) drawRunner(R[pick],pick,false);
      // bêtises premier plan (parallax + rapide)
      const fy=BH-16; props.forEach(pr=>{ const sx=MARGIN+(pr.wx??pr.x)*1.0 - camX*1.12; const x=sx; if(x>-20&&x<BW+20) drawProp(pr, x, fy); });
      ctx.fillStyle='#0a1710'; ctx.fillRect(0,BH-8,BW,8); // rebord premier plan
      // ---- HUD télé ----
      ctx.fillStyle='#0a1f16'; ctx.fillRect(0,0,BW,16);
      ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.fillRect(0,0,BW,1); ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,15,BW,1); // arêtes bevel
      ctx.font='900 11px "Courier New",monospace'; ctx.textAlign='left';
      ctx.fillStyle='#000'; ctx.fillText(COURSE.titre,7,13); ctx.fillStyle=V.vert; ctx.fillText(COURSE.titre,6,12);       // texte chunky (ombre pixel)
      ctx.textAlign='right'; ctx.fillStyle='#000'; ctx.fillText('CAGNOTTE '+cagnotte,BW-5,13); ctx.fillStyle=V.jaune; ctx.fillText('CAGNOTTE '+cagnotte,BW-6,12);
      // mini-carte de progression (positions même hors écran)
      ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(6,18,BW-12,5); ctx.fillStyle=V.rouge; ctx.fillRect(BW-7,18,1,5);
      R.forEach((r,i)=>{ ctx.fillStyle=r.col; const x=8+(r.wx/FIN)*(BW-16); ctx.fillRect(x,18,2,5); });
      if(phase==='race' && count>0){ const n=Math.ceil(count/0.8); ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,BH/2-26,BW,52); ctx.fillStyle='rgba(255,255,255,0.14)'; ctx.fillRect(0,BH/2-26,BW,1); ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,BH/2+25,BW,1); ctx.font='900 34px "Courier New",monospace'; ctx.textAlign='center'; ctx.fillStyle='#000'; ctx.fillText(String(n),BW/2+2,BH/2+14); ctx.fillStyle=V.jaune; ctx.fillText(String(n),BW/2,BH/2+12); }
      if(phase==='race' && count<=0){ ctx.font='900 14px "Courier New",monospace'; ctx.textAlign='center'; ctx.globalAlpha=Math.max(0,1-t*0.6); if(t<1.6){ ctx.fillStyle='#000'; ctx.fillText('ILS SONT PARTIS !',BW/2+1,HORIZON+41); ctx.fillStyle=V.jaune; ctx.fillText('ILS SONT PARTIS !',BW/2,HORIZON+40); } ctx.globalAlpha=1; }
      if(phase==='result' && winner===pick){ // confettis arcade : 2×3 px qui virevoltent (le sens alterne au sinus)
        for(const c of conf){ const fl=Math.sin(gt*6+c.ph)>0; ctx.fillStyle=c.col; ctx.fillRect(c.x|0, c.y|0, fl?2:3, fl?3:2); }
      }
      if(phase==='result'){ // tableau d'arrivée : le TIERCÉ (1-2-3) + verdict
        const pod=[...R].sort((a,b)=>(a.place||99)-(b.place||99)).slice(0,3);
        ctx.fillStyle='rgba(0,0,0,0.68)'; ctx.fillRect(BW/2-120,BH/2-42,240,84);
        ctx.strokeStyle=V.vert; ctx.lineWidth=1; ctx.strokeRect(BW/2-120,BH/2-42,240,84);
        ctx.fillStyle=winner===pick?V.vert:V.rouge; ctx.font='900 15px "Courier New",monospace'; ctx.textAlign='center'; ctx.fillText(winner===pick?'GAGNÉ !':'PERDU',BW/2,BH/2-24);
        ctx.font='900 11px "Courier New",monospace';
        pod.forEach((r,j)=>{ const y=BH/2-6+j*15; ctx.fillStyle=r.col; ctx.textAlign='left'; ctx.fillText(`${j+1}ᵉ`,BW/2-104,y); ctx.fillText(r.nom,BW/2-76,y); ctx.fillStyle=V.jaune; ctx.textAlign='right'; ctx.fillText('×'+r.cote,BW/2+104,y); });
      }
      if(flashT>0){ ctx.fillStyle=`rgba(255,255,255,${Math.min(0.85,flashT*2.6)})`; ctx.fillRect(0,0,BW,BH); } // flash photo-finish
      // ---- OVERLAY CRT (vieux poste PMU / borne 98) : scanlines + vignette ----
      ctx.save();
      ctx.globalAlpha=0.11; ctx.fillStyle='#000'; for(let y=0;y<BH;y+=2) ctx.fillRect(0,y,BW,1); // scanlines
      ctx.globalAlpha=0.05; ctx.fillStyle='#69f'; for(let x=0;x<BW;x+=3) ctx.fillRect(x,0,1,BH);   // masque de phosphore léger
      ctx.globalAlpha=0.06; for(let i=0;i<130;i++){ ctx.fillStyle=Math.random()<0.5?'#fff':'#000'; ctx.fillRect((Math.random()*BW)|0,(Math.random()*BH)|0,1,1); } // GRAIN (scanné/dither)
      ctx.globalAlpha=1;
      const vg=ctx.createRadialGradient(BW/2,BH/2,BH*0.34,BW/2,BH/2,BH*0.9); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.4)');
      ctx.fillStyle=vg; ctx.fillRect(0,0,BW,BH);
      ctx.restore();
    }
    function loop(now){
      raf=requestAnimationFrame(loop); const dt=Math.min(.05,(now-last)/1000); last=now; gt+=dt;
      if(phase==='bet'){ if(pick!==lastPick){ lastPick=pick; selT=0; beep(720,0.05); } selT=Math.min(1, selT+dt*3.2); } // clic de sélection + glissade
      if(phase==='race' && count>0){ // DÉPART 3-2-1 : rien ne bouge, bips, tension
        const n0=Math.ceil(count/0.8); count-=dt; const n1=Math.ceil(Math.max(count,0.001)/0.8);
        if(n1<n0) beep(n1>0?440:880, n1>0?0.09:0.25);
      }
      else if(phase==='race'){ t+=dt;
        if(hitT>0) hitT-=dt;                                             // gel photo-finish (le monde retient son souffle)
        const near = !resolved && R.some(r=>r.wx>FIN-140);
        const ts = hitT>0 ? 0 : (near ? 0.45 : 1);                       // ralenti quand la ligne approche
        const sdt = dt*ts;
        R.forEach((r,i)=>{ if(r.done) return;
          r.surgeCd-=sdt; if(r.surgeCd<=0){ r.surge = Math.random()<0.55?(0.3+Math.random()*0.7):0; r.surgeCd=0.5+Math.random()*1.5; }
          const favBias=0.62+(1/r.cote)*0.9;                 // favori un peu plus fort, mais variance forte
          const v=150*r.form*favBias*(1+r.surge*0.5)*(0.78+Math.random()*0.44);
          r.wx+=v*sdt; if(r.wx>=FIN){ r.wx=FIN; r.done=true; r.place=++placeN; if(winner<0) winner=i; }
          if(ts>0 && Math.random()<v*sdt*0.05) dust.push({x:r.wx-10-Math.random()*8, y:laneY(i)+4+Math.random()*3, vx:-30-Math.random()*40, life:0.55, s:1.5+Math.random()*2}); // poussière des sabots
        });
        for(let j=dust.length-1;j>=0;j--){ const d=dust[j]; d.life-=dt; d.x+=d.vx*sdt; if(d.life<=0) dust.splice(j,1); }
        const lead=R.reduce((a,b)=>b.wx>a.wx?b:a,R[0]);
        const camGoal=Math.max(0,Math.min(FIN-BW+MARGIN+40, lead.wx-BW*0.5));
        camX += (camGoal-camX)*Math.min(1,dt*5);                          // caméra lissée (GAME_FEEL §6)
        if(winner>=0 && !resolved){ resolved=true; flashT=0.3; hitT=0.22; beep(1320,0.3); // flash + gel : la photo
          setTimeout(()=>{ if(phase==='race') finishRace(); }, 1100); }
      }
      else if(phase==='result'){ // la fête (ou la loose) continue de tomber
        for(const c of conf){ c.y+=c.vy*dt; c.x+=Math.sin(gt*3+c.ph)*20*dt; if(c.y>BH){ c.y=-6; c.x=Math.random()*BW; } }
        for(let j=dust.length-1;j>=0;j--){ const d=dust[j]; d.life-=dt; if(d.life<=0) dust.splice(j,1); }
      }
      if(flashT>0) flashT-=dt;
      draw();
    }
    raf=requestAnimationFrame(loop);
    api.start=startRace; api.replay=replay;
    return ()=>cancelAnimationFrame(raf);
  });
  let api={ start:()=>{}, replay:()=>{} };
</script>

<div class="pmu-course">
  <canvas bind:this={canvasEl}></canvas>
  <div class="ctrls">
    {#if phase==='bet'}
      <div class="partants">
        {#each P as p, i}
          <button class="part" class:on={pick===i} onclick={()=>pick=i} style="--c:{p.col}">
            <span class="num">{i+1}</span><span class="nm">{p.nom}</span><span class="cote">×{p.cote}</span>
          </button>
        {/each}
      </div>
      <div class="row">
        <span class="lab">MISE</span>
        <button onclick={()=>mise=Math.max(COURSE.miseMin,mise-1)}>−</button><span class="mise">{mise}</span><button onclick={()=>mise=Math.min(COURSE.miseMax,mise+1)}>+</button>
        <button class="go" onclick={()=>api.start()}>LANCER LA COURSE ▶</button>
      </div>
      {#if msg}<div class="msg">{msg}</div>{/if}
    {:else if phase==='result'}
      <div class="row res"><span class="msg">{msg}</span><button class="go" onclick={()=>api.replay()}>REJOUER ↻</button></div>
    {:else}
      <div class="row"><span class="msg run">course en cours…</span></div>
    {/if}
  </div>
</div>

<style>
  .pmu-course{ display:flex; flex-direction:column; gap:6px; }
  canvas{ width:100%; image-rendering:auto; border:2px solid #123a2c; background:#0c1f16; box-shadow:inset 0 0 12px rgba(0,0,0,0.5); }
  /* écran de PARIS façon CHARACTER SELECT SF2 : tuiles "silk" colorées, bevel Win98, main-curseur, police chunky */
  .ctrls{ display:flex; flex-direction:column; gap:5px; font-family:'Courier New',monospace; font-weight:800; letter-spacing:.02em; text-transform:uppercase; image-rendering:pixelated; }
  .partants{ display:grid; grid-template-columns:1fr 1fr; gap:5px; }
  .part{ position:relative; display:flex; align-items:center; gap:6px; padding:5px 6px 5px 17px; color:#0a0e1a; cursor:pointer; font-size:11px; text-align:left;
         background:var(--c); border:1px solid #0a0e1a; box-shadow:inset 1.5px 1.5px 0 rgba(255,255,255,.55), inset -1.5px -1.5px 0 rgba(0,0,0,.45); }
  .part .num{ width:15px; height:15px; display:grid; place-items:center; background:#0a0e1a; color:var(--c); font-weight:900; box-shadow:inset 1px 1px 0 rgba(255,255,255,.25); }
  .part .nm{ flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-shadow:1px 1px 0 rgba(255,255,255,.35); }
  .part .cote{ color:#0a0e1a; background:rgba(255,255,255,.55); padding:0 3px; font-weight:900; }
  .part.on{ box-shadow:inset -1.5px -1.5px 0 rgba(255,255,255,.55), inset 1.5px 1.5px 0 rgba(0,0,0,.45); animation:silkblink .46s steps(1) infinite; } /* enfoncé + clignote */
  .part.on::before{ content:'\25BA'; position:absolute; left:3px; top:50%; transform:translateY(-50%); color:#0a0e1a; font-size:11px; animation:handpush .4s steps(1) infinite; } /* main-curseur SF2 */
  @keyframes silkblink{ 0%,50%{ outline:2px solid #fff; outline-offset:-1px; } 50.01%,100%{ outline:2px solid #0a0e1a; outline-offset:-1px; } }
  @keyframes handpush{ 0%,50%{ left:3px; } 50.01%,100%{ left:6px; } }
  .row{ display:flex; align-items:center; gap:8px; }
  .lab{ font-size:11px; color:#ffb24a; letter-spacing:.12em; }
  .row button{ font-family:inherit; font-weight:800; font-size:12px; padding:3px 10px; color:#0a0e1a; background:#c9d6cf; border:2px solid; border-color:#fff #566 #566 #fff; cursor:pointer; }
  .row button:active{ border-color:#566 #fff #fff #566; }
  .mise{ min-width:24px; text-align:center; font-weight:900; color:#ffb24a; background:#0a0e1a; padding:2px 5px; border:1px solid #2a5a44; }
  .go{ margin-left:auto; color:#0a0e1a !important; background:linear-gradient(180deg,#ffe08a,#ffb24a) !important; border:2px solid !important; border-color:#fff #a06a10 #a06a10 #fff !important; font-weight:900 !important; }
  .go:active{ border-color:#a06a10 #fff #fff #a06a10 !important; }
  .msg{ font-size:11px; color:#ffb24a; font-weight:800; } .msg.run{ color:#7ce0bf; } .res .msg{ flex:1; }
</style>
