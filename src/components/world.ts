import * as THREE from 'three';
import gsap from 'gsap';
import type {ArtState} from './SceneArt';
/** Original procedural poster room. No reference plates or owner media. */
export function createWorld(host:HTMLElement,kind:'journey'|'work',motion:boolean,state:ArtState){
 const canvas=document.createElement('canvas');host.append(canvas);let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{canvas.remove();host.dataset.art='fallback';return()=>{};}
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,70);camera.position.set(0,1.3,11);camera.lookAt(0,.3,0);
 scene.add(new THREE.AmbientLight(0x7390b0,.85));const key=new THREE.PointLight(0xffb782,36,25);key.position.set(2,5,5);scene.add(key);const cool=new THREE.PointLight(0x6a98bc,14,20);cool.position.set(-5,2,3);scene.add(cool);
 const world=new THREE.Group();scene.add(world);const metal=new THREE.MeshStandardMaterial({color:0xb59578,metalness:.85,roughness:.3,emissive:0x54321b,emissiveIntensity:.35});const dark=new THREE.MeshStandardMaterial({color:0x131c26,metalness:.55,roughness:.45});const copper=new THREE.MeshBasicMaterial({color:0xe9a476,transparent:true,opacity:.65});
 const dial=new THREE.Group();world.add(dial);
 const ring=(r:number,tube:number,mat:THREE.Material=metal)=>new THREE.Mesh(new THREE.TorusGeometry(r,tube,10,96),mat);
 const outer=ring(2.05,.045);dial.add(outer);dial.add(ring(1.9,.014,copper));dial.add(ring(1.58,.02));
 const back=new THREE.Mesh(new THREE.CircleGeometry(1.87,96),new THREE.MeshStandardMaterial({color:0x101a24,metalness:.4,roughness:.8,transparent:true,opacity:.82}));back.position.z=-.09;dial.add(back);
 for(let i=0;i<60;i++){const large=i%5===0;const tick=new THREE.Mesh(new THREE.BoxGeometry(large?.023:.012,large?.17:.07,.025),large?metal:copper);const a=i/60*Math.PI*2;tick.position.set(Math.sin(a)*1.73,Math.cos(a)*1.73,.05);tick.rotation.z=-a;dial.add(tick);}
 const hand=new THREE.Group();const needle=new THREE.Mesh(new THREE.BoxGeometry(.027,1.46,.055),copper);needle.position.y=.65;hand.add(needle);const hub=new THREE.Mesh(new THREE.SphereGeometry(.085,16,12),metal);hub.position.z=.08;hand.add(hub);dial.add(hand);
 const globe=new THREE.Mesh(new THREE.IcosahedronGeometry(.93,1),new THREE.MeshStandardMaterial({color:0x849daf,wireframe:true,transparent:true,opacity:.20,metalness:.5,roughness:.4}));globe.position.z=.04;dial.add(globe);
 const floorGroup=new THREE.Group();floorGroup.position.y=-2.05;floorGroup.rotation.x=-Math.PI/2;world.add(floorGroup);
 for(const [i,r] of [2.3,2.75,3.3].entries()){const mesh=ring(r,i===0?.024:.009,copper);floorGroup.add(mesh);}
 const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.65,.14,72),dark);pedestal.position.y=-2.13;world.add(pedestal);
 const pool=new THREE.Mesh(new THREE.PlaneGeometry(11,11),new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec2 u;void main(){u=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 u;void main(){vec2 p=(u-.5)*2.;float a=exp(-dot(p,p)*6.)*.16;gl_FragColor=vec4(.55,.32,.19,a);}'}));pool.rotation.x=-Math.PI/2;pool.position.y=-2.22;world.add(pool);
 const grid=new THREE.GridHelper(16,24,0x493526,0x18222e);grid.position.y=-2.25;(grid.material as THREE.Material).transparent=true;(grid.material as THREE.Material).opacity=.21;world.add(grid);
 const ribbonCoords=new Float32Array(100*3),ribbonColors=new Float32Array(100*3);for(let i=0;i<100;i++){const c=new THREE.Color().setRGB(.3+i/100*.55,.16+i/100*.3,.09+i/100*.18);ribbonColors.set([c.r,c.g,c.b],i*3);}
 const ribbonGeo=new THREE.BufferGeometry();ribbonGeo.setAttribute('position',new THREE.BufferAttribute(ribbonCoords,3));ribbonGeo.setAttribute('color',new THREE.BufferAttribute(ribbonColors,3));const ribbon=new THREE.Line(ribbonGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));world.add(ribbon);
 const count=matchMedia('(max-width:699px)').matches?28:70,points=new Float32Array(count*3);for(let i=0;i<count*3;i++){const n=Math.sin(i*17.2+4)*9282;points[i]=(n-Math.floor(n)-.5)*(i%3===2?5:12);}
 const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.BufferAttribute(points,3));const particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0xd8ae85,size:.023,transparent:true,opacity:.35,depthWrite:false}));scene.add(particles);
 if(kind==='work'){
  dial.visible=false;const core=new THREE.Group();world.add(core);globe.parent?.remove(globe);core.add(globe);globe.scale.setScalar(1.4);globe.position.set(0,.15,0);globe.material=new THREE.MeshStandardMaterial({color:0x769ab3,metalness:.9,roughness:.25,wireframe:true,transparent:true,opacity:.24});
  const overhead=ring(3.5,.018,copper);overhead.rotation.x=Math.PI/2;overhead.position.y=2.8;world.add(overhead);
  const orbit=ring(1.6,.012,copper);orbit.rotation.set(.7,.3,-.4);core.add(orbit);
  for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;const border=new THREE.EdgesGeometry(new THREE.BoxGeometry(1.0,.68,.04));const card=new THREE.LineSegments(border,new THREE.LineBasicMaterial({color:0x658898,transparent:true,opacity:.22}));card.position.set(Math.sin(a)*3,.65+Math.cos(a)*.3,Math.cos(a)*2-1);card.rotation.y=-a;world.add(card);}
 }
 let alive=true,visible=false,running=false,lost=false,last=0,time=0,debt=0,selection=state.selection;const pointer=new THREE.Vector2(),target=new THREE.Vector2();
 const fit=()=>{const r=host.getBoundingClientRect();const small=r.width<700;renderer.setPixelRatio(Math.min(devicePixelRatio,small?1:1.5));renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();world.position.x=small?0:(kind==='journey'?2.5:0);world.scale.setScalar(small?.8:1);camera.position.z=small?10.5:11;draw();};
 const fail=(event?:Event)=>{event?.preventDefault();lost=true;gsap.ticker.remove(tick);running=false;canvas.style.display='none';host.dataset.art='fallback';host.dataset.rendering='paused';};
 renderer.debug.onShaderError=()=>fail();canvas.addEventListener('webglcontextlost',fail);
 function draw(){if(!alive||lost)return;selection=motion?selection+(state.selection-selection)*.08:state.selection;pointer.lerp(target,.035);hand.rotation.z=-.25-selection*1.15;floorGroup.rotation.z=(motion?time*.018:0)+state.progress*.2;globe.rotation.set(.3,motion?time*.055:0,.15);dial.rotation.y=(kind==='work'?.4:0)+(motion?pointer.x*.1:0);camera.position.x=motion?pointer.x*.16:0;camera.position.y=1.3+(motion?pointer.y*.06:0);camera.position.z=(host.clientWidth<700?10.5:11)-state.progress*.45;camera.lookAt(0,.3,0);particles.rotation.y=motion?time*.006:0;
  for(let i=0;i<100;i++){const t=time*.23-(100-i)*.025;ribbonCoords[i*3]=Math.sin(t)*3.1;ribbonCoords[i*3+1]=Math.cos(t*.73)*.65-.5;ribbonCoords[i*3+2]=Math.cos(t)*2.1;}ribbonGeo.attributes.position.needsUpdate=true;
  try{renderer.render(scene,camera);host.dataset.art='ready';host.dataset.frames=String(Number(host.dataset.frames||0)+1);}catch{fail();}
 }
 function tick(now:number){if(!last)last=now;const dt=Math.min(.05,now-last);last=now;time+=dt;debt+=dt;if(debt>=1/30){debt%=1/30;draw();}}
 const sync=()=>{const need=alive&&!lost&&visible&&!document.hidden&&motion;if(need&&!running){last=0;gsap.ticker.add(tick);running=true;}else if(!need&&running){gsap.ticker.remove(tick);running=false;}host.dataset.rendering=running?'running':'paused';if(visible&&!document.hidden)draw();};
 const move=(e:PointerEvent)=>{if(e.pointerType==='mouse'&&motion){const r=host.getBoundingClientRect();target.set((e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5);}};const leave=()=>target.set(0,0);
 host.addEventListener('scenechange',draw);const section=host.closest('section')||host;section.addEventListener('pointermove',move);section.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',sync);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});observer.observe(host);const resize=new ResizeObserver(fit);resize.observe(host);fit();
 return()=>{alive=false;host.removeEventListener('scenechange',draw);observer.disconnect();resize.disconnect();gsap.ticker.remove(tick);document.removeEventListener('visibilitychange',sync);section.removeEventListener('pointermove',move);section.removeEventListener('pointerleave',leave);canvas.removeEventListener('webglcontextlost',fail);const geos=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>();scene.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.Line||obj instanceof THREE.Points){geos.add(obj.geometry);const m=obj.material;(Array.isArray(m)?m:[m]).forEach(v=>mats.add(v));}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();delete host.dataset.art;delete host.dataset.rendering;};
}
