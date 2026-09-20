import * as THREE from 'three';
import gsap from 'gsap';
import type {AlphaMedia} from './characterMedia';
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const wall=`varying vec2 vUv;uniform float time;uniform float aspect;uniform float light;uniform float warm;
void main(){vec2 ratio=vec2(aspect,1.);vec2 key=(vUv-vec2(.73+.012*sin(time*.11),.43+.01*cos(time*.14)))*ratio;vec2 fill=(vUv-vec2(.38+.01*cos(time*.09),.62))*ratio;float keyGlow=exp(-dot(key,key)*6.2);float fillGlow=exp(-dot(fill,fill)*7.4);vec2 beamUv=vUv-vec2(.76,.16);float beam=exp(-abs(beamUv.x+beamUv.y*.22)*24.)*smoothstep(.96,.2,beamUv.y)*.17;float horizon=exp(-pow((vUv.y-.86)*9.,2.));float vig=smoothstep(.26,1.,length((vUv-.5)*vec2(aspect*.62,1.)));float grain=fract(sin(dot(gl_FragCoord.xy+floor(time*10.),vec2(12.9898,78.233)))*43758.5453)-.5;vec3 base=mix(vec3(.021,.029,.044),vec3(.027,.026,.029),warm);vec3 cool=vec3(.075,.12,.15)*(keyGlow+beam)*light;vec3 amber=vec3(.15,.063,.028)*(fillGlow*.52+horizon*.2)*light;vec3 col=base+mix(cool,amber,warm*.58)+mix(amber,cool,warm*.25);gl_FragColor=vec4(col*(1.-vig*.34)+grain*.003,1.);}`;
// One synchronized decoder: premultiplied RGB left, coverage right. Sampling
// stays a texel inside each half so filtering never pulls alpha into colour.
const film=`varying vec2 vUv;uniform sampler2D media;uniform vec2 texel;uniform float reveal;uniform vec4 subject;
vec2 packedUv(vec2 uv){return vec2(clamp(uv.x*.5,texel.x,.5-texel.x),clamp(uv.y,texel.y,1.-texel.y));}
float maskAt(vec2 uv){vec2 p=packedUv(uv);return texture2D(media,p+vec2(.5,0.)).r;}
vec4 tapAt(vec2 uv,float lo,float hi){return texture2D(media,vec2(clamp(uv.x,lo,hi),clamp(uv.y,texel.y,1.-texel.y)));}
// The performance is a 1920x1080 colour master packed beside its matte. When
// the full-body subject is enlarged, plain bilinear magnification softens the
// suit and face. Catmull-Rom reconstruction preserves the available detail.
vec4 sharpSample(vec2 uv,float lo,float hi){
 vec2 size=1./texel;vec2 pos=uv*size;vec2 tc=floor(pos-.5)+.5;vec2 f=pos-tc;
 vec2 w0=f*(-.5+f*(1.-.5*f)),w1=1.+f*f*(-2.5+1.5*f),w2=f*(.5+f*(2.-1.5*f)),w3=f*f*(-.5+.5*f);
 vec2 w12=w1+w2,p0=(tc-1.)/size,p3=(tc+2.)/size,p12=(tc+w2/w12)/size;
 vec4 acc=vec4(0.);float sum=0.,w;
 w=w12.x*w0.y;acc+=tapAt(vec2(p12.x,p0.y),lo,hi)*w;sum+=w;
 w=w0.x*w12.y;acc+=tapAt(vec2(p0.x,p12.y),lo,hi)*w;sum+=w;
 w=w12.x*w12.y;acc+=tapAt(vec2(p12.x,p12.y),lo,hi)*w;sum+=w;
 w=w3.x*w12.y;acc+=tapAt(vec2(p3.x,p12.y),lo,hi)*w;sum+=w;
 w=w12.x*w3.y;acc+=tapAt(vec2(p12.x,p3.y),lo,hi)*w;sum+=w;
 return acc/sum;}
void main(){vec2 cuv=vec2(vUv.x*.5,vUv.y);
 float a=sharpSample(cuv+vec2(.5,0.),.5+texel.x,1.-texel.x).r;if(a<.008)discard;
 vec3 col=sharpSample(cuv,texel.x,.5-texel.x).rgb/max(a,.06);
 vec3 soft=tapAt(cuv,texel.x,.5-texel.x).rgb/max(a,.06);
 vec3 detail=clamp(col-soft,vec3(-.075),vec3(.075));
 col=clamp(col+detail*.68*smoothstep(.16,.76,a),0.,1.);
 float left=maskAt(vUv-vec2(texel.x*5.,0.));float right=maskAt(vUv+vec2(texel.x*5.,0.));float top=maskAt(vUv+vec2(0.,texel.y*4.));
 float warmEdge=clamp(a-right,0.,1.);float coolEdge=clamp(a-left,0.,1.);float topEdge=clamp(a-top,0.,1.);
 col+=vec3(.13,.054,.023)*warmEdge*.24+vec3(.035,.085,.105)*coolEdge*.17+vec3(.045,.05,.052)*topEdge*.06;
 gl_FragColor=vec4(clamp(col,0.,1.),a*reveal);}`;
