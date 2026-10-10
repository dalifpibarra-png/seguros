/* v5 · capa de movimiento (10 oct 2026). Se carga después de site.js y anim.js.
   Frases que se encienden con el scroll, tarjetas que se voltean, gráficas que se dibujan,
   entradas en 3D, carrusel 3D en celular, riel de capítulos, transición entre páginas y
   CTA fijo que aparece hasta después de dar valor. Sin JS o con movimiento reducido, todo queda visible. */
(function(){
  var reduce=window.__motion==="off",soft=window.__motion==="soft";  /* soft = el sistema pide menos movimiento: sin vuelos ni giros, sí vida */
  var fine=window.matchMedia&&matchMedia("(pointer: fine)").matches;
  var $=function(s,c){return (c||document).querySelector(s);};
  var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s));};
  var G=window.gsap,ST=window.ScrollTrigger;if(G&&ST)G.registerPlugin(ST);
  var anim=!reduce&&G&&ST;
  try{sessionStorage.removeItem("pt");}catch(e){}

  /* ---------- tarjetas que se voltean (funcionan aun sin animación) ---------- */
  $$(".flip").forEach(function(f){f.addEventListener("click",function(){f.setAttribute("aria-pressed",f.getAttribute("aria-pressed")==="true"?"false":"true");});});

  /* ---------- CTA fijo: aparece después del hero y se esconde en la sección del quiz ---------- */
  var hero=$(".hero,.phero"),cta=$("#platicamos"),body=document.body;
  var st={past:false,atCta:false};
  function stickyRead(){
    st.past=hero?hero.getBoundingClientRect().bottom<innerHeight*0.25:true;
    st.atCta=false;if(cta){var r=cta.getBoundingClientRect();st.atCta=r.top<innerHeight*0.8&&r.bottom>0;}
  }
  function stickyWrite(){body.classList.toggle("past-hero",st.past);body.classList.toggle("at-cta",st.atCta);}
  body.classList.add("has-motion");

  /* ---------- riel de capítulos (escritorio) ---------- */
  var chapters=$$("[data-chapter]");
  var rail=null,dots=[];
  if(chapters.length>3){
    rail=document.createElement("nav");rail.className="chapters";rail.setAttribute("aria-label","Capítulos de la página");
    rail.innerHTML=chapters.map(function(s,i){return '<a href="#'+(s.id||("cap-"+i))+'"><i></i><span>'+s.dataset.chapter+'</span></a>';}).join("");
    chapters.forEach(function(s,i){if(!s.id)s.id="cap-"+i;});
    body.appendChild(rail);dots=$$("a",rail);
    dots.forEach(function(d,i){d.addEventListener("click",function(e){e.preventDefault();var t=chapters[i];if(window.__lenis)window.__lenis.scrollTo(t,{offset:-60,duration:1.4});else t.scrollIntoView({behavior:reduce?"auto":"smooth"});});});
  }
  var cur=0,lastCur=-1;
  function railRead(){if(!rail)return;var mid=innerHeight*0.45;cur=0;chapters.forEach(function(s,i){if(s.getBoundingClientRect().top<mid)cur=i;});}
  function railState(){
    if(!rail||cur===lastCur)return;lastCur=cur;
    dots.forEach(function(d,i){d.classList.toggle("on",i===cur);d.classList.toggle("done",i<cur);});
    var dark=chapters[cur]&&chapters[cur].matches(".hero,.phero.dark,.story");rail.classList.toggle("on-dark",!!dark);
  }

  var tick=false;function onScroll(){if(tick)return;tick=true;requestAnimationFrame(function(){stickyRead();railRead();stickyWrite();railState();tick=false;});}
  addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",onScroll);onScroll();

  /* ---------- transición entre páginas ---------- */
  if(window.__motion==="full"){
    document.addEventListener("click",function(e){
      var a=e.target.closest&&e.target.closest("a[href]");if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;
      var href=a.getAttribute("href");if(!href||a.target==="_blank"||!/^[\w-]+\.html(#.*)?$/.test(href))return;
      if(href.split("#")[0]===location.pathname.split("/").pop())return;
      e.preventDefault();
      var c=document.createElement("div");c.className="curtain";c.innerHTML='<span>'+(($(".logo .mark")||{}).outerHTML||"")+'</span>';body.appendChild(c);
      try{sessionStorage.setItem("pt","1");}catch(err){}
      requestAnimationFrame(function(){c.classList.add("in");});
      setTimeout(function(){location.href=href;},280);
    });
    addEventListener("pageshow",function(e){if(e.persisted)$$(".curtain").forEach(function(c){c.remove();});});
  }

  if(!anim){return;}

  /* ---------- entrada del hero ---------- */
  var heroBits=$$(".hero .eyebrow,.hero .lead,.hero .btns,.hero .micro,.hero .pill,.hero .hint,.phero .copy .eyebrow,.phero .copy .lead,.phero .copy .btns,.phero .hint,.phero .proof .row,.phero .proof .tag");
  if(heroBits.length)G.from(heroBits,{y:soft?0:28,opacity:0,duration:.9,ease:"power3.out",stagger:.07,delay:.15,clearProps:"opacity,transform"});
  if(!soft)$$(".float3d").forEach(function(img){G.from(img,{scale:.4,rotate:-25,opacity:0,duration:1.3,ease:"back.out(1.6)",delay:.5});});

  /* ---------- frases que se encienden palabra por palabra (con giro 3D) ---------- */
  $$(".statement .st-text").forEach(function(p){
    var out="";p.innerHTML.replace(/(<[^>]+>)|([^<\s]+)|(\s+)/g,function(m,tag,word,sp){if(tag)out+=tag;else if(word)out+='<span class="sw">'+word+'</span>';else out+=" ";return m;});
    p.innerHTML=out;var ws=$$(".sw",p);
    G.fromTo(ws,soft?{opacity:.13}:{opacity:.13,rotateX:-75,y:"0.32em",transformPerspective:600,transformOrigin:"50% 100%"},
      {opacity:1,rotateX:0,y:0,ease:"none",stagger:.12,scrollTrigger:{trigger:p,start:"top 85%",end:"bottom 40%",scrub:.7}});
    var em=$$("em",p);if(em.length)G.fromTo(em,{"--hl":"0%"},{"--hl":"100%",ease:"none",scrollTrigger:{trigger:p,start:"center 70%",end:"bottom 40%",scrub:.7}});
  });

  /* ---------- entradas en 3D: las tarjetas se levantan desde abajo ---------- */
  var rise=$$(".offer,.flip,.timeline li,.faq details,.answer,.creds li,.chips .chip,.honest .h,.who button,.panel");
  var mq=matchMedia("(max-width: 700px)");
  rise=rise.filter(function(el){return el.getBoundingClientRect().top>innerHeight&&!(mq.matches&&el.matches(".flip"));});
  rise.forEach(function(el){el.classList.remove("rv","pre");});
  G.set(rise,soft?{opacity:0,y:16}:{opacity:0,y:60,rotateX:28,transformPerspective:900,transformOrigin:"50% 100%"});
  ST.batch(rise,{start:"top 92%",once:true,onEnter:function(b){G.to(b,{opacity:1,y:0,rotateX:0,duration:1,ease:"power3.out",stagger:.08,overwrite:true,clearProps:"transform,opacity"});}});

  /* ---------- la línea del tiempo del siniestro se dibuja con el scroll ---------- */
  $$(".timeline").forEach(function(tl){
    var line=document.createElement("span");line.className="tl-fill";tl.appendChild(line);
    G.fromTo(line,{scaleY:0},{scaleY:1,ease:"none",scrollTrigger:{trigger:tl,start:"top 75%",end:"bottom 55%",scrub:.6}});
    $$("li",tl).forEach(function(li){ST.create({trigger:li,start:"top 65%",onEnter:function(){li.classList.add("lit");},onLeaveBack:function(){li.classList.remove("lit");}});});
  });

  /* ---------- los pasos se conectan ---------- */
  $$(".steps").forEach(function(s){s.classList.add("linked");G.fromTo(s,{"--sp":0},{"--sp":1,ease:"none",scrollTrigger:{trigger:s,start:"top 80%",end:"bottom 60%",scrub:.6}});});

  /* ---------- gráficas que se dibujan al entrar (y al cambiar de opción) ---------- */
  function drawSvg(svg){
    var solid=$$("path[fill='none']:not([stroke-dasharray])",svg),dash=$$("path[stroke-dasharray]",svg),area=$$("path:not([fill='none'])",svg),end=$$("circle:not(.hd),text",svg).filter(function(t){return +t.getAttribute("x")>648||t.tagName==="circle";});
    solid.forEach(function(p){var L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;});
    G.set(area,{opacity:0});G.set(dash,{opacity:0});G.set(end,{opacity:0});
    var tl=G.timeline();
    tl.to(solid,{strokeDashoffset:0,duration:1.6,ease:"power2.inOut",stagger:.15,onComplete:function(){solid.forEach(function(p){p.style.strokeDasharray="";p.style.strokeDashoffset="";});}})
      .to(area,{opacity:.12,duration:1,ease:"power1.out"},.3).to(dash,{opacity:1,duration:.8},.5).to(end,{opacity:1,duration:.5,stagger:.04},1.2);
  }
  $$(".plot").forEach(function(plot){
    var seen=false;
    function arm(){var svg=$("svg",plot);if(!svg||svg.__armed)return;svg.__armed=true;if(seen)drawSvg(svg);else{G.set($$("path,circle:not(.hd)",svg),{opacity:0});}}
    arm();
    new MutationObserver(arm).observe(plot,{childList:true});
    ST.create({trigger:plot,start:"top 80%",once:true,onEnter:function(){seen=true;var svg=$("svg",plot);if(svg){G.set($$("path,circle:not(.hd)",svg),{clearProps:"opacity"});drawSvg(svg);}}});
  });

  /* ---------- la respuesta de los miedos entra con cada toque ---------- */
  $$("[data-fears]").forEach(function(box){
    $$(".chip",box).forEach(function(c){c.addEventListener("click",function(){G.fromTo($$(".answer .q,.answer .a,.answer .meta",box),{y:16,opacity:0},{y:0,opacity:1,duration:.5,ease:"power3.out",stagger:.06,overwrite:true});});});
  });

  /* ---------- preguntas frecuentes que se abren suave ---------- */
  $$(".faq details").forEach(function(d){
    var sum=$("summary",d),p=$("p",d);if(!sum||!p)return;
    sum.addEventListener("click",function(e){
      e.preventDefault();
      if(d.open){G.to(p,{height:0,opacity:0,duration:.35,ease:"power2.in",onComplete:function(){d.open=false;G.set(p,{clearProps:"height,opacity"});}});}
      else{d.open=true;G.fromTo(p,{height:0,opacity:0},{height:"auto",opacity:1,duration:.5,ease:"power3.out",clearProps:"height"});}
    });
  });

  /* ---------- 3D ligado al scroll: el escudo del cierre y los íconos de producto giran ---------- */
  if(!soft){
  $$(".cta3d").forEach(function(img){G.fromTo(img,{rotateY:-160,transformPerspective:800},{rotateY:20,ease:"none",scrollTrigger:{trigger:img.parentElement,start:"top bottom",end:"bottom top",scrub:.8}});});
  $$(".ic3d").forEach(function(img){G.fromTo(img,{rotateY:-35,rotateX:12,transformPerspective:700},{rotateY:35,rotateX:-8,ease:"none",scrollTrigger:{trigger:img,start:"top bottom",end:"bottom top",scrub:.5}});});
  $$(".phero .float3d").forEach(function(img){G.to(img,{rotateY:180,y:-60,transformPerspective:800,ease:"none",scrollTrigger:{trigger:img.closest("section"),start:"top top",end:"bottom top",scrub:.6}});});
  }

  /* ---------- inclinación 3D con el cursor (laptop) ---------- */
  if(fine&&!soft){
    $$(".offer,.flip,.honest .h,.step,.chart-card").forEach(function(c){
      var k=c.classList.contains("chart-card")?2.5:7;
      c.addEventListener("pointermove",function(e){var b=c.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;
        c.style.transform="perspective(1000px) rotateX("+(-y*k)+"deg) rotateY("+(x*k*1.2)+"deg) translateY(-3px)";c.style.setProperty("--mx",(x+.5)*100+"%");c.style.setProperty("--my",(y+.5)*100+"%");});
      c.addEventListener("pointerleave",function(){c.style.transform="";});
      c.classList.add("spot");
    });
  }

  /* ---------- carrusel 3D en celular: productos y conceptos ---------- */
  $$(".cards,.flips").forEach(function(row){
    var items=$$(".pcard,.flip",row),raf=0;
    function upd(){raf=0;if(!row.classList.contains("cf"))return;var r=row.getBoundingClientRect(),cx=r.left+r.width/2;
      items.forEach(function(it){var b=it.getBoundingClientRect(),o=((b.left+b.width/2)-cx)/r.width;o=Math.max(-1.2,Math.min(1.2,o));
        it.style.setProperty("--ry",(-o*38)+"deg");it.style.setProperty("--sc",(1-Math.abs(o)*.14).toFixed(3));it.style.setProperty("--op",(1-Math.abs(o)*.45).toFixed(3));});}
    function setMode(){var on=mq.matches;row.classList.toggle("cf",on);
      if(on){G.killTweensOf(items);G.set(items,{clearProps:"transform,opacity"});items.forEach(function(it){it.classList.remove("pre");});}
      else items.forEach(function(it){it.style.removeProperty("--ry");it.style.removeProperty("--sc");it.style.removeProperty("--op");});
      upd();}
    row.addEventListener("scroll",function(){if(!raf)raf=requestAnimationFrame(upd);},{passive:true});
    if(mq.addEventListener)mq.addEventListener("change",setMode);else mq.addListener(setMode);
    setMode();
  });

  /* recalcula posiciones cuando cargan fuentes e imágenes */
  addEventListener("load",function(){ST.refresh();});
})();

