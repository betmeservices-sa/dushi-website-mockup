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
/* Dushi caminando sobre un mundo, esquina inferior izquierda (se ve un cuarto del planeta) */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.createElement('div');root.id='dworld';
  root.innerHTML='<svg class="wsvg" viewBox="0 0 254 254" aria-hidden="true"><defs><clipPath id="wclip2"><circle cx="0" cy="240" r="240"/></clipPath></defs><g transform="translate(0 14)"><circle cx="0" cy="240" r="250" fill="#FCA62A" opacity=".35"/><circle cx="0" cy="240" r="240" fill="#1A9E9C"/><g clip-path="url(#wclip2)"><g class="wspin"><animateTransform attributeName="transform" type="rotate" from="0 0 240" to="-360 0 240" dur="150s" repeatCount="indefinite"/><path d="M170.0 270.6Q159.6 278.9 147.7 277.2Q135.8 275.4 123.5 271.8Q111.2 268.2 112.2 255.5Q113.2 242.7 114.9 230.4Q116.6 218.2 128.8 216.1Q141.1 214.0 151.6 216.6Q162.0 219.2 171.4 227.3Q180.8 235.3 180.6 248.8Q180.5 262.3 170.0 270.6Z" fill="#F3E6CF"/><path d="M104.6 144.0Q115.4 139.7 125.2 141.9Q135.0 144.1 145.5 149.2Q155.9 154.4 150.5 164.9Q145.0 175.5 143.7 186.6Q142.4 197.8 131.3 196.7Q120.3 195.5 112.9 190.9Q105.5 186.3 102.3 178.7Q99.0 171.1 96.4 159.7Q93.8 148.4 104.6 144.0Z" fill="#F3E6CF"/><path d="M106.3 73.3Q113.8 67.0 123.0 64.2Q132.2 61.4 138.2 68.5Q144.3 75.6 146.9 82.8Q149.5 90.0 147.7 97.8Q145.8 105.6 139.2 113.0Q132.6 120.4 123.0 117.1Q113.5 113.8 108.2 106.3Q102.9 98.9 100.8 89.3Q98.7 79.7 106.3 73.3Z" fill="#F3E6CF"/><path d="M42.2 48.1Q50.7 55.2 57.4 63.2Q64.1 71.3 61.3 81.9Q58.5 92.5 50.6 101.5Q42.7 110.5 30.5 108.8Q18.3 107.1 12.6 97.5Q7.0 87.9 0.7 77.2Q-5.6 66.4 5.5 60.6Q16.7 54.8 25.2 47.9Q33.8 40.9 42.2 48.1Z" fill="#F3E6CF"/><path d="M-67.0 48.1Q-69.7 38.9 -62.3 31.4Q-54.9 24.0 -44.6 24.8Q-34.3 25.7 -24.9 30.7Q-15.4 35.6 -16.9 46.1Q-18.3 56.5 -20.6 66.0Q-23.0 75.5 -32.6 78.7Q-42.3 81.9 -51.6 78.8Q-61.0 75.6 -62.6 66.5Q-64.3 57.4 -67.0 48.1Z" fill="#F3E6CF"/><path d="M-167.3 87.0Q-160.1 72.4 -154.8 56.7Q-149.5 41.0 -132.2 39.5Q-115.0 37.9 -97.4 44.9Q-79.9 51.8 -76.0 70.7Q-72.2 89.6 -83.9 102.4Q-95.6 115.3 -108.2 122.9Q-120.8 130.6 -137.3 129.9Q-153.8 129.2 -164.1 115.4Q-174.5 101.5 -167.3 87.0Z" fill="#F3E6CF"/><path d="M-135.3 179.2Q-141.0 187.7 -149.5 182.0Q-158.0 176.3 -163.8 170.5Q-169.6 164.7 -170.5 156.0Q-171.3 147.2 -167.1 137.4Q-162.8 127.6 -152.6 131.0Q-142.4 134.4 -133.9 136.6Q-125.3 138.9 -121.5 147.7Q-117.6 156.5 -123.6 163.6Q-129.5 170.7 -135.3 179.2Z" fill="#F3E6CF"/><path d="M-212.7 298.6Q-225.5 291.8 -237.1 279.2Q-248.6 266.6 -244.4 248.6Q-240.1 230.6 -222.4 228.6Q-204.8 226.6 -192.0 227.6Q-179.2 228.6 -169.6 237.6Q-160.0 246.6 -159.0 259.9Q-158.0 273.2 -164.3 286.3Q-170.5 299.4 -185.2 302.4Q-199.9 305.4 -212.7 298.6Z" fill="#F3E6CF"/><path d="M-155.1 320.0Q-158.4 312.5 -156.6 303.1Q-154.8 293.8 -145.5 290.9Q-136.3 288.0 -128.1 291.0Q-119.9 294.1 -114.5 300.6Q-109.0 307.2 -109.3 316.1Q-109.6 324.9 -117.4 328.1Q-125.3 331.2 -132.9 336.7Q-140.5 342.2 -146.2 334.9Q-151.9 327.5 -155.1 320.0Z" fill="#F3E6CF"/><path d="M-140.4 425.6Q-143.3 412.6 -144.8 397.9Q-146.3 383.1 -131.9 379.9Q-117.4 376.6 -105.8 377.6Q-94.2 378.5 -84.6 386.1Q-74.9 393.7 -74.3 406.2Q-73.6 418.8 -79.6 430.4Q-85.6 442.1 -98.5 442.6Q-111.4 443.2 -124.5 440.9Q-137.6 438.6 -140.4 425.6Z" fill="#F3E6CF"/><path d="M-60.6 390.8Q-69.9 386.5 -67.5 376.5Q-65.0 366.6 -57.0 362.5Q-49.0 358.5 -41.3 357.2Q-33.6 355.9 -26.6 360.1Q-19.6 364.3 -17.3 372.4Q-15.0 380.6 -19.7 387.1Q-24.4 393.7 -30.7 401.5Q-37.0 409.3 -44.2 402.2Q-51.4 395.1 -60.6 390.8Z" fill="#F3E6CF"/><path d="M81.3 419.2Q74.6 427.6 63.5 427.0Q52.5 426.5 39.9 422.1Q27.4 417.7 30.5 404.7Q33.6 391.8 39.5 383.8Q45.3 375.9 54.0 364.5Q62.7 353.2 74.4 361.0Q86.1 368.8 89.1 380.1Q92.1 391.3 90.1 401.1Q88.1 410.9 81.3 419.2Z" fill="#F3E6CF"/><path d="M129.8 335.9Q129.3 350.2 119.0 358.1Q108.6 365.9 97.7 369.5Q86.8 373.0 77.6 366.6Q68.4 360.1 58.7 350.8Q49.1 341.5 54.9 329.1Q60.6 316.7 70.7 307.5Q80.8 298.3 93.2 303.5Q105.6 308.7 118.0 315.1Q130.3 321.5 129.8 335.9Z" fill="#F3E6CF"/><path d="M212.8 286.3Q226.6 299.0 228.0 317.5Q229.3 336.0 215.8 346.6Q202.3 357.1 188.5 364.5Q174.8 372.0 160.9 364.2Q147.1 356.4 144.0 342.4Q140.9 328.4 143.7 316.1Q146.6 303.9 155.8 293.5Q165.0 283.2 182.0 278.3Q198.9 273.5 212.8 286.3Z" fill="#F3E6CF"/><circle cx="119.5" cy="218.9" r="5" fill="#FCA62A"/><circle cx="115.6" cy="97.2" r="5" fill="#FCA62A"/><circle cx="-7.7" cy="18.4" r="5" fill="#FCA62A"/><circle cx="-101.2" cy="131.5" r="5" fill="#FCA62A"/><circle cx="-217.7" cy="217.1" r="5" fill="#FCA62A"/><circle cx="-185.4" cy="369.8" r="5" fill="#FCA62A"/><circle cx="-53.6" cy="454.9" r="5" fill="#FCA62A"/><circle cx="62.0" cy="361.6" r="5" fill="#FCA62A"/><circle cx="107.3" cy="283.4" r="5" fill="#FCA62A"/></g></g><circle cx="0" cy="240" r="238.5" fill="none" stroke="#0E203E" stroke-width="3"/></g></svg><button type="button" class="dw" aria-label="Dushi el Torogoz caminando sobre el mundo. Tócalo para saludarlo"><span class="wsp"><img src="assets/dushi-camina.webp" alt="" width="3120" height="328"></span></button><div class="dsay" role="status" aria-live="polite"></div>';
  document.body.appendChild(root);
  var dw=root.querySelector('.dw'),say=root.querySelector('.dsay'),svg=root.querySelector('svg');
  if(reduce){root.classList.add('still');try{svg.pauseAnimations()}catch(e){}}
  var lines=['¡Pura vida!','¿Playa o montaña?','Vámonos de feriado','¡Qué chido plan!','Pasa por Plaza Merliot','No olvides la hielera'],t=0;
  function speak(s){say.textContent=s;say.classList.add('on');clearTimeout(t);t=setTimeout(function(){say.classList.remove('on')},2400)}
  dw.addEventListener('click',function(){speak(lines[Math.floor(Math.random()*lines.length)]);dw.classList.remove('hop');void dw.offsetWidth;dw.classList.add('hop')});
  dw.addEventListener('animationend',function(e){if(e.animationName==='hopw')dw.classList.remove('hop')});
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
