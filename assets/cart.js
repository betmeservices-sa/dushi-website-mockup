/* Carrito (guardado en el navegador) + tarjeta de detalle de producto */
(function(){
  'use strict';
  var KEY='dushi-cart-v1',MAXQ=20,items=[],lastFocus=null;
  var PLAN={playa:'Playa',montana:'Montaña',viaje:'Viaje',acc:'Accesorios'},
      GEN={mujer:'Mujer',hombre:'Hombre',ninos:'Niños',familia:'Familia'};
  function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function money(n){return '$'+Number(n).toFixed(2)}
  function uniq(a){return a.filter(function(x,i){return x&&a.indexOf(x)===i})}
  function avail(d){return d===true||d>0}
  var cfg={art:function(){return ''}};

  /* ---------- almacenamiento ---------- */
  function valid(i){return i&&typeof i.key==='string'&&typeof i.sku==='string'&&isFinite(i.precio)&&i.qty>0}
  function load(){try{var j=JSON.parse(localStorage.getItem(KEY)||'[]');items=Array.isArray(j)?j.filter(valid):[]}catch(e){items=[]}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}}
  function count(){return items.reduce(function(a,i){return a+i.qty},0)}
  function total(){return items.reduce(function(a,i){return i.agotado?a:a+i.precio*i.qty},0)}
  function lineKey(sku,t,c){return [sku,t||'',c||''].join('|')}

  /* ---------- variantes ---------- */
  function opts(p){
    var v=p.variantes||[];
    return {tallas:uniq(v.map(function(x){return x.talla}).filter(function(t){return t&&!/^(UNI|MULTI)TALLA$|^[UÚú]nica$/i.test(t)})),
            colores:uniq(v.map(function(x){return x.color}))};
  }
  function needsChoice(p){var o=opts(p);return o.tallas.length>0||o.colores.length>1}
  function varAvail(p,t,c){
    var v=p.variantes||[];if(!v.length)return avail(p.disponible);
    return v.some(function(x){return (!t||x.talla===t)&&(!c||x.color===c)&&avail(x.disponible)});
  }
  function findVar(p,t,c){return (p.variantes||[]).filter(function(x){return (!t||x.talla===t)&&(!c||x.color===c)})[0]||null}

  /* ---------- operaciones ---------- */
  function add(p,o){
    o=o||{};var q=o.qty||1,k=lineKey(p.sku,o.talla,o.color),l=items.filter(function(i){return i.key===k})[0];
    if(l)l.qty=Math.min(MAXQ,l.qty+q);
    else{var v=findVar(p,o.talla,o.color);
      items.push({key:k,sku:p.sku,codigo:v?v.codigo:null,nombre:p.nombre,marca:p.marca||'',precio:Number(p.precio),
        imagen:p.imagen||null,bg:p.bg||'#F3E6CF',art:p.imagen?null:cfg.art(p),talla:o.talla||null,color:o.color||null,qty:Math.min(MAXQ,q)})}
    save();paint();
  }
  function setQty(k,q){
    items=items.map(function(i){if(i.key===k)i.qty=Math.max(0,Math.min(MAXQ,q));return i}).filter(function(i){return i.qty>0});
    save();paint();
  }
  function clear(){items=[];save();paint()}
  /* actualiza precio, nombre, foto y disponibilidad con el catálogo vigente */
  function refresh(prods){
    var by={};prods.forEach(function(p){by[p.sku]=p});
    items.forEach(function(i){var p=by[i.sku];
      if(!p){i.agotado=true;return}
      i.precio=Number(p.precio);i.nombre=p.nombre;i.marca=p.marca||'';
      if(p.imagen){i.imagen=p.imagen;i.art=null}
      i.agotado=!varAvail(p,i.talla,i.color)});
    save();paint();
  }

  /* ---------- pintar carrito ---------- */
  var ov,dr,list,sub,foot,empty,hn;
  function paint(){
    var n=count(),b=document.getElementById('count');
    if(b){b.textContent=n;b.setAttribute('aria-label',n+(n===1?' artículo':' artículos'))}
    if(!dr)return;
    hn.textContent=n?'('+n+')':'';
    empty.hidden=n>0;foot.hidden=!n;list.hidden=!n;
    list.innerHTML=items.map(function(i){
      var art=i.imagen?'<img src="'+esc(i.imagen)+'" alt="">':(i.art||'');
      var det=[i.talla?'Talla '+i.talla:'',i.color&&i.color!=='—'?i.color:''].filter(Boolean).join(' · ');
      return '<li class="kc-line'+(i.agotado?' off':'')+'" data-k="'+esc(i.key)+'">'
        +'<button class="kc-th" data-open="'+esc(i.sku)+'" style="background:'+esc(i.bg)+'" aria-label="Ver '+esc(i.nombre)+'">'+art+'</button>'
        +'<div class="kc-in"><span class="kc-b">'+esc(i.marca)+'</span><b class="kc-n">'+esc(i.nombre)+'</b>'
        +(det?'<span class="kc-d">'+esc(det)+'</span>':'')
        +(i.agotado?'<span class="kc-w">Ya no está disponible</span>':'')
        +'<div class="kc-r"><div class="kc-q" role="group" aria-label="Cantidad"><button data-d="-1" aria-label="Quitar uno">−</button><output>'+i.qty+'</output><button data-d="1" aria-label="Agregar uno"'+(i.qty>=MAXQ?' disabled':'')+'>+</button></div>'
        +'<span class="kc-p">'+money(i.precio*i.qty)+'</span></div>'
        +'<button class="kc-x" data-rm="1">Quitar</button></div></li>';
    }).join('');
    sub.textContent=money(total());
  }
  function lock(on){document.documentElement.style.overflow=on?'hidden':''}
  function openCart(){
    lastFocus=document.activeElement;closeProd(true);
    ov.hidden=false;dr.hidden=false;void dr.offsetWidth;ov.classList.add('on');dr.classList.add('on');lock(true);
    dr.querySelector('.kc-close').focus();
  }
  function closeCart(){
    if(dr.hidden)return;ov.classList.remove('on');dr.classList.remove('on');lock(false);
    setTimeout(function(){if(!dr.classList.contains('on')){ov.hidden=true;dr.hidden=true}},260);
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  function buildCart(){
    ov=document.createElement('div');ov.className='kc-ov';ov.hidden=true;
    dr=document.createElement('aside');dr.className='kc';dr.hidden=true;dr.id='cart';
    dr.setAttribute('role','dialog');dr.setAttribute('aria-modal','true');dr.setAttribute('aria-labelledby','kc-t');
    dr.innerHTML='<div class="kc-h"><h2 id="kc-t">Tu carrito <span></span></h2><button class="kc-close" aria-label="Cerrar carrito">×</button></div>'
      +'<p class="kc-empty">Tu carrito está vacío. Elige algo para tu próximo plan.<br><button class="kc-go">Seguir comprando</button></p>'
      +'<ul class="kc-list"></ul>'
      +'<div class="kc-f"><div class="kc-sub"><span>Subtotal</span><b></b></div>'
      +'<p class="kc-note">Retiro en tienda: Plaza Merliot, tercer nivel. Por ahora no hacemos envíos a domicilio. Tu carrito se guarda aunque cierres la página.</p>'
      +'<button class="kc-pay">Finalizar compra</button><button class="kc-clear">Vaciar carrito</button></div>';
    document.body.appendChild(ov);document.body.appendChild(dr);
    hn=dr.querySelector('h2 span');list=dr.querySelector('.kc-list');empty=dr.querySelector('.kc-empty');foot=dr.querySelector('.kc-f');sub=dr.querySelector('.kc-sub b');
    ov.addEventListener('click',closeCart);
    dr.querySelector('.kc-close').addEventListener('click',closeCart);
    dr.querySelector('.kc-go').addEventListener('click',function(){closeCart();var s=document.getElementById('productos');if(s)s.scrollIntoView({behavior:'smooth'})});
    dr.querySelector('.kc-clear').addEventListener('click',function(){if(confirm('¿Vaciar el carrito?'))clear()});
    dr.querySelector('.kc-pay').addEventListener('click',function(){toast('El pago en línea llega pronto. Tu carrito queda guardado.')});
    list.addEventListener('click',function(e){
      var li=e.target.closest('.kc-line');if(!li)return;var k=li.dataset.k,l=items.filter(function(i){return i.key===k})[0];if(!l)return;
      var d=e.target.closest('[data-d]');if(d)return setQty(k,l.qty+Number(d.dataset.d));
      if(e.target.closest('[data-rm]'))return setQty(k,0);
      var o=e.target.closest('[data-open]');if(o&&cfg.byKey){var p=cfg.byKey(o.dataset.open);if(p){closeCart();setTimeout(function(){openProd(p)},280)}}
    });
    var cb=document.getElementById('cartbtn');if(cb)cb.addEventListener('click',openCart);
  }

  /* ---------- toast ---------- */
  var tt;function toast(m){var t=document.getElementById('toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('show')},2600)}

  /* ---------- tarjeta de producto ---------- */
  var pv,pb,cur,sel;
  function openProd(p){
    cur=p;sel={t:null,c:null,q:1};
    var o=opts(p);if(o.colores.length===1)sel.c=o.colores[0];
    if(!pv)buildProd();
    lastFocus=document.activeElement;
    drawProd();pv.hidden=false;void pv.offsetWidth;pv.classList.add('on');lock(true);
    pv.querySelector('.kp-close').focus();
  }
  function closeProd(quiet){
    if(!pv||pv.hidden)return;pv.classList.remove('on');if(!dr||dr.hidden)lock(false);
    setTimeout(function(){if(!pv.classList.contains('on'))pv.hidden=true},260);
    if(!quiet&&lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  function buildProd(){
    pv=document.createElement('div');pv.className='kp-ov';pv.hidden=true;
    pv.innerHTML='<div class="kp" role="dialog" aria-modal="true" aria-labelledby="kp-t"><button class="kp-close" aria-label="Cerrar">×</button><div class="kp-body"></div></div>';
    document.body.appendChild(pv);pb=pv.querySelector('.kp-body');
    pv.addEventListener('click',function(e){
      if(e.target===pv||e.target.closest('.kp-close'))return closeProd();
      var t=e.target.closest('[data-t]');if(t&&!t.disabled){sel.t=sel.t===t.dataset.t?null:t.dataset.t;return drawProd()}
      var c=e.target.closest('[data-c]');if(c&&!c.disabled){sel.c=sel.c===c.dataset.c?null:c.dataset.c;return drawProd()}
      var d=e.target.closest('[data-q]');if(d){sel.q=Math.max(1,Math.min(MAXQ,sel.q+Number(d.dataset.q)));return drawProd()}
      if(e.target.closest('.kp-add'))return addFromProd(e.target.closest('.kp-add'));
    });
  }
  function missing(p){var o=opts(p),m=[];if(o.tallas.length&&!sel.t)m.push('talla');if(o.colores.length>1&&!sel.c)m.push('color');return m}
  function addFromProd(btn){
    var p=cur;if(btn.disabled)return;
    add(p,{talla:sel.t,color:sel.c,qty:sel.q});
    if(cfg.onAdd)cfg.onAdd(p,btn);
    toast('Agregaste '+p.nombre+' al carrito');
    closeProd(true);lastFocus=document.getElementById('cartbtn');
  }
  function drawProd(){
    var p=cur,o=opts(p),m=missing(p),stockOk=varAvail(p,sel.t,sel.c);
    var art=p.imagen?'<img src="'+esc(p.imagen)+'" alt="'+esc(p.nombre)+'">':cfg.art(p);
    var chips=(p.planes||[]).filter(function(x){return PLAN[x]}).map(function(x){return '<span class="kp-chip">'+PLAN[x]+'</span>'})
      .concat((p.generos||[]).filter(function(x){return GEN[x]}).map(function(x){return '<span class="kp-chip alt">'+GEN[x]+'</span>'})).join('');
    var old=p.precioAnterior&&p.precioAnterior>p.precio?'<s>'+money(p.precioAnterior)+'</s>':'';
    var tallas=o.tallas.length?'<div class="kp-opt"><span class="kp-l">Talla'+(sel.t?': <b>'+esc(sel.t)+'</b>':'')+'</span><div class="kp-pills">'
      +o.tallas.map(function(t){var ok=varAvail(p,t,sel.c);return '<button data-t="'+esc(t)+'" aria-pressed="'+(sel.t===t)+'"'+(ok?'':' disabled')+'>'+esc(t)+'</button>'}).join('')+'</div></div>':'';
    var colores=o.colores.length>1?'<div class="kp-opt"><span class="kp-l">Color'+(sel.c?': <b>'+esc(sel.c)+'</b>':'')+'</span><div class="kp-pills">'
      +o.colores.map(function(c){var ok=varAvail(p,sel.t,c);return '<button data-c="'+esc(c)+'" aria-pressed="'+(sel.c===c)+'"'+(ok?'':' disabled')+'>'+esc(c)+'</button>'}).join('')+'</div></div>':'';
    var estado=!avail(p.disponible)&&!(p.variantes||[]).some(function(v){return avail(v.disponible)})?'<span class="kp-st out">Agotado por ahora</span>':
      (!m.length&&!stockOk?'<span class="kp-st out">Esta combinación está agotada</span>':'<span class="kp-st ok">Disponible para retiro en tienda</span>');
    var can=!m.length&&stockOk;
    pb.innerHTML='<div class="kp-img" style="background:'+esc(p.bg||'#F3E6CF')+'">'+art+(p.etiqueta?'<span class="tag'+(p.etiquetaSol?' sol':'')+'">'+esc(p.etiqueta)+'</span>':'')+'</div>'
      +'<div class="kp-info"><span class="kp-b">'+esc(p.marca)+(p.categoria?' · '+esc(p.categoria):'')+'</span>'
      +'<h2 id="kp-t">'+esc(p.nombre)+'</h2><div class="kp-price">'+money(p.precio)+old+'</div>'
      +(chips?'<div class="kp-chips">'+chips+'</div>':'')
      +(p.descripcion?'<p class="kp-desc">'+esc(p.descripcion)+'</p>':'')
      +tallas+colores+estado
      +'<div class="kp-buy"><div class="kc-q" role="group" aria-label="Cantidad"><button data-q="-1" aria-label="Menos"'+(sel.q<=1?' disabled':'')+'>−</button><output>'+sel.q+'</output><button data-q="1" aria-label="Más"'+(sel.q>=MAXQ?' disabled':'')+'>+</button></div>'
      +'<button class="kp-add"'+(can?'':' disabled')+'>'+(m.length?'Elige tu '+m.join(' y '):(stockOk?'Agregar · '+money(p.precio*sel.q):'Agotado'))+'</button></div>'
      +'<span class="kp-sku">Código '+esc(p.sku.replace(/^E-.*/,'—'))+'</span></div>';
  }

  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    if(pv&&!pv.hidden)closeProd();else if(dr&&!dr.hidden)closeCart();
  });
  window.addEventListener('storage',function(e){if(e.key===KEY){load();paint()}});

  load();
  function init(){buildCart();paint()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

  window.DushiCart={add:add,refresh:refresh,openProd:openProd,openCart:openCart,needsChoice:needsChoice,toast:toast,
    config:function(c){for(var k in c)cfg[k]=c[k]},count:count};
})();
