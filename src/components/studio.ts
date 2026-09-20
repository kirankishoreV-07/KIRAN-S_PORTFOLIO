import {createAlphaStudio} from './alphaStudio';
import type {AlphaMedia} from './characterMedia';
import * as THREE from 'three';
import gsap from 'gsap';

export type IntroClock = { reveal:number; light:number };
const vertex=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const background=`varying vec2 vUv; uniform float time; uniform float light; uniform float aspect;
void main(){
 vec2 p=(vUv-vec2(.74,.56))*vec2(aspect,1.);
 p.x+=sin(time*.13)*.025; p.y+=cos(time*.17)*.015;
 float glow=exp(-dot(p,p)*5.);
 float vig=smoothstep(.2,1.,length((vUv-.5)*vec2(aspect*.65,1.)));
 float grain=fract(sin(dot(gl_FragCoord.xy+floor(time*12.),vec2(12.9898,78.233)))*43758.5453)-.5;
 vec3 col=vec3(.027,.036,.054)+vec3(.026,.033,.042)*glow*light;
 col*=1.-vig*.22; col+=grain*.003;
 gl_FragColor=vec4(col,1.);
}`;
// Original RGB is kept untouched in the interior. Feather only empty borders,
// never use luminance as character alpha: dark suit / hair would disappear.
const film=`varying vec2 vUv;uniform sampler2D media;uniform float reveal;
void main(){
 vec3 col=texture2D(media,vUv).rgb;
 float a=smoothstep(0.,.14,vUv.x)*smoothstep(0.,.11,1.-vUv.x);
 float protect=smoothstep(.32,.40,vUv.x)*(1.-smoothstep(.90,.96,vUv.x));
 a*=smoothstep(0.,.035,vUv.y)*mix(smoothstep(0.,.16,1.-vUv.y),smoothstep(0.,.025,1.-vUv.y),protect);
 gl_FragColor=vec4(col,a*reveal);
}`;
const floorShader=`varying vec2 vUv;uniform float light;uniform float time;
void main(){vec2 p=(vUv-vec2(.5,.44))*vec2(2.,1.);float pool=exp(-dot(p,p)*8.);
 float edge=smoothstep(0.,.15,vUv.x)*smoothstep(0.,.15,1.-vUv.x)*smoothstep(0.,.12,vUv.y)*smoothstep(0.,.12,1.-vUv.y);
 vec3 col=vec3(.13,.145,.16)*(1.+sin(time*.19)*.045);
 gl_FragColor=vec4(col,pool*edge*light*.28);}`;

/** A single renderer: a navy wall, real perspective floor / particles, then
 * a screen-aligned video plate. The media never tilts or changes its foot anchor.
 * There is deliberately no silhouette rim or synthetic shadow over baked feet.
 */
