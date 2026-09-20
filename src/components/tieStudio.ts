import {createAlphaStudio} from './alphaStudio';
import type {AlphaMedia} from './characterMedia';
import * as THREE from 'three';
import gsap from 'gsap';

export type TieClock = { reveal:number; light:number };
const vertex=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
// Same navy void as the entrance studio, warmed toward the site accent for a
// quieter, closer-in beat rather than a repeat of the hero's cooler glow.
const background=`varying vec2 vUv; uniform float time; uniform float light; uniform float aspect;
void main(){
 vec2 p=(vUv-vec2(.5,.5))*vec2(aspect,1.);
 p.x+=sin(time*.1)*.02; p.y+=cos(time*.13)*.012;
 float glow=exp(-dot(p,p)*4.6);
 float vig=smoothstep(.2,1.,length((vUv-.5)*vec2(aspect*.62,1.)));
 float grain=fract(sin(dot(gl_FragCoord.xy+floor(time*12.),vec2(12.9898,78.233)))*43758.5453)-.5;
 vec3 col=vec3(.03,.032,.036)+vec3(.058,.03,.024)*glow*light;
 col*=1.-vig*.24; col+=grain*.003;
 gl_FragColor=vec4(col,1.);
}`;
// Original RGB kept untouched in the interior; only empty borders feather.
// A slightly tighter crop than the hero (closer-in character beat) without
// cutting the settled, hands-composed pose out of frame.
const film=`varying vec2 vUv;uniform sampler2D media;uniform float reveal;uniform float zoom;
void main(){
 vec2 c=(vUv-.5)/zoom+.5;
 if(c.x<0.||c.x>1.||c.y<0.||c.y>1.){discard;}
 vec3 col=texture2D(media,c).rgb;
 float a=smoothstep(0.,.1,c.x)*smoothstep(0.,.08,1.-c.x);
 float protect=smoothstep(.3,.4,c.x)*(1.-smoothstep(.9,.96,c.x));
 a*=smoothstep(0.,.03,c.y)*mix(smoothstep(0.,.14,1.-c.y),smoothstep(0.,.02,1.-c.y),protect);
 gl_FragColor=vec4(col,a*reveal);
}`;
const floorShader=`varying vec2 vUv;uniform float light;uniform float time;
void main(){vec2 p=(vUv-vec2(.5,.42))*vec2(2.,1.);float pool=exp(-dot(p,p)*8.);
 float edge=smoothstep(0.,.15,vUv.x)*smoothstep(0.,.15,1.-vUv.x)*smoothstep(0.,.12,vUv.y)*smoothstep(0.,.12,1.-vUv.y);
 vec3 col=vec3(.15,.125,.11)*(1.+sin(time*.16)*.04);
 gl_FragColor=vec4(col,pool*edge*light*.3);}`;

/** A quieter sibling of createStudio (studio.ts): same navy-void/feathered
 * plate technique, warmer glow, a slow one-shot dolly-in instead of scroll
 * parallax, and a held settle once the performance ends — it never loops.
 */