const floorShader=`varying vec2 vUv;uniform float time;uniform float light;uniform float warm;
void main(){vec2 p=(vUv-vec2(.5,.44))*vec2(2.15,1.);float pool=exp(-dot(p,p)*7.2);float ring=exp(-pow(length(p)-.32,2.)*34.)*.13;float edge=smoothstep(0.,.15,vUv.x)*smoothstep(0.,.15,1.-vUv.x)*smoothstep(0.,.12,vUv.y)*smoothstep(0.,.12,1.-vUv.y);vec3 col=mix(vec3(.11,.16,.19),vec3(.19,.105,.073),warm)*(1.+sin(time*.16)*.035);gl_FragColor=vec4(col,(pool+ring)*edge*light*.34);}`;
const auraShader=`varying vec2 vUv;uniform vec4 subject;uniform float time;uniform float light;
void main(){vec2 center=vec2((subject.x+subject.z)*.5,1.-(subject.y+subject.w)*.5);vec2 radius=vec2(max(.12,(subject.z-subject.x)*.9),max(.24,(subject.w-subject.y)*.62));vec2 p=(vUv-center)/radius;float core=exp(-dot(p,p)*2.15);float warm=exp(-dot(p-vec2(.72,.02),p-vec2(.72,.02))*3.8);float cool=exp(-dot(p+vec2(.7,-.06),p+vec2(.7,-.06))*3.4);float pulse=.97+.03*sin(time*.2);vec3 col=vec3(.045,.092,.115)*cool+vec3(.17,.067,.029)*warm+vec3(.038,.047,.058)*core;float edge=smoothstep(1.,.75,abs(vUv.x-.5)*2.);gl_FragColor=vec4(col,(core*.18+warm*.14+cool*.13)*edge*light*pulse);}`;
const shadowShader=`varying vec2 vUv;uniform vec4 subject;uniform float reveal;
void main(){float w=max(.045,(subject.z-subject.x)*.55);vec2 feet=vec2((subject.x+subject.z)*.5,1.-subject.w+.001);vec2 p=(vUv-feet)/vec2(w,.015);float a=exp(-dot(p,p)*2.2)*.24*reveal;gl_FragColor=vec4(.006,.008,.012,a);}`;
/** The approved studio environment, with a genuinely transparent video body.
 * The screen-aligned performance is unchanged; only the floor/shadow follows
 * measured feet. The person is video media, not a replacement rigged avatar. */
