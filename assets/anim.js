/* Capa de animación del sitio: barra de progreso, títulos que se revelan, cifras que cuentan,
   botones magnéticos y scrollytelling ligero (sin WebGL). Todo el contenido es visible en reposo. */
(function(){
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s));};
  var G=window.gsap,ST=window.ScrollTrigger;if(G&&ST)G.registerPlugin(ST);

  /* barra de progreso de lectura */
  var bar=document.createElement("div");bar.className="progress";document.body.appendChild(bar);
  var ticking=false;function prog(){var h=document.documentElement.scrollHeight-innerHeight;bar.style.transform="scaleX("+(h>0?scrollY/h:0)+")";ticking=false;}
  addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(prog);}},{passive:true});prog();

  /* títulos: palabra por palabra */
  if(G&&ST&&!reduce){
    $$("h1,h2").forEach(function(h){
      if(h.closest(".chart-card,.story .card-s"))return;
      var html=h.innerHTML;if(/<(a|button|br)/.test(html))return;
      var out="";html.replace(/(<[^>]+>)|([^<\s]+)|(\s+)/g,function(m,tag,word,sp){if(tag)out+=tag;else if(word)out+='<span class="w"><span class="wi">'+word+'</span></span>';else out+=" ";return m;});
      h.innerHTML=out;
      G.from(h.querySelectorAll(".wi"),{yPercent:110,duration:.9,ease:"power4.out",stagger:.045,immediateRender:false,scrollTrigger:{trigger:h,start:"top 88%",once:true}});
    });
  }

  /* cifras que cuentan hasta su valor */
  function countUp(el){
    var txt=el.textContent.trim(),m=txt.match(/^(\$?)([\d,]+(?:\.\d+)?)(.*)$/);if(!m)return;
    var pre=m[1],num=parseFloat(m[2].replace(/,/g,"")),post=m[3],dec=(m[2].split(".")[1]||"").length;
    if(!isFinite(num)||num<10)return;
    var t0=null,dur=1200;
    function step(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/dur),e=1-Math.pow(1-p,3),v=num*e;
      el.textContent=pre+(dec?v.toFixed(dec):Math.round(v).toLocaleString("es-MX"))+post;if(p<1)requestAnimationFrame(step);else el.textContent=txt;}
    requestAnimationFrame(step);
  }
  if(!reduce&&"IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(e.target);io.unobserve(e.target);}});},{threshold:.6});
    $$(".proof .row b,.pill b,.offer b.k2,.stat-big").forEach(function(el){io.observe(el);});
  }

  /* botones magnéticos */
  if(!reduce&&matchMedia("(pointer:fine)").matches){
    $$(".btn.primary").forEach(function(b){
      b.addEventListener("pointermove",function(e){var r=b.getBoundingClientRect();b.style.transform="translate("+((e.clientX-r.left-r.width/2)*.18)+"px,"+((e.clientY-r.top-r.height/2)*.28)+"px)";});
      b.addEventListener("pointerleave",function(){b.style.transform="";});
    });
  }

  /* luz que sigue al cursor en secciones oscuras */
  $$(".glowfollow").forEach(function(s){s.addEventListener("pointermove",function(e){var r=s.getBoundingClientRect();s.style.setProperty("--gx",(e.clientX-r.left)+"px");s.style.setProperty("--gy",(e.clientY-r.top)+"px");});});

  /* scrollytelling ligero */
  var ICONS={
    shield:'<path d="M32 6l20 8v14c0 13-9 23-20 28C21 51 12 41 12 28V14z"/><path d="M23 31l6 6 12-13"/>',
    home:'<path d="M10 30L32 12l22 18v22H10z"/><path d="M26 52V38h12v14"/>',
    drop:'<path d="M32 8s16 18 16 30a16 16 0 0 1-32 0C16 26 32 8 32 8z"/>',
    bolt:'<path d="M36 6L14 36h16l-4 22 24-32H34z"/>',
    run:'<circle cx="38" cy="12" r="5"/><path d="M28 54l6-16-8-6 6-12 10 8h8M22 30l8-8M30 38l-10 4"/>',
    quake:'<path d="M6 34h10l5-12 8 24 7-30 6 18h16"/>',
    paw:'<circle cx="18" cy="24" r="5"/><circle cx="32" cy="16" r="5"/><circle cx="46" cy="24" r="5"/><path d="M32 30c-9 0-15 10-15 15 0 4 4 6 8 6 3 0 5-2 7-2s4 2 7 2c4 0 8-2 8-6 0-5-6-15-15-15z"/>',
    scissors:'<circle cx="18" cy="44" r="7"/><circle cx="46" cy="44" r="7"/><path d="M23 39L46 10M41 39L18 10"/>',
    store:'<path d="M8 24l4-12h40l4 12"/><path d="M12 24v28h40V24"/><path d="M26 52V38h12v14"/>',
    coin:'<circle cx="32" cy="32" r="22"/><path d="M38 24c-2-2-4-3-7-3-4 0-7 2-7 5 0 7 15 4 15 11 0 3-3 6-8 6-3 0-6-1-8-3M31 17v30"/>',
    clock:'<circle cx="32" cy="32" r="22"/><path d="M32 18v15l10 6"/>',
    heart:'<path d="M32 54S10 42 10 26a11 11 0 0 1 22-5 11 11 0 0 1 22 5c0 16-22 28-22 28z"/>',
    doctor:'<rect x="12" y="12" width="40" height="40" rx="10"/><path d="M32 22v20M22 32h20"/>',
    lock:'<rect x="14" y="28" width="36" height="26" rx="5"/><path d="M22 28v-8a10 10 0 0 1 20 0v8"/>'
  };
  $$(".scrolly").forEach(function(sec){
    var steps=$$(".sc-step",sec),vis=sec.querySelector(".sc-visual"),ic=vis.querySelector(".sc-icon"),num=vis.querySelector(".sc-num"),cap=vis.querySelector(".sc-cap"),ring=vis.querySelector(".sc-ring i"),dots=vis.querySelector(".sc-dots");
    dots.innerHTML=steps.map(function(){return "<i></i>";}).join("");var dl=$$("i",dots);
    function set(i){var s=steps[i];
      ic.innerHTML='<svg viewBox="0 0 64 64" fill="none" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[s.dataset.ic]||ICONS.shield)+'</svg>';
      num.textContent=s.dataset.num||"";cap.textContent=s.dataset.cap||"";
      ring.style.transform="scaleX("+((i+1)/steps.length)+")";
      dl.forEach(function(d,k){d.classList.toggle("on",k<=i);});
      steps.forEach(function(x,k){x.classList.toggle("on",k===i);});
      sec.style.setProperty("--tone",s.dataset.tone||"var(--s1)");
      if(G&&!reduce){G.fromTo([ic,num,cap],{y:24,opacity:.0},{y:0,opacity:1,duration:.55,ease:"power3.out",stagger:.06});}
    }
    set(0);
    if("IntersectionObserver" in window){var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)set(steps.indexOf(e.target));});},{rootMargin:"-48% 0px -48% 0px"});steps.forEach(function(s){o.observe(s);});}
  });
})();