export function createTieStudio(host:HTMLElement,frame:HTMLElement,video:HTMLVideoElement,poster:string,clock:TieClock,motion:boolean,alpha?:AlphaMedia){
 if(alpha)return createAlphaStudio(host,frame,video,alpha,clock,motion,true);
 const canvas=document.createElement('canvas');canvas.className='webgl-tie-studio';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
 let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});}catch{canvas.remove();host.dataset.webgl='fallback';return()=>{};}
 renderer.outputColorSpace=THREE.LinearSRGBColorSpace;
 renderer.autoClear=false;
 const screen=new THREE.Scene(),room=new THREE.Scene();
 const ortho=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);ortho.position.z=2;
 const camera=new THREE.PerspectiveCamera(32,16/9,.1,40);camera.position.set(0,2.1,6.4);camera.lookAt(0,.3,0);
 const bgMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:background,depthTest:false,depthWrite:false,uniforms:{time:{value:0},light:{value:1},aspect:{value:1}}});
 const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),bgMat);bg.renderOrder=0;screen.add(bg);
 const videoTexture=new THREE.VideoTexture(video);videoTexture.minFilter=THREE.LinearFilter;videoTexture.magFilter=THREE.LinearFilter;videoTexture.generateMipmaps=false;
 const posterTexture=new THREE.TextureLoader().load(poster,()=>draw());posterTexture.minFilter=THREE.LinearFilter;
 const filmMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:film,transparent:true,depthTest:false,depthWrite:false,uniforms:{media:{value:posterTexture},reveal:{value:1},zoom:{value:1.14}}});
 const plate=new THREE.Mesh(new THREE.PlaneGeometry(2,2),filmMat);plate.renderOrder=2;
 const filmScene=new THREE.Scene();filmScene.add(plate);
 const floorMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:floorShader,transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:0},light:{value:1}}});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,9),floorMat);floor.rotation.x=-Math.PI/2;floor.position.set(0,-1.3,-1.8);room.add(floor);
 const small=()=>matchMedia('(max-width:699px)').matches;
 const count=small()?10:26,coords=new Float32Array(count*3);
 for(let i=0;i<count;i++){const rnd=(n:number)=>{const v=Math.sin((i+1)*n)*43758.5453;return v-Math.floor(v);};coords[i*3]=(i%2?-1:1)*(2.5+rnd(13.1)*3);coords[i*3+1]=rnd(73.3)*5-1;coords[i*3+2]=-rnd(41.7)*5;}
 const particlesGeo=new THREE.BufferGeometry();particlesGeo.setAttribute('position',new THREE.BufferAttribute(coords,3));
 const particlesMat=new THREE.PointsMaterial({color:0xa38a7a,size:.011,transparent:true,opacity:.16,depthWrite:false});const particles=new THREE.Points(particlesGeo,particlesMat);room.add(particles);
 let alive=true,lost=false,visible=true,running=false,width=1,height=1,elapsed=0,lastTick=0,frameDebt=0,frames=0;
 const dolly={z:0};
 const fail=()=>{lost=true;host.dataset.webgl='fallback';host.dataset.rendering='paused';canvas.style.display='none';gsap.ticker.remove(tick);running=false;};
 renderer.debug.onShaderError=()=>fail();
 const layout=()=>{const box=host.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);renderer.setPixelRatio(Math.min(devicePixelRatio,small()?1:1.5));renderer.setSize(width,height,false);bgMat.uniforms.aspect.value=width/height;};
 function draw(){
  if(!alive||lost)return;
  const box=host.getBoundingClientRect(),f=frame.getBoundingClientRect();
  const x=f.left-box.left,y=height-(f.top-box.top)-f.height;
  filmMat.uniforms.media.value=video.readyState>=2&&(video.currentTime>0||!video.paused)?videoTexture:posterTexture;
  filmMat.uniforms.reveal.value=clock.reveal;bgMat.uniforms.light.value=clock.light;floorMat.uniforms.light.value=clock.light;
  bgMat.uniforms.time.value=elapsed;floorMat.uniforms.time.value=elapsed;
  camera.position.z=6.4-dolly.z;camera.lookAt(0,.3,0);
  particles.position.y=motion?Math.sin(elapsed*.1)*.03:0;
  try{
   renderer.setScissorTest(false);renderer.setViewport(0,0,width,height);renderer.clear();renderer.render(screen,ortho);
   renderer.setViewport(x,y,f.width,f.height);renderer.setScissor(x,y,f.width,f.height);renderer.setScissorTest(true);camera.aspect=f.width/f.height;camera.updateProjectionMatrix();renderer.render(room,camera);
   renderer.setScissorTest(false);renderer.clearDepth();renderer.render(filmScene,ortho);
   host.dataset.webgl='ready';host.dataset.frames=String(++frames);
  }catch{fail();}
 }
 function tick(time:number){if(!lastTick)lastTick=time;const delta=Math.min(.05,time-lastTick);elapsed+=delta;frameDebt+=delta;lastTick=time;const interval=1/(small()?24:30);if(frameDebt>=interval){frameDebt%=interval;draw();}}
 const sync=()=>{const should=alive&&!lost&&visible&&!document.hidden&&!video.paused;if(should&&!running){lastTick=0;gsap.ticker.add(tick);running=true;}else if(!should&&running){gsap.ticker.remove(tick);running=false;}host.dataset.rendering=running?'running':'paused';if(visible&&!document.hidden)draw();};
 const contextLost=(event:Event)=>{event.preventDefault();fail();};canvas.addEventListener('webglcontextlost',contextLost);
 const resize=new ResizeObserver(()=>{layout();if(visible)draw();});resize.observe(host);resize.observe(frame);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});observer.observe(host);
 document.addEventListener('visibilitychange',sync);
 const events=['play','pause','ended','loadeddata','seeked'] as const;events.forEach(e=>video.addEventListener(e,sync));
 let dollyTween:gsap.core.Tween|undefined;
 if(motion)dollyTween=gsap.to(dolly,{z:.55,duration:9.6,ease:'power1.out'});else dolly.z=.55;
 layout();sync();draw();
 return()=>{alive=false;gsap.ticker.remove(tick);dollyTween?.kill();resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',sync);canvas.removeEventListener('webglcontextlost',contextLost);events.forEach(e=>video.removeEventListener(e,sync));
  [bg.geometry,plate.geometry,floor.geometry,particlesGeo].forEach(g=>g.dispose());[bgMat,filmMat,floorMat,particlesMat].forEach(m=>m.dispose());videoTexture.dispose();posterTexture.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();delete host.dataset.webgl;delete host.dataset.rendering;delete host.dataset.frames;
 };
}
