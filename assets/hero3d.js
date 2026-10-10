/* Escena del inicio: cada columna es un año. Las primeras (doradas) son los años en que aportas;
   las demás (verdes) crecen solas con interés compuesto. */
(function(){
  var cv=document.getElementById("hero3d");
  function flat(){var h=cv&&cv.closest(".hero");if(h)h.classList.add("no3d");}
  if(!cv||!window.THREE){flat();return;}
  var reduce=window.__motion==="off",soft=window.__motion==="soft";  /* modo central (ver <head>): full | soft | off */
  var T=window.THREE,r;
  try{r=new T.WebGLRenderer({canvas:cv,antialias:!window.__lowfx,alpha:true});}catch(e){flat();return;}
  r.setPixelRatio(window.__dpr?window.__dpr():1);
  var scene=new T.Scene();scene.fog=new T.Fog(0x0B1A17,18,46);
  var cam=new T.PerspectiveCamera(42,1,0.1,100);
  scene.add(new T.AmbientLight(0xffffff,0.55));
  var key=new T.DirectionalLight(0xffe2b0,0.9);key.position.set(6,12,8);scene.add(key);
  var rim=new T.DirectionalLight(0x6fc2b6,0.6);rim.position.set(-8,6,-6);scene.add(rim);

  var YEARS=56,ROWS=7,PAY=10,count=YEARS*ROWS;
  var geo=new T.BoxGeometry(0.42,1,0.42);geo.translate(0,0.5,0);
  var mat=new T.MeshStandardMaterial({roughness:0.45,metalness:0.15,vertexColors:false});
  var mesh=new T.InstancedMesh(geo,mat,count);scene.add(mesh);
  var gold=new T.Color(0xF2B04F),teal=new T.Color(0x22A08C),deep=new T.Color(0x12332E),tmp=new T.Object3D(),c=new T.Color();
  var target=[],pos=[],fvs=[];
  for(var i0=0;i0<YEARS;i0++){var f=0;for(var k0=0;k0<=Math.min(i0,PAY-1);k0++)f+=Math.pow(1.06,i0-k0);fvs.push(f);}
  var fmax=fvs[YEARS-1];
  for(var i=0;i<YEARS;i++){
    var h=0.2+7.2*fvs[i]/fmax;
    for(var j=0;j<ROWS;j++){
      var idx=i*ROWS+j,ang=(i/YEARS)*Math.PI*0.95-0.15,rad=9+j*0.62;
      var x=-Math.cos(ang)*rad+2.5,z=-Math.sin(ang)*rad+2;
      pos.push([x,z]);target.push(h*(1-j*0.07));
      if(i<PAY)c.copy(gold).lerp(deep,j*0.08);else c.copy(teal).lerp(gold,Math.max(0,(i-PAY))/ (YEARS*2.2)).lerp(deep,j*0.1);
      mesh.setColorAt(idx,c);
    }
  }
  mesh.instanceColor.needsUpdate=true;

  var pg=new T.BufferGeometry(),pn=140,pp=new Float32Array(pn*3);
  for(var p=0;p<pn;p++){pp[p*3]=(Math.random()-0.5)*30;pp[p*3+1]=Math.random()*14;pp[p*3+2]=(Math.random()-0.5)*20;}
  pg.setAttribute("position",new T.BufferAttribute(pp,3));
  var pts=new T.Points(pg,new T.PointsMaterial({color:0xF2B04F,size:0.07,transparent:true,opacity:0.7}));scene.add(pts);

  var base=[0,6.5,19],mob=false;
  function size(){var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;mob=w<700;base=mob?[2.5,9.5,22]:[0,6.5,19];cam.fov=mob?64:42;scene.fog.near=mob?20:18;scene.fog.far=mob?56:46;cam.position.set(base[0],base[1],base[2]);cam.updateProjectionMatrix();}
  window.addEventListener("resize",size);size();
  var mx=0,my=0,spin=0,vel=0,down=false,lx=0,hero=cv.closest(".hero")||cv;
  window.addEventListener("pointermove",function(e){mx=(e.clientX/window.innerWidth-0.5);my=(e.clientY/window.innerHeight-0.5);if(down){vel=(e.clientX-lx)*0.004;spin+=vel;lx=e.clientX;}});
  hero.addEventListener("pointerdown",function(e){if(e.target.closest("a,button"))return;down=true;lx=e.clientX;hero.classList.add("grabbing");});
  window.addEventListener("pointerup",function(){down=false;hero.classList.remove("grabbing");});
  var t0=performance.now(),visible=true,grown=false,adapt=window.__adapt?window.__adapt(r,size):null;
  if("IntersectionObserver" in window)new IntersectionObserver(function(es){var was=visible;visible=es[0].isIntersecting;if(visible&&!was&&!reduce)requestAnimationFrame(frame);}).observe(cv);
  function frame(now){
    var t=(now-t0)/1000;
    if(adapt)adapt(now);
    /* v7: cuando ya crecieron todas, deja de recalcular 392 matrices por cuadro */
    if(!grown)for(var i=0;i<count;i++){
      var col=Math.floor(i/ROWS),grow=reduce?1:Math.min(1,Math.max(0,(t*1.6-col*0.045)));
      var e=1-Math.pow(1-grow,3);
      tmp.position.set(pos[i][0],0,pos[i][1]);tmp.scale.set(1,Math.max(0.001,target[i]*e),1);tmp.updateMatrix();mesh.setMatrixAt(i,tmp.matrix);
    }
    if(!grown){mesh.instanceMatrix.needsUpdate=true;if(reduce||t*1.6-(YEARS-1)*0.045>=1)grown=true;}
    var a=pg.attributes.position.array;if(!reduce)for(var q=0;q<pn;q++){a[q*3+1]+=0.012;if(a[q*3+1]>14)a[q*3+1]=0;}pg.attributes.position.needsUpdate=true;
    var orbit=reduce?0:Math.sin(t*0.12)*0.35;
    /* v5: al bajar, la cámara se eleva y entra sobre las columnas */
    var hb=hero.getBoundingClientRect(),sp=(reduce||soft)?0:Math.min(1,Math.max(0,-hb.top/(hb.height||1)));
    cam.position.set(base[0],base[1]+sp*5,base[2]-sp*7);
    if(!down){spin+=vel;vel*=0.94;}scene.rotation.y=orbit+mx*0.25+spin+sp*0.9;cam.lookAt((mob?2.6:2.2),(mob?2.4:2.8)-my*0.8-sp*1.5,-3);
    r.render(scene,cam);
    if(!reduce&&visible)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
