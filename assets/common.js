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
  root.innerHTML='<div class="stage"><div class="ic ic-m on"><svg viewBox="0 0 120 90" aria-hidden="true"><circle cx="102" cy="20" r="11" fill="#FCA62A"/><ellipse cx="62" cy="80" rx="56" ry="8" fill="#1A9E9C" stroke="#0E203E" stroke-width="3"/><path d="M44 80q6-4 12 0M76 82q6-4 12 0" fill="none" stroke="#F3E6CF" stroke-width="2.4" stroke-linecap="round"/><path d="M30 80L58 24Q64 14 70 24L98 80Z" fill="#F96C4F" stroke="#0E203E" stroke-width="3.5" stroke-linejoin="round"/><path d="M66 18L98 80L74 80Z" fill="#D4513C"/><path d="M30 80L58 24Q64 14 70 24L98 80Z" fill="none" stroke="#0E203E" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="64" cy="20" rx="6" ry="2.4" fill="#0E203E"/><g fill="#F3E6CF" stroke="#0E203E" stroke-width="2"><circle cx="70" cy="9" r="5"/><circle cx="78" cy="4" r="4"/></g></svg><span class="nm">Volcán de Izalco</span></div><div class="ic ic-b"><svg viewBox="0 0 120 90" aria-hidden="true"><circle cx="22" cy="20" r="11" fill="#FCA62A"/><ellipse cx="70" cy="60" rx="30" ry="18" fill="#0E203E"/><ellipse cx="40" cy="62" rx="9" ry="8" fill="#0E203E"/><path d="M58 46L66 34L72 46Z" fill="#0E203E" stroke="#0E203E" stroke-width="2" stroke-linejoin="round"/><path d="M99 56q9-5 5-12q-4-5-9 1" fill="none" stroke="#0E203E" stroke-width="3.5" stroke-linecap="round"/><circle cx="49" cy="55" r="2.4" fill="#F3E6CF"/><circle cx="36" cy="62" r="1.5" fill="#F3E6CF"/><circle cx="41" cy="64" r="1.5" fill="#F3E6CF"/><path d="M54 47Q72 36 92 50" fill="none" stroke="#F3E6CF" stroke-width="2.6" stroke-linecap="round" opacity=".8"/><path d="M22 70q8-9 16 0t16 0t16 0t16 0t16 0" fill="none" stroke="#F3E6CF" stroke-width="3" stroke-linecap="round"/><path d="M0 76q10-8 20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="#1A9E9C" stroke-width="6" stroke-linecap="round"/><path d="M0 86q10-8 20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="#1A9E9C" stroke-width="6" stroke-linecap="round"/></svg><span class="nm">El Tunco</span></div><div class="road"><svg class="ly" style="--d:7.5s" viewBox="0 0 560 16" preserveAspectRatio="none" aria-hidden="true"><rect x="8" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="48" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="88" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="128" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="168" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="208" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="248" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><g transform="translate(280 0)"><rect x="8" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="48" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="88" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="128" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="168" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="208" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/><rect x="248" y="6" width="16" height="3.5" rx="1.75" fill="#FCA62A"/></g></svg></div><button type="button" class="dw" aria-label="Dushi el Torogoz caminando. Tócalo para saludarlo"><span class="wsp"><img src="assets/dushi-camina.webp" alt="" width="3120" height="328"></span></button></div><div class="dsay" role="status" aria-live="polite"></div>';
  document.body.appendChild(root);
  var dw=root.querySelector('.dw'),say=root.querySelector('.dsay'),sc=root.querySelectorAll('.ic'),cur=0;
  var lines=['¡Pura vida!','¿Playa o montaña?','Vámonos de feriado','¡Qué chido plan!','Pasa por Plaza Merliot','No olvides la hielera'],t=0;
  function speak(s){say.textContent=s;say.classList.add('on');clearTimeout(t);t=setTimeout(function(){say.classList.remove('on')},2400)}
  dw.addEventListener('click',function(){speak(lines[Math.floor(Math.random()*lines.length)]);dw.classList.remove('hop');void dw.offsetWidth;dw.classList.add('hop')});
  dw.addEventListener('animationend',function(e){if(e.animationName==='hopw')dw.classList.remove('hop')});
  if(!reduce)setInterval(function(){if(document.hidden)return;sc[cur].classList.remove('on');cur=(cur+1)%sc.length;sc[cur].classList.add('on')},11000);
  setTimeout(function(){speak('¡Hola! Soy Dushi')},1500);
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
