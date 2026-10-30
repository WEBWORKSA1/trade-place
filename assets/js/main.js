/* Trade.Place — core UI, forms, search */
(function(){
  'use strict';
  var d=document, root=d.documentElement, ROOT=root.getAttribute('data-root')||'./';
  root.classList.add('js');
  var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

  /* ---------- Theme ---------- */
  var saved=store.get('tp-theme');
  if(saved){root.setAttribute('data-theme',saved)}
  d.querySelectorAll('[data-theme-toggle]').forEach(function(b){
    b.addEventListener('click',function(){
      var t=root.getAttribute('data-theme')==='dark'?'light':'dark';
      root.setAttribute('data-theme',t);store.set('tp-theme',t);
    });
  });

  /* ---------- Drawer ---------- */
  var drawer=d.getElementById('drawer');
  function toggleDrawer(open){if(!drawer)return;drawer.classList.toggle('open',open);d.body.style.overflow=open?'hidden':'';}
  d.querySelectorAll('[data-open-drawer]').forEach(function(b){b.addEventListener('click',function(){toggleDrawer(true)})});
  if(drawer){drawer.addEventListener('click',function(e){if(e.target===drawer||e.target.closest('[data-close-drawer]'))toggleDrawer(false)});}

  /* ---------- Contact relay (address assembled at runtime, never in markup) ---------- */
  function relay(){var p=['=02bj5Cb','pFWbnBUM','hN3ay92d','iV2d'];return atob(p.join('').split('').reverse().join(''));}
  function endpoint(){return 'https://formsubmit.co/ajax/'+relay();}

  /* ---------- Forms ---------- */
  function validate(form){
    var ok=true,first=null;
    form.querySelectorAll('[required]').forEach(function(f){
      if(f.closest('.wstep')&&!f.closest('.wstep').classList.contains('active')&&form.hasAttribute('data-wizard-checking'))return;
      var v=f.type==='checkbox'?f.checked:String(f.value||'').trim();
      var bad=!v||(f.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value));
      f.classList.toggle('invalid',!!bad);
      if(bad){ok=false;if(!first)first=f;}
    });
    if(first)first.focus();
    return ok;
  }
  d.addEventListener('input',function(e){if(e.target.classList&&e.target.classList.contains('invalid'))e.target.classList.remove('invalid')});

  d.querySelectorAll('form[data-form]').forEach(function(form){
    form.setAttribute('novalidate','');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var msg=form.querySelector('.form-msg');
      if(form.querySelector('.hp input')&&form.querySelector('.hp input').value)return;
      if(!validate(form)){if(msg){msg.className='form-msg err';msg.textContent='Please complete the highlighted fields.';}return;}
      var data={};
      new FormData(form).forEach(function(v,k){if(k==='_hp')return;if(data[k]){data[k]+=', '+v}else{data[k]=v}});
      var type=form.getAttribute('data-form');
      data._subject='Trade.Place — '+type+(data.product?' — '+data.product:'')+(data.name?' ('+data.name+')':'');
      data._template='table';
      data.lead_type=type;
      data.page=location.href;
      var q=new URLSearchParams(location.search);['utm_source','utm_medium','utm_campaign'].forEach(function(k){if(q.get(k))data[k]=q.get(k)});
      data.submitted_at=new Date().toISOString();
      var btn=form.querySelector('[type=submit]'),txt=btn?btn.innerHTML:'';
      if(btn){btn.disabled=true;btn.innerHTML='Sending…';}
      fetch(endpoint(),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json().catch(function(){return {}}).then(function(j){return {ok:r.ok,j:j}})})
        .then(function(res){
          if(res.ok&&String(res.j.success)!=='false'){
            if(msg){msg.className='form-msg ok';msg.innerHTML=form.getAttribute('data-success')||'Thank you — your submission was received. We reply within 1–2 business days.';}
            form.reset();
            form.querySelectorAll('.wstep').forEach(function(s,i){s.classList.toggle('active',i===0)});
            var w=form.closest('[data-wizard]')||form; if(w.__wizardGo)w.__wizardGo(0);
            if(msg)msg.scrollIntoView({behavior:'smooth',block:'center'});
          }else{throw new Error('fail')}
        })
        .catch(function(){if(msg){msg.className='form-msg err';msg.textContent='Sorry — the message could not be sent right now. Please try again in a minute, or use the Contact page.';}})
        .finally(function(){if(btn){btn.disabled=false;btn.innerHTML=txt;}});
    });
  });

  /* ---------- Wizard ---------- */
  d.querySelectorAll('[data-wizard]').forEach(function(form){
    var steps=form.querySelectorAll('.wstep'),bars=form.querySelectorAll('.wizard-progress div'),i=0;
    function go(n){i=n;steps.forEach(function(s,k){s.classList.toggle('active',k===n)});bars.forEach(function(b,k){b.classList.toggle('active',k===n);b.classList.toggle('done',k<n)});}
    form.__wizardGo=go;
    form.querySelectorAll('[data-next]').forEach(function(b){b.addEventListener('click',function(){
      var cur=steps[i],ok=true,first=null;
      cur.querySelectorAll('[required]').forEach(function(f){var v=f.type==='checkbox'?f.checked:String(f.value||'').trim();var bad=!v||(f.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value));f.classList.toggle('invalid',!!bad);if(bad){ok=false;if(!first)first=f;}});
      if(!ok){first.focus();return;}
      go(Math.min(i+1,steps.length-1));form.scrollIntoView({behavior:'smooth',block:'start'});
    })});
    form.querySelectorAll('[data-prev]').forEach(function(b){b.addEventListener('click',function(){go(Math.max(i-1,0))})});
    go(0);
  });

  /* ---------- Tabs ---------- */
  d.querySelectorAll('[data-tabs]').forEach(function(wrap){
    var tabs=wrap.querySelectorAll('[role=tab]');
    function sel(t){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);var p=d.getElementById(x.getAttribute('aria-controls'));if(p)p.classList.toggle('active',on);});}
    tabs.forEach(function(t){t.addEventListener('click',function(){sel(t);history.replaceState(null,'','#'+t.id.replace('tab-',''))})});
    var h=location.hash.slice(1);if(h){var t=d.getElementById('tab-'+h);if(t)sel(t);}
  });
  d.querySelectorAll('[data-go-tab]').forEach(function(a){a.addEventListener('click',function(){var t=d.getElementById('tab-'+a.getAttribute('data-go-tab'));if(t){t.click();t.scrollIntoView({behavior:'smooth',block:'center'})}})});

  /* ---------- Hero search ---------- */
  var hs=d.getElementById('hero-search');
  if(hs){hs.addEventListener('submit',function(e){e.preventDefault();var scope=hs.querySelector('select').value,q=hs.querySelector('input').value.trim();
    if(scope==='rfq'){location.href=ROOT+'get-quotes.html?product='+encodeURIComponent(q)+'#rfq';return;}
    if(scope==='hs'){location.href=ROOT+'tools/hs-code-finder.html?q='+encodeURIComponent(q);return;}
    openSearch(q);});}
  var pq=new URLSearchParams(location.search).get('product');
  if(pq){var pf=d.querySelector('#rfq input[name=product]');if(pf)pf.value=pq;}

  /* ---------- Site search ---------- */
  var modal=d.getElementById('search-modal'),sInput,sRes,idx=null,selIdx=-1;
  function loadIdx(cb){if(idx)return cb();fetch(ROOT+'search-index.json').then(function(r){return r.json()}).then(function(j){idx=j;cb()}).catch(function(){idx=[];cb()});}
  function render(q){
    q=(q||'').toLowerCase().trim();selIdx=-1;
    if(!q){sRes.innerHTML='<div class="empty">Search guides, tools, glossary terms and pages. Try “CBM”, “Incoterms” or “supplier”.</div>';return;}
    var words=q.split(/\s+/);
    var hits=idx.map(function(it){var hay=(it.t+' '+it.d+' '+(it.k||'')).toLowerCase(),s=0;words.forEach(function(w){if(hay.indexOf(w)>-1)s+=1;if(it.t.toLowerCase().indexOf(w)>-1)s+=2});return {it:it,s:s}}).filter(function(x){return x.s>=words.length}).sort(function(a,b){return b.s-a.s}).slice(0,12);
    sRes.innerHTML=hits.length?hits.map(function(h){return '<a href="'+ROOT+h.it.u+'"><strong>'+esc(h.it.t)+'</strong><small>'+esc(h.it.d)+'</small></a>'}).join(''):'<div class="empty">No results for “'+esc(q)+'”. <a href="'+ROOT+'get-quotes.html#expert">Ask an expert instead →</a></div>';
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function openSearch(q){if(!modal)return;modal.classList.add('open');sInput=modal.querySelector('input');sRes=modal.querySelector('.results');sInput.value=q||'';loadIdx(function(){render(sInput.value)});setTimeout(function(){sInput.focus()},30);}
  function closeSearch(){if(modal)modal.classList.remove('open')}
  d.querySelectorAll('[data-open-search]').forEach(function(b){b.addEventListener('click',function(){openSearch('')})});
  if(modal){
    modal.addEventListener('click',function(e){if(e.target===modal)closeSearch()});
    modal.querySelector('input').addEventListener('input',function(e){render(e.target.value)});
    modal.querySelector('input').addEventListener('keydown',function(e){var as=sRes.querySelectorAll('a');if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();selIdx=(selIdx+(e.key==='ArrowDown'?1:-1)+as.length)%as.length;as.forEach(function(a,k){a.classList.toggle('sel',k===selIdx)});}if(e.key==='Enter'&&as[selIdx>-1?selIdx:0]){location.href=as[selIdx>-1?selIdx:0].href}});
  }
  d.addEventListener('keydown',function(e){if((e.key==='/'&&!/input|textarea|select/i.test(e.target.tagName))||((e.ctrlKey||e.metaKey)&&e.key==='k')){e.preventDefault();openSearch('')}if(e.key==='Escape'){closeSearch();toggleDrawer(false)}});

  /* ---------- Reveal + counters ---------- */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.12});
    d.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
    var co=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;var el=en.target,end=parseFloat(el.getAttribute('data-count')),suf=el.getAttribute('data-suffix')||'',t0=null;co.unobserve(el);
      function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/1200,1),v=Math.round(end*(1-Math.pow(1-p,3)));el.textContent=v.toLocaleString()+suf;if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step)})},{threshold:.5});
    d.querySelectorAll('[data-count]').forEach(function(el){co.observe(el)});
  }else{d.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')})}

  /* ---------- YouTube facade ---------- */
  d.querySelectorAll('.yt[data-id]').forEach(function(b){
    var id=b.getAttribute('data-id');b.style.backgroundImage='url(https://i.ytimg.com/vi/'+id+'/hqdefault.jpg)';
    b.addEventListener('click',function(){var f=d.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';f.title=b.getAttribute('aria-label')||'YouTube video';f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;b.innerHTML='';b.appendChild(f);},{once:true});
  });

  /* ---------- Article: TOC, progress, share ---------- */
  var prose=d.querySelector('.prose[data-toc]'),toc=d.getElementById('toc-list');
  if(prose&&toc){
    var hs2=prose.querySelectorAll('h2');
    hs2.forEach(function(h,k){if(!h.id)h.id='s'+(k+1)+'-'+h.textContent.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);var li=d.createElement('li');li.innerHTML='<a href="#'+h.id+'">'+esc(h.textContent)+'</a>';toc.appendChild(li)});
    var links=toc.querySelectorAll('a');
    if('IntersectionObserver' in window){var to=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+en.target.id)})}})},{rootMargin:'-20% 0px -70% 0px'});hs2.forEach(function(h){to.observe(h)});}
  }
  var bar=d.querySelector('.progress');
  if(bar){window.addEventListener('scroll',function(){var h=d.documentElement,max=h.scrollHeight-h.clientHeight;bar.style.width=(max>0?h.scrollTop/max*100:0)+'%'},{passive:true});}
  d.querySelectorAll('[data-share]').forEach(function(b){b.addEventListener('click',function(){var u=location.href,t=d.title,k=b.getAttribute('data-share');
    if(k==='copy'){(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){b.textContent='Link copied ✓'}).catch(function(){prompt('Copy this link:',u)});return;}
    var map={x:'https://twitter.com/intent/tweet?url='+encodeURIComponent(u)+'&text='+encodeURIComponent(t),li:'https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(u),wa:'https://wa.me/?text='+encodeURIComponent(t+' '+u)};
    window.open(map[k],'_blank','noopener,width=640,height=560');})});

  /* ---------- Glossary filter ---------- */
  var gf=d.getElementById('gl-filter');
  if(gf){var items=d.querySelectorAll('.gl-item'),letters=d.querySelectorAll('.gl-letter'),cnt=d.getElementById('gl-count');
    gf.addEventListener('input',function(){var q=gf.value.toLowerCase().trim(),n=0;items.forEach(function(it){var on=!q||it.textContent.toLowerCase().indexOf(q)>-1;it.style.display=on?'':'none';if(on)n++});letters.forEach(function(l){l.style.display=q?'none':''});if(cnt)cnt.textContent=n;});}

  /* ---------- Filter chips (trade shows, resources) ---------- */
  d.querySelectorAll('[data-filter-group]').forEach(function(g){
    var target=d.querySelectorAll(g.getAttribute('data-filter-group'));
    g.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){g.querySelectorAll('.chip').forEach(function(x){x.classList.remove('active')});c.classList.add('active');var f=c.getAttribute('data-f');target.forEach(function(r){r.style.display=(f==='all'||(r.getAttribute('data-tags')||'').indexOf(f)>-1)?'':'none'})})});
  });

  /* ---------- Cookie consent ---------- */
  var ck=d.getElementById('cookie');
  if(ck&&!store.get('tp-consent')){setTimeout(function(){ck.classList.add('show')},900);}
  d.querySelectorAll('[data-consent]').forEach(function(b){b.addEventListener('click',function(){store.set('tp-consent',b.getAttribute('data-consent'));if(ck)ck.classList.remove('show')})});

  /* ---------- Back to top & year ---------- */
  var tt=d.querySelector('.to-top');
  if(tt){window.addEventListener('scroll',function(){tt.classList.toggle('show',window.scrollY>900)},{passive:true});tt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});}
  d.querySelectorAll('[data-year]').forEach(function(y){y.textContent=new Date().getFullYear()});

  /* ---------- Amount chips (donations) ---------- */
  d.querySelectorAll('[data-amounts]').forEach(function(g){var inp=d.querySelector(g.getAttribute('data-amounts'));g.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){g.querySelectorAll('.chip').forEach(function(x){x.classList.remove('active')});c.classList.add('active');if(inp)inp.value=c.getAttribute('data-v')})})});
  d.querySelectorAll('[data-prefill]').forEach(function(a){a.addEventListener('click',function(){var t=a.getAttribute('data-prefill').split('|');var f=d.querySelector(t[0]);if(f){f.value=t[1];f.dispatchEvent(new Event('change'))}})});
})();
