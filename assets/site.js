(function(){
  var WA="523117408139";
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s,c){return (c||document).querySelector(s);}
  function $$(s,c){return [].slice.call((c||document).querySelectorAll(s));}
  function J(id){var el=document.getElementById(id);return el?JSON.parse(el.textContent):null;}
  var money=function(n){return "$"+Math.round(n).toLocaleString("es-MX");};
  var short=function(n){if(n>=1e6)return "$"+(n/1e6).toFixed(n>=1e7?0:1).replace(".0","")+" M";if(n>=1e3)return "$"+Math.round(n/1e3)+" mil";return "$"+Math.round(n);};

  /* reveal: content is visible at rest; it only slides in */
  if(!reduce&&"IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove("pre");io.unobserve(e.target);}});},{rootMargin:"0px 0px -8% 0px"});
    $$(".rv").forEach(function(el){var r=el.getBoundingClientRect();if(r.top>window.innerHeight){el.classList.add("pre");io.observe(el);}});
  }

  /* fears */
  $$("[data-fears]").forEach(function(box){
    var data=J(box.getAttribute("data-fears"));var chips=$$(".chip",box);
    var q=$(".q",box),a=$(".a",box),p=$(".prod",box),go=$(".go",box);
    function show(i){
      var d=data[i];q.textContent="«"+d[0]+"»";a.textContent=d[1];p.textContent=d[2];
      if(go){if(d[3]){go.hidden=false;go.href=d[3];go.textContent=d[4]||"Ver cómo funciona";}else go.hidden=true;}
      chips.forEach(function(c){c.setAttribute("aria-pressed",+c.dataset.i===i?"true":"false");});
    }
    chips.forEach(function(c){c.addEventListener("click",function(){show(+c.dataset.i);});});
    show(0);
  });

  /* toggles */
  $$("[data-toggle]").forEach(function(group){
    var btns=$$("button",group);
    btns.forEach(function(b){b.addEventListener("click",function(){
      btns.forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false");var t=document.getElementById(x.dataset.t);if(t)t.hidden=x!==b;});
    });});
  });

  /* line chart */
  function niceMax(v){var e=Math.pow(10,Math.floor(Math.log10(v)));var m=v/e;var n=m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10;return n*e;}
  function lineChart(host,cfg){
    var W=760,H=380,ml=64,mr=118,mt=18,mb=40,iw=W-ml-mr,ih=H-mt-mb;
    var xs=cfg.x,n=xs.length,max=0;
    cfg.series.forEach(function(s){s.values.forEach(function(v){if(v>max)max=v;});});
    var raw=max*1.04/4,e10=Math.pow(10,Math.floor(Math.log10(raw))),mm=raw/e10;var stp=(mm<=1?1:mm<=2?2:mm<=5?5:10)*e10;var ym=stp*Math.ceil(max*1.04/stp);var nt=Math.round(ym/stp);
    var X=function(i){return ml+(n===1?0:i*iw/(n-1));},Y=function(v){return mt+ih-(v/ym)*ih;};
    var svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+(cfg.title||"Gráfica")+'">';
    for(var g=0;g<=nt;g++){var gv=stp*g,gy=Y(gv);svg+='<line x1="'+ml+'" x2="'+(W-mr)+'" y1="'+gy+'" y2="'+gy+'" style="stroke:var(--line)" stroke-width="1"/>';svg+='<text x="'+(ml-10)+'" y="'+(gy+4)+'" text-anchor="end" style="fill:var(--ink-3);font:12px IBM Plex Mono,monospace">'+(g===0?"$0":short(gv))+'</text>';}
    var step=Math.max(1,Math.ceil(n/8));
    for(var i=0;i<n;i+=step){svg+='<text x="'+X(i)+'" y="'+(H-12)+'" text-anchor="middle" style="fill:var(--ink-3);font:12px IBM Plex Mono,monospace">'+xs[i]+'</text>';}
    if((n-1)%step)svg+='<text x="'+X(n-1)+'" y="'+(H-12)+'" text-anchor="middle" style="fill:var(--ink-3);font:12px IBM Plex Mono,monospace">'+xs[n-1]+'</text>';
    if(cfg.xLabel)svg+='<text x="'+(W-mr)+'" y="'+(H-12)+'" text-anchor="start" dx="10" style="fill:var(--ink-3);font:12px Atkinson Hyperlegible,sans-serif">'+cfg.xLabel+'</text>';
    cfg.series.forEach(function(s,k){
      var d=s.values.map(function(v,i){return (i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1);}).join(" ");
      if(s.area)svg+='<path d="'+d+" L"+X(n-1)+" "+Y(0)+" L"+X(0)+" "+Y(0)+' Z" style="fill:'+s.color+';opacity:.12"/>';
      svg+='<path d="'+d+'" fill="none" style="stroke:'+s.color+'" stroke-width="'+(s.dash?2:3)+'" stroke-linejoin="round" stroke-linecap="round"'+(s.dash?' stroke-dasharray="6 6"':'')+'/>';
    });
    // direct labels at the end, nudged apart
    var ends=cfg.series.map(function(s){return {s:s,y:Y(s.values[n-1])};}).sort(function(a,b){return a.y-b.y;});
    for(var e=1;e<ends.length;e++){if(ends[e].y-ends[e-1].y<34)ends[e].y=ends[e-1].y+34;}
    ends.forEach(function(o){var v=o.s.values[n-1];svg+='<circle cx="'+X(n-1)+'" cy="'+Y(v)+'" r="5" style="fill:'+o.s.color+';stroke:var(--card)" stroke-width="2"/>';
      svg+='<text x="'+(X(n-1)+12)+'" y="'+(o.y-2)+'" style="fill:var(--ink);font:600 13px IBM Plex Mono,monospace">'+short(v)+'</text><text x="'+(X(n-1)+12)+'" y="'+(o.y+13)+'" style="fill:var(--ink-3);font:12px Atkinson Hyperlegible,sans-serif">'+o.s.short+'</text>';});
    svg+='<line class="xh" x1="0" x2="0" y1="'+mt+'" y2="'+(mt+ih)+'" style="stroke:var(--ink-3)" stroke-width="1" stroke-dasharray="3 4" opacity="0"/>';
    cfg.series.forEach(function(s,k){svg+='<circle class="hd" data-k="'+k+'" r="6" style="fill:'+s.color+';stroke:var(--card)" stroke-width="2" opacity="0"/>';});
    svg+='<rect x="'+ml+'" y="'+mt+'" width="'+iw+'" height="'+ih+'" fill="transparent" class="hit"/></svg>';
    var plot=$(".plot",host);plot.innerHTML=svg+'<div class="tip"></div>';
    var leg=$(".legend",host);if(leg)leg.innerHTML=cfg.series.map(function(s){return '<span><i class="'+(s.dash?"dash":"")+'" style="background:'+s.color+'"></i>'+s.name+'</span>';}).join("");
    var tbl=$(".tbl",host);
    if(tbl){var h='<summary>Ver los números en tabla</summary><div class="tw"><table><thead><tr><th>'+(cfg.xHead||"")+'</th>'+cfg.series.map(function(s){return "<th>"+s.name+"</th>";}).join("")+'</tr></thead><tbody>';
      xs.forEach(function(x,i){h+="<tr><td>"+x+"</td>"+cfg.series.map(function(s){return "<td>"+money(s.values[i])+"</td>";}).join("")+"</tr>";});tbl.innerHTML=h+"</tbody></table></div>";}
    var sv=$("svg",plot),tip=$(".tip",plot),xh=$(".xh",sv),hd=$$(".hd",sv),hit=$(".hit",sv);
    function move(ev){
      var r=sv.getBoundingClientRect(),cx=(ev.touches?ev.touches[0].clientX:ev.clientX);
      var px=(cx-r.left)/r.width*W;var i=Math.round((px-ml)/iw*(n-1));i=Math.max(0,Math.min(n-1,i));
      xh.setAttribute("x1",X(i));xh.setAttribute("x2",X(i));xh.setAttribute("opacity",1);
      hd.forEach(function(c){var s=cfg.series[+c.dataset.k];c.setAttribute("cx",X(i));c.setAttribute("cy",Y(s.values[i]));c.setAttribute("opacity",1);});
      tip.innerHTML="<div style=\"opacity:.8;margin-bottom:4px\">"+(cfg.tipX?cfg.tipX(xs[i]):(cfg.tipPre||"")+xs[i]+(cfg.tipPost||""))+"</div>"+cfg.series.map(function(s){return '<div><span class="sw" style="background:'+s.color+'"></span>'+s.name+": <b>"+money(s.values[i])+"</b></div>";}).join("");
      var left=X(i)/W*r.width,top=Y(Math.max.apply(null,cfg.series.map(function(s){return s.values[i];})))/H*r.height;
      tip.style.left=Math.max(90,Math.min(r.width-90,left))+"px";tip.style.top=Math.max(70,top)+"px";tip.style.opacity=1;
    }
    function out(){tip.style.opacity=0;xh.setAttribute("opacity",0);hd.forEach(function(c){c.setAttribute("opacity",0);});}
    hit.addEventListener("mousemove",move);hit.addEventListener("touchmove",move,{passive:true});hit.addEventListener("touchstart",move,{passive:true});hit.addEventListener("mouseleave",out);
  }
  $$("[data-chart]").forEach(function(host){var cfg=J(host.getAttribute("data-chart"));cfg.series.forEach(function(s){s.color=s.color||"var(--s1)";});lineChart(host,cfg);});

  /* compound interest explorer (home) */
  var cx=$("[data-compound]");
  if(cx){
    var st={age:25,m:2500},RATE=0.06,YEARS=10;
    function calc(){
      var ages=[],put=[],have=[],v=0,p=0;
      for(var a=st.age;a<=65;a++){if(a<st.age+YEARS){v+=st.m*12;p+=st.m*12;}ages.push(a);put.push(p);have.push(v);v*=1+RATE;}
      return {ages:ages,put:put,have:have};
    }
    function draw(){
      var r=calc();
      lineChart(cx,{x:r.ages,xHead:"Edad",xLabel:"edad",title:"Interés compuesto de "+st.age+" a 65 años",tipX:function(a){return a+" años";},
        series:[{name:"Lo que tienes",short:"tienes",color:"var(--s1)",values:r.have,area:true},{name:"Lo que metiste",short:"metiste",color:"var(--s2)",values:r.put,dash:true}]});
      var last=r.have.length-1;
      $("#cx-have").textContent=money(r.have[last]);$("#cx-put").textContent=money(r.put[last]);
      $("#cx-x").textContent=(r.have[last]/r.put[last]).toFixed(1)+" veces";
    }
    $$("[data-age]",cx).forEach(function(b){b.addEventListener("click",function(){st.age=+b.dataset.age;$$("[data-age]",cx).forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false");});draw();});});
    $$("[data-m]",cx).forEach(function(b){b.addEventListener("click",function(){st.m=+b.dataset.m;$$("[data-m]",cx).forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false");});draw();});});
    draw();
  }

  /* quiz -> WhatsApp */
  $$("[data-quiz]").forEach(function(box){
    var cfg=J(box.getAttribute("data-quiz")),ans={};
    var link=$(".wa-link",box),ok=$(".okmsg",box);
    function msg(){var t=cfg.intro;cfg.q.forEach(function(q,i){if(ans[i])t+=" "+q.say.replace("{}",ans[i])+".";});return t+" ¿Me ayudas a ver qué me conviene?";}
    function upd(){link.href="https://wa.me/"+WA+"?text="+encodeURIComponent(msg());}
    $$(".opts",box).forEach(function(o,i){$$("button",o).forEach(function(b){b.addEventListener("click",function(){ans[i]=b.textContent;$$("button",o).forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false");});upd();});});});
    upd();
    var cp=$(".copy",box);if(cp)cp.addEventListener("click",function(){var n="3117408139";try{navigator.clipboard.writeText(n).then(function(){ok.textContent="Número copiado.";},function(){ok.textContent="Mi número: 311 740 8139";});}catch(e){ok.textContent="Mi número: 311 740 8139";}});
  });
})();
