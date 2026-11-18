(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* header + reveal al hacer scroll */
  var hdr=document.querySelector('header');
  function onS(){hdr.classList.toggle('stuck',window.scrollY>40)}
  window.addEventListener('scroll',onS,{passive:true});onS();
  var groups=['.head','.toolbar','.plan','.step','.slot','.card','.camp .wrap>*','.ali .cta','footer .fgrid>div','.v3','.callout','.qa','.fq-cta','.draft','.tzs .wrap>*','.nm .wrap>*','.band .wrap>*','.mascot .mtxt','.mascot .mstage','.pstrip','.ali .head'];
  var els=[];
  groups.forEach(function(sel){var prev=null,idx=0;document.querySelectorAll(sel).forEach(function(el){
    var par=el.parentNode;if(par!==prev){prev=par;idx=0}
    el.classList.add('rv');el.style.setProperty('--i',Math.min(idx++,7));els.push(el)})});
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var el=e.target;el.classList.add('in');io.unobserve(el);if(!el.classList.contains('head'))el.addEventListener('transitionend',function h(ev){if(ev.propertyName==='transform'){el.classList.remove('rv','in');el.style.removeProperty('--i');el.removeEventListener('transitionend',h)}})}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(el){io.observe(el)});
  }else els.forEach(function(el){el.classList.add('in')});
})();
/* Dushi paseando: camina por el borde inferior y a veces vuela */
(function(){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var root=document.createElement('div');root.id='dwalk';root.setAttribute('aria-hidden','false');
  root.innerHTML='<div class="dshadow"></div><button type="button" class="dw walk" aria-label="Dushi el Torogoz paseando. Tócalo para saludarlo"><img src="assets/dushi-camina.png" alt="" width="300" height="444"></button><div class="dsay" role="status" aria-live="polite"></div>';
  document.body.appendChild(root);
  var dw=root.querySelector('.dw'),img=dw.querySelector('img'),sh=root.querySelector('.dshadow'),say=root.querySelector('.dsay');
  var W=function(){return dw.offsetWidth||104},H=function(){return img.offsetHeight||150};
  var x=-W(),y=0,dir=1,mode='walk',vx=70,tx=0,ty=0,tmode=0,next=performance.now()+9000,last=performance.now(),talk=0;
  var lines=['¡Pura vida!','¿Playa o montaña?','Vámonos de feriado','¡Qué chido plan!','Pasa por Plaza Merliot','No olvides la hielera'];
  function setMode(m){mode=m;dw.classList.toggle('walk',m==='walk');dw.classList.toggle('fly',m==='fly');
    var src=m==='fly'?'assets/dushi-vuela.png':'assets/dushi-camina.png';if(img.getAttribute('src')!==src)img.setAttribute('src',src)}
  function pos(){var w=W(),h=H(),vw=innerWidth,flip=dir<0;
    dw.style.transform='translate('+x+'px,'+(-y)+'px) scaleX('+(flip?-1:1)+')';
    sh.style.transform='translate('+(x+w*.15)+'px,0)';sh.style.opacity=Math.max(.12,.9-y/260);
    say.style.transform='translate('+Math.max(6,Math.min(vw-say.offsetWidth-6,x+w*.3))+'px,'+(-(y+h+12))+'px)'}
  function speak(t,ms){say.textContent=t;say.classList.add('on');clearTimeout(talk);talk=setTimeout(function(){say.classList.remove('on')},ms||2200)}
  dw.addEventListener('click',function(){speak(lines[Math.floor(Math.random()*lines.length)]);dw.classList.remove('hop');dw.classList.remove('walk');void dw.offsetWidth;dw.classList.add('hop');
    setTimeout(function(){dw.classList.remove('hop');if(mode==='walk')dw.classList.add('walk')},620);
    if(mode==='walk'&&Math.random()<.5)startFly()});
  function startFly(){setMode('fly');tmode=0;var vh=innerHeight,vw=innerWidth;ty=vh*(.28+Math.random()*.4);
    tx=Math.max(0,Math.min(vw-W(),x+(Math.random()<.5?-1:1)*(vw*(.2+Math.random()*.3))));dir=tx>=x?1:-1}
  function frame(t){var dt=Math.min(.05,(t-last)/1000);last=t;var vw=innerWidth;
    if(document.hidden){requestAnimationFrame(frame);return}
    if(mode==='walk'){x+=dir*vx*dt;if(x>vw-W()+20){dir=-1}else if(x<-20){dir=1}
      if(t>next){if(Math.random()<.55)startFly();else{dir=-dir;next=t+5000+Math.random()*6000}}}
    else{ // volando: sube, avanza, y baja
      var dxx=tx-x;x+=Math.sign(dxx)*Math.min(Math.abs(dxx),150*dt);
      if(tmode===0){y+=170*dt;if(y>=ty){y=ty;tmode=1;tmode=Math.abs(dxx)<4?2:1}}
      else if(tmode===1){y+=Math.sin(t/260)*40*dt;if(Math.abs(tx-x)<4){tmode=2;}}
      else{y-=150*dt;if(y<=0){y=0;setMode('walk');next=t+8000+Math.random()*8000;speak('¡Aterrizaje perfecto!',1800)}}}
    pos();requestAnimationFrame(frame)}
  setMode('walk');pos();requestAnimationFrame(frame);
  setTimeout(function(){speak('¡Hola! Soy Dushi',2600)},1500);
  addEventListener('resize',pos);
})();
