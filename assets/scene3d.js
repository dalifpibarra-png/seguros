/* Escenas 3D de las páginas de producto. Cada <canvas data-scene="..."> elige su escena.
   vida: un domo protector sobre columnas que crecen · ahorro: columnas de 10 años de aporte
   casa: una casa bajo un domo · mascota: una huella flotando · negocio: un local con su toldo */
(function(){
  if(!window.THREE)return;
  var T=window.THREE,reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GOLD=0xF2B04F,TEAL=0x22A08C,DEEP=0x12332E,WHITE=0xE7F0ED;
  function std(c,o){return new T.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.15},o||{}));}
  function columns(group,years,pay,rows,rad0,scaleH){
    var n=years*rows,geo=new T.BoxGeometry(.4,1,.4);geo.translate(0,.5,0);
    var mesh=new T.InstancedMesh(geo,std(0xffffff),n),tmp=new T.Object3D(),c=new T.Color(),fv=[],f;
    for(var i=0;i<years;i++){f=0;for(var k=0;k<=Math.min(i,pay-1);k++)f+=Math.pow(1.06,i-k);fv.push(f);}
    var max=fv[years-1],data=[];
    for(i=0;i<years;i++)for(var j=0;j<rows;j++){
      var ang=(i/years)*Math.PI*1.1-.2,r=rad0+j*.55,x=-Math.cos(ang)*r,z=-Math.sin(ang)*r;
      data.push([x,z,(.2+scaleH*fv[i]/max)*(1-j*.08)]);
      if(i<pay)c.set(GOLD).lerp(new T.Color(DEEP),j*.09);else c.set(TEAL).lerp(new T.Color(DEEP),j*.1);
      mesh.setColorAt(i*rows+j,c);
    }
    mesh.instanceColor.needsUpdate=true;group.add(mesh);
    return function(t){for(var q=0;q<n;q++){var col=Math.floor(q/rows),g=reduce?1:Math.min(1,Math.max(0,t*1.4-col*.05)),e=1-Math.pow(1-g,3);
      tmp.position.set(data[q][0],0,data[q][1]);tmp.scale.set(1,Math.max(.001,data[q][2]*e),1);tmp.updateMatrix();mesh.setMatrixAt(q,tmp.matrix);}mesh.instanceMatrix.needsUpdate=true;};
  }
  function dome(group,r,color){var m=new T.Mesh(new T.IcosahedronGeometry(r,2),new T.MeshBasicMaterial({color:color,wireframe:true,transparent:true,opacity:.22}));group.add(m);
    var s=new T.Mesh(new T.SphereGeometry(r*.99,48,32),new T.MeshStandardMaterial({color:color,transparent:true,opacity:.06,roughness:.2}));group.add(s);return m;}
  function house(group){
    var h=new T.Group(),body=new T.Mesh(new T.BoxGeometry(3,2,2.6),std(0xE7EDE9));body.position.y=1;h.add(body);
    var roof=new T.Mesh(new T.ConeGeometry(2.6,1.5,4),std(GOLD,{roughness:.5}));roof.position.y=2.75;roof.rotation.y=Math.PI/4;h.add(roof);
    var door=new T.Mesh(new T.BoxGeometry(.6,1.1,.05),std(DEEP));door.position.set(0,.55,1.31);h.add(door);
    [[-.9,1.2],[.9,1.2]].forEach(function(p){var w=new T.Mesh(new T.BoxGeometry(.55,.5,.05),new T.MeshStandardMaterial({color:0xFFE2A8,emissive:0xF2B04F,emissiveIntensity:.6}));w.position.set(p[0],p[1],1.31);h.add(w);});
    var ground=new T.Mesh(new T.CylinderGeometry(4.2,4.2,.15,48),std(0x183A34));ground.position.y=-.08;h.add(ground);
    group.add(h);return h;
  }
  function paw(group){
    var p=new T.Group(),mat=std(GOLD,{roughness:.35}),pad=new T.Mesh(new T.SphereGeometry(1.3,32,24),mat);pad.scale.set(1.2,.9,.55);p.add(pad);
    [[-1.35,1.25,.85],[-.5,1.9,.8],[.5,1.9,.8],[1.35,1.25,.85]].forEach(function(t){var toe=new T.Mesh(new T.SphereGeometry(.55*t[2],24,18),mat);toe.position.set(t[0],t[1],0);toe.scale.set(1,1.15,.6);p.add(toe);});
    p.position.y=2.4;group.add(p);return p;
  }
  function store(group){
    var s=new T.Group(),b=new T.Mesh(new T.BoxGeometry(4.2,2.6,2.4),std(0xE7EDE9));b.position.y=1.3;s.add(b);
    for(var i=0;i<7;i++){var st=new T.Mesh(new T.BoxGeometry(.6,.18,.9),std(i%2?WHITE:GOLD));st.position.set(-1.8+i*.6,2.45,1.55);st.rotation.x=.45;s.add(st);}
    var win=new T.Mesh(new T.BoxGeometry(2.6,1.1,.05),new T.MeshStandardMaterial({color:0xBFE6DF,emissive:0x22A08C,emissiveIntensity:.35}));win.position.set(-.4,1.15,1.21);s.add(win);
    var door=new T.Mesh(new T.BoxGeometry(.7,1.5,.05),std(DEEP));door.position.set(1.45,.75,1.21);s.add(door);
    var ground=new T.Mesh(new T.CylinderGeometry(4.6,4.6,.15,48),std(0x183A34));ground.position.y=-.08;s.add(ground);
    group.add(s);return s;
  }
  [].forEach.call(document.querySelectorAll("canvas[data-scene]"),function(cv){
    var r;try{r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}catch(e){return;}
    r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    var mode=cv.dataset.scene,scene=new T.Scene(),cam=new T.PerspectiveCamera(40,1,.1,100),root=new T.Group();scene.add(root);
    scene.add(new T.AmbientLight(0xffffff,.55));var l=new T.DirectionalLight(0xffe2b0,.95);l.position.set(5,9,7);scene.add(l);var l2=new T.DirectionalLight(0x6fc2b6,.6);l2.position.set(-6,4,-5);scene.add(l2);
    var anim=function(){},spinObj=root,camPos=[0,5,13],look=[0,1.8,0];
    if(mode==="vida"){anim=columns(root,40,5,4,4.2,4.2);var d=dome(root,6.2,TEAL);d.position.y=0;camPos=[0,6,15];look=[0,2.2,0];var a0=anim;anim=function(t){a0(t);d.rotation.y=t*.08;};}
    else if(mode==="ahorro"){anim=columns(root,36,10,5,3.6,5.5);camPos=[0,6.5,14];look=[0,2.6,0];}
    else if(mode==="casa"){var hs=house(root);var dm=dome(root,4.6,TEAL);camPos=[0,4.2,11.5];look=[0,1.6,0];anim=function(t){dm.rotation.y=-t*.1;};}
    else if(mode==="mascota"){var pw=paw(root);camPos=[0,3,10.5];look=[0,2.4,0];anim=function(t){pw.position.y=2.4+Math.sin(t*1.4)*.18;pw.rotation.z=Math.sin(t*.7)*.08;};}
    else if(mode==="negocio"){var sh=store(root);var dn=dome(root,5,GOLD);camPos=[0,4.4,12];look=[0,1.7,0];anim=function(t){dn.rotation.y=t*.07;};}
    var pg=new T.BufferGeometry(),pn=110,pp=new Float32Array(pn*3);for(var p=0;p<pn;p++){pp[p*3]=(Math.random()-.5)*22;pp[p*3+1]=Math.random()*10;pp[p*3+2]=(Math.random()-.5)*14;}
    pg.setAttribute("position",new T.BufferAttribute(pp,3));scene.add(new T.Points(pg,new T.PointsMaterial({color:GOLD,size:.06,transparent:true,opacity:.7})));
    function size(){var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;var k=w<700?1.25:1;cam.position.set(camPos[0],camPos[1]*k,camPos[2]*k);cam.updateProjectionMatrix();}
    window.addEventListener("resize",size);size();
    var host=cv.closest("section")||cv,down=false,lx=0,spin=0,vel=0,mx=0,my=0,vis=true;
    host.addEventListener("pointerdown",function(e){if(e.target.closest("a,button"))return;down=true;lx=e.clientX;});
    window.addEventListener("pointerup",function(){down=false;});
    window.addEventListener("pointermove",function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;if(down){vel=(e.clientX-lx)*.005;spin+=vel;lx=e.clientX;}});
    if("IntersectionObserver" in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis&&!reduce)requestAnimationFrame(loop);}).observe(cv);
    var t0=performance.now();
    function draw(now){var t=((now||performance.now())-t0)/1000;anim(reduce?99:t);
      if(!down){spin+=vel;vel*=.94;}root.rotation.y=(reduce?.4:t*.15)+mx*.3+spin;
      var a=pg.attributes.position.array;if(!reduce)for(var q=0;q<pn;q++){a[q*3+1]+=.01;if(a[q*3+1]>10)a[q*3+1]=0;}pg.attributes.position.needsUpdate=true;
      cam.lookAt(look[0],look[1]-my*.5,look[2]);r.render(scene,cam);}
    function loop(now){draw(now);if(vis&&!reduce)requestAnimationFrame(loop);}
    draw();
  });
})();
