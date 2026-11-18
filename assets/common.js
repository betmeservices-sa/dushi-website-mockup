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
/* Dushi caminando por escenarios (montaña y playa) en la esquina inferior izquierda */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.createElement('div');root.id='dworld';if(reduce)root.classList.add('still');
  root.innerHTML='<div class="stage"><svg class="lights" viewBox="0 0 280 200" aria-hidden="true"><path class="lh" d="M-4 16C46 128 118 118 170 80S252 70 284 118" fill="none"/><path class="lw" d="M-4 16C46 128 118 118 170 80S252 70 284 118" fill="none"/><g class="lb"></g></svg><div class="sled-shadow"></div><button type="button" class="dw" aria-label="Dushi el Torogoz con gorro de Santa, flotando en su trineo. Tócalo para saludarlo"><img class="sled" src="assets/dushi-trineo.webp" alt="" width="520" height="528"></button></div><div class="dsay" role="status" aria-live="polite"></div>';
  document.body.appendChild(root);
  (function(){var p=root.querySelector('.lw'),g=root.querySelector('.lb'),L=p.getTotalLength(),n=5,D=9,C=['#FCA62A','#F96C4F','#0E203E','#1A9E9C'],s='';
    for(var i=0;i<n;i++){var pt=p.getPointAtLength(L*(i+.5)/D),a=p.getPointAtLength(Math.min(L,L*(i+.5)/D+2)),ang=Math.atan2(a.y-pt.y,a.x-pt.x)*180/Math.PI;
      s+='<g class="b b'+(i%4)+'" transform="translate('+pt.x.toFixed(1)+' '+pt.y.toFixed(1)+') rotate('+(ang*.3).toFixed(1)+')"><circle class="gl" cx="0" cy="9" r="11" fill="'+C[i%4]+'"/><path d="M-5 4Q-5 14 0 15Q5 14 5 4Z" fill="#F3E6CF" stroke="#F3E6CF" stroke-width="5" stroke-linejoin="round"/><rect x="-2.6" y="-1" width="5.2" height="5" rx="1.2" fill="#0E203E"/><path d="M-5 4Q-5 14 0 15Q5 14 5 4Z" fill="'+C[i%4]+'" stroke="#0E203E" stroke-width="1.6" stroke-linejoin="round"/></g>'}
    root.querySelectorAll('.lw,.lh').forEach(function(e){e.style.strokeDasharray=(L*(n-.35)/D).toFixed(1)+' '+L.toFixed(1)});
    g.innerHTML=s})();
  var dw=root.querySelector('.dw'),say=root.querySelector('.dsay');
  var lines=['¡Felices fiestas!','¡Pura vida!','¿Playa o montaña?','Vámonos de feriado','¡Todo Dushi!','Pasa por Plaza Merliot','No olvides la hielera'],t=0;
  function speak(s){say.textContent=s;say.classList.add('on');clearTimeout(t);t=setTimeout(function(){say.classList.remove('on')},2400)}
  dw.addEventListener('click',function(){speak(lines[Math.floor(Math.random()*lines.length)]);dw.classList.remove('hop');void dw.offsetWidth;dw.classList.add('hop')});
  dw.addEventListener('animationend',function(e){if(e.animationName==='hopw')dw.classList.remove('hop')});
  setTimeout(function(){speak('¡Felices fiestas! Soy Dushi')},1500);
  // móvil: se esconde mientras se hace scroll y vuelve al detenerse
  var mq=window.matchMedia&&matchMedia('(max-width: 700px)'),st=0;
  addEventListener('scroll',function(){if(!mq||!mq.matches)return;root.classList.add('away');clearTimeout(st);st=setTimeout(function(){root.classList.remove('away')},1400)},{passive:true});
})();

/* Dushi en la hielera: extiende el brazo y levanta el pulgar (animación por cuadros) */
(function(){
  var cv=document.querySelectorAll('canvas.dz');if(!cv.length)return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var img=new Image();img.src=cv[0].dataset.sheet;
  img.onload=function(){cv.forEach(function(c){
    var N=+c.dataset.frames,cols=+c.dataset.cols,w=c.width,h=c.height,x=c.getContext('2d'),f=0,playing=false,timer=0,vis=true;
    function draw(i){var r=Math.floor(i/cols),k=i%cols;x.clearRect(0,0,w,h);x.drawImage(img,k*w,r*h,w,h,0,0,w,h)}
    function play(){if(playing||reduce)return;playing=true;f=0;var t0=performance.now();
      (function step(t){if(!playing)return;var i=Math.min(N-1,Math.floor((t-t0)/83));draw(i);
        if(i>=N-1){playing=false;draw(0);schedule(3500);return}requestAnimationFrame(step)})(t0)}
    function schedule(ms){clearTimeout(timer);timer=setTimeout(function(){if(vis&&!document.hidden)play();else schedule(1500)},ms)}
    draw(reduce?26:0);
    if(!reduce){schedule(1200);
      var host=c.closest('button,.frame')||c;host.addEventListener('click',function(){play()});host.addEventListener('mouseenter',function(){play()});
      if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(c)}
  })};
})();
