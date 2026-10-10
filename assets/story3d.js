/* Scrollytelling "La vida de un plan": el scroll mueve la edad de 33 a 100 años.
   Cifras reales de la cotización (Trasciende, 33 años, $3,777 al mes, 5 años de pago) en las edades ancla:
   38 (pagado $250,464), 64 ($1,694,471), 65 (saca $908,087 → quedan $786,384) y 84 ($3,179,711).
   Entre anclas la curva es ilustrativa y el contador lo marca con "~".
   Sin WebGL, sin GSAP o con movimiento reducido, la sección se queda como tarjetas (CSS por defecto). */
(function(){
  var sec=document.getElementById("historia"),cv=document.getElementById("story3d");
  if(!sec||!cv)return;
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce||!window.THREE||!window.gsap||!window.ScrollTrigger)return;
  var T=THREE,r;
  try{r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:"high-performance"});}catch(e){return;}
  if(!r.getContext())return;
  sec.classList.add("live");
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize:true});
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.0;

  /* ---------- datos ---------- */
  var PAID=250464,V64=1694471,OUT=908087,V65=V64-OUT,V84=3179711;
  var V38=PAID*0.85;                                  // ilustrativo: valor al dejar de pagar
  var G=Math.pow(V84/V65,1/19);                        // ritmo 65→84 de la cotización
  function value(a){
    if(a<=33)return 0;
    if(a<=38)return V38*(a-33)/5;
    if(a<=64)return V38*Math.pow(V64/V38,(a-38)/26);
    if(a<=65)return V64+(V65-V64)*(a-64);
    if(a<=84)return V65*Math.pow(G,a-65);
    return V84*Math.pow(G,a-84);                       // después de 84: solo para la altura
  }
  function paid(a){return Math.max(0,Math.min(PAID,(a-33)/5*PAID));}
  var VMAX=value(100);
  function H(v){return 0.12+7.2*Math.sqrt(Math.max(0,v)/VMAX);}

  /* ---------- guion: progreso del scroll → edad, con pausas en cada ancla ---------- */
  var KEYS=[[0,33],[.06,33],[.18,38],[.25,38],[.47,64],[.52,64],[.57,65],[.64,65],[.79,84],[.84,84],[.9,100],[1,100]];
  function ss(t){return t*t*(3-2*t);}
  function ageAt(p){for(var i=1;i<KEYS.length;i++){var a=KEYS[i-1],b=KEYS[i];if(p<=b[0]){var t=(p-a[0])/((b[0]-a[0])||1);return a[1]+(b[1]-a[1])*ss(Math.max(0,Math.min(1,t)));}}return 100;}
  function chapter(p,age){if(p>=.94)return 6;if(age>=99.5)return 5;if(age>=84)return 4;if(age>=64.5)return 3;if(age>=64)return 2;if(age>=38)return 1;return 0;}

  /* ---------- escena ---------- */
  var scene=new T.Scene();scene.fog=new T.Fog(0x0B1A17,16,60);
  var cam=new T.PerspectiveCamera(38,1,0.1,200);
  scene.add(new T.HemisphereLight(0xdff5ee,0x0b1a17,0.75));
  var key=new T.DirectionalLight(0xffe6c2,1.15);key.position.set(6,14,10);scene.add(key);
  var rim=new T.DirectionalLight(0x6fc2b6,0.7);rim.position.set(-8,6,-10);scene.add(rim);

  var SP=0.56,AGES=[];for(var g=33;g<=100;g++)AGES.push(g);
  function X(a){return (a-33)*SP;}
  var geo=new T.BoxGeometry(0.42,1,0.42);geo.translate(0,0.5,0);
  var mat=new T.MeshStandardMaterial({roughness:0.32,metalness:0.18});
  var mesh=new T.InstancedMesh(geo,mat,AGES.length);scene.add(mesh);
  var HT=AGES.map(function(a){return H(value(a));});
  var cur=AGES.map(function(){return 0.02;});
  function lin(hex){return new T.Color(hex).convertSRGBToLinear();}
  var cGold=lin(0xF2B04F),cTeal=lin(0x22A08C),cMint=lin(0x8FD3C5),cGhost=lin(0x183A34),cOut=lin(0xE8613C),tmp=new T.Object3D(),col=new T.Color();

  var ground=new T.Mesh(new T.PlaneGeometry(140,40),new T.MeshStandardMaterial({color:lin(0x0E211D),roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.position.set(X(66),0,0);scene.add(ground);
  var grid=new T.GridHelper(140,140,0x2b5a51,0x173a34);grid.position.set(X(66),0.002,0);grid.material.transparent=true;grid.material.opacity=0.35;scene.add(grid);

  // la línea dorada: el nivel de lo que pagó
  var paidLine=new T.Mesh(new T.BoxGeometry(1,0.045,0.7),new T.MeshBasicMaterial({color:lin(0xF2B04F),transparent:true,opacity:0}));
  scene.add(paidLine);var HP=H(PAID);

  // etiquetas de edad en el piso
  function label(txt){var c=document.createElement("canvas");c.width=256;c.height=128;var x=c.getContext("2d");x.font="600 64px 'IBM Plex Mono', ui-monospace, monospace";x.fillStyle="rgba(185,204,198,.85)";x.textAlign="center";x.textBaseline="middle";x.fillText(txt,128,64);
    var tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;var s=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));s.scale.set(1.3,0.65,1);return s;}
  [33,38,50,64,65,84,100].forEach(function(a){var s=label(String(a));s.position.set(X(a)+(a===64?-0.25:a===65?0.3:0),0.3,1.25);scene.add(s);});

  // el retiro de los 65: partículas doradas que salen de la columna 64
  var N=520,pg=new T.BufferGeometry(),pos=new Float32Array(N*3),start=[],dir=[];
  for(var i=0;i<N;i++){var h=HT[31]*(0.35+Math.random()*0.65);start.push([X(64.5)+(Math.random()-.5)*.4,h,(Math.random()-.5)*.4]);
    var th=Math.random()*Math.PI*2;dir.push([Math.cos(th)*(1+Math.random()*3)+1.5,2+Math.random()*6,Math.sin(th)*(1+Math.random()*3)+2]);}
  pg.setAttribute("position",new T.BufferAttribute(pos,3));
  var pm=new T.PointsMaterial({color:lin(0xF7C980),size:0.22,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});
  var pts=new T.Points(pg,pm);scene.add(pts);

  /* ---------- HUD ---------- */
  var $=function(id){return document.getElementById(id);};
  var elAge=$("st-age"),elPaid=$("st-paid"),elVal=$("st-val"),elOut=$("st-out");
  var fill=sec.querySelector(".rail .fill"),cards=[].slice.call(sec.querySelectorAll(".card-s")),mOut=sec.querySelector(".m.out");
  function money(n){return "$"+Math.round(n).toLocaleString("es-MX");}
  function approx(n){var q=n<100000?1000:10000;return "~$"+(Math.round(n/q)*q).toLocaleString("es-MX");}
  var EXACT=[[64,V64],[65,V65],[84,V84]];
  var lastCh=-1,lastTxt="";
  function hud(p,age){
    var a=Math.round(age);
    var v="—";if(age>=33.4&&age<=84.01){v=approx(value(age));EXACT.forEach(function(e){if(Math.abs(age-e[0])<0.015)v=money(e[1]);});}
    else if(age>84.01)v="sigue creciendo";
    var t=a+"|"+v+"|"+Math.round(paid(age));
    if(t!==lastTxt){lastTxt=t;elAge.textContent=a;elPaid.textContent=money(paid(age));elVal.textContent=v;
      var out=age>=64.5;elOut.textContent=out?money(OUT):"—";mOut.classList.toggle("lit",out);}
    fill.style.width=((age-33)/67*100)+"%";
    var ch=chapter(p,age);
    if(ch!==lastCh){lastCh=ch;cards.forEach(function(c,i){c.classList.toggle("on",i===ch);});}
  }

  /* ---------- cámara ---------- */
  var camPos=new T.Vector3(),camLook=new T.Vector3(),tPos=new T.Vector3(),tLook=new T.Vector3(),first=true;
  var drag=0,down=false,lx=0;
  cv.addEventListener("pointerdown",function(e){down=true;lx=e.clientX;});
  window.addEventListener("pointermove",function(e){if(down){drag=Math.max(-.9,Math.min(.9,drag+(e.clientX-lx)*0.004));lx=e.clientX;}});
  window.addEventListener("pointerup",function(){down=false;});
  var W=1,Hh=1,narrow=false;
  var nav=document.querySelector(".nav");
  function size(){if(nav)sec.style.setProperty("--navh",nav.offsetHeight+"px");W=cv.clientWidth;Hh=cv.clientHeight;if(!W||!Hh)return;r.setSize(W,Hh,false);cam.aspect=W/Hh;narrow=cam.aspect<0.9;cam.fov=narrow?50:38;cam.updateProjectionMatrix();}
  window.addEventListener("resize",size);

  function camTarget(p,age){
    var head=X(age),hh=H(value(Math.min(age,100)));
    var ang=-0.62+drag,R=(narrow?10:7)+hh*1.3;
    var off=narrow?0.6:2.6;                                  // en escritorio la columna viva queda a la derecha del texto
    tPos.set(head-off+Math.sin(ang)*R,2.4+hh*0.75,Math.cos(ang)*R);
    tLook.set(head-off*0.4,hh*0.55,0);
    var w=ss(Math.max(0,Math.min(1,(p-.86)/.1)));             // toma final: se abre para ver toda la vida del plan
    if(w>0){var mid=X(66.5),half=X(100)/2+2.5,dist=half/Math.tan(T.MathUtils.degToRad(cam.fov/2))/Math.min(cam.aspect,1.9);
      dist=Math.min(dist,narrow?70:60);
      dist*=narrow?0.95:0.9;
      tPos.lerp(new T.Vector3(mid-3+Math.sin(-0.15+drag)*dist,dist*0.5,Math.cos(-0.15+drag)*dist*0.95),w);
      tLook.lerp(new T.Vector3(narrow?mid:mid-1.2,narrow?2:-0.2,0),w);}
    scene.fog.near=16+w*30;scene.fog.far=60+w*70;
  }

  /* ---------- scroll ---------- */
  var prog=0,active=false;
  ScrollTrigger.create({trigger:sec,start:"top top",end:function(){return "+="+Math.round(window.innerHeight*(narrow?8:7));},
    pin:sec.querySelector(".stage"),anticipatePin:1,invalidateOnRefresh:true,
    onUpdate:function(s){prog=s.progress;},onToggle:function(s){active=s.isActive;document.body.classList.toggle("in-story",active);if(active)kick();}});
  var near=false;
  new IntersectionObserver(function(es){near=es[0].isIntersecting;if(near)kick();},{rootMargin:"200px 0px"}).observe(sec);

  var running=false,shown=AGES.map(function(){return 0;});
  function kick(){if(!running){running=true;requestAnimationFrame(loop);}}
  function frame(){
    var p=prog,age=ageAt(p);
    for(var i=0;i<AGES.length;i++){
      var a=AGES[i],grow=Math.max(0,Math.min(1,age-a+1));
      var target=grow>0?HT[i]*(1-Math.pow(1-grow,3)):0.03;
      cur[i]+=(target-cur[i])*0.14;
      tmp.position.set(X(a),0,0);tmp.scale.set(1,Math.max(0.02,cur[i]),1);tmp.updateMatrix();mesh.setMatrixAt(i,tmp.matrix);
      if(grow<=0)col.copy(cGhost);
      else if(a<38)col.copy(cGold);
      else if(a===65)col.copy(cOut);
      else col.copy(cTeal).lerp(cMint,Math.min(1,(a-38)/62)*0.55);
      if(Math.abs(a-age)<0.6&&grow>0)col.lerp(new T.Color(1,1,1),0.25);     // la columna viva brilla
      mesh.setColorAt(i,col);
    }
    mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;
    // línea de lo pagado
    var endA=Math.min(age,100),lw=Math.max(0.01,X(endA)-X(33)+0.6);
    paidLine.scale.set(lw,1,1);paidLine.position.set(X(33)-0.3+lw/2,HP,0);
    paidLine.material.opacity=Math.max(0,Math.min(0.9,(age-34)*0.5));
    // partículas del retiro
    var tt=Math.max(0,Math.min(1,(p-.52)/.13));
    pm.opacity=tt>0&&tt<1?Math.sin(Math.PI*tt)*0.95:0;
    if(pm.opacity>0){var e=1-Math.pow(1-tt,2.2);for(var k=0;k<N;k++){var s=start[k],d=dir[k];pos[k*3]=s[0]+d[0]*e;pos[k*3+1]=s[1]+d[1]*e-2.5*tt*tt;pos[k*3+2]=s[2]+d[2]*e;}pg.attributes.position.needsUpdate=true;}
    // cámara con inercia
    camTarget(p,age);
    if(first){camPos.copy(tPos);camLook.copy(tLook);first=false;}
    camPos.lerp(tPos,0.09);camLook.lerp(tLook,0.09);
    cam.position.copy(camPos);cam.lookAt(camLook);
    r.render(scene,cam);
    hud(p,age);
  }
  function loop(){frame();if(near||active)requestAnimationFrame(loop);else running=false;}
  if(/debug/.test(location.hash))window.__story=function(p){prog=p;near=true;first=true;kick();};  // solo para probar la historia sin hacer scroll
  size();frame();
  window.addEventListener("load",function(){size();ScrollTrigger.refresh();});
})();
