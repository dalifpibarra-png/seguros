/* Escena del inicio, v8 "maqueta premium" (11 oct 2026): una casa familiar sobre una base, protegida por una cúpula
   de cristal, y detrás una corona de columnas que crecen una por una. Cada columna es un año: las primeras (doradas)
   son los años en que aportas; las demás (verdes) crecen solas con interés compuesto.
   En escritorio la maqueta va a la derecha (setViewOffset) para dejar libre el texto; en celular es el escenario de arriba.
   Lee el modo central de <head>: full | soft | off, __dpr y __adapt. */
(function(){
  var cv=document.getElementById("hero3d");
  function flat(){var h=cv&&cv.closest(".hero");if(h)h.classList.add("no3d");}
  if(!cv||!window.THREE){flat();return;}
  var reduce=window.__motion==="off",soft=window.__motion==="soft";
  var T=window.THREE,r;
  try{r=new T.WebGLRenderer({canvas:cv,antialias:!window.__lowfx,alpha:true});}catch(e){flat();return;}
  r.setPixelRatio(window.__dpr?window.__dpr():1);
  var SH=!window.__lowfx;                                   // sombras reales solo donde sobra potencia
  if(SH){r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;}
  var scene=new T.Scene();scene.fog=new T.Fog(0x0B1A17,20,52);
  var cam=new T.PerspectiveCamera(40,1,0.1,120);
  scene.add(new T.HemisphereLight(0xdff5ee,0x0b1a17,0.55));
  var key=new T.DirectionalLight(0xffe2b0,0.95);key.position.set(7,13,9);scene.add(key);
  if(SH){key.castShadow=true;key.shadow.mapSize.set(1024,1024);var kc=key.shadow.camera;kc.left=-12;kc.right=12;kc.top=12;kc.bottom=-12;kc.near=1;kc.far=40;key.shadow.radius=4;key.shadow.bias=-.0006;}
  /* entorno para reflejos: un cielo degradado verde-noche convertido en mapa de luz (PMREM) */
  try{var envS=new T.Scene(),skyG=new T.SphereGeometry(10,32,16),skyC=document.createElement("canvas");skyC.width=4;skyC.height=64;var sx=skyC.getContext("2d"),sg=sx.createLinearGradient(0,0,0,64);
    sg.addColorStop(0,"#3a7d73");sg.addColorStop(.45,"#f2c27a");sg.addColorStop(.55,"#163a34");sg.addColorStop(1,"#0b1a17");sx.fillStyle=sg;sx.fillRect(0,0,4,64);
    envS.add(new T.Mesh(skyG,new T.MeshBasicMaterial({map:new T.CanvasTexture(skyC),side:T.BackSide})));
    var pm=new T.PMREMGenerator(r);scene.environment=pm.fromScene(envS,.04).texture;pm.dispose();}catch(e){}
  var rim=new T.DirectionalLight(0x6fc2b6,0.7);rim.position.set(-9,6,-7);scene.add(rim);
  function std(c,o){return new T.MeshStandardMaterial(Object.assign({color:c,roughness:.42,metalness:.12,envMapIntensity:.45},o||{}));}   // reflejos suaves; el cristal usa más

  var root=new T.Group();scene.add(root);   // todo gira alrededor de la casa, como una maqueta en tornamesa

  /* base de la maqueta: dos niveles y un filo de luz */
  var base1=new T.Mesh(new T.CylinderGeometry(9.2,9.5,.36,96),std(0x10302B,{roughness:.8}));base1.position.y=-.2;base1.receiveShadow=SH;root.add(base1);
  var base2=new T.Mesh(new T.CylinderGeometry(4.1,4.3,.22,72),std(0x1B4A43,{roughness:.6}));base2.position.y=.09;base2.receiveShadow=SH;root.add(base2);
  var edge=new T.Mesh(new T.TorusGeometry(9.35,.035,8,160),new T.MeshBasicMaterial({color:0x6FC2B6,transparent:true,opacity:.45}));edge.rotation.x=Math.PI/2;edge.position.y=-.02;root.add(edge);

  /* sombra suave de contacto bajo la casa (textura radial, sin mapas de sombra) */
  var sc=document.createElement("canvas");sc.width=sc.height=128;var g=sc.getContext("2d"),gr=g.createRadialGradient(64,64,4,64,64,64);
  gr.addColorStop(0,"rgba(0,0,0,.55)");gr.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=gr;g.fillRect(0,0,128,128);
  var shadow=new T.Mesh(new T.PlaneGeometry(6.4,6.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.21;root.add(shadow);

  /* la casa */
  var house=new T.Group();
  var body=new T.Mesh(new T.BoxGeometry(2.6,1.7,2.2),std(0xE9EFEC,{roughness:.55}));body.position.y=1.05;house.add(body);
  var roof=new T.Mesh(new T.ConeGeometry(2.25,1.25,4),std(0xE9A23B,{roughness:.45,metalness:.2,envMapIntensity:.35}));roof.position.y=2.52;roof.rotation.y=Math.PI/4;house.add(roof);
  var door=new T.Mesh(new T.BoxGeometry(.52,.95,.05),std(0x12332E));door.position.set(0,.68,1.12);house.add(door);
  var winM=new T.MeshStandardMaterial({color:0xFFE2A8,emissive:0xF2B04F,emissiveIntensity:.75});
  [[-.82,1.25],[.82,1.25]].forEach(function(p){var w=new T.Mesh(new T.BoxGeometry(.5,.44,.05),winM);w.position.set(p[0],p[1],1.12);house.add(w);});
  var chim=new T.Mesh(new T.BoxGeometry(.28,.6,.28),std(0xD9E2DE));chim.position.set(.7,2.75,-.3);house.add(chim);
  [[-1.75,.9],[1.8,-.6]].forEach(function(p,i){                // dos arbolitos de maqueta
    var tr=new T.Mesh(new T.CylinderGeometry(.06,.08,.5,8),std(0x5B4A3A));tr.position.set(p[0],.45,p[1]);house.add(tr);
    var cr=new T.Mesh(new T.SphereGeometry(.42+i*.08,18,14),std(0x2E7D6B,{roughness:.7}));cr.position.set(p[0],1.0+i*.05,p[1]);house.add(cr);
  });
  house.position.y=.2;house.traverse(function(o){if(o.isMesh){o.castShadow=SH;o.receiveShadow=SH;}});root.add(house);

  /* la cúpula de cristal que protege */
  var domeR=3.55;
  var glass=new T.Mesh(new T.SphereGeometry(domeR,64,32,0,Math.PI*2,0,Math.PI/2),new T.MeshPhysicalMaterial({color:0x9FE0D2,transparent:true,opacity:.16,roughness:.04,metalness:0,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.6,side:T.DoubleSide,depthWrite:false}));
  glass.position.y=.2;root.add(glass);
  var wire=new T.Mesh(new T.IcosahedronGeometry(domeR*1.002,2),new T.MeshBasicMaterial({color:0x6FC2B6,wireframe:true,transparent:true,opacity:.16}));
  wire.position.y=.2;root.add(wire);
  var ring=new T.Mesh(new T.TorusGeometry(domeR,.05,10,120),new T.MeshBasicMaterial({color:0x8FD3C5,transparent:true,opacity:.7}));ring.rotation.x=Math.PI/2;ring.position.y=.22;root.add(ring);
  var halo=new T.Mesh(new T.RingGeometry(domeR,domeR+.9,96),new T.MeshBasicMaterial({color:0x22A08C,transparent:true,opacity:.14,side:T.DoubleSide,depthWrite:false}));halo.rotation.x=-Math.PI/2;halo.position.y=.205;root.add(halo);
  var gc=document.createElement("canvas");gc.width=gc.height=128;var gx=gc.getContext("2d"),gg=gx.createRadialGradient(64,64,0,64,64,64);
  gg.addColorStop(0,"rgba(111,194,182,.55)");gg.addColorStop(.5,"rgba(34,160,140,.18)");gg.addColorStop(1,"rgba(34,160,140,0)");gx.fillStyle=gg;gx.fillRect(0,0,128,128);
  var glow=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(gc),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));glow.scale.set(11,9,1);glow.position.set(0,2.2,-.6);root.add(glow);   // el brillo suave de la cúpula

  /* la corona de columnas: cada una es un año */
  var YEARS=48,ROWS=5,PAY=10,count=YEARS*ROWS;
  var geo=new T.CylinderGeometry(.2,.2,1,14);geo.translate(0,.5,0);
  var mesh=new T.InstancedMesh(geo,std(0xffffff,{roughness:.3,metalness:.32}),count);mesh.castShadow=SH;mesh.receiveShadow=SH;root.add(mesh);
  var gold=new T.Color(0xF2B04F),teal=new T.Color(0x22A08C),deep=new T.Color(0x12332E),tmp=new T.Object3D(),c=new T.Color();
  var target=[],pos=[],fvs=[];
  for(var i0=0;i0<YEARS;i0++){var f=0;for(var k0=0;k0<=Math.min(i0,PAY-1);k0++)f+=Math.pow(1.06,i0-k0);fvs.push(f);}
  var fmax=fvs[YEARS-1];
  for(var i=0;i<YEARS;i++){
    var h=.25+6.2*fvs[i]/fmax;
    for(var j=0;j<ROWS;j++){
      var idx=i*ROWS+j,ang=-.12+(i/(YEARS-1))*(Math.PI+.24),rad=6.1+j*.62;
      pos.push([-Math.cos(ang)*rad,-Math.sin(ang)*rad]);target.push(h*(1-j*.08));
      if(i<PAY)c.copy(gold).lerp(deep,j*.08);else c.copy(teal).lerp(gold,Math.max(0,i-PAY)/(YEARS*2.4)).lerp(deep,j*.1);
      mesh.setColorAt(idx,c);
    }
  }
  mesh.instanceColor.needsUpdate=true;

  /* polvo dorado que sube */
  var pg=new T.BufferGeometry(),pn=120,pp=new Float32Array(pn*3);
  for(var p=0;p<pn;p++){pp[p*3]=(Math.random()-.5)*26;pp[p*3+1]=Math.random()*12;pp[p*3+2]=(Math.random()-.5)*18;}
  pg.setAttribute("position",new T.BufferAttribute(pp,3));
  scene.add(new T.Points(pg,new T.PointsMaterial({color:0xF2B04F,size:.07,transparent:true,opacity:.7})));

  /* cámara y encuadre */
  var base=[0,6.4,17.5],look=[0,2.3,0],mob=false;
  function size(){
    var w=cv.clientWidth,hh=cv.clientHeight;if(!w||!hh)return;
    r.setSize(w,hh,false);cam.aspect=w/hh;mob=w<700;
    /* Escritorio: para mover la maqueta a la derecha SIN acercarla, el "cuadro completo" es K (1.46) veces más ancho
       (aspect incluido) y la ventana muestra su parte izquierda: el centro de la escena cae al K/2 (≈73 %) del ancho.
       Ojo: setViewOffset con una ventana más chica que el cuadro completo, sin ajustar aspect, hace zoom (error del 11 oct). */
    if(mob){base=[0,8.4,21];look=[0,2.2,0];cam.fov=56;cam.clearViewOffset();scene.fog.near=22;scene.fog.far=58;}
    else{var K=1.46;base=[0,8,24];look=[0,2.6,0];cam.fov=38;cam.aspect=w*K/hh;cam.setViewOffset(w*K,hh,0,0,w,hh);scene.fog.near=26;scene.fog.far=62;}
    cam.position.set(base[0],base[1],base[2]);cam.updateProjectionMatrix();
  }
  window.addEventListener("resize",size);size();

  var mx=0,my=0,spin=0,vel=0,down=false,lx=0,hero=cv.closest(".hero")||cv;
  window.addEventListener("pointermove",function(e){mx=(e.clientX/window.innerWidth-.5);my=(e.clientY/window.innerHeight-.5);if(down){vel=(e.clientX-lx)*.004;spin+=vel;lx=e.clientX;}});
  hero.addEventListener("pointerdown",function(e){if(e.target.closest("a,button"))return;down=true;lx=e.clientX;hero.classList.add("grabbing");});
  window.addEventListener("pointerup",function(){down=false;hero.classList.remove("grabbing");});

  /* si el equipo va lento (cuadros de más de 24 ms), además de bajar la resolución se apagan las sombras */
  function noShadows(){if(!r.shadowMap.enabled)return;r.shadowMap.enabled=false;scene.traverse(function(o){if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(function(m){m.needsUpdate=true;});}});}
  var t0=performance.now(),visible=true,grown=false,adapt=window.__adapt?window.__adapt(r,size,noShadows):null;
  if("IntersectionObserver" in window)new IntersectionObserver(function(es){var was=visible;visible=es[0].isIntersecting;if(visible&&!was&&!reduce)requestAnimationFrame(frame);}).observe(cv);
  function frame(now){
    var t=((now||performance.now())-t0)/1000;
    if(adapt)adapt(now);
    if(!grown){
      for(var i=0;i<count;i++){
        var col=Math.floor(i/ROWS),gw=reduce?1:Math.min(1,Math.max(0,t*1.5-.6-col*.05)),e=1-Math.pow(1-gw,3);
        tmp.position.set(pos[i][0],.02,pos[i][1]);tmp.scale.set(1,Math.max(.001,target[i]*e),1);tmp.updateMatrix();mesh.setMatrixAt(i,tmp.matrix);
      }
      mesh.instanceMatrix.needsUpdate=true;if(reduce||t*1.5-.6-(YEARS-1)*.05>=1)grown=true;   // ya crecieron: deja de recalcular
    }
    var a=pg.attributes.position.array;if(!reduce){for(var q=0;q<pn;q++){a[q*3+1]+=.011;if(a[q*3+1]>12)a[q*3+1]=0;}pg.attributes.position.needsUpdate=true;}
    if(!reduce){wire.rotation.y=t*.06;halo.material.opacity=.11+Math.sin(t*1.6)*.04;}
    var hb=hero.getBoundingClientRect(),sp=(reduce||soft)?0:Math.min(1,Math.max(0,-hb.top/(hb.height||1)));
    cam.position.set(base[0],base[1]+sp*4,base[2]-sp*6);       // al bajar, la cámara sube y entra a la maqueta
    if(!down){spin+=vel;vel*=.94;}
    root.rotation.y=(reduce?.35:Math.sin(t*.12)*.38+t*.03)+mx*.25+spin+sp*.9;
    cam.lookAt(look[0],look[1]-my*.6-sp*1.2,look[2]);
    r.render(scene,cam);
    if(!reduce&&visible)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