export function createAlphaStudio(host:HTMLElement,frame:HTMLElement,video:HTMLVideoElement,media:AlphaMedia,clock:{reveal:number;light:number},motion:boolean,tie=false){
 const canvas=document.createElement('canvas');canvas.className=tie?'webgl-tie-studio':'webgl-studio';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
 const native=()=>{host.dataset.webgl='fallback';host.dataset.rendering='paused';host.dispatchEvent(new Event('characterfallback'));};
 let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'high-performance'});}catch{canvas.remove();native();return()=>{};}
 renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.autoClear=false;
 const screen=new THREE.Scene(),auraScene=new THREE.Scene(),room=new THREE.Scene(),filmScene=new THREE.Scene();
 const ortho=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);ortho.position.z=2;
 const camera=new THREE.PerspectiveCamera(tie?32:38,16/9,.1,40);camera.position.set(0,tie?2.1:2.4,tie?6.4:7);
 const bgMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:wall,depthTest:false,depthWrite:false,uniforms:{time:{value:0},light:{value:1},aspect:{value:1},warm:{value:tie?1:0}}});
 const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),bgMat);screen.add(bg);
 const texture=new THREE.VideoTexture(video);texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;
 const poster=new THREE.TextureLoader().load(media.texturePoster,()=>draw(),undefined,()=>fail());poster.minFilter=THREE.LinearFilter;poster.generateMipmaps=false;
 const subject=new THREE.Vector4();
 const auraMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:auraShader,transparent:true,depthTest:false,depthWrite:false,uniforms:{subject:{value:subject},time:{value:0},light:{value:1}}});
 const aura=new THREE.Mesh(new THREE.PlaneGeometry(2,2),auraMat);auraScene.add(aura);
 const filmMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:film,transparent:true,depthTest:false,depthWrite:false,uniforms:{media:{value:poster},texel:{value:new THREE.Vector2(1/(media.width*2),1/media.height)},reveal:{value:1},subject:{value:subject}}});
 const plate=new THREE.Mesh(new THREE.PlaneGeometry(2,2),filmMat);plate.renderOrder=2;filmScene.add(plate);
 const shadowMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:shadowShader,transparent:true,depthTest:false,depthWrite:false,uniforms:{subject:{value:subject},reveal:{value:1}}});
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2,2),shadowMat);shadow.renderOrder=1;filmScene.add(shadow);
 const floorMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:floorShader,transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:0},light:{value:1},warm:{value:tie?1:0}}});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,9),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-1.3;room.add(floor);
 const small=()=>matchMedia('(max-width:699px)').matches;
 const count=small()?(tie?10:16):(tie?26:44),coords=new Float32Array(count*3);
 for(let i=0;i<count;i++){const rnd=(n:number)=>{const v=Math.sin((i+1)*n)*43758.5453;return v-Math.floor(v);};coords[i*3]=(i%2?-1:1)*(2.5+rnd(13.1)*3);coords[i*3+1]=rnd(73.3)*5-1;coords[i*3+2]=-rnd(41.7)*5;}
 const particlesGeo=new THREE.BufferGeometry();particlesGeo.setAttribute('position',new THREE.BufferAttribute(coords,3));
 const particlesMat=new THREE.PointsMaterial({color:tie?0xa38a7a:0x8b9aa9,size:.012,transparent:true,opacity:tie?.16:.21,depthWrite:false});const particles=new THREE.Points(particlesGeo,particlesMat);room.add(particles);
 const ray=new THREE.Raycaster(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),1.3),anchor=new THREE.Vector3(),target=new THREE.Vector2(),pointer=new THREE.Vector2();
 let alive=true,lost=false,visible=true,running=false,width=1,height=1,elapsed=0,lastTick=0,debt=0,frames=0;
 function fail(){if(!alive||lost)return;lost=true;canvas.style.display='none';gsap.ticker.remove(tick);running=false;native();}
 renderer.debug.onShaderError=fail;
 const layout=()=>{const b=host.getBoundingClientRect();width=Math.max(1,b.width);height=Math.max(1,b.height);const desired=Math.max(small()?1.25:1.5,Math.min(devicePixelRatio||1,small()?1.5:2));const fourKCap=Math.min(3840/width,2160/height);renderer.setPixelRatio(Math.max(1,Math.min(desired,fourKCap)));renderer.setSize(width,height,false);bgMat.uniforms.aspect.value=width/height;host.dataset.mediaResolution=`${media.width}x${media.height}`;host.dataset.renderQuality='adaptive-4k-buffer';};
 function draw(){
  if(!alive||lost)return;
  const b=host.getBoundingClientRect(),f=frame.getBoundingClientRect(),x=f.left-b.left,y=height-(f.top-b.top)-f.height;
  const hasFrame=video.readyState>=2&&(video.currentTime>0||!video.paused||(!tie&&motion));
  filmMat.uniforms.media.value=hasFrame?texture:poster;
  const box=media.boxes[hasFrame?Math.min(media.boxes.length-1,Math.floor(video.currentTime*media.fps)):media.boxes.length-1];
  subject.set(box[0],box[1],box[2],box[3]);filmMat.uniforms.reveal.value=clock.reveal;shadowMat.uniforms.reveal.value=clock.reveal;
  bgMat.uniforms.light.value=clock.light;floorMat.uniforms.light.value=clock.light;auraMat.uniforms.light.value=clock.light;bgMat.uniforms.time.value=elapsed;floorMat.uniforms.time.value=elapsed;auraMat.uniforms.time.value=elapsed;
  const scroll=motion&&!tie?Math.min(.12,Math.max(0,-b.top/height)*.12):0;pointer.lerp(target,.035);
  camera.position.set(!tie&&motion?pointer.x*.06:0,(tie?2.1:2.4)+(!tie&&motion?pointer.y*.025:0),(tie?6.4:7)-scroll-(tie?Math.min(.55,video.currentTime/9.6*.55):0));camera.lookAt(0,tie?.3:.4,0);camera.aspect=f.width/f.height;camera.updateProjectionMatrix();camera.updateMatrixWorld();
  ray.setFromCamera(new THREE.Vector2(box[0]+box[2]-1,1-2*box[3]),camera);
  if(ray.ray.intersectPlane(ground,anchor)){floor.position.x=anchor.x;floor.position.z=anchor.z-.54;}
  particles.position.y=motion?Math.sin(elapsed*.12)*.035:0;
  try{renderer.setScissorTest(false);renderer.setViewport(0,0,width,height);renderer.clear();if(!tie)renderer.render(screen,ortho);renderer.setViewport(x,y,f.width,f.height);renderer.setScissor(x,y,f.width,f.height);renderer.setScissorTest(true);renderer.render(auraScene,ortho);renderer.render(room,camera);renderer.clearDepth();renderer.render(filmScene,ortho);renderer.setScissorTest(false);if(!lost){host.dataset.webgl='ready';host.dataset.character='alpha';host.dataset.frames=String(++frames);}}
  catch{fail();}
 }
 function tick(time:number){if(!lastTick)lastTick=time;const d=Math.min(.05,time-lastTick);elapsed+=d;debt+=d;lastTick=time;if(debt>=1/(small()?24:30)){debt%=1/(small()?24:30);draw();}}
 const sync=()=>{const should=alive&&!lost&&visible&&!document.hidden&&((motion&&!tie)||!video.paused);if(should&&!running){lastTick=0;gsap.ticker.add(tick);running=true;}else if(!should&&running){gsap.ticker.remove(tick);running=false;}host.dataset.rendering=running?'running':'paused';if(visible&&!document.hidden)draw();};
 const move=(e:PointerEvent)=>{if(motion&&!tie&&e.pointerType==='mouse'){const b=host.getBoundingClientRect();target.set((e.clientX-b.left)/b.width-.5,(e.clientY-b.top)/b.height-.5);}};
 const leave=()=>target.set(0,0),contextLost=(e:Event)=>{e.preventDefault();fail();};canvas.addEventListener('webglcontextlost',contextLost);
 const resize=new ResizeObserver(()=>{layout();if(visible)draw();});resize.observe(host);resize.observe(frame);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});observer.observe(host);
 let presentedCallback=0;
 const presented=()=>{if(!alive)return;texture.needsUpdate=true;if(visible&&!document.hidden&&(video.paused||!running))draw();presentedCallback=video.requestVideoFrameCallback(presented);};
 if('requestVideoFrameCallback' in video)presentedCallback=video.requestVideoFrameCallback(presented);
 const events=['play','pause','ended','loadeddata','seeked'] as const;events.forEach(e=>video.addEventListener(e,sync));document.addEventListener('visibilitychange',sync);host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
 layout();sync();
 return()=>{alive=false;if(presentedCallback)video.cancelVideoFrameCallback(presentedCallback);gsap.ticker.remove(tick);resize.disconnect();observer.disconnect();events.forEach(e=>video.removeEventListener(e,sync));document.removeEventListener('visibilitychange',sync);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);canvas.removeEventListener('webglcontextlost',contextLost);[bg.geometry,aura.geometry,plate.geometry,shadow.geometry,floor.geometry,particlesGeo].forEach(g=>g.dispose());[bgMat,auraMat,filmMat,shadowMat,floorMat,particlesMat].forEach(m=>m.dispose());texture.dispose();poster.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();delete host.dataset.webgl;delete host.dataset.rendering;delete host.dataset.frames;delete host.dataset.character;delete host.dataset.mediaResolution;delete host.dataset.renderQuality;};
}
