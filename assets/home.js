(function(){
  var toast=document.getElementById('toast');
  function bump(){var bd=document.querySelector('.badge');bd.classList.remove('bump');void bd.offsetWidth;bd.classList.add('bump')}
  function fly(b){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!b.animate)return;
    var cart=document.querySelector('.badge').getBoundingClientRect(),r=b.getBoundingClientRect(),d=document.createElement('div');
    d.className='fly';document.body.appendChild(d);
    var x0=r.left+r.width/2,y0=r.top+r.height/2,x1=cart.left+cart.width/2,y1=cart.top+cart.height/2;
    var a=d.animate([{transform:'translate('+x0+'px,'+y0+'px) scale(1)',opacity:1},{transform:'translate('+(x0+(x1-x0)*.5)+'px,'+(Math.min(y0,y1)-60)+'px) scale(1.2)',opacity:1,offset:.5},{transform:'translate('+x1+'px,'+y1+'px) scale(.3)',opacity:.4}],{duration:700,easing:'cubic-bezier(.4,0,.2,1)'});
    a.onfinish=function(){d.remove()};
  }
  function bindAdd(b){b.addEventListener('click',function(){
    var c=b.closest('.card'),p=c&&c._p;if(!p)return;
    if(window.DushiCart.needsChoice(p)){DushiCart.openProd(p);return} /* con tallas o colores se elige en la tarjeta */
    DushiCart.add(p);b.classList.add('done');bump();fly(b);b.textContent='Agregado ✓';
    DushiCart.toast('Agregaste '+p.nombre+' al carrito');
    setTimeout(function(){b.classList.remove('done');b.textContent=b.disabled?'Agotado':'Agregar'},1600)})}
  document.querySelectorAll('.add').forEach(bindAdd);

  /* filtros: género x plan x búsqueda x orden */
  var grid=document.getElementById('grid'),cards=[].slice.call(grid.querySelectorAll('.card')),
      st={g:'all',p:'all',q:'',s:'rel'},cnt=document.getElementById('cnt');
  var orderIdx=cards.map(function(c,i){c.dataset.i=i;return c});
  function norm(t){return String(t==null?'':t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  var PLANTXT={playa:'playa',montana:'montana montaña',viaje:'viaje',acc:'accesorios'},GENTXT={mujer:'mujer',hombre:'hombre',ninos:'ninos niños nina nino',familia:'familia'};
  function indexar(p){
    var v=p.variantes||[];
    p._ix=norm([p.nombre,p.marca,p.categoria,p.sku,p.descripcion,p.etiqueta,
      (p.planes||[]).map(function(x){return PLANTXT[x]||x}).join(' '),(p.generos||[]).map(function(x){return GENTXT[x]||x}).join(' '),
      v.map(function(x){return [x.talla,x.color,x.codigo].join(' ')}).join(' ')].join(' '));
    return p}
  function slug(t){return norm(t).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  function cardToProd(c){
    var th=c.querySelector('.thumb'),img=th.querySelector('img'),svg=th.querySelector('svg.g'),pr=c.querySelector('.price'),o=pr.querySelector('s'),tg=th.querySelector('.tag');
    var nombre=c.querySelector('h3').textContent,bg=(th.getAttribute('style')||'').match(/background:\s*([^;]+)/);
    return indexar({sku:c.dataset.sku||'E-'+slug(nombre),nombre:nombre,marca:c.querySelector('.brand').textContent,categoria:'',
      precio:Number(c.dataset.pr),precioAnterior:o?parseFloat(o.textContent.replace('$','')):null,disponible:true,variantes:[],
      imagen:img?img.getAttribute('src'):null,_svg:svg?svg.outerHTML:'',bg:bg?bg[1].trim():'#F3E6CF',
      planes:c.dataset.c.split(' ').filter(function(x){return PLANTXT[x]}),generos:c.dataset.g.split(' ').filter(function(x){return GENTXT[x]}),
      etiqueta:tg?tg.textContent:null,etiquetaSol:!!(tg&&tg.classList.contains('sol')),descripcion:''})}
  function decorar(c){var h=c.querySelector('h3');h.tabIndex=0;h.setAttribute('role','button');h.setAttribute('aria-haspopup','dialog')}
  var PRODS=cards.map(function(c){c._p=cardToProd(c);decorar(c);return c._p});
  function pressed(sel,attr,val){document.querySelectorAll(sel).forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset[attr]===val))})}
  var PER=20,pg=1,lastKey='',pager=document.createElement('nav');
  pager.className='pager';pager.setAttribute('aria-label','Páginas de productos');grid.after(pager);
  function pintarPager(pages){
    pager.hidden=pages<2;if(pages<2){pager.innerHTML='';return}
    var h='<button class="tab" data-pg="'+(pg-1)+'"'+(pg===1?' disabled':'')+' aria-label="Página anterior">←</button>';
    for(var i=1;i<=pages;i++)h+='<button class="tab" data-pg="'+i+'" aria-pressed="'+(i===pg)+'"'+(i===pg?' aria-current="page"':'')+' aria-label="Página '+i+'">'+i+'</button>';
    pager.innerHTML=h+'<button class="tab" data-pg="'+(pg+1)+'"'+(pg===pages?' disabled':'')+' aria-label="Página siguiente">→</button>';
  }
  pager.addEventListener('click',function(e){var b=e.target.closest('[data-pg]');if(!b||b.disabled)return;
    pg=+b.dataset.pg;apply();document.getElementById('productos').scrollIntoView({behavior:'smooth'})});
  function apply(){
    var n=0;
    cards.forEach(function(c){
      var gs=c.dataset.g.split(' '),ps=c.dataset.c.split(' ');
      var okG=st.g==='all'||gs.indexOf('all')>-1||gs.indexOf(st.g)>-1;
      var okP=st.p==='all'||ps.indexOf(st.p)>-1;
      var okQ=!st.q||st.q.split(/\s+/).every(function(t){return c._p._ix.indexOf(t)>-1});
      c.dataset.ok=(okG&&okP&&okQ)?'1':'';if(c.dataset.ok)n++;});
    var sorted=cards.slice().sort(function(a,b){
      if(st.s==='asc')return a.dataset.pr-b.dataset.pr;
      if(st.s==='desc')return b.dataset.pr-a.dataset.pr;
      return a.dataset.i-b.dataset.i});
    /* paginación: al cambiar filtro, búsqueda u orden se vuelve a la página 1 */
    var key=[st.g,st.p,st.q,st.s].join('|');if(key!==lastKey){pg=1;lastKey=key}
    var pages=Math.max(1,Math.ceil(n/PER));if(pg>pages)pg=pages;
    var k0=0;sorted.forEach(function(c){
      if(c.dataset.ok){c.hidden=!(k0>=(pg-1)*PER&&k0<pg*PER);k0++}else c.hidden=true;
      grid.appendChild(c)});
    pintarPager(pages);
    cnt.textContent=n+(n===1?' producto':' productos');
    if(window.__f){var k=0;cards.forEach(function(c){c.classList.remove('pop');if(!c.hidden){c.style.setProperty('--i',Math.min(k++,11));void c.offsetWidth;c.classList.add('pop')}})}
    var e=document.getElementById('emp');
    if(!n&&!e){e=document.createElement('p');e.id='emp';e.className='empty';e.textContent='No encontramos nada con esos filtros. Prueba con otro plan o género.';grid.after(e)}
    if(n&&e)e.remove();
    pressed('#gen button','g',st.g);pressed('#gchips button','g',st.g);
    pressed('#plansnav button','p',st.p);pressed('.tabs .tab','p',st.p);
  }
  document.querySelectorAll('[data-g]').forEach(function(b){b.addEventListener('click',function(){st.g=b.dataset.g;apply();if(b.closest('#gen'))document.getElementById('productos').scrollIntoView({behavior:'smooth'})})});
  document.querySelectorAll('.tabs [data-p],#plansnav [data-p]').forEach(function(b){b.addEventListener('click',function(){
    st.p=(st.p===b.dataset.p&&b.closest('#plansnav'))?'all':b.dataset.p;apply();
    if(b.closest('#plansnav'))document.getElementById('productos').scrollIntoView({behavior:'smooth'})})});
  document.querySelectorAll('[data-go]').forEach(function(a){a.addEventListener('click',function(){st.p=a.dataset.go;apply()})});
  
  document.getElementById('sort').addEventListener('change',function(e){st.s=e.target.value;apply()});
  (function(){var u=new URLSearchParams(location.search);
    if(u.get('g'))st.g=u.get('g');if(u.get('p'))st.p=u.get('p');
    if(u.get('q')){st.q=norm(u.get('q').trim());document.getElementById('q').value=u.get('q')}})();
  apply();window.__f=true;

  /* ===== catálogo e inventario en vivo (backend -> VELARIS) ===== */
  function esc(t){return String(t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function money(n){return '$'+Number(n).toFixed(2)}
  /* sin foto: el icono del plan (los mismos de la sección de planes) */
  var ICONO={playa:'<svg class="g" viewBox="0 0 52 52"><path d="M8 24a18 14 0 0 1 36 0Z" fill="#F96C4F" stroke="#0E203E" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 24v20" stroke="#0E203E" stroke-width="3" stroke-linecap="round"/></svg>',
    montana:'<svg class="g" viewBox="0 0 52 52"><path d="M4 44 22 14l9 14 6-8 11 24Z" fill="#1A9E9C" stroke="#0E203E" stroke-width="2.5" stroke-linejoin="round"/><circle cx="38" cy="12" r="5" fill="#FCA62A" stroke="#0E203E" stroke-width="2"/></svg>',
    viaje:'<svg class="g" viewBox="0 0 52 52"><path d="M4 30 46 12l2 4-14 12 6 14-4 2-10-12-14 6Z" fill="#fff" stroke="#0E203E" stroke-width="2.5" stroke-linejoin="round" transform="rotate(8 26 26) scale(.95) translate(1 3)"/></svg>'};
  function cardHTML(p){
    var art=p.imagen?'<img src="'+esc(p.imagen)+'" alt="'+esc(p.nombre)+'" loading="lazy">':((window.DUSHI_ART&&window.DUSHI_ART[p.sku])||ICONO[(p.planes||[])[0]]||'');
    var tag=p.etiqueta?'<span class="tag'+(p.etiquetaSol?' sol':'')+'">'+esc(p.etiqueta)+'</span>':'';
    var old=p.precioAnterior&&p.precioAnterior>p.precio?'<s>'+money(p.precioAnterior)+'</s>':'';
    var sizes=p.tallas&&p.tallas.length?'<span class="sizes">Tallas '+p.tallas.map(esc).join(' · ')+'</span>':'';
    return '<article class="card" data-sku="'+esc(p.sku)+'" data-c="'+esc((p.planes||[]).join(' '))+'" data-g="'+esc((p.generos||['all']).join(' '))+'" data-pr="'+p.precio+'">'
      +'<div class="thumb" style="background:'+esc(p.bg)+'">'+art+tag+'</div>'
      +'<div class="meta"><span class="brand">'+esc(p.marca)+'</span><h3 tabindex="0" role="button" aria-haspopup="dialog">'+esc(p.nombre)+'</h3>'+sizes
      +'<div class="row"><span class="price">'+money(p.precio)+old+'</span><button class="add">Agregar</button></div></div></article>';
  }
  function setStock(card,n){
    if(n===true)n=Infinity;else if(n===false)n=0; /* VELARIS real solo dice si hay o no hay */
    var meta=card.querySelector('.meta'),old=meta.querySelector('.stock'),add=card.querySelector('.add');
    if(old)old.remove();
    card.classList.toggle('soldout',n===0);
    if(n===0||n<=3){var sp=document.createElement('span');sp.className='stock'+(n===0?' out':' low');sp.textContent=n===0?'Agotado por ahora':'Quedan '+n;meta.querySelector('h3').after(sp)}
    add.disabled=n===0;if(!add.classList.contains('done'))add.textContent=n===0?'Agotado':'Agregar';
  }
  function renderCatalogo(data){
    var list=data.productos||[];if(!list.length)return;
    grid.innerHTML=list.map(cardHTML).join('');
    cards=[].slice.call(grid.querySelectorAll('.card'));
    PRODS=list.map(indexar);
    cards.forEach(function(c,i){c._p=PRODS[i];c.dataset.i=i;bindAdd(c.querySelector('.add'));setStock(c,list[i].disponible)});
    apply();DushiCart.refresh(PRODS);sugerir();
  }
  function actualizarStock(){
    fetch('/api/stock',{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject()}).then(function(d){
      cards.forEach(function(c){var s=d.stock[c.dataset.sku];if(!s)return;setStock(c,s.disponible);c._p.disponible=s.disponible;
        (c._p.variantes||[]).forEach(function(v){if(s.variantes&&s.variantes[v.codigo]!==undefined)v.disponible=s.variantes[v.codigo]})});
      DushiCart.refresh(PRODS)}).catch(function(){});
  }
  fetch('/api/catalogo').then(function(r){return r.ok?r.json():Promise.reject()}).then(function(d){
    renderCatalogo(d);setInterval(actualizarStock,30000)}).catch(function(){/* sin backend: se queda el catálogo de ejemplo */});

  /* ===== tarjeta de producto, carrito y buscador ===== */
  function artHTML(p){return p.imagen?'<img src="'+esc(p.imagen)+'" alt="'+esc(p.nombre)+'">':(p._svg||(window.DUSHI_ART&&window.DUSHI_ART[p.sku])||ICONO[(p.planes||[])[0]]||'')}
  DushiCart.config({art:artHTML,onAdd:bump,byKey:function(sku){return PRODS.filter(function(p){return p.sku===sku})[0]}});
  grid.addEventListener('click',function(e){
    if(e.target.closest('.add'))return;
    var c=e.target.closest('.card');if(c&&(e.target.closest('.thumb')||e.target.closest('h3'))&&c._p)DushiCart.openProd(c._p)});
  grid.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.matches('h3')){var c=e.target.closest('.card');if(c&&c._p)DushiCart.openProd(c._p)}});

  var qEl=document.getElementById('q'),sug=document.createElement('ul');
  sug.className='sug';sug.id='sug';sug.hidden=true;sug.setAttribute('role','listbox');sug.setAttribute('aria-label','Resultados de búsqueda');
  qEl.closest('.search').appendChild(sug);qEl.setAttribute('autocomplete','off');qEl.setAttribute('aria-controls','sug');
  function encontrar(q){var t=norm(q).trim().split(/\s+/).filter(Boolean);return t.length?PRODS.filter(function(p){return t.every(function(x){return p._ix.indexOf(x)>-1})}):[]}
  function sugerir(){
    var q=qEl.value.trim();if(q.length<2){sug.hidden=true;qEl.setAttribute('aria-expanded','false');return}
    var m=encontrar(q),h='';
    m.slice(0,6).forEach(function(p){
      h+='<li role="option"><button type="button" data-sku="'+esc(p.sku)+'"><span class="sg-th" style="background:'+esc(p.bg||'#F3E6CF')+'">'+artHTML(p)+'</span>'
        +'<span class="sg-tx"><b>'+esc(p.nombre)+'</b><small>'+esc(p.marca)+(p.categoria?' · '+esc(p.categoria):'')+'</small></span><span class="sg-pr">'+money(p.precio)+'</span></button></li>'});
    if(!m.length)h='<li class="sg-none">No encontramos «'+esc(q)+'». Prueba con otra palabra.</li>';
    else if(m.length>6)h+='<li role="option"><button type="button" class="sg-all" data-all="1">Ver los '+m.length+' resultados en la tienda →</button></li>';
    sug.innerHTML=h;sug.hidden=false;qEl.setAttribute('aria-expanded','true');
  }
  function verTodos(){sug.hidden=true;st.q=norm(qEl.value.trim());apply();document.getElementById('productos').scrollIntoView({behavior:'smooth'})}
  qEl.addEventListener('input',function(){st.q=norm(qEl.value.trim());apply();sugerir()});
  qEl.addEventListener('focus',sugerir);
  qEl.addEventListener('keydown',function(e){
    if(e.key==='Enter'){e.preventDefault();verTodos()}
    else if(e.key==='ArrowDown'){var b=sug.querySelector('button');if(b){e.preventDefault();b.focus()}}
    else if(e.key==='Escape'&&!sug.hidden){sug.hidden=true;e.stopPropagation()}});
  sug.addEventListener('keydown',function(e){
    var bs=[].slice.call(sug.querySelectorAll('button')),i=bs.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();(bs[i+1]||bs[0]).focus()}
    else if(e.key==='ArrowUp'){e.preventDefault();if(i<=0)qEl.focus();else bs[i-1].focus()}
    else if(e.key==='Escape'){sug.hidden=true;qEl.focus();e.stopPropagation()}});
  sug.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    if(b.dataset.all)return verTodos();
    var p=PRODS.filter(function(x){return x.sku===b.dataset.sku})[0];sug.hidden=true;if(p)DushiCart.openProd(p)});
  document.addEventListener('click',function(e){if(!e.target.closest('.search'))sug.hidden=true});

  /* carrusel */
  var track=document.getElementById('track'),slides=track.children,N=slides.length,i=0,timer,playing=true,
      dots=document.getElementById('dots'),vid=document.getElementById('vid'),pp=document.getElementById('pp'),
      reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,DUR=[9,6,6,6];
  for(var k=0;k<N;k++){(function(k){var d=document.createElement('button');d.className='dot';d.setAttribute('aria-label','Ir a la diapositiva '+(k+1));
    d.addEventListener('click',function(){go(k)});dots.appendChild(d)})(k)}
  function go(n){
    i=(n+N)%N;track.style.transform='translateX('+(-100*i)+'%)';
    [].forEach.call(dots.children,function(d,j){d.setAttribute('aria-current',String(j===i));d.style.setProperty('--dur',DUR[j]+'s');d.classList.remove('paused');void d.offsetWidth;d.classList.toggle('paused',!playing)});
    [].forEach.call(slides,function(s,j){s.classList.toggle('on',j===i);s.setAttribute('aria-hidden',String(j!==i));[].forEach.call(s.querySelectorAll('a,button'),function(x){x.tabIndex=j===i?0:-1})});
    if(vid){if(i===0&&playing&&!reduce){var p=vid.play();if(p&&p.catch)p.catch(function(){})}else vid.pause()}
    clearTimeout(timer);if(playing&&!reduce)timer=setTimeout(function(){go(i+1)},DUR[i]*1000);
  }
  function setPlay(v){playing=v;pp.setAttribute('aria-label',v?'Pausar carrusel':'Reanudar carrusel');
    pp.innerHTML=v?'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>';go(i)}
  pp.addEventListener('click',function(){setPlay(!playing)});
  document.getElementById('prev').addEventListener('click',function(){go(i-1)});
  document.getElementById('next').addEventListener('click',function(){go(i+1)});
  var car=document.getElementById('car');
  car.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')go(i-1);if(e.key==='ArrowRight')go(i+1)});
  [].forEach.call(slides,function(s){[].forEach.call(s.querySelectorAll('.wrap>div:first-child>*'),function(el,k){el.style.setProperty('--k',k)})});
  if(reduce){playing=false;setPlay(false)}else go(0);
})();

/* mascota Dushi: frases al tocarla */
(function(){var b=document.getElementById('mbird'),bub=document.getElementById('bubble');if(!b||!bub)return;
  var f=['¡Pura vida!','¿Playa o montaña?','No olvides la hielera','¡Chivo! Vámonos de feriado','Tu próxima vacación empieza aquí','Pasa por Plaza Merliot, tercer nivel','¡Todo Dushi!'],i=0;
  function say(t){bub.textContent=t;bub.style.animation='none';void bub.offsetWidth;bub.style.animation=''}
  b.addEventListener('click',function(){i=(i+1)%f.length;say(f[i]);b.classList.remove('hop');void b.offsetWidth;b.classList.add('hop')});
  b.addEventListener('animationend',function(e){if(e.animationName==='hop')b.classList.remove('hop')});
  setInterval(function(){if(document.hidden)return;i=(i+1)%f.length;say(f[i])},6000);
})();
