/* Scrollytelling: la vida de un plan Trasciende real (33 años, $3,777 al mes, 5 años de pago).
   Las cifras de cada paso son de la cotización; la altura de las columnas entre esos puntos es ilustrativa. */
(function(){
  var cv=document.getElementById("story3d");
  if(!cv||!window.THREE)return;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T=window.THREE,r;
  try{r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}catch(e){return;}
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  var scene=new T.Scene();scene.fog=new T.Fog(0x0B1A17,14,40);
  var cam=new T.PerspectiveCamera(40,1,0.1,100);
  scene.add(new T.AmbientLight(0xffffff,0.5));
  var l1=new T.DirectionalLight(0xffe2b0,1);l1.position.set(5,10,8);scene.add(l1);
  var l2=new T.DirectionalLight(0x6fc2b6,0.5);l2.position.set(-6,5,-4);scene.add(l2);

  // valores ancla reales (cotización) y forma ilustrativa entre ellos
  var A=[[33,15000],[38,250464],[64,1694471],[65,786384],[84,3179711],[100,6200000]];
  function val(age){for(var i=1;i<A.length;i++){if(age<=A[i][0]){var a=A[i-1],b=A[i];if(b[0]===65&&age===65)return b[1];var t=(age-a[0])/(b[0]-a[0]);return a[1]*Math.pow(b[1]/a[1],t);}}return A[A.length-1][1];}
  var AGES=[];for(var g=33;g<=100;g++)AGES.push(g);
  var maxv=6200000,SP=0.62;
  var geo=new T.BoxGeometry(0.46,1,0.46);geo.translate(0,0.5,0);
  var mat=new T.MeshStandardMaterial({roughness:0.4,metalness:0.2});
  var mesh=new T.InstancedMesh(geo,mat,AGES.length);scene.add(mesh);
  var cGold=new T.Color(0xF2B04F),cTeal=new T.Color(0x22A08C),cDim=new T.Color(0x1C3A35),cOut=new T.Color(0xE8613C),tmp=new T.Object3D(),col=new T.Color();
  var H=AGES.map(function(a){return 0.12+9*Math.sqrt(val(a)/maxv);});
  var cur=AGES.map(function(){return 0.001;});
  var ground=new T.Mesh(new T.PlaneGeometry(80,12),new T.MeshStandardMaterial({color:0x10241F,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(20,0,0);scene.add(ground);

  var STEPS=[{upto:33,cam:33},{upto:38,cam:36},{upto:64,cam:52},{upto:65,cam:62},{upto:84,cam:76},{upto:100,cam:86}];
  var step=-1,camX=X(33),camTarget=X(33);
  function X(age){return (age-33)*SP;}
  function size(){var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
  window.addEventListener("resize",size);size();

  function setStep(i){step=i;camTarget=X(STEPS[i].cam);if(reduce)render();}
  var cards=[].slice.call(document.querySelectorAll("[data-story]"));
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){cards.forEach(function(c){c.classList.toggle("on",c===e.target);});setStep(+e.target.dataset.story);}});},{rootMargin:"-45% 0px -45% 0px"});
    cards.forEach(function(c){io.observe(c);});
  }
  setStep(0);
  var drag=0,dx=0,down=false,lx=0;
  cv.addEventListener("pointerdown",function(e){down=true;lx=e.clientX;cv.setPointerCapture(e.pointerId);});
  cv.addEventListener("pointermove",function(e){if(down){drag+=(e.clientX-lx)*0.005;lx=e.clientX;}});
  cv.addEventListener("pointerup",function(){down=false;});

  var visible=false;
  if("IntersectionObserver" in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible&&!reduce)requestAnimationFrame(loop);}).observe(cv);
  function render(){
    var upto=STEPS[Math.max(0,step)].upto;
    for(var i=0;i<AGES.length;i++){
      var a=AGES[i],target=a<=upto?H[i]:0.06;
      cur[i]=reduce?target:cur[i]+(target-cur[i])*0.08;
      tmp.position.set(X(a),0,0);tmp.scale.set(1,Math.max(0.001,cur[i]),1);tmp.updateMatrix();mesh.setMatrixAt(i,tmp.matrix);
      if(a>upto)col.copy(cDim);else if(a<=38)col.copy(cGold);else if(a===65)col.copy(cOut);else col.copy(cTeal).lerp(cGold,Math.min(1,(a-38)/120));
      mesh.setColorAt(i,col);
    }
    mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;
    camX=reduce?camTarget:camX+(camTarget-camX)*0.05;
    var ang=-0.55+drag;
    cam.position.set(camX+Math.sin(ang)*14,6.2,Math.cos(ang)*14);
    cam.lookAt(camX+2,2.6,0);
    r.render(scene,cam);
  }
  function loop(){render();if(visible&&!reduce)requestAnimationFrame(loop);}
  render();
})();
