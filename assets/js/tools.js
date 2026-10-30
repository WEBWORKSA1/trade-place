/* Trade.Place — calculators (all run locally in the browser) */
(function(){
  'use strict';
  var d=document;
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}
  function n(el){if(typeof el==='string')el=$(el);var v=parseFloat(String(el&&el.value||'').replace(/,/g,''));return isFinite(v)?v:0}
  function f(v,dp){dp=dp==null?2:dp;return Number(v||0).toLocaleString(undefined,{minimumFractionDigits:dp,maximumFractionDigits:dp})}
  function set(id,v){var e=d.getElementById(id);if(e)e.textContent=v}
  function bar(id,p){var e=d.getElementById(id);if(e)e.style.width=Math.max(0,Math.min(100,p))+'%'}
  function live(form,fn){form.addEventListener('input',fn);form.addEventListener('change',fn);fn();}

  var CONT={
    '20GP':{n:"20' Standard",L:5.898,W:2.352,H:2.393,vol:33.2,pay:28000,use:28},
    '40GP':{n:"40' Standard",L:12.032,W:2.352,H:2.393,vol:67.7,pay:26700,use:58},
    '40HC':{n:"40' High Cube",L:12.032,W:2.352,H:2.698,vol:76.3,pay:26500,use:68},
    '45HC':{n:"45' High Cube",L:13.556,W:2.352,H:2.698,vol:86.0,pay:27600,use:78}
  };
  var UNIT={cm:0.01,m:1,mm:0.001,in:0.0254,ft:0.3048};

  /* ---------- Landed cost ---------- */
  var lc=$('#tool-landed');
  if(lc)live(lc,function(){
    var unit=n('#lc-unit'),qty=Math.max(1,n('#lc-qty')),goods=unit*qty,fr=n('#lc-freight'),insP=n('#lc-ins'),ins=(goods+fr)*1.1*insP/100;
    var basis=$('#lc-basis').value,cv=basis==='FOB'?goods:goods+fr+ins;
    var duty=cv*n('#lc-duty')/100,extra=cv*n('#lc-extra')/100;
    var vat=(goods+fr+ins+duty+extra)*n('#lc-vat')/100;
    var fees=n('#lc-broker')+n('#lc-port')+n('#lc-inland')+n('#lc-other');
    var total=goods+fr+ins+duty+extra+vat+fees,pu=total/qty,cur=$('#lc-cur').value;
    var reclaim=$('#lc-reclaim').checked;
    var costBase=reclaim?total-vat:total,puBase=costBase/qty;
    set('lc-total',cur+' '+f(total));set('lc-unitcost',cur+' '+f(pu));set('lc-unitbase',cur+' '+f(puBase));
    set('lc-goods',f(goods));set('lc-fr',f(fr));set('lc-insv',f(ins));set('lc-cv',f(cv)+' ('+basis+')');set('lc-dutyv',f(duty+extra));set('lc-vatv',f(vat));set('lc-fees',f(fees));
    set('lc-mult',goods>0?(total/goods).toFixed(2)+'×':'—');
    bar('lc-bar',goods>0?goods/total*100:0);
    var sp=n('#lc-sell');if(sp>0){var m=(sp-puBase)/sp*100;set('lc-margin',f(m,1)+'% margin · '+cur+' '+f(sp-puBase)+' profit/unit');}else set('lc-margin','Enter a selling price to see margin');
  });

  /* ---------- Import duty & tax ---------- */
  var dt=$('#tool-duty');
  if(dt)live(dt,function(){
    var v=n('#dt-value'),fr=n('#dt-freight'),ins=n('#dt-ins'),basis=$('#dt-basis').value,cv=basis==='FOB'?v:v+fr+ins;
    var dm=n('#dt-deminimis'),below=dm>0&&v<=dm;
    var duty=below?0:cv*n('#dt-rate')/100,add=below?0:cv*n('#dt-add')/100,exc=below?0:cv*n('#dt-excise')/100;
    var vat=(cv+(basis==='FOB'?fr+ins:0)+duty+add+exc)*n('#dt-vat')/100;
    if($('#dt-vatbasis').value==='value')vat=cv*n('#dt-vat')/100;
    var mpf=0,hmf=0;
    if($('#dt-us').checked&&!below){mpf=Math.min(Math.max(cv*0.003464,n('#dt-mpfmin')),n('#dt-mpfmax')||1e12);if($('#dt-ocean').checked)hmf=cv*0.00125;}
    var tot=duty+add+exc+vat+mpf+hmf,cur=$('#dt-cur').value;
    set('dt-total',cur+' '+f(tot));set('dt-cv',f(cv)+' ('+basis+')');set('dt-dutyv',f(duty));set('dt-addv',f(add));set('dt-excv',f(exc));set('dt-vatv',f(vat));set('dt-mpf',f(mpf));set('dt-hmf',f(hmf));
    set('dt-eff',v>0?f(tot/v*100,2)+'% of goods value':'—');
    set('dt-note',below?'Goods value is at or below the de minimis threshold you entered — duty assumed to be zero (import VAT/GST may still apply in some countries).':'');
  });

  /* ---------- CBM ---------- */
  var cbm=$('#tool-cbm');
  if(cbm){
    var rows=$('#cbm-rows');
    function addRow(){var r=d.createElement('div');r.className='item-row';r.innerHTML='<div class="form-field"><label>Length</label><input type="number" min="0" step="any" class="c-l" value="60"></div><div class="form-field"><label>Width</label><input type="number" min="0" step="any" class="c-w" value="40"></div><div class="form-field"><label>Height</label><input type="number" min="0" step="any" class="c-h" value="40"></div><div class="form-field"><label>Cartons</label><input type="number" min="0" step="1" class="c-q" value="100"></div><button type="button" class="btn btn-ghost btn-sm rm" aria-label="Remove row">✕</button>';rows.appendChild(r);r.querySelector('.rm').addEventListener('click',function(){if(rows.children.length>1){r.remove();calc()}});calc();}
    $('#cbm-add').addEventListener('click',addRow);
    function calc(){
      var u=UNIT[$('#cbm-unit').value],tot=0,cartons=0;
      $$('.item-row',rows).forEach(function(r){var v=n($('.c-l',r))*u*n($('.c-w',r))*u*n($('.c-h',r))*u,q=n($('.c-q',r));tot+=v*q;cartons+=q;});
      var wkg=n('#cbm-weight')*($('#cbm-wunit').value==='lb'?0.453592:1)*cartons;
      set('cbm-total',f(tot,3));set('cbm-ft3',f(tot*35.3147,2));set('cbm-cartons',f(cartons,0));set('cbm-kg',f(wkg,1)+' kg');
      set('cbm-wm',f(Math.max(tot,wkg/1000),3)+' W/M (revenue tons)');
      set('cbm-air',f(tot*1e6/6000,1)+' kg');
      ['20GP','40GP','40HC'].forEach(function(k){var p=tot/CONT[k].use*100;set('cbm-'+k,f(p,0)+'%');bar('bar-'+k,p);});
      var rec=tot<=15?'LCL (shared container) is usually cheaper below ~15 CBM.':tot<=CONT['20GP'].use?'A 20\' container likely fits — compare FCL vs LCL quotes.':tot<=CONT['40GP'].use?'A 40\' standard container is the likely fit.':tot<=CONT['40HC'].use?'A 40\' High Cube is the likely fit.':'Multiple containers needed: ~'+Math.ceil(tot/CONT['40HC'].use)+' × 40\' HC.';
      set('cbm-rec',rec);
    }
    cbm.addEventListener('input',calc);cbm.addEventListener('change',calc);addRow();
  }

  /* ---------- Container load ---------- */
  var cl=$('#tool-container');
  if(cl)live(cl,function(){
    var u=UNIT[$('#cl-unit').value],l=n('#cl-l')*u,w=n('#cl-w')*u,h=n('#cl-h')*u,wt=n('#cl-wt'),qty=n('#cl-qty'),c=CONT[$('#cl-type').value];
    var allowRot=$('#cl-rotate').checked,best=0,bo='';
    if(l>0&&w>0&&h>0){
      var ors=allowRot?[[l,w,h],[l,h,w],[w,l,h],[w,h,l],[h,l,w],[h,w,l]]:[[l,w,h],[w,l,h]];
      ors.forEach(function(o){var k=Math.floor(c.L/o[0])*Math.floor(c.W/o[1])*Math.floor(c.H/o[2]);if(k>best){best=k;bo=Math.floor(c.L/o[0])+' × '+Math.floor(c.W/o[1])+' × '+Math.floor(c.H/o[2])}});
    }
    var byW=wt>0?Math.floor(c.pay/wt):Infinity,fit=Math.min(best,byW),limit=byW<best?'weight (payload)':'space';
    var used=fit*l*w*h,util=used/c.vol*100;
    set('cl-fit',f(fit,0));set('cl-pattern',bo||'—');set('cl-limit',fit?limit:'—');set('cl-util',f(util,1)+'%');bar('cl-bar',util);
    set('cl-weight',f(fit*wt,0)+' / '+f(c.pay,0)+' kg');set('cl-name',c.n+' — internal '+c.L+' × '+c.W+' × '+c.H+' m');
    set('cl-need',qty>0&&fit>0?Math.ceil(qty/fit)+' container(s) for '+f(qty,0)+' cartons':'—');
  });

  /* ---------- Volumetric / chargeable weight ---------- */
  var vw=$('#tool-volweight');
  if(vw)live(vw,function(){
    var u=$('#vw-unit').value,l=n('#vw-l'),w=n('#vw-w'),h=n('#vw-h'),q=Math.max(1,n('#vw-q')),act=n('#vw-act')*q,div=n('#vw-div');
    var cm3=l*w*h*(u==='in'?16.387064:1)*q,vol=div>0?cm3/div:0,ch=Math.max(act,vol),cbmv=cm3/1e6;
    if(u==='in'&&$('#vw-div').value==='6000'){} // divisor applies to cm; inches converted above
    set('vw-vol',f(vol,2)+' kg');set('vw-act2',f(act,2)+' kg');set('vw-charge',f(ch,2));set('vw-basis',ch===vol&&vol>act?'Volumetric weight applies — the shipment is bulky for its weight.':'Actual weight applies — the shipment is dense.');
    set('vw-cbm',f(cbmv,3)+' CBM');set('vw-sea',f(Math.max(cbmv,act/1000),3)+' W/M');set('vw-ratio',act>0?f(cbmv*1e6/6000/act*100,0)+'% (volumetric ÷ actual, IATA basis)':'—');
  });

  /* ---------- Margin & markup ---------- */
  var mg=$('#tool-margin');
  if(mg)live(mg,function(){
    var c=n('#mg-cost'),p=n('#mg-price'),t=n('#mg-target'),fx=n('#mg-fixed'),fee=n('#mg-fee');
    var net=p*(1-fee/100),profit=net-c;
    set('mg-margin',p>0?f(profit/p*100,1)+'%':'—');set('mg-markup',c>0?f(profit/c*100,1)+'%':'—');set('mg-profit',f(profit));
    set('mg-tprice',t<100&&t>=0?f(c/((1-t/100)*(1-fee/100))):'—');
    set('mg-be',profit>0?f(Math.ceil(fx/profit),0)+' units':'Not reachable at this price');
  });

  /* ---------- Pallet ---------- */
  var pl=$('#tool-pallet');
  if(pl){
    $('#pl-type').addEventListener('change',function(){var v=this.value.split('x');if(v.length===2){$('#pl-pl').value=v[0];$('#pl-pw').value=v[1];}});
    live(pl,function(){
      var pl1=n('#pl-pl'),pw=n('#pl-pw'),mh=n('#pl-mh'),ph=n('#pl-ph'),l=n('#pl-l'),w=n('#pl-w'),h=n('#pl-h'),wt=n('#pl-wt'),max=n('#pl-max'),qty=n('#pl-qty');
      var a=Math.floor(pl1/l)*Math.floor(pw/w),b=Math.floor(pl1/w)*Math.floor(pw/l),per=Math.max(a,b)||0;
      var layers=h>0?Math.floor((mh-ph)/h):0,tot=per*Math.max(0,layers);
      if(wt>0&&max>0)tot=Math.min(tot,Math.floor(max/wt));
      set('pl-layer',f(per,0));set('pl-layers',f(Math.max(0,layers),0));set('pl-total',f(tot,0));set('pl-weight',f(tot*wt,1)+' kg');
      set('pl-need',qty>0&&tot>0?Math.ceil(qty/tot)+' pallet(s)':'—');
      var area=pl1*pw>0?(per*l*w)/(pl1*pw)*100:0;set('pl-area',f(area,0)+'%');bar('pl-bar',area);
    });
  }

  /* ---------- Currency ---------- */
  var cc=$('#tool-currency');
  if(cc){
    var rates=null,from=$('#cc-from'),to=$('#cc-to'),status=$('#cc-status');
    var common=['USD','EUR','GBP','CNY','INR','JPY','CAD','AUD','AED','SGD','HKD','CHF','MXN','BRL','KRW','TRY','VND','THB','IDR','MYR','ZAR','SAR','NZD','PKR','BDT','LKR','PHP','EGP','NGN','KES'];
    function fill(list){[from,to].forEach(function(s,i){var cur=s.value||(i?'EUR':'USD');s.innerHTML=list.map(function(c){return '<option'+(c===cur?' selected':'')+'>'+c+'</option>'}).join('')})}
    fill(common);
    function calc(){if(!rates)return;var a=n('#cc-amt'),r=rates[to.value]/rates[from.value];set('cc-out',f(a*r,2)+' '+to.value);set('cc-rate','1 '+from.value+' = '+f(r,6)+' '+to.value);set('cc-inv','1 '+to.value+' = '+f(1/r,6)+' '+from.value);}
    fetch('https://open.er-api.com/v6/latest/USD').then(function(r){return r.json()}).then(function(j){if(j&&j.rates){rates=j.rates;var ks=Object.keys(rates);fill(common.filter(function(c){return rates[c]}).concat(ks.filter(function(c){return common.indexOf(c)<0}).sort()));status.textContent='Reference rates updated '+(j.time_last_update_utc||'recently')+' · Source: open.er-api.com (ExchangeRate-API).';calc();}else throw 0})
      .catch(function(){status.textContent='Live rates could not be loaded right now. Please refresh, or check your bank\'s rate.';});
    cc.addEventListener('input',calc);cc.addEventListener('change',calc);
    $('#cc-swap').addEventListener('click',function(){var t=from.value;from.value=to.value;to.value=t;calc()});
  }

  /* ---------- Incoterms ---------- */
  var INC={
    EXW:{n:'Ex Works',m:'any',risk:'At seller\'s premises, goods made available (not loaded).',s:'Packs goods and makes them available at the named place.',b:'Loading, export clearance, all transport, insurance (optional), import clearance, duties.',use:'Experienced buyers with their own agent in the origin country. Risky for buyers who cannot handle export formalities.',c:[0,0,0,0,0,0,0,0,0]},
    FCA:{n:'Free Carrier',m:'any',risk:'When goods are delivered to the buyer\'s carrier at the named place.',s:'Export clearance; loads goods if the place is seller\'s premises.',b:'Main carriage, insurance (optional), import clearance and duties.',use:'Best all-round choice for containerised and multimodal shipments. Often recommended instead of FOB for containers.',c:[1,1,1,0,0,0,0,0,0]},
    CPT:{n:'Carriage Paid To',m:'any',risk:'When goods are handed to the first carrier — even though seller pays freight to destination.',s:'Export clearance and main carriage to named destination.',b:'Insurance (optional), import clearance, duties, destination delivery.',use:'Seller controls freight but buyer bears transit risk — buyer should insure.',c:[1,1,1,1,1,0,0,0,0]},
    CIP:{n:'Carriage and Insurance Paid To',m:'any',risk:'When goods are handed to the first carrier.',s:'Export clearance, main carriage and insurance (Institute Cargo Clauses (A) level — all risks) to destination.',b:'Import clearance, duties, destination delivery.',use:'Multimodal shipments where the buyer wants seller-arranged all-risks insurance.',c:[1,1,1,1,1,1,0,0,0]},
    DAP:{n:'Delivered at Place',m:'any',risk:'At the named destination, ready for unloading.',s:'All transport to the named place (not unloading), export clearance.',b:'Unloading, import clearance, duties and taxes.',use:'Buyer wants delivery to their door but will handle import clearance.',c:[1,1,1,1,1,0,1,0,0]},
    DPU:{n:'Delivered at Place Unloaded',m:'any',risk:'At the named destination, once unloaded.',s:'All transport and unloading at destination, export clearance.',b:'Import clearance, duties and taxes.',use:'Seller can arrange unloading at a terminal or site. The only rule where seller unloads at destination.',c:[1,1,1,1,1,0,1,1,0]},
    DDP:{n:'Delivered Duty Paid',m:'any',risk:'At the named destination, ready for unloading.',s:'Everything including import clearance, duties and taxes.',b:'Unloading only.',use:'Maximum convenience for the buyer; seller must be able to act as importer of record — often hard for foreign sellers.',c:[1,1,1,1,1,0,1,0,1]},
    FAS:{n:'Free Alongside Ship',m:'sea',risk:'When goods are placed alongside the vessel at the port of shipment.',s:'Export clearance and delivery alongside the ship.',b:'Loading on board, sea freight, insurance, import clearance.',use:'Bulk and break-bulk cargo (not containers).',c:[1,1,0,0,0,0,0,0,0]},
    FOB:{n:'Free On Board',m:'sea',risk:'When goods are on board the vessel at the port of shipment.',s:'Export clearance and loading on board.',b:'Sea freight, insurance, import clearance, duties.',use:'Traditional choice for sea freight; for containers, FCA is technically more accurate.',c:[1,1,1,0,0,0,0,0,0]},
    CFR:{n:'Cost and Freight',m:'sea',risk:'When goods are on board at the port of shipment.',s:'Export clearance, loading and sea freight to the destination port.',b:'Insurance (optional), unloading costs not in freight, import clearance, duties.',use:'Seller books the ship; buyer carries sea risk and should insure.',c:[1,1,1,1,0,0,0,0,0]},
    CIF:{n:'Cost, Insurance and Freight',m:'sea',risk:'When goods are on board at the port of shipment.',s:'Export clearance, loading, sea freight and minimum insurance (Institute Cargo Clauses (C)).',b:'Import clearance, duties, onward transport; may buy extra cover.',use:'Common for commodities by sea; minimum cover only — buyers often top it up.',c:[1,1,1,1,0,1,0,0,0]}
  };
  var COLS=['Export packing & clearance','Loading at origin','Delivery to carrier / port','Main carriage (freight)','Destination terminal charges','Cargo insurance (obligation)','Delivery to named place','Unloading at destination','Import clearance & duties'];
  var inc=$('#inco-app');
  if(inc){
    var tb=$('#inco-body'),det=$('#inco-detail'),mode='all';
    function draw(){
      tb.innerHTML=Object.keys(INC).filter(function(k){return mode==='all'||INC[k].m===mode}).map(function(k){var r=INC[k];return '<tr data-k="'+k+'" tabindex="0" style="cursor:pointer"><td><strong>'+k+'</strong><br><small class="muted">'+r.n+'</small></td>'+r.c.map(function(x){return '<td class="'+(x?'cell-s':'cell-b')+'">'+(x?'S':'B')+'</td>'}).join('')+'</tr>'}).join('');
      $$('tr[data-k]',tb).forEach(function(tr){function go(){show(tr.getAttribute('data-k'))}tr.addEventListener('click',go);tr.addEventListener('keydown',function(e){if(e.key==='Enter')go()})});
    }
    function show(k){var r=INC[k];det.innerHTML='<span class="badge'+(r.m==='sea'?' teal':'')+'">'+(r.m==='sea'?'Sea & inland waterway only':'Any mode of transport')+'</span><h3 class="mt-2">'+k+' — '+r.n+'</h3><ul class="result-list"><li><span>Risk transfers</span><b>'+r.risk+'</b></li><li><span>Seller handles</span><b>'+r.s+'</b></li><li><span>Buyer handles</span><b>'+r.b+'</b></li><li><span>Best used when</span><b>'+r.use+'</b></li></ul>';}
    $$('[data-mode]',inc).forEach(function(b){b.addEventListener('click',function(){$$('[data-mode]',inc).forEach(function(x){x.classList.remove('active')});b.classList.add('active');mode=b.getAttribute('data-mode');draw()})});
    $('#inco-head').innerHTML='<th>Rule</th>'+COLS.map(function(c){return '<th style="white-space:normal;min-width:84px">'+c+'</th>'}).join('');
    draw();show('FCA');
    var ch=$('#inco-chooser');
    if(ch)live(ch,function(){
      var sea=$('#ic-mode').value==='sea',ctrl=$('#ic-ctrl').value,imp=$('#ic-import').value;
      var rec;
      if(ctrl==='buyer-all')rec=sea&&$('#ic-cargo').value==='bulk'?'FAS':'EXW';
      else if(ctrl==='buyer-main')rec=sea&&$('#ic-cargo').value!=='container'?'FOB':'FCA';
      else if(ctrl==='seller-main')rec=$('#ic-ins').value==='yes'?(sea&&$('#ic-cargo').value!=='container'?'CIF':'CIP'):(sea&&$('#ic-cargo').value!=='container'?'CFR':'CPT');
      else rec=imp==='seller'?'DDP':($('#ic-unload').value==='yes'?'DPU':'DAP');
      set('ic-rec',rec+' — '+INC[rec].n);set('ic-why',INC[rec].use);show(rec);
    });
  }

  /* ---------- HS chapter finder ---------- */
  var HS=[["I","Live animals; animal products",[[1,"Live animals"],[2,"Meat and edible meat offal"],[3,"Fish, crustaceans, molluscs"],[4,"Dairy, eggs, honey, edible animal products"],[5,"Other products of animal origin"]]],
  ["II","Vegetable products",[[6,"Live trees, plants, bulbs, cut flowers"],[7,"Edible vegetables, roots and tubers"],[8,"Edible fruit and nuts; citrus peel"],[9,"Coffee, tea, maté and spices"],[10,"Cereals"],[11,"Milling products; malt; starches"],[12,"Oil seeds, oleaginous fruits, industrial plants"],[13,"Lacs, gums, resins, vegetable saps"],[14,"Vegetable plaiting materials"]]],
  ["III","Animal or vegetable fats and oils",[[15,"Animal, vegetable or microbial fats and oils; waxes"]]],
  ["IV","Prepared foodstuffs; beverages; tobacco",[[16,"Preparations of meat, fish or crustaceans"],[17,"Sugars and sugar confectionery"],[18,"Cocoa and cocoa preparations"],[19,"Preparations of cereals, flour, starch or milk; bakery"],[20,"Preparations of vegetables, fruit, nuts"],[21,"Miscellaneous edible preparations"],[22,"Beverages, spirits and vinegar"],[23,"Residues from food industries; animal feed"],[24,"Tobacco and manufactured tobacco substitutes; nicotine products"]]],
  ["V","Mineral products",[[25,"Salt; sulphur; earths and stone; plaster, lime, cement"],[26,"Ores, slag and ash"],[27,"Mineral fuels, oils, waxes; bituminous substances"]]],
  ["VI","Chemical products",[[28,"Inorganic chemicals"],[29,"Organic chemicals"],[30,"Pharmaceutical products"],[31,"Fertilisers"],[32,"Tanning/dyeing extracts; paints, varnishes, inks"],[33,"Essential oils; perfumery, cosmetics, toiletries"],[34,"Soap, detergents, lubricants, waxes, candles"],[35,"Albuminoidal substances; glues; enzymes"],[36,"Explosives; matches; pyrotechnic products"],[37,"Photographic or cinematographic goods"],[38,"Miscellaneous chemical products"]]],
  ["VII","Plastics and rubber",[[39,"Plastics and articles thereof"],[40,"Rubber and articles thereof"]]],
  ["VIII","Hides, skins, leather, travel goods",[[41,"Raw hides and skins and leather"],[42,"Leather articles; saddlery; handbags, travel goods"],[43,"Furskins and artificial fur"]]],
  ["IX","Wood, cork, basketware",[[44,"Wood and articles of wood; charcoal"],[45,"Cork and articles of cork"],[46,"Basketware and wickerwork"]]],
  ["X","Pulp, paper and paperboard",[[47,"Pulp of wood; recovered paper"],[48,"Paper and paperboard; articles thereof"],[49,"Printed books, newspapers, pictures"]]],
  ["XI","Textiles and textile articles",[[50,"Silk"],[51,"Wool, animal hair, horsehair yarn and fabric"],[52,"Cotton"],[53,"Other vegetable textile fibres; paper yarn"],[54,"Man-made filaments"],[55,"Man-made staple fibres"],[56,"Wadding, felt, nonwovens; twine, cordage, ropes"],[57,"Carpets and other textile floor coverings"],[58,"Special woven fabrics; lace; tapestries"],[59,"Impregnated, coated or laminated textile fabrics"],[60,"Knitted or crocheted fabrics"],[61,"Apparel, knitted or crocheted"],[62,"Apparel, not knitted or crocheted"],[63,"Other made-up textile articles; worn clothing"]]],
  ["XII","Footwear, headgear, umbrellas",[[64,"Footwear, gaiters and the like"],[65,"Headgear and parts thereof"],[66,"Umbrellas, walking sticks, whips"],[67,"Prepared feathers; artificial flowers; wigs"]]],
  ["XIII","Stone, ceramics, glass",[[68,"Articles of stone, plaster, cement, asbestos, mica"],[69,"Ceramic products"],[70,"Glass and glassware"]]],
  ["XIV","Pearls, precious stones and metals",[[71,"Pearls, precious stones, precious metals, jewellery, coin"]]],
  ["XV","Base metals",[[72,"Iron and steel"],[73,"Articles of iron or steel"],[74,"Copper and articles thereof"],[75,"Nickel and articles thereof"],[76,"Aluminium and articles thereof"],[77,"(Reserved for possible future use)"],[78,"Lead and articles thereof"],[79,"Zinc and articles thereof"],[80,"Tin and articles thereof"],[81,"Other base metals; cermets"],[82,"Tools, implements, cutlery of base metal"],[83,"Miscellaneous articles of base metal"]]],
  ["XVI","Machinery and electrical equipment",[[84,"Nuclear reactors, boilers, machinery, mechanical appliances, computers"],[85,"Electrical machinery and equipment; sound/TV equipment; phones"]]],
  ["XVII","Vehicles, aircraft, vessels",[[86,"Railway or tramway locomotives and rolling stock"],[87,"Vehicles other than railway; parts and accessories"],[88,"Aircraft, spacecraft and parts; unmanned aircraft"],[89,"Ships, boats and floating structures"]]],
  ["XVIII","Optical, medical, clocks, musical instruments",[[90,"Optical, photographic, measuring, medical instruments"],[91,"Clocks and watches"],[92,"Musical instruments"]]],
  ["XIX","Arms and ammunition",[[93,"Arms and ammunition; parts and accessories"]]],
  ["XX","Miscellaneous manufactured articles",[[94,"Furniture; bedding; lamps and lighting; prefabricated buildings"],[95,"Toys, games and sports requisites"],[96,"Miscellaneous manufactured articles (pens, brushes, buttons…)"]]],
  ["XXI","Works of art, collectors' pieces, antiques",[[97,"Works of art, collectors' pieces and antiques"]]]];
  var hsApp=$('#hs-app');
  if(hsApp){
    var hin=$('#hs-q'),out=$('#hs-out'),cnt=$('#hs-count');
    var q0=new URLSearchParams(location.search).get('q');if(q0)hin.value=q0;
    function drawHS(){
      var q=hin.value.toLowerCase().trim(),k=0,html='';
      HS.forEach(function(s){var ch=s[2].filter(function(c){var code=('0'+c[0]).slice(-2);return !q||c[1].toLowerCase().indexOf(q)>-1||s[1].toLowerCase().indexOf(q)>-1||code===q.slice(0,2)||String(c[0])===q});
        if(!ch.length)return;k+=ch.length;
        html+='<div class="card" style="margin-bottom:14px"><span class="badge teal">Section '+s[0]+'</span><h3 class="mt-2">'+s[1]+'</h3><div class="table-wrap mt-2"><table><thead><tr><th style="width:90px">Chapter</th><th>Description</th></tr></thead><tbody>'+ch.map(function(c){return '<tr><td><span class="pill-num">'+('0'+c[0]).slice(-2)+'</span></td><td>'+c[1]+'</td></tr>'}).join('')+'</tbody></table></div></div>';});
      out.innerHTML=html||'<div class="callout warn"><strong>No chapter matched.</strong><p>Try a broader word (e.g. “furniture”, “cotton”, “machinery”) or use an official classification tool below.</p></div>';
      cnt.textContent=k;
    }
    hin.addEventListener('input',drawHS);drawHS();
  }
})();