export function createStudio(host:HTMLElement,frame:HTMLElement,video:HTMLVideoElement,poster:string,clock:IntroClock,motion:boolean,alpha?:AlphaMedia){
 if(alpha)return createAlphaStudio(host,frame,video,alpha,clock,motion);
 const canvas=document.createElement('canvas');canvas.className='webgl-studio';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
 let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});}catch{canvas.remove();host.dataset.webgl='fallback';return()=>{};}
 renderer.outputColorSpace=THREE.LinearSRGBColorSpace; // custom shaders output source sRGB without a second grade
 renderer.autoClear=false;
 const screen=new THREE.Scene(),room=new THREE.Scene();
 const ortho=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);ortho.position.z=2;
 const camera=new THREE.PerspectiveCamera(38,16/9,.1,40);camera.position.set(0,2.4,7);camera.lookAt(0,.4,0);
 const bgMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:background,depthTest:false,depthWrite:false,uniforms:{time:{value:0},light:{value:1},aspect:{value:1}}});
 const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),bgMat);bg.renderOrder=0;screen.add(bg);
 const videoTexture=new THREE.VideoTexture(video);videoTexture.minFilter=THREE.LinearFilter;videoTexture.magFilter=THREE.LinearFilter;videoTexture.generateMipmaps=false;
 const posterTexture=new THREE.TextureLoader().load(poster,()=>draw());posterTexture.minFilter=THREE.LinearFilter;
 const filmMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:film,transparent:true,depthTest:false,depthWrite:false,uniforms:{media:{value:posterTexture},reveal:{value:1}}});
 const plate=new THREE.Mesh(new THREE.PlaneGeometry(2,2),filmMat);plate.renderOrder=2;
 const filmScene=new THREE.Scene();filmScene.add(plate);
 const floorMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:floorShader,transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:0},light:{value:1}}});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,9),floorMat);floor.rotation.x=-Math.PI/2;floor.position.set(0,-1.3,-1.8);room.add(floor);
 const small=()=>matchMedia('(max-width:699px)').matches;
 const count=small()?16:44,coords=new Float32Array(count*3);
 for(let i=0;i<count;i++){const rnd=(n:number)=>{const v=Math.sin((i+1)*n)*43758.5453;return v-Math.floor(v);};coords[i*3]=(i%2?-1:1)*(2.5+rnd(13.1)*3);coords[i*3+1]=rnd(73.3)*5-1;coords[i*3+2]=-rnd(41.7)*5;}
 const particlesGeo=new THREE.BufferGeometry();particlesGeo.setAttribute('position',new THREE.BufferAttribute(coords,3));
 const particlesMat=new THREE.PointsMaterial({color:0x8b9aa9,size:.012,transparent:true,opacity:.21,depthWrite:false});const particles=new THREE.Points(particlesGeo,particlesMat);room.add(particles);
 let alive=true,lost=false,visible=true,running=false,width=1,height=1,elapsed=0,lastTick=0,frameDebt=0,frames=0;
 const target=new THREE.Vector2(),pointer=new THREE.Vector2();
 const fail=()=>{lost=true;host.dataset.webgl='fallback';host.dataset.rendering='paused';canvas.style.display='none';gsap.ticker.remove(tick);running=false;};
 renderer.debug.onShaderError=()=>fail();
 const layout=()=>{const box=host.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);renderer.setPixelRatio(Math.min(devicePixelRatio,small()?1:1.5));renderer.setSize(width,height,false);bgMat.uniforms.aspect.value=width/height;};
 function draw(){
  if(!alive||lost)return;
  const box=host.getBoundingClientRect(),f=frame.getBoundingClientRect();
  const x=f.left-box.left,y=height-(f.top-box.top)-f.height;
  filmMat.uniforms.media.value=video.readyState>=2&&(video.currentTime>0||!video.paused||motion)?videoTexture:posterTexture;
  filmMat.uniforms.reveal.value=clock.reveal;bgMat.uniforms.light.value=clock.light;floorMat.uniforms.light.value=clock.light;
  bgMat.uniforms.time.value=elapsed;floorMat.uniforms.time.value=elapsed;
  const scroll=motion?Math.min(.12,Math.max(0,-box.top/Math.max(height,1))*.12):0;
  pointer.lerp(target,.035);camera.position.x=motion?pointer.x*.06:0;camera.position.y=2.4+(motion?pointer.y*.025:0);camera.position.z=7-scroll;camera.lookAt(0,.4,0);
  particles.position.y=motion?Math.sin(elapsed*.12)*.035:0;
  try{
   renderer.setScissorTest(false);renderer.setViewport(0,0,width,height);renderer.clear();renderer.render(screen,ortho);
   renderer.setViewport(x,y,f.width,f.height);renderer.setScissor(x,y,f.width,f.height);renderer.setScissorTest(true);camera.aspect=f.width/f.height;camera.updateProjectionMatrix();renderer.render(room,camera);
   renderer.setScissorTest(false);renderer.clearDepth();renderer.render(filmScene,ortho);
   host.dataset.webgl='ready';host.dataset.frames=String(++frames);
  }catch{fail();}
 }
 function tick(time:number){if(!lastTick)lastTick=time;const delta=Math.min(.05,time-lastTick);elapsed+=delta;frameDebt+=delta;lastTick=time;const interval=1/(small()?24:30);if(frameDebt>=interval){frameDebt%=interval;draw();}}
 const sync=()=>{const should=alive&&!lost&&visible&&!document.hidden&&(motion||!video.paused);if(should&&!running){lastTick=0;gsap.ticker.add(tick);running=true;}else if(!should&&running){gsap.ticker.remove(tick);running=false;}host.dataset.rendering=running?'running':'paused';if(visible&&!document.hidden)draw();};
 const move=(event:PointerEvent)=>{if(motion&&event.pointerType==='mouse'){const r=host.getBoundingClientRect();target.set((event.clientX-r.left)/r.width-.5,(event.clientY-r.top)/r.height-.5);}};
 const leave=()=>target.set(0,0);
 const contextLost=(event:Event)=>{event.preventDefault();fail();};canvas.addEventListener('webglcontextlost',contextLost);
 const resize=new ResizeObserver(()=>{layout();if(visible)draw();});resize.observe(host);resize.observe(frame);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});observer.observe(host);
 document.addEventListener('visibilitychange',sync);host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
 const events=['play','pause','ended','loadeddata','seeked'] as const;events.forEach(e=>video.addEventListener(e,sync));
 layout();sync();
 return()=>{alive=false;gsap.ticker.remove(tick);resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',sync);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);canvas.removeEventListener('webglcontextlost',contextLost);events.forEach(e=>video.removeEventListener(e,sync));
  [bg.geometry,plate.geometry,floor.geometry,particlesGeo].forEach(g=>g.dispose());[bgMat,filmMat,floorMat,particlesMat].forEach(m=>m.dispose());videoTexture.dispose();posterTexture.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();delete host.dataset.webgl;delete host.dataset.rendering;delete host.dataset.frames;
 };
}
