(function(){
  var d=document;
  // menu mobilne
  var burger=d.querySelector('.burger'),menu=d.getElementById('menu');
  if(burger){burger.addEventListener('click',function(){
    var o=menu.classList.toggle('otw');burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu');d.body.classList.toggle('menu-otw',o);
  });}
  d.querySelectorAll('.ma-sub>button').forEach(function(b){
    b.addEventListener('click',function(){
      var li=b.parentNode,o=!li.classList.contains('otw');
      d.querySelectorAll('.ma-sub.otw').forEach(function(x){if(x!==li){x.classList.remove('otw');x.firstElementChild.setAttribute('aria-expanded','false');}});
      li.classList.toggle('otw',o);b.setAttribute('aria-expanded',o);
    });
  });
  // na mobile otwórz grupę z bieżącą stroną
  if(matchMedia('(max-width:1100px)').matches){var cur=d.querySelector('.sub a[aria-current]');if(cur){var li=cur.closest('.ma-sub');li.classList.add('otw');li.firstElementChild.setAttribute('aria-expanded','true');}}
  d.addEventListener('click',function(e){if(!e.target.closest('.ma-sub')&&matchMedia('(min-width:1101px)').matches){d.querySelectorAll('.ma-sub.otw').forEach(function(x){x.classList.remove('otw');x.firstElementChild.setAttribute('aria-expanded','false');});}});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'){d.querySelectorAll('.ma-sub.otw').forEach(function(x){x.classList.remove('otw');});}});

  // karuzele: palec, mysz, strzałki, licznik
  d.querySelectorAll('[data-k]').forEach(function(k){
    var tor=k.querySelector('.tor'),p=k.querySelector('.k-p'),n=k.querySelector('.k-n'),licz=k.querySelector('.k-licz'),items=tor.children;
    function krok(){var a=items[0],b=items[1];return b?b.offsetLeft-a.offsetLeft:tor.clientWidth;}
    function stan(){
      var s=krok(),i=Math.round(tor.scrollLeft/s),max=tor.scrollWidth-tor.clientWidth-2;
      var widoczne=Math.max(1,Math.round(tor.clientWidth/s));
      if(licz)licz.textContent=Math.min(items.length,i+1)+' / '+items.length;
      if(p)p.disabled=tor.scrollLeft<=2; if(n)n.disabled=tor.scrollLeft>=max;
      var nav=k.querySelector('.k-nav'); if(nav)nav.style.visibility=items.length<=widoczne?'hidden':'';
    }
    p&&p.addEventListener('click',function(){tor.scrollBy({left:-krok(),behavior:'smooth'});});
    n&&n.addEventListener('click',function(){tor.scrollBy({left:krok(),behavior:'smooth'});});
    tor.addEventListener('scroll',function(){requestAnimationFrame(stan);},{passive:true});
    addEventListener('resize',stan);stan();
    // przeciąganie myszą
    var x0=0,s0=0,ruch=false,wcis=false;
    tor.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;wcis=true;ruch=false;x0=e.clientX;s0=tor.scrollLeft;});
    addEventListener('pointermove',function(e){if(!wcis)return;var dx=e.clientX-x0;if(Math.abs(dx)>5){ruch=true;tor.classList.add('ciag');}if(ruch){tor.scrollLeft=s0-dx;}});
    addEventListener('pointerup',function(){if(!wcis)return;wcis=false;if(ruch){tor.classList.remove('ciag');var s=krok();tor.scrollTo({left:Math.round(tor.scrollLeft/s)*s,behavior:'smooth'});}});
    tor.addEventListener('click',function(e){if(ruch){e.preventDefault();e.stopPropagation();ruch=false;}},true);
    tor.addEventListener('dragstart',function(e){e.preventDefault();});
  });

  // pasek dolny po przewinięciu za przycisk w hero
  var pasek=d.querySelector('.pasek'),cel=d.querySelector('.hero .btn')||d.querySelector('.ph');
  if(pasek&&cel&&'IntersectionObserver' in window){
    new IntersectionObserver(function(en){var e=en[0];pasek.classList.toggle('widac',!e.isIntersecting&&e.boundingClientRect.top<0);}).observe(cel);
  }

  // formularze pokazowe
  d.querySelectorAll('form[action="#"]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var i=f.querySelector('.info');if(i)i.hidden=false;});});

  // cookies
  var c=d.querySelector('.cookies'),zgoda=null;
  try{zgoda=localStorage.getItem('og-cookies');}catch(e){}
  if(c&&!zgoda){c.hidden=false;c.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){try{localStorage.setItem('og-cookies',b.dataset.c);}catch(e){}c.hidden=true;});});}

  // lightbox dla zdjęć w treści i galerii
  var lb=d.querySelector('.lb');
  if(lb){
    var lbImg=lb.querySelector('img'),lbC=lb.querySelector('.lb-c'),lista=[],idx=0;
    function duzy(el){
      var a=el.closest('a');
      if(a&&/\.(jpe?g|png|webp|gif)(\?|$)/i.test(a.getAttribute('href')))return a.href;
      var ss=el.getAttribute('srcset');
      if(ss){var best=ss.split(',').map(function(x){x=x.trim().split(/\s+/);return{u:x[0],w:parseInt(x[1])||0};}).sort(function(a,b){return b.w-a.w;});var ok=best.filter(function(b){return b.w<=2048;});return (ok[0]||best[0]).u;}
      return el.currentSrc||el.src;
    }
    function pokaz(i){idx=(i+lista.length)%lista.length;lbImg.src=duzy(lista[idx]);lbImg.alt=lista[idx].alt||'';lbC.textContent=(idx+1)+' / '+lista.length;}
    function otworz(img){
      var kont=img.closest('.tresc,.szeroka');
      lista=Array.prototype.slice.call(kont.querySelectorAll('img')).filter(function(x){return !x.classList.contains('tlo')&&(x.closest('.galeria,.szeroka')||x.closest('a'));});
      if(lista.indexOf(img)<0)lista=[img];
      pokaz(lista.indexOf(img));lb.hidden=false;d.body.style.overflow='hidden';lb.querySelector('.lb-x').focus();
    }
    function zamknij(){lb.hidden=true;d.body.style.overflow='';lbImg.removeAttribute('src');}
    d.addEventListener('click',function(e){
      var img=e.target.closest('.tresc img, .szeroka img');
      if(!img)return;
      var a=img.closest('a');
      if(a&&!/\.(jpe?g|png|webp|gif)(\?|$)/i.test(a.getAttribute('href')||''))return;
      if(!a&&!img.closest('.galeria'))return;
      e.preventDefault();otworz(img);
    });
    lb.querySelector('.lb-x').addEventListener('click',zamknij);
    lb.querySelector('.lb-p').addEventListener('click',function(){pokaz(idx-1);});
    lb.querySelector('.lb-n').addEventListener('click',function(){pokaz(idx+1);});
    lb.addEventListener('click',function(e){if(e.target===lb)zamknij();});
    d.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')zamknij();if(e.key==='ArrowLeft')pokaz(idx-1);if(e.key==='ArrowRight')pokaz(idx+1);});
    var sx=null;lb.addEventListener('pointerdown',function(e){sx=e.clientX;});lb.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50)pokaz(idx+(dx<0?1:-1));});
  }

  // wyszukiwarka wpisów
  var q=d.getElementById('q');
  if(q){
    var wyn=d.querySelector('.wyniki'),idxData=null,pre='../';
    function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l');}
    function szukaj(){
      var v=norm(q.value.trim());
      if(v.length<3){wyn.hidden=true;wyn.innerHTML='';return;}
      var sl=v.split(/\s+/),r=[];
      for(var i=0;i<idxData.length&&r.length<40;i++){var t=norm(idxData[i][0]);if(sl.every(function(w){return t.indexOf(w)>=0;}))r.push(idxData[i]);}
      wyn.innerHTML=r.length?r.map(function(x){var dt=x[1].split('-');return '<li><a href="'+pre+x[2]+'"><small>'+dt[2]+'.'+dt[1]+'.'+dt[0]+'</small>'+x[0].replace(/</g,'&lt;')+'</a></li>';}).join(''):'<li><a>Brak wpisów z tym słowem w tytule</a></li>';
      wyn.hidden=false;
    }
    q.addEventListener('input',function(){if(idxData)return szukaj();fetch(q.dataset.idx).then(function(r){return r.json();}).then(function(j){idxData=j;szukaj();});});
    d.addEventListener('click',function(e){if(!e.target.closest('.szukaj'))wyn.hidden=true;});
  }
})();