/* altura real de la barra de navegación (el riel de capítulos en celular se pone debajo) */
(function(){var n=document.querySelector(".nav");function set(){if(n)document.documentElement.style.setProperty("--navh",n.offsetHeight+"px");}set();addEventListener("resize",set);})();

/* botón de animaciones y diagnóstico (#diag). Corren en cualquier modo. */
(function(){
  var m=window.__motion||"full",os=!!window.__osReduce,pref=null;try{pref=localStorage.getItem("anim");}catch(e){}
  if(os||pref){
    var b=document.createElement("button");b.type="button";b.className="motion-toggle";
    b.textContent=m==="full"?"Reducir animaciones":"\u2728 Activar todas las animaciones";
    b.addEventListener("click",function(){try{if(m==="full"){if(os)localStorage.removeItem("anim");else localStorage.setItem("anim","off");}else localStorage.setItem("anim","full");}catch(e){}location.reload();});
    document.body.appendChild(b);
  }
  function diag(){
    if(!/diag/.test(location.hash)||document.querySelector(".diag"))return;
    var gl=false;try{var c=document.createElement("canvas");gl=!!(c.getContext("webgl")||c.getContext("experimental-webgl"));}catch(e){}
    var fps=0,n=0,t0=performance.now();
    var box=document.createElement("div");box.className="diag";document.body.appendChild(box);
    function show(){box.innerHTML='<button type="button">Cerrar</button><b>Diagnóstico</b>\n'+
      "Reducir movimiento (sistema): "+(os?"SÍ":"no")+"\nModo de animación: "+m+(pref?" (elegido en el botón)":"")+
      "\nWebGL (3D): "+(gl?"sí":"NO")+"\nHistoria 3D activa: "+(document.querySelector(".story.live")?"sí":"no")+
      "\nGSAP: "+(window.gsap?"sí":"NO")+" · ScrollTrigger: "+(window.ScrollTrigger?"sí":"NO")+" · Three: "+(window.THREE?"sí":"NO")+" · Lenis: "+(window.__lenis?"activo":"no")+
      "\nPantalla: "+innerWidth+"×"+innerHeight+" · densidad "+(window.devicePixelRatio||1)+"\nCuadros por segundo: "+(fps||"midiendo…")+
      "\nNavegador: "+navigator.userAgent+"\nErrores: "+((window.__errs&&window.__errs.length)?window.__errs.join(" | "):"ninguno");
      box.querySelector("button").onclick=function(){box.remove();};}
    show();
    (function f(now){n++;if(now-t0>=2000){fps=Math.round(n*1000/(now-t0));show();return;}requestAnimationFrame(f);})(t0);
  }
  diag();addEventListener("hashchange",diag);
})();

/* precarga: la página siguiente se descarga en cuanto apuntas o tocas el enlace */
(function(){var done={};function pre(e){var a=e.target.closest&&e.target.closest("a[href$='.html']");if(!a)return;var h=a.getAttribute("href");if(done[h]||a.target==="_blank")return;done[h]=1;var l=document.createElement("link");l.rel="prefetch";l.href=h;document.head.appendChild(l);}
document.addEventListener("pointerover",pre,{passive:true});document.addEventListener("touchstart",pre,{passive:true});})();
