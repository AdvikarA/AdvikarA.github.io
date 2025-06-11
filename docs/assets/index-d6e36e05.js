import*as e from"https://cdn.skypack.dev/three@0.132.2";import{OrbitControls as Qi}from"https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";import"https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js";import{gsap as Nt}from"https://cdn.skypack.dev/gsap@3.9.1";import{EffectComposer as Ui}from"https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js";import{RenderPass as _i}from"https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js";import{UnrealBloomPass as $i}from"https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js";(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function o(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(s){if(s.ep)return;s.ep=!0;const r=o(s);fetch(s.href,r)}})();function Ni(t){const i=new e.SphereGeometry(5,32,32),o=new e.MeshBasicMaterial({color:16777113,transparent:!0,opacity:.9}),a=new e.Mesh(i,o);a.position.set(0,0,0),t.add(a);const s=new e.PointLight(16777113,1,300);s.position.set(0,0,0),t.add(s);const r=new e.SphereGeometry(6,32,32),l=new e.ShaderMaterial({uniforms:{c:{type:"f",value:.65},p:{type:"f",value:1.8},glowColor:{type:"c",value:new e.Color(16777113)}},vertexShader:`
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,fragmentShader:`
            uniform vec3 glowColor;
            uniform float c;
            uniform float p;
            varying vec3 vNormal;
            void main() {
                float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                gl_FragColor = vec4(glowColor, intensity * 1.5); // Adjusted glow intensity multiplier
            }
        `,side:e.BackSide,blending:e.AdditiveBlending,transparent:!0}),c=new e.Mesh(r,l);return t.add(c),a.userData.collisionRadius=8,a}function Xi(t,i,o=6135020,a=128){const s=new e.BufferGeometry,r=new e.LineBasicMaterial({color:o,transparent:!0,opacity:.3,blending:e.AdditiveBlending}),l=[];for(let w=0;w<=a;w++){const m=w/a*Math.PI*2,x=Math.cos(m)*t,M=Math.sin(m)*t;l.push(new e.Vector3(x,0,M))}s.setFromPoints(l);const c=new e.Line(s,r);return i.add(c),c}function _(t,i,o,a=null){const s=t.position.clone(),r=Math.atan2(s.z,s.x);return t.userData.orbit={radius:i,speed:o,angle:r,center:a?a.position:new e.Vector3(0,0,0),originalY:s.y},t}function Ki(t,i,o){Object.values(t).forEach(a=>{if(a.userData.orbit){a.userData.orbit.angle+=a.userData.orbit.speed*i;const s=Math.cos(a.userData.orbit.angle)*a.userData.orbit.radius,r=Math.sin(a.userData.orbit.angle)*a.userData.orbit.radius;a.position.x=s+a.userData.orbit.center.x,a.position.z=r+a.userData.orbit.center.z,a.children.forEach(l=>{l.userData.isLabel&&l.lookAt(o.position)})}})}function Zi(t,i){const o=document.querySelector(".minimap-ship");if(!o)return;document.querySelectorAll(".minimap-planet").forEach(c=>c.remove());const s=document.querySelector(".minimap"),r=s.offsetWidth/2,l=r/150;if(Object.entries(t).forEach(([c,w])=>{if(c.includes("Project")||c==="ampleHarvest"||c==="qaoa"||c==="facies"||c==="boulder"||c==="momentum"||c==="burger"||c==="galaxsea"||c==="skyfarer")return;const m=document.createElement("div");m.className=`minimap-planet ${c}`;const x=w.position.x*l+r,M=w.position.z*l+r;m.style.left=`${x}px`,m.style.top=`${M}px`,s.appendChild(m)}),i){const c=i.position.x*l+r,w=i.position.z*l+r;o.style.left=`${c}px`,o.style.top=`${w}px`}}const ei=document.querySelector("canvas.webgl"),v=new e.Scene;v.background=new e.Color(2068);document.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>{const t=document.querySelector(".loading-screen");t&&(t.style.display="none")},1e3)});let Jt=!1;const p={},_t=Ni(v),Ji=[40,60,80,100,120,140];Ji.forEach(t=>{Xi(t,v)});function mt(t,i,o){const a=t.x+i*Math.cos(o),s=0,r=t.z+i*Math.sin(o);return new e.Vector3(a,s,r)}function Be(t,i=16777215,o=50,a=1e3){const s=new e.BufferGeometry,r=new Float32Array(o*3),l=new Float32Array(o),c=new Float32Array(o*3);for(let g=0;g<o;g++){const h=g*3,u=Math.random()*Math.PI*2,P=Math.random()*Math.PI,f=Math.random()*2;r[h]=t.x+f*Math.sin(P)*Math.cos(u),r[h+1]=t.y+f*Math.sin(P)*Math.sin(u),r[h+2]=t.z+f*Math.cos(P),l[g]=Math.random()*.3+.1;const T=(i>>16&255)/255,j=(i>>8&255)/255,$=(i&255)/255;c[h]=T*(.8+Math.random()*.4),c[h+1]=j*(.8+Math.random()*.4),c[h+2]=$*(.8+Math.random()*.4)}s.setAttribute("position",new e.BufferAttribute(r,3)),s.setAttribute("size",new e.BufferAttribute(l,1)),s.setAttribute("color",new e.BufferAttribute(c,3));const w=new e.PointsMaterial({size:.5,transparent:!0,opacity:1,vertexColors:!0,blending:e.AdditiveBlending,sizeAttenuation:!0,depthWrite:!1}),m=new e.Points(s,w);m.userData.velocities=[];for(let g=0;g<o;g++)m.userData.velocities.push({x:(Math.random()-.5)*.2,y:(Math.random()-.5)*.2,z:(Math.random()-.5)*.2});v.add(m);const x=Date.now(),M=()=>{const g=m.geometry.attributes.position.array,h=m.geometry.attributes.size.array,u=m.geometry.attributes.color.array,P=Date.now()-x,f=Math.min(P/a,1);for(let T=0;T<o;T++){const j=T*3;g[j]+=m.userData.velocities[T].x,g[j+1]+=m.userData.velocities[T].y,g[j+2]+=m.userData.velocities[T].z,h[T]*=.98,u[j+0]*=.99,u[j+1]*=.99,u[j+2]*=.99}m.geometry.attributes.position.needsUpdate=!0,m.geometry.attributes.size.needsUpdate=!0,m.geometry.attributes.color.needsUpdate=!0,m.material.opacity=1-f,f<1?requestAnimationFrame(M):(v.remove(m),m.geometry.dispose(),m.material.dispose())};return M(),m}function Qt(t,i,o=50,a=.1,s=.02){const r=new e.BufferGeometry,l=new Float32Array(o*3),c=new e.PointsMaterial({color:i,size:a,transparent:!0,opacity:.7,blending:e.AdditiveBlending,sizeAttenuation:!0}),w=t.geometry.parameters.radius;for(let x=0;x<o;x++){const M=x*3,g=w*1.2+Math.random()*w*.5,h=Math.random()*Math.PI*2,u=Math.random()*Math.PI;l[M]=g*Math.sin(u)*Math.cos(h),l[M+1]=g*Math.sin(u)*Math.sin(h),l[M+2]=g*Math.cos(u)}r.setAttribute("position",new e.BufferAttribute(l,3));const m=new e.Points(r,c);return m.userData.originalPositions=l.slice(),m.userData.speed=s,m.userData.time=0,t.add(m),m}function ta(){const t=document.querySelectorAll(".typed-text"),i=document.querySelectorAll(".massive-name span");t.forEach(a=>{a.textContent="",a.classList.remove("typing")}),i.forEach(a=>{a.classList.remove("visible")});const o=window.setTimeout(function(){},0);for(let a=0;a<=o;a++)window.clearTimeout(a)}function N(t,i,o=!1){const a=document.createElement("canvas");a.width=512,a.height=160;const s=a.getContext("2d");s.fillStyle="rgba(0, 0, 0, 0)",s.fillRect(0,0,a.width,a.height),o?s.font="bold 30px Orbitron, Arial":s.font="bold 42px Orbitron, Arial",s.textAlign="center",s.textBaseline="middle";const r=t.toUpperCase().split(""),l=o?3:5,c=s.createLinearGradient(0,0,a.width,0);c.addColorStop(0,"#5d9cec"),c.addColorStop(.5,"#ffffff"),c.addColorStop(1,"#5d9cec"),s.fillStyle=c,s.shadowColor="#5d9cec",s.shadowBlur=15;let w=0;for(let h=0;h<r.length;h++)w+=s.measureText(r[h]).width+(h<r.length-1?l:0);let m=(a.width-w)/2;for(let h=0;h<r.length;h++)s.fillText(r[h],m+s.measureText(r[h]).width/2,a.height/2),m+=s.measureText(r[h]).width+l;const x=new e.CanvasTexture(a);x.needsUpdate=!0;const M=new e.SpriteMaterial({map:x,transparent:!0,depthTest:!1}),g=new e.Sprite(M);return o?(g.scale.set(6,3,1),g.position.copy(i),g.position.y+=6):(g.scale.set(8,4,1),g.position.copy(i),g.position.y+=8),v.add(g),g}new e.TextureLoader;const ea=new e.IcosahedronGeometry(5,1),ii=new e.MeshPhysicalMaterial({color:2719929,roughness:.5,metalness:.2,clearcoat:.3,clearcoatRoughness:.25,envMapIntensity:1,emissive:623843,emissiveIntensity:.2,flatShading:!0}),Mt=document.createElement("canvas"),Yt=Mt.getContext("2d");Mt.width=512;Mt.height=512;Yt.fillStyle="#1a73e8";Yt.fillRect(0,0,Mt.width,Mt.height);Yt.fillStyle="#2e7d32";for(let t=0;t<8;t++){const i=Math.random()*Mt.width,o=Math.random()*Mt.height,a=30+Math.random()*100;Yt.beginPath(),Yt.arc(i,o,a,0,Math.PI*2),Yt.fill()}const ia=new e.CanvasTexture(Mt);ii.map=ia;const It=new e.Mesh(ea,ii);It.position.set(0,0,0);v.add(It);p.home=It;Qt(It,6135020,100,.15,.01);const qe=N("Home",It.position),aa=new e.IcosahedronGeometry(5,1),ai=new e.MeshPhysicalMaterial({color:12597547,roughness:.7,metalness:.1,clearcoat:.2,clearcoatRoughness:.4,envMapIntensity:.8,emissive:15158332,emissiveIntensity:.2,flatShading:!0}),ct=document.createElement("canvas"),lt=ct.getContext("2d");ct.width=512;ct.height=512;lt.fillStyle="#e74c3c";lt.fillRect(0,0,ct.width,ct.height);lt.fillStyle="#c0392b";for(let t=0;t<30;t++){const i=Math.random()*ct.width,o=Math.random()*ct.height,a=10+Math.random()*50;lt.beginPath(),lt.arc(i,o,a,0,Math.PI*2),lt.fill()}lt.fillStyle="#a93226";for(let t=0;t<20;t++){const i=Math.random()*ct.width,o=Math.random()*ct.height,a=5+Math.random()*20;lt.beginPath(),lt.arc(i,o,a,0,Math.PI*2),lt.fill()}const oa=new e.CanvasTexture(ct);ai.map=oa;const W=new e.Mesh(aa,ai);W.position.set(40,0,40);v.add(W);p.projects=W;Qt(W,15158332,80,.12,.015);const Fe=N("Projects Hub",W.position),na=new e.IcosahedronGeometry(3.5,1),oi=new e.MeshPhysicalMaterial({color:15965202,roughness:.6,metalness:.3,clearcoat:.4,clearcoatRoughness:.3,envMapIntensity:.9,emissive:15844367,emissiveIntensity:.2,flatShading:!0}),dt=document.createElement("canvas"),ot=dt.getContext("2d");dt.width=512;dt.height=512;ot.fillStyle="#f39c12";ot.fillRect(0,0,dt.width,dt.height);ot.fillStyle="#e67e22";for(let t=0;t<10;t++){const i=Math.random()*dt.width,o=Math.random()*dt.height;for(let a=0;a<5;a++){const s=20+a*15,r=Math.random()*Math.PI*2,l=r+Math.PI*(1+Math.random());ot.beginPath(),ot.arc(i,o,s,r,l),ot.lineWidth=10+Math.random()*10,ot.stroke()}}ot.fillStyle="#d35400";for(let t=0;t<15;t++){const i=Math.random()*dt.width,o=Math.random()*dt.height,a=5+Math.random()*15;ot.beginPath(),ot.arc(i,o,a,0,Math.PI*2),ot.fill()}const sa=new e.CanvasTexture(dt);oi.map=sa;const Kt=new e.Mesh(na,oi);Kt.position.set(-30,0,35);v.add(Kt);p.work=Kt;Qt(Kt,15965202,70,.1,.018);const kt=document.createElement("canvas");kt.width=768;kt.height=160;const Lt=kt.getContext("2d");Lt.fillStyle="rgba(0, 0, 0, 0)";Lt.fillRect(0,0,kt.width,kt.height);Lt.fillStyle="#ffffff";Lt.font="bold 42px Orbitron, Arial";Lt.textAlign="center";Lt.textBaseline="middle";Lt.fillText("Work",kt.width/2,kt.height/2);const ra=new e.CanvasTexture(kt),la=new e.SpriteMaterial({map:ra,transparent:!0}),Ae=new e.Sprite(la);Ae.scale.set(15,5,1);Ae.position.set(0,8,0);Kt.add(Ae);const J={},ca=new e.IcosahedronGeometry(1.5,1),ni=new e.MeshPhysicalMaterial({color:38886,roughness:.5,metalness:.4,clearcoat:.3,clearcoatRoughness:.25,emissive:623843,emissiveIntensity:.2,flatShading:!0}),tt=document.createElement("canvas"),H=tt.getContext("2d");tt.width=512;tt.height=512;H.fillStyle="#0097e6";H.fillRect(0,0,tt.width,tt.height);H.strokeStyle="#00a8ff";H.lineWidth=2;for(let t=0;t<20;t++){const i=t*(tt.height/20);H.beginPath(),H.moveTo(0,i),H.lineTo(tt.width,i),H.stroke()}for(let t=0;t<20;t++){const i=t*(tt.width/20);H.beginPath(),H.moveTo(i,0),H.lineTo(i,tt.height),H.stroke()}H.fillStyle="#ffffff";for(let t=0;t<50;t++){const i=Math.random()*tt.width,o=Math.random()*tt.height,a=2+Math.random()*4;H.beginPath(),H.arc(i,o,a,0,Math.PI*2),H.fill()}const da=new e.CanvasTexture(tt);ni.map=da;const zt=new e.Mesh(ca,ni),te={center:W.position.clone(),radius:15,angle:0*Math.PI*2/8,speed:.002};zt.position.copy(mt(te.center,te.radius,te.angle));v.add(zt);J.ampleharvest=zt;zt.userData.orbit=te;p.ampleharvest=zt;const He=N("AmpleHarvest",zt.position,!0),pa=new e.IcosahedronGeometry(1.5,1),si=new e.MeshPhysicalMaterial({color:52937,roughness:.5,metalness:.4,clearcoat:.3,clearcoatRoughness:.25,emissive:47252,emissiveIntensity:.2,flatShading:!0}),At=document.createElement("canvas"),y=At.getContext("2d");At.width=512;At.height=512;y.fillStyle="#00cec9";y.fillRect(0,0,At.width,At.height);y.strokeStyle="#81ecec";y.lineWidth=3;for(let t=0;t<10;t++){const i=50+t*40;y.beginPath(),y.moveTo(0,i),y.lineTo(At.width,i),y.stroke();for(let o=0;o<8;o++){const a=60+o*60,s=Math.floor(Math.random()*3);s===0?(y.fillStyle="#74b9ff",y.fillRect(a-15,i-15,30,30),y.fillStyle="#ffffff",y.font="16px Arial",y.fillText("H",a-5,i+5)):s===1?(y.fillStyle="#0984e3",y.beginPath(),y.arc(a,i,15,0,Math.PI*2),y.fill(),y.fillStyle="#ffffff",y.font="16px Arial",y.fillText("X",a-5,i+5)):(y.fillStyle="#dfe6e9",y.beginPath(),y.arc(a,i,5,0,Math.PI*2),y.fill(),t<9&&(y.beginPath(),y.moveTo(a,i),y.lineTo(a,i+40),y.stroke(),y.beginPath(),y.arc(a,i+40,15,0,Math.PI*2),y.stroke(),y.beginPath(),y.moveTo(a-10,i+30),y.lineTo(a+10,i+50),y.moveTo(a+10,i+30),y.lineTo(a-10,i+50),y.stroke()))}}const ga=new e.CanvasTexture(At);si.map=ga;const Dt=new e.Mesh(pa,si),ee={center:W.position.clone(),radius:15,angle:1*Math.PI*2/8,speed:.002};Dt.position.copy(mt(ee.center,ee.radius,ee.angle));v.add(Dt);J.qaoa=Dt;Dt.userData.orbit=ee;p.qaoa=Dt;const We=N("QAOA",Dt.position,!0),ha=new e.IcosahedronGeometry(1.5,1),ri=new e.MeshPhysicalMaterial({color:7649791,roughness:.5,metalness:.3,clearcoat:.2,clearcoatRoughness:.3,emissive:623843,emissiveIntensity:.2,flatShading:!0}),C=document.createElement("canvas"),bt=C.getContext("2d");C.width=512;C.height=512;bt.fillStyle="#74b9ff";bt.fillRect(0,0,C.width,C.height);const ma=[{color:"#0984e3",y:C.height*.1,height:C.height*.15},{color:"#6c5ce7",y:C.height*.25,height:C.height*.1},{color:"#fdcb6e",y:C.height*.35,height:C.height*.12},{color:"#e17055",y:C.height*.47,height:C.height*.08},{color:"#d63031",y:C.height*.55,height:C.height*.13},{color:"#6c5ce7",y:C.height*.68,height:C.height*.1},{color:"#00b894",y:C.height*.78,height:C.height*.22}];ma.forEach(t=>{bt.fillStyle=t.color,bt.fillRect(0,t.y,C.width,t.height)});bt.fillStyle="rgba(255, 255, 255, 0.1)";for(let t=0;t<200;t++){const i=Math.random()*C.width,o=Math.random()*C.height,a=1+Math.random()*3;bt.beginPath(),bt.arc(i,o,a,0,Math.PI*2),bt.fill()}const ua=new e.CanvasTexture(C);ri.map=ua;const Et=new e.Mesh(ha,ri),ie={center:W.position.clone(),radius:15,angle:2*Math.PI*2/8,speed:.002};Et.position.copy(mt(ie.center,ie.radius,ie.angle));v.add(Et);J.facies=Et;Et.userData.orbit=ie;p.facies=Et;const Ye=N("Facies Predictor",Et.position,!0),fa=new e.IcosahedronGeometry(1.5,1),li=new e.MeshPhysicalMaterial({color:10656766,roughness:.7,metalness:.1,clearcoat:.1,clearcoatRoughness:.5,emissive:7101671,emissiveIntensity:.2,flatShading:!0}),pt=document.createElement("canvas"),F=pt.getContext("2d");pt.width=512;pt.height=512;F.fillStyle="#a29bfe";F.fillRect(0,0,pt.width,pt.height);for(let t=0;t<30;t++){const i=Math.random()*pt.width,o=Math.random()*pt.height,a=10+Math.random()*40,s=F.createRadialGradient(i,o,0,i,o,a);s.addColorStop(0,"#8c7ae6"),s.addColorStop(.7,"#9c88ff"),s.addColorStop(1,"#a29bfe"),F.fillStyle=s,F.beginPath(),F.arc(i,o,a,0,Math.PI*2),F.fill(),F.strokeStyle="#7158e2",F.lineWidth=2,F.beginPath(),F.arc(i,o,a,0,Math.PI*2),F.stroke()}F.fillStyle="#7158e2";for(let t=0;t<200;t++){const i=Math.random()*pt.width,o=Math.random()*pt.height,a=1+Math.random()*3;F.beginPath(),F.arc(i,o,a,0,Math.PI*2),F.fill()}const ya=new e.CanvasTexture(pt);li.map=ya;const Rt=new e.Mesh(fa,li),ae={center:W.position.clone(),radius:15,angle:3*Math.PI*2/8,speed:.002};Rt.position.copy(mt(ae.center,ae.radius,ae.angle));v.add(Rt);J.boulder=Rt;Rt.userData.orbit=ae;p.boulder=Rt;const Ve=N("Boulder Detection",Rt.position,!0),ba=new e.IcosahedronGeometry(1.5,1),ci=new e.MeshPhysicalMaterial({color:16632686,roughness:.5,metalness:.3,clearcoat:.2,clearcoatRoughness:.3,emissive:15965202,emissiveIntensity:.2,flatShading:!0}),st=document.createElement("canvas"),O=st.getContext("2d");st.width=512;st.height=512;O.fillStyle="#fdcb6e";O.fillRect(0,0,st.width,st.height);O.strokeStyle="#ffeaa7";O.lineWidth=3;for(let t=0;t<10;t++){const i=t*50;O.beginPath();for(let o=0;o<st.width;o+=2){const a=15+Math.random()*10,s=.02+Math.random()*.01,r=i+Math.sin(o*s)*a;o===0?O.moveTo(o,r):O.lineTo(o,r)}O.stroke()}O.fillStyle="#e17055";for(let t=0;t<100;t++){const i=Math.random()*st.width,o=Math.random()*st.height,a=2+Math.random()*4;O.beginPath(),O.arc(i,o,a,0,Math.PI*2),O.fill()}O.fillStyle="#ff9f43";for(let t=0;t<20;t++){const i=Math.random()*st.width,o=Math.random()*st.height,a=5+Math.random()*10,s=O.createRadialGradient(i,o,0,i,o,a);s.addColorStop(0,"#ffffff"),s.addColorStop(.4,"#ff9f43"),s.addColorStop(1,"rgba(253, 203, 110, 0)"),O.fillStyle=s,O.beginPath(),O.arc(i,o,a,0,Math.PI*2),O.fill()}const va=new e.CanvasTexture(st);ci.map=va;const Ot=new e.Mesh(ba,ci),oe={center:W.position.clone(),radius:15,angle:4*Math.PI*2/8,speed:.002};Ot.position.copy(mt(oe.center,oe.radius,oe.angle));v.add(Ot);J.momentum=Ot;Ot.userData.orbit=oe;p.momentum=Ot;const Qe=N("Momentum",Ot.position,!0),wa=new e.IcosahedronGeometry(1.5,1),di=new e.MeshPhysicalMaterial({color:16771751,roughness:.5,metalness:.2,clearcoat:.2,clearcoatRoughness:.3,emissive:16632686,emissiveIntensity:.2,flatShading:!0}),z=document.createElement("canvas"),U=z.getContext("2d");z.width=512;z.height=512;U.fillStyle="#ffeaa7";U.fillRect(0,0,z.width,z.height);const xa=[{color:"#e17055",y:z.height*.3,height:z.height*.1},{color:"#55efc4",y:z.height*.4,height:z.height*.05},{color:"#d35400",y:z.height*.45,height:z.height*.15},{color:"#fdcb6e",y:z.height*.6,height:z.height*.1}];xa.forEach(t=>{U.fillStyle=t.color,U.fillRect(0,t.y,z.width,t.height)});U.fillStyle="#ffffff";for(let t=0;t<50;t++){const i=Math.random()*z.width,o=Math.random()*(z.height*.3),a=2+Math.random()*3;U.beginPath(),U.ellipse(i,o,a,a*1.5,0,0,Math.PI*2),U.fill()}U.fillStyle="#e84393";for(let t=0;t<15;t++){const i=Math.random()*z.width,o=z.height*.3,a=10+Math.random()*30;U.beginPath(),U.moveTo(i,o),U.lineTo(i+5,o),U.lineTo(i+2.5,o+a),U.fill()}const Ma=new e.CanvasTexture(z);di.map=Ma;const Gt=new e.Mesh(wa,di),ne={center:W.position.clone(),radius:15,angle:5*Math.PI*2/8,speed:.002};Gt.position.copy(mt(ne.center,ne.radius,ne.angle));v.add(Gt);J.burger=Gt;Gt.userData.orbit=ne;p.burger=Gt;const Ue=N("Burger Brawl",Gt.position,!0),ka=new e.IcosahedronGeometry(1.5,1),pi=new e.MeshPhysicalMaterial({color:7649791,roughness:.3,metalness:.6,clearcoat:.7,clearcoatRoughness:.1,envMapIntensity:1.2,transmission:.3,emissive:623843,emissiveIntensity:.3,flatShading:!0}),et=document.createElement("canvas"),R=et.getContext("2d");et.width=512;et.height=512;const ue=R.createLinearGradient(0,0,0,et.height);ue.addColorStop(0,"#0984e3");ue.addColorStop(.5,"#74b9ff");ue.addColorStop(1,"#00cec9");R.fillStyle=ue;R.fillRect(0,0,et.width,et.height);for(let t=0;t<8;t++){const i=t*60;R.strokeStyle="rgba(255, 255, 255, 0.3)",R.lineWidth=2,R.beginPath();for(let o=0;o<et.width;o+=1){const a=5+Math.random()*3,s=.03+Math.random()*.01,r=i+Math.sin(o*s)*a;o===0?R.moveTo(o,r):R.lineTo(o,r)}R.stroke()}R.fillStyle="rgba(255, 255, 255, 0.5)";for(let t=0;t<60;t++){const i=Math.random()*et.width,o=Math.random()*et.height,a=1+Math.random()*4;R.beginPath(),R.arc(i,o,a,0,Math.PI*2),R.fill()}const _e=["#00cec9","#0984e3","#6c5ce7","#00b894"];for(let t=0;t<30;t++){const i=Math.random()*et.width,o=Math.random()*et.height,a=5+Math.random()*10,s=Math.floor(Math.random()*_e.length),r=R.createRadialGradient(i,o,0,i,o,a);r.addColorStop(0,"rgba(255, 255, 255, 0.8)"),r.addColorStop(.5,_e[s]),r.addColorStop(1,"rgba(0, 0, 0, 0)"),R.fillStyle=r,R.beginPath(),R.arc(i,o,a,0,Math.PI*2),R.fill()}const Pa=new e.CanvasTexture(et);pi.map=Pa;const Bt=new e.Mesh(ka,pi),se={center:W.position.clone(),radius:15,angle:6*Math.PI*2/8,speed:.002};Bt.position.copy(mt(se.center,se.radius,se.angle));v.add(Bt);J.galaxsea=Bt;Bt.userData.orbit=se;p.galaxsea=Bt;const $e=N("Galaxsea",Bt.position,!0),Sa=new e.IcosahedronGeometry(1.5,1),gi=new e.MeshPhysicalMaterial({color:16234289,roughness:.2,metalness:.5,clearcoat:.8,clearcoatRoughness:.1,envMapIntensity:1.4,emissive:15965202,emissiveIntensity:.3,flatShading:!0}),rt=document.createElement("canvas"),q=rt.getContext("2d");rt.width=512;rt.height=512;const fe=q.createLinearGradient(0,0,0,rt.height);fe.addColorStop(0,"#3498db");fe.addColorStop(.5,"#f7b731");fe.addColorStop(1,"#f39c12");q.fillStyle=fe;q.fillRect(0,0,rt.width,rt.height);q.fillStyle="rgba(255, 255, 255, 0.7)";for(let t=0;t<12;t++){const i=Math.random()*rt.width,o=Math.random()*rt.height,a=20+Math.random()*40;for(let s=0;s<5;s++){const r=(Math.random()-.5)*a,l=(Math.random()-.5)*a*.5,c=a*(.5+Math.random()*.5);q.beginPath(),q.arc(i+r,o+l,c,0,Math.PI*2),q.fill()}}q.strokeStyle="rgba(255, 255, 255, 0.4)";q.lineWidth=3;const Se=rt.width*.7,Te=rt.height*.3;q.fillStyle="rgba(255, 255, 255, 0.9)";q.beginPath();q.arc(Se,Te,30,0,Math.PI*2);q.fill();for(let t=0;t<12;t++){const i=t/12*Math.PI*2,o=50+Math.random()*30;q.beginPath(),q.moveTo(Se,Te),q.lineTo(Se+Math.cos(i)*o,Te+Math.sin(i)*o),q.stroke()}const Ta=new e.CanvasTexture(rt);gi.map=Ta;const qt=new e.Mesh(Sa,gi),re={center:W.position.clone(),radius:15,angle:7*Math.PI*2/8,speed:.002};qt.position.copy(mt(re.center,re.radius,re.angle));v.add(qt);J.skyfarer=qt;qt.userData.orbit=re;p.skyfarer=qt;const Ne=N("Skyfarer",qt.position,!0),ja=new e.IcosahedronGeometry(3.5,1),hi=new e.MeshPhysicalMaterial({color:2600544,roughness:.6,metalness:.2,clearcoat:.3,clearcoatRoughness:.3,envMapIntensity:.9,emissive:3066993,emissiveIntensity:.2,flatShading:!0}),G=document.createElement("canvas"),vt=G.getContext("2d");G.width=512;G.height=512;vt.fillStyle="#4cd137";vt.fillRect(0,0,G.width,G.height);const Ca=[{color:"#44bd32",y:G.height*.2,height:G.height*.1},{color:"#20bf6b",y:G.height*.4,height:G.height*.15},{color:"#26de81",y:G.height*.65,height:G.height*.12},{color:"#2ecc71",y:G.height*.85,height:G.height*.1}];Ca.forEach(t=>{vt.fillStyle=t.color,vt.fillRect(0,t.y,G.width,t.height)});vt.fillStyle="#27ae60";for(let t=0;t<8;t++){const i=Math.random()*G.width,o=Math.random()*G.height,a=20+Math.random()*40,s=10+Math.random()*20;vt.beginPath(),vt.ellipse(i,o,a,s,0,0,Math.PI*2),vt.fill()}const Aa=new e.CanvasTexture(G);hi.map=Aa;const Ft=new e.Mesh(ja,hi);Ft.position.set(-40,0,-40);v.add(Ft);p.skills=Ft;Qt(Ft,5034295,70,.1,.02);const Xe=N("Skills",Ft.position),Ia=new e.IcosahedronGeometry(3.5,1),mi=new e.MeshPhysicalMaterial({color:9323693,roughness:.5,metalness:.3,clearcoat:.4,clearcoatRoughness:.3,envMapIntensity:1,emissive:10181046,emissiveIntensity:.2,flatShading:!0}),gt=document.createElement("canvas"),nt=gt.getContext("2d");gt.width=512;gt.height=512;nt.fillStyle="#8e44ad";nt.fillRect(0,0,gt.width,gt.height);nt.fillStyle="#9b59b6";for(let t=0;t<6;t++){const i=Math.random()*gt.width,o=Math.random()*gt.height;for(let a=0;a<4;a++){const s=30+a*20,r=Math.random()*Math.PI*2,l=r+Math.PI*(1+Math.random());nt.beginPath(),nt.arc(i,o,s,r,l),nt.lineWidth=15+Math.random()*15,nt.stroke()}}nt.fillStyle="#a569bd";for(let t=0;t<12;t++){const i=Math.random()*gt.width,o=Math.random()*gt.height,a=5+Math.random()*10;nt.beginPath(),nt.arc(i,o,a,0,Math.PI*2),nt.fill()}const La=new e.CanvasTexture(gt);mi.map=La;const Ht=new e.Mesh(Ia,mi);Ht.position.set(35,0,-35);v.add(Ht);p.about=Ht;Qt(Ht,9323693,70,.1,.016);const Ke=N("About",Ht.position),za=new e.IcosahedronGeometry(3.5,1),ye=new e.MeshPhysicalMaterial({color:15844367,roughness:.6,metalness:.2,clearcoat:.3,clearcoatRoughness:.3,envMapIntensity:.9,emissive:15965202,emissiveIntensity:.2,flatShading:!0}),B=document.createElement("canvas"),wt=B.getContext("2d");B.width=512;B.height=512;wt.fillStyle="#fbc531";wt.fillRect(0,0,B.width,B.height);const Da=[{color:"#e1b12c",y:B.height*.2,height:B.height*.08},{color:"#fad390",y:B.height*.35,height:B.height*.1},{color:"#f6b93b",y:B.height*.55,height:B.height*.12},{color:"#e58e26",y:B.height*.75,height:B.height*.1}];Da.forEach(t=>{wt.fillStyle=t.color,wt.fillRect(0,t.y,B.width,t.height)});wt.fillStyle="#f39c12";for(let t=0;t<10;t++){const i=Math.random()*B.width,o=Math.random()*B.height,a=5+Math.random()*10;wt.beginPath(),wt.arc(i,o,a,0,Math.PI*2),wt.fill()}const Ea=new e.CanvasTexture(B);ye.map=Ea;ye.emissive=new e.Color(8282648);ye.emissiveIntensity=.1;const Pt=new e.Mesh(za,ye);Pt.position.set(10,0,45);v.add(Pt);p.contact=Pt;const Ra=new e.RingGeometry(5,8,64),Ie=new e.MeshPhysicalMaterial({color:16766720,side:e.DoubleSide,transparent:!0,opacity:.8,roughness:.5,metalness:.2,clearcoat:.3,clearcoatRoughness:.3,envMapIntensity:.8,emissive:11175936,emissiveIntensity:.2}),Y=document.createElement("canvas"),yt=Y.getContext("2d");Y.width=512;Y.height=512;const Ut=yt.createRadialGradient(Y.width/2,Y.height/2,Y.width*.3,Y.width/2,Y.height/2,Y.width*.5);Ut.addColorStop(0,"rgba(255, 215, 0, 0.9)");Ut.addColorStop(.4,"rgba(255, 215, 0, 0.7)");Ut.addColorStop(.6,"rgba(255, 215, 0, 0.5)");Ut.addColorStop(.8,"rgba(255, 215, 0, 0.3)");Ut.addColorStop(1,"rgba(255, 215, 0, 0)");yt.fillStyle=Ut;yt.fillRect(0,0,Y.width,Y.height);for(let t=0;t<5;t++){const i=Y.width*(.32+t*.04);yt.beginPath(),yt.arc(Y.width/2,Y.height/2,i,0,Math.PI*2),yt.strokeStyle="rgba(150, 120, 0, 0.5)",yt.lineWidth=2,yt.stroke()}const ui=new e.CanvasTexture(Y);Ie.map=ui;Ie.alphaMap=ui;const Le=new e.Mesh(Ra,Ie);Le.rotation.x=Math.PI/2;Pt.add(Le);Le.userData.rotationSpeed=.003;Qt(Pt,16500017,70,.1,.017);const Ze=N("Contact",Pt.position),n=new e.Group,Oa=new e.CylinderGeometry(.6,1,4,6),Ga=new e.MeshStandardMaterial({color:14213875,metalness:.7,roughness:.4,emissive:4021420,emissiveIntensity:.2,flatShading:!0}),fi=new e.Mesh(Oa,Ga);fi.rotation.x=Math.PI/2;n.add(fi);const Ba=new e.IcosahedronGeometry(.7,0),qa=new e.MeshStandardMaterial({color:6135020,metalness:.3,roughness:.4,transparent:!0,opacity:.9,emissive:6135020,emissiveIntensity:.3,flatShading:!0}),ze=new e.Mesh(Ba,qa);ze.position.set(0,.4,-1.5);ze.scale.set(1,.8,1.2);n.add(ze);const Fa=new e.BoxGeometry(5,.2,1.5,2,1,2),Ha=new e.MeshStandardMaterial({color:6135020,metalness:.5,roughness:.5,flatShading:!0}),yi=new e.Mesh(Fa,Ha);yi.position.y=.1;n.add(yi);const bi=new e.ConeGeometry(.4,1,4),vi=new e.MeshStandardMaterial({color:15158332,emissive:15158332,emissiveIntensity:.5,flatShading:!0}),De=new e.Mesh(bi,vi);De.position.set(-2.5,.1,-.5);De.rotation.z=-Math.PI/2;n.add(De);const Ee=new e.Mesh(bi,vi);Ee.position.set(2.5,.1,-.5);Ee.rotation.z=Math.PI/2;n.add(Ee);const be=50,ve=new e.BufferGeometry,le=new Float32Array(be*3),wi=new Float32Array(be),xi=new Float32Array(be);for(let t=0;t<be;t++){const i=t*3;le[i]=-2.5,le[i+1]=.1,le[i+2]=-.5+Math.random()*.2,wi[t]=Math.random()*.3+.1,xi[t]=0}ve.setAttribute("position",new e.BufferAttribute(le,3));ve.setAttribute("size",new e.BufferAttribute(wi,1));ve.setAttribute("opacity",new e.BufferAttribute(xi,1));const Mi=new e.ShaderMaterial({uniforms:{color:{value:new e.Color(16742144)}},vertexShader:`
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        void main() {
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,fragmentShader:`
        uniform vec3 color;
        varying float vOpacity;
        void main() {
            if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) discard;
            gl_FragColor = vec4(color, vOpacity);
        }
    `,transparent:!0,blending:e.AdditiveBlending,depthWrite:!1}),ki=new e.Points(ve,Mi.clone());n.add(ki);const we=50,xe=new e.BufferGeometry,ce=new Float32Array(we*3),Pi=new Float32Array(we),Si=new Float32Array(we);for(let t=0;t<we;t++){const i=t*3;ce[i]=2.5,ce[i+1]=.1,ce[i+2]=-.5+Math.random()*.2,Pi[t]=Math.random()*.3+.1,Si[t]=0}xe.setAttribute("position",new e.BufferAttribute(ce,3));xe.setAttribute("size",new e.BufferAttribute(Pi,1));xe.setAttribute("opacity",new e.BufferAttribute(Si,1));const Ti=new e.Points(xe,Mi.clone());n.add(Ti);n.userData.leftWingTrail=ki;n.userData.rightWingTrail=Ti;const Wa=new e.OctahedronGeometry(.4,0),Ya=new e.MeshBasicMaterial({color:16724736,transparent:!0,opacity:.6,flatShading:!0}),Me=new e.Mesh(Wa,Ya);Me.position.z=2;n.add(Me);const Vt=new e.Object3D;Vt.position.z=2.5;n.add(Vt);Vt.visible=!1;const ge=new e.PointLight(16733440,0,12);ge.position.z=3;n.add(ge);n.userData.collisionRadius=3;n.scale.set(.8,.8,.8);n.position.set(0,0,15);v.add(n);n.userData.collisionRadius=1.2;Nt.to(Me.scale,{x:1.3,y:1.3,z:1.3,duration:.3,repeat:-1,yoyo:!0,ease:"sine.inOut"});Nt.to(Me.rotation,{y:Math.PI*2,duration:4,repeat:-1,ease:"none"});n.rotation.order="YXZ";const ke=200,Re=new e.BufferGeometry,de=new Float32Array(ke*3),ji=new Float32Array(ke);for(let t=0;t<ke;t++){const i=t*3;de[i]=(Math.random()-.5)*.3,de[i+1]=(Math.random()-.5)*.3,de[i+2]=2+Math.random()*4,ji[t]=Math.random()*.2+.05}Re.setAttribute("position",new e.BufferAttribute(de,3));Re.setAttribute("size",new e.BufferAttribute(ji,1));const Va=new e.PointsMaterial({color:16742144,size:.3,transparent:!0,opacity:.7,blending:e.AdditiveBlending,sizeAttenuation:!0}),Wt=new e.Points(Re,Va);Wt.visible=!1;n.add(Wt);_(p.home,40,.02);_(p.skills,60,.015);_(p.about,80,.01);_(p.contact,100,.005);_(p.work,120,.008);_(p.projects,140,.006);_(p.ampleharvest,15,.03,p.projects);_(p.qaoa,15,.04,p.projects);_(p.facies,20,.035,p.projects);_(p.boulder,20,.025,p.projects);_(p.momentum,25,.02,p.projects);_(p.burger,25,.015,p.projects);_(p.galaxsea,30,.01,p.projects);_(p.skyfarer,30,.005,p.projects);const Ci=new e.BufferGeometry,Ai=1e3,pe=new Float32Array(Ai*3);for(let t=0;t<Ai;t++){const i=t*3;pe[i]=(Math.random()-.5)*300,pe[i+1]=(Math.random()-.5)*300,pe[i+2]=(Math.random()-.5)*300}Ci.setAttribute("position",new e.BufferAttribute(pe,3));const Qa=new e.PointsMaterial({color:16777215,size:1,sizeAttenuation:!0}),Ua=new e.Points(Ci,Qa);v.add(Ua);const _a=new e.AmbientLight(16777215,.4);v.add(_a);const Ii=new e.DirectionalLight(16777215,.8);Ii.position.set(50,50,50);v.add(Ii);const Li=new e.DirectionalLight(16777164,.5);Li.position.set(-50,20,-50);v.add(Li);const zi=new e.PointLight(16777215,.3,100);zi.position.set(0,0,0);v.add(zi);const Oe=new e.PointLight(16777215,1,30);Oe.position.set(0,5,20);v.add(Oe);const $a=new e.Color(6135020),Di=new e.PointLight($a,3,50);Di.position.copy(It.position);v.add(Di);const Na=new e.Color(9206502),Ei=new e.PointLight(Na,3,50);Ei.position.copy(W.position);v.add(Ei);const Xa=new e.Color(5034295),Ri=new e.PointLight(Xa,3,50);Ri.position.copy(Ft.position);v.add(Ri);const Ka=new e.Color(15221016),Oi=new e.PointLight(Ka,3,50);Oi.position.copy(Ht.position);v.add(Oi);const Za=new e.Color(16500017),Gi=new e.PointLight(Za,3,50);Gi.position.copy(Pt.position);v.add(Gi);const K={width:window.innerWidth,height:window.innerHeight},I=new e.PerspectiveCamera(75,K.width/K.height,.1,1e3);I.position.set(0,5,20);v.add(I);const L=new Qi(I,ei);L.enableDamping=!0;L.dampingFactor=.05;L.enableZoom=!0;L.enablePan=!1;L.maxDistance=100;L.minDistance=5;L.minPolarAngle=Math.PI*.05;L.maxPolarAngle=Math.PI*.95;L.enableRotate=!1;let xt,Bi;const Xt=new e.WebGLRenderer({canvas:ei,antialias:!0});Xt.setSize(K.width,K.height);Xt.setPixelRatio(Math.min(window.devicePixelRatio,2));xt=new Ui(Xt);const Ja=new _i(v,I);xt.addPass(Ja);Bi=new $i(new e.Vector2(window.innerWidth,window.innerHeight),1.5,.7,.75);xt.addPass(Bi);let Z=!1,$t=null,jt=!1,at=!1;const A=document.createElement("div");A.className="visit-popup";A.innerHTML="Press SHIFT to visit";A.style.position="absolute";A.style.bottom="20%";A.style.left="50%";A.style.transform="translateX(-50%)";A.style.backgroundColor="rgba(0, 10, 30, 0.7)";A.style.color="#ffffff";A.style.padding="10px 20px";A.style.borderRadius="5px";A.style.fontFamily="'Orbitron', sans-serif";A.style.fontSize="16px";A.style.border="1px solid rgba(93, 156, 236, 0.5)";A.style.boxShadow="0 0 15px rgba(93, 156, 236, 0.3)";A.style.display="none";A.style.zIndex="100";document.body.appendChild(A);const k=document.createElement("div");k.className="exit-button";k.innerHTML="CLOSE & EXIT PLANET";k.style.position="fixed";k.style.bottom="30px";k.style.left="50%";k.style.transform="translateX(-50%)";k.style.backgroundColor="rgba(93, 156, 236, 0.3)";k.style.color="#e0e0ff";k.style.padding="15px 30px";k.style.borderRadius="30px";k.style.fontFamily="'Orbitron', sans-serif";k.style.fontSize="16px";k.style.border="1px solid rgba(93, 156, 236, 0.5)";k.style.boxShadow="0 0 15px rgba(93, 156, 236, 0.3)";k.style.cursor="pointer";k.style.display="none";k.style.zIndex="1001";k.style.marginTop="30px";k.style.transition="all 0.3s ease";document.body.appendChild(k);k.addEventListener("mouseover",()=>{k.style.backgroundColor="rgba(93, 156, 236, 0.5)",k.style.boxShadow="0 0 15px rgba(93, 156, 236, 0.5)"});k.addEventListener("mouseout",()=>{k.style.backgroundColor="rgba(93, 156, 236, 0.3)",k.style.boxShadow="0 0 15px rgba(93, 156, 236, 0.3)"});k.addEventListener("click",Fi);const b=document.createElement("div");b.className="planet-info-popup";b.style.position="fixed";b.style.top="0";b.style.left="0";b.style.width="100%";b.style.height="100%";b.style.backgroundColor="rgba(0, 10, 30, 0.92)";b.style.color="#e0e0ff";b.style.padding="40px";b.style.fontFamily="'Space Mono', monospace";b.style.fontSize="16px";b.style.boxSizing="border-box";b.style.overflowY="auto";b.style.display="none";b.style.zIndex="1000";b.style.backdropFilter="blur(10px)";b.style.opacity="0";b.style.transform="translateY(20px)";b.style.transition="opacity 0.5s ease, transform 0.5s ease";document.body.appendChild(b);async function qi(t){b.style.opacity="0",b.style.transform="translateY(20px)",b.innerHTML='<div class="popup-content markdown-content"><p>Loading...</p></div>';let i="";function o(){const r=document.querySelectorAll(".lazy-bg");if("IntersectionObserver"in window){const l=new IntersectionObserver((c,w)=>{c.forEach(m=>{if(m.isIntersecting){const x=m.target,M=x.getAttribute("data-src");M&&(x.style.backgroundImage=`url('${M}')`,x.classList.add("loaded"),l.unobserve(x))}})},{rootMargin:"0px 0px 200px 0px"});r.forEach(c=>l.observe(c))}else r.forEach(l=>{const c=l.getAttribute("data-src");c&&(l.style.backgroundImage=`url('${c}')`,l.classList.add("loaded"))})}function a(r){document.querySelectorAll(".project-link").forEach(l=>{l.addEventListener("click",c=>{c.preventDefault();const w=c.currentTarget.getAttribute("data-project");w&&to(w)})}),document.querySelectorAll(".lazy-bg").length>0&&o(),r==="projects"&&setTimeout(()=>{const l=document.querySelector("#projects-ai");l&&l.classList.add("active"),setTimeout(()=>{const c=document.querySelector("#projects-games");c&&c.classList.add("active")},300)},100)}switch(t){case"home":let r=function(){const l=document.getElementById("popup-massive-name"),c=document.getElementById("popup-typed-text"),w=document.getElementById("home-content");if(!l||!c){setTimeout(r,100);return}l.querySelectorAll("span").forEach((f,T)=>{setTimeout(()=>{f.classList.add("visible")},100*T)});const x=["a developer","a wannabe start up founder","unemployed"];let M=0,g=0,h=!1,u=100;function P(){const f=document.querySelector(".planet-info-popup");if(!f||f.style.display==="none")return;const T=x[M];h?(c.textContent=T.substring(0,g-1),g--,u=50):(c.textContent=T.substring(0,g+1),g++,u=100),g>0?c.classList.add("typing"):c.classList.remove("typing"),!h&&g===T.length?(h=!0,u=1e3):h&&g===0&&(h=!1,M=(M+1)%x.length,u=500),setTimeout(P,u)}setTimeout(()=>{P(),w&&setTimeout(()=>{w.style.transition="opacity 1s ease",w.style.opacity="1"},2e3)},1e3)};b.innerHTML=`
                <div class="popup-content">
                    <div class="cosmic-background">
                        <div class="star-field"></div>
                        <div class="nebula-glow"></div>
                    </div>
                    
                    <div class="typing-container" id="popup-typing-container">
                        <div class="massive-name" id="popup-massive-name">
                            <span class="letter-animate">A</span>
                            <span class="letter-animate">D</span>
                            <span class="letter-animate">V</span>
                            <span class="letter-animate">I</span>
                            <span class="letter-animate">K</span>
                            <span class="letter-animate">A</span>
                            <span class="letter-animate">R</span>
                        </div>
                        <div class="typed-text-container">
                            <div class="typed-prefix">is </div>
                            <div class="typed-text" id="popup-typed-text"></div>
                        </div>
                    </div>
                    
                    <div class="home-content" id="home-content" style="margin-top: 40px; opacity: 0;">
                        <div class="intro-card">
                            <p class="dynamic-intro">I'm currently studying at Harvard, with interests in Software and AI/Machine Learning. I'm not sure what I want to do in the future, but I'd like to work on something impact focused with an emphasis on applied AI/ML. In my free time, I enjoy exploring new places, playing basketball, and looking at rocks. I have some big plans coming soon. </p>
                        </div>
                        
                        <div class="social-links animated-links">
                            <a href="https://github.com/AdvikarA" title="GitHub" class="bounce-hover"><i class="fab fa-github"></i></a>
                            <a href="https://www.linkedin.com/in/advikar-ananthkumar-79b568311/" title="LinkedIn" class="bounce-hover"><i class="fab fa-linkedin"></i></a>
                            <a href="https://open.spotify.com/user/cyanair24" title="Spotify" class="bounce-hover"><i class="fab fa-spotify"></i></a>
                            <a href="https://discord.com/users/cyanair24" title="Discord" class="bounce-hover"><i class="fab fa-discord"></i></a>
                        </div>
                        
                        <div class="highlighted-work">
                            <h3 class="section-title">Current Projects</h3>
                            <div class="work-items">
                                <div class="work-item fade-in-item">
                                    <div class="work-icon"><i class="fas fa-robot"></i></div>
                                    <div class="work-content">
                                        <h5>AI Agents</h5>
                                        <p>Building autonomous agents for recruitment and productivity</p>
                                    </div>
                                </div>
                                <div class="work-item fade-in-item">
                                    <div class="work-icon"><i class="fas fa-brain"></i></div>
                                    <div class="work-content">
                                        <h5>LLM Research</h5>
                                        <p>Exploring image interpretation capabilities with Google</p>
                                    </div>
                                </div>
                                <div class="work-item fade-in-item">
                                    <div class="work-icon"><i class="fas fa-rocket"></i></div>
                                    <div class="work-content">
                                        <h5>Stealth Startup</h5>
                                        <p>Full stack development for an exciting new venture</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="projects-button-container" style="margin-top: 25px; text-align: center;">
                                <button id="view-projects-button" class="view-projects-button pulse-animation">View All Projects</button>
                            </div>
                        </div>
                        

                    </div>
                </div>
            `,setTimeout(()=>{b.style.opacity="1",b.style.transform="translateY(0)",setTimeout(()=>{document.querySelectorAll(".fade-in-item").forEach((m,x)=>{setTimeout(()=>{m.classList.add("active")},100*x)});const w=document.getElementById("home-content");w&&(w.style.opacity="1",w.style.transform="translateY(0)")},300);const l=document.getElementById("view-projects-button");l&&l.addEventListener("click",()=>{navigateToPlanet("projects")}),r(),a(t)},100);break;case"about":i=`
                <div class="popup-content">
                    <div class="profile-section">
                        <div class="profile-image">
                            <img src="../img/headshot.jpeg" alt="Profile Picture" class="profile-img">
                        </div>
                        <div class="profile-info">
                            <h2>About Me</h2>
                            <p>Harvard CS student passionate about AI, startups, and technology.</p>
                        </div>
                    </div>
                    
                    <div class="about-section">
                        <h3>Stuff I'm Working On</h3>
                        <div class="current-projects">
                            <div class="project-card">
                                <h4>AI Agents</h4>
                                <p>Building autonomous agents for recruitment and productivity</p>
                            </div>
                            <div class="project-card">
                                <h4>LLM Research</h4>
                                <p>Exploring image interpretation capabilities with Google</p>
                            </div>
                            <div class="project-card">
                                <h4>Stealth Startup</h4>
                                <p>Full stack development for an exciting new venture</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about-section">
                        <h3>Gallery</h3>
                        <div class="album">
                            <div class="responsive-container-block bg">
                                <!-- First Column -->
                                <div class="responsive-container-block img-cont">
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_0542.jpeg">
                                        <div class="caption">
                                            <p>NH hike 2024</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_0736.jpeg">
                                        <div class="caption">
                                            <p>Puerto Rico trip</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_1369.jpeg">
                                
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_1906.jpeg">
                                        <div class="caption">
                                            <p>Senior Year HS</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Second Column -->
                                <div class="responsive-container-block img-cont">
                                    <div class="gallery-image img-big lazy-bg" data-src="../img/about/IMG_1954.jpeg">
                                        <div class="caption">
                                            <p>Proof I work</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image img-big lazy-bg" data-src="../img/about/IMG_2396.jpeg">
                                        <div class="caption">
                                            <p>Election day 2024</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Third Column -->
                                <div class="responsive-container-block img-cont">
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_2419.jpeg">
                                        <div class="caption">
                                            <p>US Earth Science Camp 2023</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_2582.jpeg">
                                        <div class="caption">
                                            <p>National High School Game Academy 2023</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_3835.jpeg">
                                        <div class="caption">
                                            <p>SciOly</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_4180.jpeg">
                                        
                                    </div>
                                </div>
                                
                                <!-- Fourth Column -->
                                <div class="responsive-container-block img-cont">
                                    <div class="gallery-image img-big lazy-bg" data-src="../img/about/447785391_914211827404490_844395448136633570_n.jpeg">
                                        <div class="caption">
                                            <p>HS Graduation</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image img-big" style="background-image: url('../img/about/448030336_914663567359316_4875574797276855298_n.jpeg');">
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about-section">
                        <h3>Featured Video</h3>
                        <div class="video-container">
                            <!-- YouTube video embed -->
                            <iframe 
                                width="100%" 
                                height="315" 
                                src="https://www.youtube.com/embed/s9GFkTlP6ME" 
                                title="YouTube video" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen
                            ></iframe>
                        </div>
                    </div>
                    
                    <style>
                        .about-section {
                            margin-top: 40px;
                        }
                        
                        .video-container {
                            margin-top: 20px;
                            position: relative;
                            width: 100%;
                            height: 0;
                            padding-bottom: 56.25%; /* 16:9 aspect ratio */
                            overflow: hidden;
                            border-radius: 8px;
                            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                        }
                        
                        .video-container iframe {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            border-radius: 8px;
                        }
                        
                        .about-section h3 {
                            color: #5d9cec;
                            border-bottom: 2px solid #5d9cec;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                            font-family: 'Orbitron', sans-serif;
                        }
                        
                        /* Current projects styling */
                        .current-projects {
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                            gap: 20px;
                            margin-top: 20px;
                        }
                        
                        .project-card {
                            background: rgba(13, 20, 33, 0.7);
                            border-radius: 8px;
                            padding: 20px;
                            border-left: 4px solid #5d9cec;
                            transition: all 0.3s ease;
                        }
                        
                        .project-card:hover {
                            transform: translateY(-5px);
                            box-shadow: 0 5px 15px rgba(93, 156, 236, 0.3);
                        }
                        
                        .project-card h4 {
                            margin: 0 0 10px;
                            color: #5d9cec;
                        }
                        
                        .project-card p {
                            margin: 0;
                            font-size: 0.9rem;
                            opacity: 0.9;
                        }
                        
                        /* YouTube placeholder styling */
                        .video-container {
                            margin-top: 20px;
                            width: 100%;
                        }
                        
                        .youtube-placeholder {
                            background: rgba(0, 0, 0, 0.7);
                            border-radius: 8px;
                            aspect-ratio: 16/9;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        }
                        
                        .youtube-placeholder:hover {
                            background: rgba(0, 0, 0, 0.8);
                        }
                        
                        .play-button {
                            width: 70px;
                            height: 70px;
                            background: rgba(255, 0, 0, 0.7);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 30px;
                            margin-bottom: 15px;
                            transition: all 0.3s ease;
                        }
                        
                        .youtube-placeholder:hover .play-button {
                            transform: scale(1.1);
                            background: rgba(255, 0, 0, 0.9);
                        }
                        
                        /* Profile section styling */
                        .profile-section {
                            display: flex;
                            align-items: center;
                            gap: 30px;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 1px solid rgba(93, 156, 236, 0.3);
                        }
                        
                        .profile-image {
                            width: 150px;
                            height: 150px;
                            flex-shrink: 0;
                            border-radius: 50%;
                            overflow: hidden;
                            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                            border: 3px solid rgba(93, 156, 236, 0.3);
                        }
                        
                        .profile-img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            object-position: center top;
                            transition: transform 0.3s ease;
                        }
                        
                        .profile-img:hover {
                            transform: scale(1.05);
                        }
                        
                        .profile-info {
                            flex-grow: 1;
                        }
                        
                        .profile-info h2 {
                            margin-top: 0;
                            color: #5d9cec;
                        }
                        
                        /* Album Gallery styling */
                        .album .responsive-container-block {
                            min-height: 75px;
                            height: fit-content;
                            width: 100%;
                            padding: 10px;
                            display: flex;
                            flex-wrap: wrap;
                            margin: 0 auto;
                            justify-content: flex-start;
                        }
                        
                        .album .responsive-container-block.bg {
                            max-width: 100%;
                            margin: 0;
                            justify-content: space-between;
                        }
                        
                        .album .responsive-container-block.img-cont {
                            flex-direction: column;
                            max-width: 25%;
                            min-height: auto;
                            margin: 0;
                            height: 100%;
                        }
                        
                        .gallery-image {
                            width: 100%;
                            height: 100%;
                            margin: 0 0 15px 0;
                            position: relative;
                            overflow: hidden;
                            border-radius: 8px;
                            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                            transition: all 0.3s ease;
                            background-size: cover;
                            background-position: center;
                            min-height: 150px;
                        }
                        
                        .gallery-image.img-big {
                            height: 250px;
                            margin: 0 0 15px 0;
                        }
                        
                        .gallery-image:hover {
                            transform: scale(1.03);
                        }
                        
                        /* Responsive styles for album gallery */
                        @media (max-width: 992px) {
                            .album .responsive-container-block.img-cont {
                                max-width: 50%;
                            }
                        }
                        
                        @media (max-width: 768px) {
                            .album .responsive-container-block.img-cont {
                                max-width: 100%;
                                flex-direction: row;
                                justify-content: space-between;
                                flex-wrap: wrap;
                            }
                            
                            .gallery-image {
                                max-width: 48%;
                                margin: 0 0 15px 0;
                            }
                            
                            .gallery-image.img-big {
                                max-width: 48%;
                                height: 200px;
                            }
                        }
                        
                        @media (max-width: 500px) {
                            .gallery-image, .gallery-image.img-big {
                                max-width: 100%;
                                margin: 0 0 15px 0;
                            }
                        }
                        
                        /* Gallery image styling */
                        .gallery-image {
                            background-size: cover;
                            background-position: center;
                            background-repeat: no-repeat;
                        }
                        
                        .caption {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.7);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            opacity: 0;
                            transition: opacity 0.3s ease;
                            border-radius: 8px;
                        }
                        
                        .gallery-image:hover .caption {
                            opacity: 1;
                        }
                        
                        .caption p {
                            color: white;
                            font-size: 16px;
                            text-align: center;
                            padding: 10px;
                            margin: 0;
                            font-weight: 500;
                            letter-spacing: 0.5px;
                        }
                        
                        /* Background colors for gallery images */
                        .gallery-image.image1 { background: linear-gradient(135deg, #5d9cec, #3b6cad); }
                        .gallery-image.image2 { background: linear-gradient(135deg, #6c8ddd, #4a6cb7); }
                        .gallery-image.image3 { background: linear-gradient(135deg, #7a7ce0, #5658c7); }
                        .gallery-image.image4 { background: linear-gradient(135deg, #8a6ad4, #6b4db8); }
                        .gallery-image.image5 { background: linear-gradient(135deg, #9c59d1, #7e3eb0); }
                        .gallery-image.image6 { background: linear-gradient(135deg, #ad48c8, #8f2da6); }
                        .gallery-image.image7 { background: linear-gradient(135deg, #c038be, #a01d9c); }
                        .gallery-image.image8 { background: linear-gradient(135deg, #d328b4, #b20e92); }
                        .gallery-image.image9 { background: linear-gradient(135deg, #e619aa, #c30088); }
                        .gallery-image.image10 { background: linear-gradient(135deg, #f70a9f, #d4007e); }
                    </style>
                </div>
            `;break;case"skills":i=`
                <div class="popup-content">
                    <h2>Skills</h2>
                    <p>Technologies and skills I've been working with:</p>
                    <div class="skills-grid">
                        <div class="skill-category">
                            <h3>Programming Languages</h3>
                            <h4>Proficient</h4>
                            <ul>
                                <li>C++</li>
                                <li>Python</li>
                            </ul>
                            <h4>Familiar</h4>
                            <ul>
                                <li>Java</li>
                                <li>HTML/CSS</li>
                                <li>JavaScript</li>
                                <li>C#</li>
                            </ul>
                        </div>
                        
                        <div class="skill-category">
                            <h3>Technologies</h3>
                            <ul>
                                <li>Visual Studio Code</li>
                                <li>GitHub</li>
                                <li>Unity</li>
                                <li>Google Cloud</li>
                                <li>Vertex AI</li>
                                <li>Streamlit</li>
                                <li>QGIS</li>
                            </ul>
                        </div>
                        
                        <div class="skill-category">
                            <h3>Content</h3>
                            <ul>
                                <li>Data Structures & Algorithms</li>
                                <li>Computer Systems</li>
                                <li>Machine Learning Architecture</li>
                                <li>Reinforcement Learning</li>
                            </ul>
                        </div>
                        
                        <div class="skill-category">
                            <h3>Misc</h3>
                            <ul>
                                <li>Video Editing</li>
                            </ul>
                        </div>
                    </div>
                </div>
                    </div>
                </div>
            `;break;case"contact":i=`
                <div class="popup-content cosmic-contact">
                    <div class="cosmic-header">
                        <div class="stars-bg"></div>
                        <h2>Contact</h2>
                        <p>Establish contact through these channels:</p>
                    </div>
                    
                    <div class="social-links-container">
                        <a href="https://github.com/AdvikarA" class="social-link" target="_blank">
                            <div class="social-icon github">
                                <i class="fab fa-github"></i>
                            </div>
                            <div class="social-info">
                                <h3>GitHub</h3>
                                <p>Explore my code repositories</p>
                            </div>
                            <div class="cosmic-trail"></div>
                        </a>
                        
                        <a href="https://www.linkedin.com/in/advikar-ananthkumar-79b568311/" class="social-link" target="_blank">
                            <div class="social-icon linkedin">
                                <i class="fab fa-linkedin"></i>
                            </div>
                            <div class="social-info">
                                <h3>LinkedIn</h3>
                                <p>Professional network connection</p>
                            </div>
                            <div class="cosmic-trail"></div>
                        </a>
                        
                        <a href="mailto:advikar_ananthkumar@college.harvard.edu" class="social-link">
                            <div class="social-icon email">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="social-info">
                                <h3>Email</h3>
                                <p>advikar_ananthkumar@college.harvard.edu</p>
                            </div>
                            <div class="cosmic-trail"></div>
                        </a>
                        
                        <a href="https://instagram.com/aaadvikar.24" class="social-link" target="_blank">
                            <div class="social-icon instagram">
                                <i class="fab fa-instagram"></i>
                            </div>
                            <div class="social-info">
                                <h3>Instagram</h3>
                                <p>@aaadvikar.24</p>
                            </div>
                            <div class="cosmic-trail"></div>
                        </a>
                    </div>
                    
                    <style>
                        .cosmic-contact {
                            position: relative;
                            overflow: hidden;
                            background: linear-gradient(to bottom, rgba(10, 15, 30, 0.9), rgba(20, 30, 60, 0.9));
                            border-radius: 12px;
                            box-shadow: 0 0 30px rgba(93, 156, 236, 0.2);
                        }
                        
                        .cosmic-header {
                            position: relative;
                            padding: 20px 0;
                            margin-bottom: 30px;
                            text-align: center;
                            overflow: hidden;
                        }
                        
                        .cosmic-header h2 {
                            font-size: 2.5rem;
                            margin-bottom: 10px;
                            background: linear-gradient(45deg, #5d9cec, #a3bffa, #5d9cec);
                            -webkit-background-clip: text;
                            background-clip: text;
                            color: transparent;
                            animation: cosmic-glow 3s infinite alternate;
                            text-shadow: 0 0 15px rgba(93, 156, 236, 0.5);
                        }
                        
                        .stars-bg {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background-image: 
                                radial-gradient(1px 1px at 25px 5px, white, rgba(255,255,255,0)),
                                radial-gradient(1px 1px at 50px 25px, white, rgba(255,255,255,0)),
                                radial-gradient(1px 1px at 125px 20px, white, rgba(255,255,255,0)),
                                radial-gradient(1.5px 1.5px at 50px 75px, white, rgba(255,255,255,0)),
                                radial-gradient(2px 2px at 15px 125px, white, rgba(255,255,255,0)),
                                radial-gradient(2.5px 2.5px at 110px 80px, white, rgba(255,255,255,0));
                            z-index: -1;
                        }
                        
                        .social-links-container {
                            display: flex;
                            flex-direction: column;
                            gap: 20px;
                            margin-top: 30px;
                            position: relative;
                        }
                        
                        .social-link {
                            display: flex;
                            align-items: center;
                            padding: 20px;
                            background: rgba(13, 20, 33, 0.7);
                            border-radius: 12px;
                            text-decoration: none;
                            color: #fff;
                            transition: all 0.4s ease;
                            position: relative;
                            overflow: hidden;
                            border: 1px solid rgba(93, 156, 236, 0.3);
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        }
                        
                        .social-link:hover {
                            transform: translateY(-5px);
                            background: rgba(20, 30, 48, 0.8);
                            box-shadow: 0 8px 25px rgba(93, 156, 236, 0.4);
                            border-color: rgba(93, 156, 236, 0.8);
                        }
                        
                        .social-link:hover .cosmic-trail {
                            opacity: 1;
                        }
                        
                        .cosmic-trail {
                            position: absolute;
                            top: 0;
                            right: 0;
                            width: 50px;
                            height: 100%;
                            background: linear-gradient(90deg, rgba(93, 156, 236, 0), rgba(93, 156, 236, 0.2));
                            opacity: 0;
                            transition: opacity 0.3s ease;
                        }
                        
                        .social-icon {
                            width: 60px;
                            height: 60px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 28px;
                            margin-right: 20px;
                            position: relative;
                            z-index: 2;
                            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
                        }
                        
                        .github {
                            background: linear-gradient(135deg, #333, #222);
                        }
                        
                        .linkedin {
                            background: linear-gradient(135deg, #0077B5, #0e5a8a);
                        }
                        
                        .email {
                            background: linear-gradient(135deg, #D44638, #b23121);
                        }
                        
                        .instagram {
                            background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
                        }
                        
                        .social-info h3 {
                            margin: 0 0 8px;
                            font-family: 'Orbitron', sans-serif;
                            font-size: 1.2rem;
                            letter-spacing: 1px;
                        }
                        
                        .social-info p {
                            margin: 0;
                            opacity: 0.8;
                            font-size: 0.9rem;
                        }
                        
                        @keyframes cosmic-glow {
                            0% { text-shadow: 0 0 5px rgba(93, 156, 236, 0.5); }
                            50% { text-shadow: 0 0 20px rgba(93, 156, 236, 0.8), 0 0 30px rgba(93, 156, 236, 0.4); }
                            100% { text-shadow: 0 0 5px rgba(93, 156, 236, 0.5); }
                        }
                        
                        @media (max-width: 768px) {
                            .social-icon {
                                width: 50px;
                                height: 50px;
                                font-size: 22px;
                            }
                            
                            .cosmic-header h2 {
                                font-size: 2rem;
                            }
                        }
                    </style>
                </div>
            `;break;case"work":i=`
                <div class="popup-content">
                    <h2>Work Experience</h2>
                    <div class="academic-info">
                        <h3>Coursework & Clubs</h3>
                        <p><strong>Coursework:</strong> Systems Programming, Vector Calculus and Linear Algebra, Planning/Learning AI Methods, Science in the age of AI, Data Structures & Algorithms, Application of Linear Algebra and Machine Learning, Planetary Habitability, Introduction to Economics, Expository Writing</p>
                        <p><strong>Clubs:</strong> Harvard Computer Society, Tech for Social Good, Institute of Politics, Harvard Undergraduate Science Olympiad, Student Astronomers at Harvard-Radcliffe, Harvard Financial Analysts Club (Traditional & Quant), Harvard Undergraduate Quant Traders, Harvard Data Analytics Group (Case Team)</p>
                    </div>
                    
                    <div class="work-sections">
                        <!-- Current Section -->
                        <div class="work-section current-section">
                            <h3>Current</h3>
                            <div class="work-items">
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Engineer | Liquid Palladium</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Working on agentic recruitment and agent architecture at this start-up.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Engineer | stealth</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Helping build out full stack MVP.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Researcher | EPS department</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Working on LLM image interpretation with Google under the Generative AI program.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Director of Events for HUSO</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Harvard Undergrad Science Olympiad.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Previously Section -->
                        <div class="work-section previously-section">
                            <h3>Previously</h3>
                            <div class="work-items">
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Analyst for Harvard Data Analytics</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Helping secret company with AI analysis.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>PM for Harvard Tech for Social Good</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Worked on 2 projects.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Software Engineering Intern @ Maitsys</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Didn't really do anything ngl.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Highschool Section -->
                        <div class="work-section highschool-section">
                            <h3>Highschool</h3>
                            <div class="work-items">
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Acton Institute of Computer Science President</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Nonprofit, taught 2000+ students, 24 countries, $15,000+ raised.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Noctem Dev President</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Computing competitions for students, 4 events with 300+ participants.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <style>
                    /* Work sections styling */
                    .work-sections {
                        display: flex;
                        flex-direction: column;
                        gap: 40px;
                        margin-top: 30px;
                    }
                    
                    .academic-info {
                        background: rgba(13, 20, 33, 0.7);
                        border-left: 4px solid #5d9cec;
                        padding: 15px 20px;
                        border-radius: 0 8px 8px 0;
                        margin-top: 20px;
                        margin-bottom: 30px;
                        display: block;
                        opacity: 1;
                    }
                    
                    .academic-info h3 {
                        color: #5d9cec;
                        margin-top: 0;
                        margin-bottom: 15px;
                        font-family: 'Orbitron', sans-serif;
                    }
                    
                    .academic-info p {
                        margin-bottom: 10px;
                        line-height: 1.6;
                    }
                    
                    .work-section h3 {
                        color: #5d9cec;
                        border-bottom: 2px solid #5d9cec;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                        font-family: 'Orbitron', sans-serif;
                    }
                    
                    .work-items {
                        display: flex;
                        flex-direction: column;
                        gap: 25px;
                    }
                    
                    .work-item {
                        background: rgba(13, 20, 33, 0.7);
                        border-left: 4px solid #5d9cec;
                        padding: 15px 20px;
                        border-radius: 0 8px 8px 0;
                        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    
                    .work-item.active {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    
                    .work-header {
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 10px;
                    }
                    
                    .work-item h4 {
                        color: #ffffff;
                        margin: 0 0 5px;
                        font-family: 'Space Mono', monospace;
                        font-weight: bold;
                    }
                    
                    .work-date {
                        color: #5d9cec;
                        font-size: 0.9rem;
                        margin: 0;
                        font-style: italic;
                    }
                    
                    .work-details {
                        font-family: 'Space Mono', monospace;
                        font-size: 0.95rem;
                        line-height: 1.5;
                    }
                    
                    .work-bullets {
                        margin-top: 10px;
                        padding-left: 20px;
                    }
                    
                    .work-bullets li {
                        margin-bottom: 5px;
                        position: relative;
                    }
                    
                    .work-bullets li::before {
                        content: '•';
                        color: #5d9cec;
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                    
                    /* Interactive hover effect */
                    .work-item:hover {
                        background: rgba(20, 30, 48, 0.8);
                        box-shadow: 0 5px 15px rgba(93, 156, 236, 0.3);
                        transform: translateY(-3px);
                    }
                </style>
            `,setTimeout(()=>{document.querySelectorAll(".work-item").forEach((c,w)=>{setTimeout(()=>{c.classList.add("active")},120*w)})},200);break;case"projects":i=`
                <div class="popup-content">
                    <section class="projects" id="projects-ai" style="opacity: 1; transform: translateY(0);">
                      <h2 class="projects-title">AI & Research</h2>
                      <div class="projects-text-1" style="margin-bottom: 30px;">My work in AI, Machine Learning, and Research.</div>
                      <div class="projects-container">
                        <div class="project-container project-card">
                          <img
                            src="../img/llmresearchlogo.png"
                            alt="New AI Project"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Gemini-based LLM Earthquake Research</h3>
                          <p class="project-details">
                            [2025] Using Gemini to classify and predict earthquakes from seismic waveform data
                          </p>
                          <a href="#" class="project-link" data-project="llmearthquake">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/ampleharvest.jpg"
                            alt="AmpleHarvest Webscraper"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">AmpleHarvest Webscraper</h3>
                          <p class="project-details">
                            [2024] LLM powered Webscraper for automating contact information verification
                          </p>
                          <a href="#" class="project-link" data-project="ampleharvest">Check it Out</a>
                        </div>
                        

                        
                        <div class="project-container project-card">
                          <img
                            src="../img/FaciesLogo.jpg"
                            alt="Geographic Facies Predictor"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Geographic Facies Predictor</h3>
                          <p class="project-details">
                            [2022-2023] Using machine learning and AI to map geographic layers in the ground [Research + Web Application]
                          </p>
                          <a href="#" class="project-link" data-project="facies">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/BoulderLights.png"
                            alt="Planetary Boulder Detection"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Planetary Boulder Detection</h3>
                          <p class="project-details">
                            [2023] Training a boulder detecting/outlining CNN model from high-res satellite images
                          </p>
                          <a href="#" class="project-link" data-project="boulder">Check it Out</a>
                        </div>
                      </div>
                    </section>
                    
                    <section class="projects" id="projects-general" style="opacity: 1; transform: translateY(0); margin-top: 40px;">
                      <h2 class="projects-title">General</h2>
                      <div class="projects-text-2" style="margin-bottom: 30px;">Other Interesting Projects</div>
                      <div class="projects-container" style="row-gap: 30px;">
                        <div class="project-container project-card">
                          <img
                            src="../img/hopeboundlogo.jpg"
                            alt="Project 3"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Hopebound data visualization webpage</h3>
                          <p class="project-details">
                            [2025] Building a fullstack data site for Hopebound, a mental health nonprofit
                          </p>
                          <a href="#" class="project-link" data-project="hopebound">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/newsailogo.png"
                            alt="NewsAI logo"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">NewsAI</h3>
                          <p class="project-details">
                            [2025] An AI integrated News site -- Built for the Anthropic Hackathon
                          </p>
                          <a href="#" class="project-link" data-project="newsai">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <div style="overflow: hidden;">
                            <img
                              src="../img/HPT.png"
                              alt="HPT"
                              loading="lazy"
                              class="project-pic"
                              style="transform: scale(1.4); transform-origin: center center;"
                            />
                          </div>
                          <h3 class="project-title">Harvard Purity Test</h3>
                          <p class="project-details">
                            [2025] Harvard's largest unaffiliated social site
                          </p>
                          <a href="#" class="project-link" data-project="hpt">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/QAOA.jpg"
                            alt="Quantum Optimization Algorithm"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Quantum Approximate Optimization Algorithm</h3>
                          <p class="project-details">
                            [2024] Implementing QAOA as part of Qbraid Quantum ML project
                          </p>
                          <a href="#" class="project-link" data-project="qaoa">Check it Out</a>
                        </div>
                      </div>
                    </section>
                    
                    <section class="projects" id="projects-games" style="opacity: 1; transform: translateY(0); margin-top: 40px;">
                      <h2 class="projects-title">Game Development</h2>
                      <div class="projects-text-2" style="margin-bottom: 30px;">Game Development</div>
                      <div class="projects-container" style="row-gap: 30px;">
                        <div class="project-container project-card">
                          <img
                            src="../img/MomentumLogo.jpg"
                            alt="Momentum"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Momentum</h3>
                          <p class="project-details">
                            [2020-2021] 2D Friction based platformer
                          </p>
                          <a href="#" class="project-link" data-project="momentum">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/BurgerBrawlLogo.jpg"
                            alt="Burger Brawl"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Burger Brawl</h3>
                          <p class="project-details">
                            [2022] 2D action/fighter made in 24 hours
                          </p>
                          <a href="#" class="project-link" data-project="burger">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/GalaxSeaLogo.jpg"
                            alt="Galaxsea"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Galaxsea</h3>
                          <p class="project-details">
                            [2023] A twist on the iconic arcade shooter Galaga
                          </p>
                          <a href="#" class="project-link" data-project="galaxsea">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/SkyfarerLogo.jpg"
                            alt="Skyfarer"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Skyfarer</h3>
                          <p class="project-details">
                            [2023] Dialogue based VR flying experience
                          </p>
                          <a href="#" class="project-link" data-project="skyfarer">Check it Out</a>
                        </div>
                      </div>
                    </section>
                </div>
            `;break;case"ampleharvest":case"qaoa":case"facies":case"boulder":case"momentum":case"burger":case"galaxsea":case"skyfarer":navigateToPlanet("projects");return;default:i=`<h1>${t.charAt(0).toUpperCase()+t.slice(1)}</h1>`}i+=`
        <style>
            .popup-content {
                max-width: 1400px;
                margin: 0 auto;
                padding: 30px;
                width: 90%;
            }
            
            /* Lazy loading styles */
            .lazy-bg {
                background-color: #1e293b; /* Dark placeholder color */
                transition: background-image 0.3s ease-in;
            }
            
            .lazy-bg.loaded {
                background-color: transparent;
            }
            .popup-content h2 {
                color: #5d9cec;
                margin-bottom: 20px;
                font-size: 2rem;
                font-family: 'Orbitron', sans-serif;
                text-shadow: 0 0 10px rgba(93, 156, 236, 0.5);
            }
            .popup-content h3 {
                color: #ffffff;
                margin: 15px 0 10px;
                font-size: 1.3rem;
                font-family: 'Orbitron', sans-serif;
            }
            .popup-content p {
                margin-bottom: 15px;
                line-height: 1.6;
                font-family: 'Space Mono', monospace;
            }
            .popup-content ul {
                list-style-type: none;
                padding-left: 5px;
                margin-bottom: 20px;
            }
            .popup-content li {
                margin-bottom: 8px;
                position: relative;
                padding-left: 20px;
                font-family: 'Space Mono', monospace;
            }
            .popup-content li:before {
                content: '•';
                color: #5d9cec;
                position: absolute;
                left: 0;
                top: 0;
            }
            .social-links {
                margin-top: 20px;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                width: 100%;
            }
            .social-links a {
                color: #e0e0ff;
                font-size: 1.5rem;
                margin-right: 15px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(93, 156, 236, 0.1);
                border: 1px solid rgba(93, 156, 236, 0.3);
                text-decoration: none;
                position: relative;
            }
            
            .social-links a i {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .social-links a:hover {
                color: #5d9cec;
                background: rgba(93, 156, 236, 0.2);
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(93, 156, 236, 0.3);
            }
            
            /* Timeline Styling */
            .timeline {
                position: relative;
                max-width: 100%;
                margin: 30px 0;
                padding-left: 30px;
            }
            
            .timeline:before {
                content: '';
                position: absolute;
                left: 10px;
                top: 0;
                bottom: 0;
                width: 2px;
                background: rgba(93, 156, 236, 0.5);
            }
            
            .timeline-item {
                position: relative;
                margin-bottom: 30px;
            }
            
            .timeline-dot {
                position: absolute;
                left: -30px;
                top: 5px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #5d9cec;
                box-shadow: 0 0 10px rgba(93, 156, 236, 0.8);
                z-index: 1;
            }
            
            .timeline-date {
                font-family: 'Orbitron', sans-serif;
                font-weight: bold;
                color: #5d9cec;
                margin-bottom: 5px;
            }
            
            .timeline-content {
                background: rgba(0, 8, 20, 0.6);
                border-radius: 8px;
                padding: 15px;
                border-left: 3px solid #5d9cec;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            }
            
            .timeline-content h4 {
                margin-top: 0;
                color: #e0e0ff;
                font-family: 'Orbitron', sans-serif;
            }
            
            .timeline-content p {
                margin-bottom: 5px;
                font-family: 'Space Mono', monospace;
                font-size: 0.9rem;
            }
            
            .timeline-content p:last-child {
                margin-bottom: 0;
            }
            .projects {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.8s ease, transform 0.8s ease;
                margin-bottom: 40px;
            }
            .projects.active {
                opacity: 1;
                transform: translateY(0);
            }
            .projects-title {
                text-align: center;
                margin-bottom: 30px;
                color: #5d9cec;
                font-size: 2rem;
            }
            .projects-text-1, .projects-text-2 {
                text-align: center;
                font-size: 1.2rem;
                color: #aaa;
            }
            .projects-container {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }
            .project-container {
                background: rgba(0, 10, 30, 0.5);
                border-radius: 10px;
                padding: 15px;
                border: 1px solid rgba(93, 156, 236, 0.2);
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .project-container:hover {
                background: rgba(0, 10, 30, 0.7);
                transform: translateY(-10px);
                box-shadow: 0 10px 20px rgba(93, 156, 236, 0.3);
            }
            .project-pic {
                width: 100%;
                height: 140px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 10px;
                border: 1px solid rgba(93, 156, 236, 0.3);
            }
            .project-title {
                color: #ffffff;
                margin: 8px 0;
                font-size: 1.2rem;
                font-family: 'Orbitron', sans-serif;
            }
            .project-details {
                color: #aaa;
                font-size: 0.9rem;
                margin-bottom: 20px;
            }
            .project-link {
                display: inline-block;
                padding: 10px 20px;
                background: rgba(93, 156, 236, 0.2);
                color: #e0e0ff;
                text-decoration: none;
                border-radius: 30px;
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                border: 1px solid rgba(93, 156, 236, 0.4);
                margin-top: auto;
            }
            .project-link:hover {
                background: rgba(93, 156, 236, 0.4);
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(93, 156, 236, 0.4);
            }
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 20px 0;
            }
            .skill-category {
                background: rgba(0, 10, 30, 0.5);
                border-radius: 8px;
                padding: 15px;
                border: 1px solid rgba(93, 156, 236, 0.2);
            }
            .skill-category h3 {
                color: #5d9cec;
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            .skill-category h4 {
                color: #e0e0ff;
                margin: 10px 0 5px;
                font-size: 0.95rem;
                opacity: 0.9;
            }
            .skill-category ul {
                list-style-type: none;
                padding-left: 10px;
            }
            .skill-category li {
                margin-bottom: 5px;
                position: relative;
                padding-left: 15px;
            }
            .skill-category li:before {
                content: '•';
                color: #5d9cec;
                position: absolute;
                left: 0;
            }
            .contact-links {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-top: 20px;
            }
            .contact-link {
                display: flex;
                align-items: center;
                color: #e0e0ff;
                text-decoration: none;
                padding: 10px 15px;
                background: rgba(93, 156, 236, 0.1);
                border-radius: 8px;
                transition: all 0.3s ease;
                border: 1px solid rgba(93, 156, 236, 0.3);
            }
            .contact-link i {
                margin-right: 10px;
                font-size: 1.2rem;
            }
            .contact-link:hover {
                background: rgba(93, 156, 236, 0.2);
                transform: translateX(5px);
                box-shadow: 0 0 15px rgba(93, 156, 236, 0.3);
            }
            @media (max-width: 1200px) {
                .projects-container {
                    grid-template-columns: 1fr 1fr;
                }
            }
            @media (max-width: 768px) {
                .projects-container,
                .project-grid,
                .skills-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `,b.style.display="block",["about","contact","projects","skills","work","default"].includes(t)&&(b.innerHTML=i,setTimeout(()=>{b.style.opacity="1",b.style.transform="translateY(0)",a(t)},50))}async function to(t){let i="";const o=`/templates/project-details/${t}.html`;try{const s=await fetch(o);if(!s.ok){let r=t.charAt(0).toUpperCase()+t.slice(1);throw t==="qaoa"?r="Quantum Approximate Optimization Algorithm":t==="facies"&&(r="Geographic Facies Predictor"),new Error(`Content not found for ${r} (Error ${s.status})`)}i=await s.text()}catch(s){console.error(`Error fetching project details for "${t}" from ${o}:`,s);let r=t.charAt(0).toUpperCase()+t.slice(1);t==="qaoa"?r="Quantum Approximate Optimization Algorithm":t==="facies"&&(r="Geographic Facies Predictor"),i=`<h2>${r}</h2>
                               <p>Sorry, the details for this project could not be loaded at this time.</p>
                               <p><small>${s.message}</small></p>`}let a=`
        <div class="project-details-popup">
            ${i}
        </div>
        <style>
            .project-details-popup {
                padding: 20px;
            }
            .project-details-popup h2 {
                margin-bottom: 20px;
                text-align: center;
            }
            .project-details-popup p {
                margin-bottom: 15px;
                line-height: 1.6;
            }
            .project-details-popup ul {
                margin-bottom: 20px;
                padding-left: 20px;
            }
            .project-details-popup li {
                margin-bottom: 8px;
            }
            .image-container {
                display: flex;
                gap: 10px;
                justify-content: center;
                align-items: center;
                margin: 20px 0;
                flex-wrap: wrap;
            }
            .project-pic {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                border: 1px solid rgba(93, 156, 236, 0.3);
            }
            .detail-pic {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                border: 1px solid rgba(93, 156, 236, 0.3);
            }
            .image-note {
                text-align: center;
                font-style: italic;
                color: rgba(224, 224, 255, 0.7);
                margin-top: 10px;
            }
            .back-button {
                display: inline-block;
                padding: 10px 20px;
                background: rgba(93, 156, 236, 0.2);
                color: #e0e0ff;
                text-decoration: none;
                border-radius: 30px;
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                border: 1px solid rgba(93, 156, 236, 0.4);
                margin-top: 20px;
                cursor: pointer;
            }
            .back-button:hover {
                background: rgba(93, 156, 236, 0.4);
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(93, 156, 236, 0.4);
            }
            /* Responsive adjustments for images within project details */
            @media (max-width: 768px) {
                .project-details-popup .image-container img,
                .project-details-popup > div > img.project-pic { 
                    max-width: 90vw; 
                }
            }
        </style>
        <div style="text-align: left; padding-left: 20px; padding-bottom: 10px; margin-top: 20px;">
            <button class="back-button" id="back-to-projects">Back to Projects</button>
        </div>
    `;b.style.opacity="0",setTimeout(()=>{b.innerHTML=a,document.getElementById("back-to-projects").addEventListener("click",()=>{b.style.opacity="0",setTimeout(()=>{qi("projects")},300)}),setTimeout(()=>{b.style.opacity="1"},50)},300)}function Fi(){if(Z)return;Z=!0,at=!1,ta(),b.style.opacity="0",b.style.transform="translateY(20px)",k.style.display="none",setTimeout(()=>{b.style.display="none";const o=document.querySelector(".ui-container");o&&(o.style.opacity="1",o.style.pointerEvents="auto")},500);const t=new e.Vector3(0,5,15);t.applyQuaternion(n.quaternion);const i=new e.Vector3().copy(n.position).add(t);L.target.copy(n.position),Nt.to(I.position,{x:i.x,y:i.y,z:i.z,duration:1.5,ease:"power2.inOut",onUpdate:()=>{L.target.copy(n.position)},onComplete:()=>{Z=!1}})}window.navigateToPlanet=function(t){if(Z||!p[t])return;Z=!0,at=!0,typeof window.updateNavActive=="function"&&window.updateNavActive(t),d.up=!1,d.down=!1,d.left=!1,d.right=!1,d.thrust=!1,document.querySelectorAll(".planet-selector li").forEach(M=>{M.classList.remove("active")}),document.querySelector(`.planet-selector li[data-planet="${t}"]`).classList.add("active");const i=document.querySelector(".info-panel");if(i){document.querySelectorAll(".panel-content").forEach(g=>{g.classList.remove("active")});const M=document.querySelector(`.${t}-panel`);M&&M.classList.add("active"),i.classList.add("visible"),t==="home"?(i.style.position="fixed",i.style.top="0",i.style.left="0",i.style.width="100%",i.style.height="100vh",i.style.maxWidth="100%",i.style.margin="0",i.style.padding="0",i.style.borderRadius="0",i.style.display="flex",i.style.justifyContent="center",i.style.alignItems="center",i.style.zIndex="1000",i.style.backgroundColor="rgba(0, 0, 0, 0.9)",typeof window.resetAndStartTypingAnimation=="function"?setTimeout(window.resetAndStartTypingAnimation,500):typeof initTypingAnimation=="function"&&setTimeout(initTypingAnimation,500)):(i.style.position="relative",i.style.width="",i.style.height="",i.style.maxWidth="800px",i.style.margin="",i.style.padding="40px",i.style.borderRadius="15px",i.style.display="block",i.style.backgroundColor="rgba(0, 10, 30, 0.8)")}const o=document.querySelector(".ui-container");o&&(o.style.opacity="0",o.style.pointerEvents="none");const a=p[t],s=new e.Vector3(0,0,-1).applyQuaternion(n.quaternion).normalize(),r=new e.Vector3().subVectors(a.position,n.position).normalize();s.dot(r),new e.Vector3().copy(n.position);const l=new e.Vector3().copy(a.position),c=new e.Quaternion,w=new e.Vector3(0,1,0),m=new e.Matrix4().lookAt(n.position,l,w);c.setFromRotationMatrix(m),Nt.to(n.quaternion,{x:c.x,y:c.y,z:c.z,w:c.w,duration:1,ease:"power2.inOut"});const x=new e.Vector3;if(n.position.distanceTo(a.position)<20*2){const M=a.geometry.parameters.radius*2+5;x.copy(a.position).sub(n.position).normalize().multiplyScalar(M).add(a.position)}else{const M=a.geometry.parameters.radius*2+5;x.copy(a.position).sub(n.position).normalize().multiplyScalar(M).add(a.position)}L.target.copy(a.position),Nt.to(I.position,{x:x.x,y:x.y,z:x.z,duration:2,ease:"power2.inOut",onUpdate:()=>{L.target.copy(a.position)},onComplete:()=>{Z=!1,k.style.display="block",qi(t)}}),Hi()};const d={left:!1,right:!1,thrust:!1,isAtBoundary:!1,controlsDisabled:!1,currentThrustLevel:0,targetThrustLevel:0,accelerationRate:.03,decelerationRate:.1,currentTargetYawRate:0,currentYawRate:0,turnAccelerationRate:.05,turnDecelerationRate:.08};window.addEventListener("resize",()=>{K.width=window.innerWidth,K.height=window.innerHeight,I.aspect=K.width/K.height,I.updateProjectionMatrix(),Xt.setSize(K.width,K.height),Xt.setPixelRatio(Math.min(window.devicePixelRatio,2)),xt&&(xt.setSize(K.width,K.height),xt.setPixelRatio(Math.min(window.devicePixelRatio,2)))});document.querySelectorAll(".planet-selector li").forEach(t=>{t.addEventListener("click",()=>{const i=t.getAttribute("data-planet");navigateToPlanet(i)})});document.addEventListener("keydown",t=>{if(!(n.userData.controlsDisabled&&t.code!=="KeyQ"))switch(t.code){case"ArrowUp":case"KeyW":d.up=!0;break;case"ArrowDown":case"KeyS":d.down=!0;break;case"ArrowLeft":case"KeyA":d.left=!0;break;case"ArrowRight":case"KeyD":d.right=!0;break;case"Space":d.thrust=!0,d.targetThrustLevel=1;break;case"ShiftLeft":case"ShiftRight":$t&&!Z&&!at&&navigateToPlanet($t);break;case"KeyQ":n.userData.isAtBoundary&&eo();break;case"1":navigateToPlanet("home");break;case"2":navigateToPlanet("projects");break;case"3":navigateToPlanet("skills");break;case"4":navigateToPlanet("about");break;case"5":navigateToPlanet("contact");break;case"Escape":at&&!Z&&Fi();break}});window.addEventListener("keyup",t=>{switch(t.code){case"ArrowUp":case"KeyW":d.up=!1;break;case"ArrowDown":case"KeyS":d.down=!1;break;case"ArrowLeft":case"KeyA":d.left=!1;break;case"ArrowRight":case"KeyD":d.right=!1;break;case"Space":d.thrust=!1,d.targetThrustLevel=0;break}});function eo(){const t=document.getElementById("restart-message");t&&t.classList.remove("visible"),n.userData.isAtBoundary=!1,n.userData.boundaryTransition=null,n.userData.orbitingMode=!1,n.userData.controlsDisabled=!1,n.visible=!0,n.traverse(l=>{(l.isMesh||l.isPoints)&&l.material&&l.userData.originalOpacity!==void 0&&(l.material.opacity=l.userData.originalOpacity)});const i=100,o=Math.random()*Math.PI*2;n.position.x=Math.cos(o)*i,n.position.y=0,n.position.z=Math.sin(o)*i;const a=new e.Vector3(n.position.x,0,n.position.z).normalize(),s=new e.Quaternion().setFromUnitVectors(new e.Vector3(0,0,1),a);n.quaternion.copy(s);const r=new e.Vector3(0,5,15);r.applyQuaternion(s),I.position.copy(n.position).add(r),L.target.copy(n.position)}const Zt=new e.Clock;let Je=0;function io(t){if(!at){if(J[t]){jt=!1,A.style.display="none";return}A.style.display="block",A.innerHTML=`Press SHIFT to visit ${t.charAt(0).toUpperCase()+t.slice(1)}`,jt=!0}}function Hi(){A.style.display="none",jt=!1}function ao(){if(at||Z){jt&&(jt=!1,A.style.opacity="0",setTimeout(()=>{A.style.display="none"},300));return}let t=null,i=1/0;const o=20;for(const a in p){const s=p[a];s.userData.isHighlighted||(s.material.emissive.set(0),s.material.emissiveIntensity=0)}for(const a in p){if(J[a])continue;const s=p[a],r=n.position.distanceTo(s.position);r<i&&(i=r,t=a)}if(i<o&&!Z){const a=p[t];if(!a.userData.isHighlighted){a.userData.originalEmissive=a.material.emissive.clone(),a.userData.originalEmissiveIntensity=a.material.emissiveIntensity;const s=a.material.color.clone();a.material.emissive.set(s),a.material.emissiveIntensity=.2,a.userData.isHighlighted=!0}($t!==t||!jt)&&io(t),$t=t}else jt&&Hi(),Object.values(p).forEach(a=>{a.userData.isHighlighted&&(a.userData.originalEmissive&&(a.material.emissive.copy(a.userData.originalEmissive),a.material.emissiveIntensity=a.userData.originalEmissiveIntensity),a.userData.isHighlighted=!1)}),$t=null}const Wi=()=>{const t=Zt.getElapsedTime(),i=t-Je;Je=t;const o=document.querySelector(".coordinates-value"),a=document.querySelector(".velocity-value");if(o&&n){const g=n.position.x.toFixed(1),h=n.position.z.toFixed(1);o.textContent=`X: ${g} Z: ${h}`}if(a&&n){let g=0;n.userData.controlsDisabled||(g=.5+d.currentThrustLevel*1),a.textContent=`${g.toFixed(1)} km/s`}Ki(p,i,I),Zi(p,n),Object.values(p).forEach(g=>{g.rotation.y+=.005,g.children.forEach(h=>{if(h instanceof e.Points){const u=h.geometry.attributes.position.array,P=h.userData.originalPositions;h.userData.time+=i*h.userData.speed;for(let f=0;f<u.length;f+=3){const T=P[f],j=P[f+1],$=P[f+2];u[f]=T+Math.sin(h.userData.time+f*.1)*.1,u[f+1]=j+Math.cos(h.userData.time+f*.05)*.1,u[f+2]=$+Math.sin(h.userData.time+f*.07)*.1}h.geometry.attributes.position.needsUpdate=!0}})});const s=Object.keys(J),r=s.length,l=Math.ceil(r/2),c=W.position.clone(),w=13,m=20,x=2,M=.6;if(window.innerOrbitAngle||(window.innerOrbitAngle=0),window.outerOrbitAngle||(window.outerOrbitAngle=0),window.innerOrbitAngle+=x*i,window.outerOrbitAngle+=M*i,s.forEach((g,h)=>{const u=J[g],P=h<l,f=P?w:m,T=P?l:r-l,j=P?h:h-l;u.rotation.y+=.007*i;const $=j/T*Math.PI*2,St=(P?window.innerOrbitAngle:window.outerOrbitAngle)+$,it=mt(c,f,St);u.position.copy(it);const Tt=g+"Label";window[Tt]&&window[Tt].position.copy(it).add(new e.Vector3(0,4,0))}),qe&&qe.position.copy(It.position).add(new e.Vector3(0,8,0)),Fe&&Fe.position.copy(W.position).add(new e.Vector3(0,10,0)),Xe&&Xe.position.copy(Ft.position).add(new e.Vector3(0,7,0)),Ke&&Ke.position.copy(Ht.position).add(new e.Vector3(0,9,0)),Ze&&Ze.position.copy(Pt.position).add(new e.Vector3(0,6,0)),He&&He.position.copy(zt.position).add(new e.Vector3(0,4,0)),We&&We.position.copy(Dt.position).add(new e.Vector3(0,4,0)),Ye&&Ye.position.copy(Et.position).add(new e.Vector3(0,4,0)),Ve&&Ve.position.copy(Rt.position).add(new e.Vector3(0,4,0)),Qe&&Qe.position.copy(Ot.position).add(new e.Vector3(0,4,0)),Ue&&Ue.position.copy(Gt.position).add(new e.Vector3(0,4,0)),$e&&$e.position.copy(Bt.position).add(new e.Vector3(0,4,0)),Ne&&Ne.position.copy(qt.position).add(new e.Vector3(0,4,0)),at||ao(),Oe.position.copy(I.position),!Z&&n){if(d.currentThrustLevel!==d.targetThrustLevel){const f=d.targetThrustLevel>d.currentThrustLevel?.03:.1;d.currentThrustLevel+=(d.targetThrustLevel-d.currentThrustLevel)*f,Math.abs(d.currentThrustLevel-d.targetThrustLevel)<.01&&(d.currentThrustLevel=d.targetThrustLevel)}const g=18,h=3;if(!at){n.position.y=0;const u=new e.Vector3(0,0,-1);u.applyQuaternion(n.quaternion),u.y=0,u.normalize();const P=.6,f=1.8,T=g*i*(P+d.currentThrustLevel*(f-P)),j=n.position.clone().add(u.clone().multiplyScalar(T));j.y=0;let $=!1;const X=n.userData.collisionRadius||3;for(const S in p){const D=p[S],Q=D.geometry.parameters.radius+X;if(j.distanceTo(D.position)<Q){$=!0;break}}const St=195,Tt=j.length()>St,ut=_t&&_t.userData.collisionRadius?j.distanceTo(_t.position)<_t.userData.collisionRadius:!1;if(!$&&!Tt&&!ut)Jt&&n.position.copy(j);else if(ut){const S=n.position.clone().sub(_t.position).normalize();Jt&&n.position.add(S.multiplyScalar(.5));const D=new e.PointLight(16763955,5,20);D.position.copy(n.position),v.add(D),Be(n.position.clone(),16763955,75,1500),setTimeout(()=>{v.remove(D)},300)}else if(Tt){n.userData.boundaryTransition||(n.userData.boundaryTransition={active:!0,startTime:Zt.getElapsedTime(),initialPosition:n.position.clone(),initialCameraPosition:I.position.clone(),initialCameraTarget:L.target.clone()},n.userData.controlsDisabled=!0,setTimeout(()=>{const Q=document.getElementById("restart-message");Q&&Q.classList.add("visible")},2e3));const S=n.userData.boundaryTransition,D=Zt.getElapsedTime()-S.startTime,V=3;if(D<=V){const Q=Math.min(D/V,1);n.traverse(E=>{(E.isMesh||E.isPoints)&&E.material&&(E.material.transparent?(E.userData.originalOpacity===void 0&&(E.userData.originalOpacity=E.material.opacity),E.material.opacity=E.userData.originalOpacity*(1-Q)):(E.material.transparent=!0,E.userData.originalOpacity=1,E.material.opacity=1-Q))});const ft=new e.Vector3(0,50,0);I.position.lerpVectors(S.initialCameraPosition,ft,Q),L.target.set(0,0,0)}else{n.userData.orbitingMode||(n.userData.orbitingMode=!0,n.visible=!1,I.position.set(0,50,0));const Q=.05,ft=50,E=Zt.getElapsedTime()*Q;I.position.x=Math.sin(E)*ft,I.position.z=Math.cos(E)*ft,I.position.y=50+Math.sin(E*.5)*10,L.target.set(0,0,0)}n.userData.isAtBoundary=!0}else{const S=new e.Vector3;for(const D in p){const V=p[D],Q=new e.Vector3(V.position.x-n.position.x,0,V.position.z-n.position.z).normalize();S.sub(Q.multiplyScalar(.1))}S.y=0,n.position.add(S),Be(n.position.clone(),8039935,50,1e3),n.position.y=0}if(Vt)if(d.currentThrustLevel>.05){Vt.visible=!1,ge.intensity=6*d.currentThrustLevel,Wt.visible=!0;const S=Wt.geometry.attributes.position.array;for(let D=0;D<ke;D++){const V=D*3;S[V+2]+=.15*Math.random(),S[V+2]>5&&(S[V]=(Math.random()-.5)*.5,S[V+1]=(Math.random()-.5)*.5,S[V+2]=2)}Wt.geometry.attributes.position.needsUpdate=!0}else Vt.visible=!1,ge.intensity=0,Wt.visible=!1}if(d.currentThrustLevel>.1&&!at){const u=new e.Vector3(0,0,-1);u.applyQuaternion(n.quaternion),I.position.add(u.multiplyScalar(g*i))}if(!at){Jt?d.left?d.currentTargetYawRate=h*i:d.right?d.currentTargetYawRate=-h*i:d.currentTargetYawRate=0:(d.currentTargetYawRate=0,d.currentYawRate=0);const u=d.currentTargetYawRate!==0?d.turnAccelerationRate:d.turnDecelerationRate;d.currentYawRate+=(d.currentTargetYawRate-d.currentYawRate)*u,Math.abs(d.currentYawRate-d.currentTargetYawRate)<1e-4&&(d.currentYawRate=d.currentTargetYawRate),Math.abs(d.currentYawRate)<1e-4&&d.currentTargetYawRate===0&&(d.currentYawRate=0);const P=d.currentYawRate;if(P!==0){const j=new e.Quaternion;j.setFromAxisAngle(new e.Vector3(0,1,0),P),n.quaternion.premultiply(j),n.quaternion.normalize();const $=.3,X=Math.sign(d.currentYawRate),St=Math.abs(d.currentYawRate)/(h*i),it=X*St*$;n.userData.targetTilt=it}n.userData.currentTilt||(n.userData.currentTilt=0),!d.left&&!d.right&&(n.userData.targetTilt=0);let f;Math.abs(n.userData.targetTilt)>Math.abs(n.userData.currentTilt)?f=.7:f=.15,n.userData.currentTilt+=(n.userData.targetTilt-n.userData.currentTilt)*f,n.rotation.order="YXZ";const T=new e.Euler().setFromQuaternion(n.quaternion,n.rotation.order);if(T.x=0,T.z=n.userData.currentTilt,n.quaternion.setFromEuler(T),n.userData.leftWingTrail&&n.userData.rightWingTrail){const j=d.currentThrustLevel>.1,$=Math.abs(n.userData.currentTilt)>.05,X=n.userData.leftWingTrail.geometry.attributes.position.array,St=n.userData.leftWingTrail.geometry.attributes.opacity.array,it=n.userData.rightWingTrail.geometry.attributes.position.array,Tt=n.userData.rightWingTrail.geometry.attributes.opacity.array;for(let ut=0;ut<X.length/3;ut++){const S=ut*3;X[S+2]+=.1,it[S+2]+=.1,X[S+2]>5&&(X[S]=-2.5+(Math.random()*.2-.1),X[S+1]=.1+(Math.random()*.2-.1),X[S+2]=-.5+Math.random()*.2),it[S+2]>5&&(it[S]=2.5+(Math.random()*.2-.1),it[S+1]=.1+(Math.random()*.2-.1),it[S+2]=-.5+Math.random()*.2);const D=1-Math.min(1,X[S+2]/5),V=Math.max(0,-n.userData.currentTilt*2),Q=Math.max(0,n.userData.currentTilt*2),ft=j?.2:0,E=ft+($?V*.8:0),Vi=ft+($?Q*.8:0);St[ut]=E*D,Tt[ut]=Vi*D}n.userData.leftWingTrail.geometry.attributes.position.needsUpdate=!0,n.userData.leftWingTrail.geometry.attributes.opacity.needsUpdate=!0,n.userData.rightWingTrail.geometry.attributes.position.needsUpdate=!0,n.userData.rightWingTrail.geometry.attributes.opacity.needsUpdate=!0}}if(!Z&&!at){if(n.userData.isAtBoundary){const u=new e.Vector3(0,5,10),P=new e.Vector3(-n.position.x,0,-n.position.z).normalize(),f=new e.Quaternion().setFromUnitVectors(new e.Vector3(0,0,1),P);u.applyQuaternion(f),I.position.copy(n.position).add(u),L.target.set(0,0,0),(d.currentThrustLevel>.1||d.left||d.right)&&(n.userData.isAtBoundary=!1)}else{const u=new e.Euler().setFromQuaternion(n.quaternion,"YXZ"),P=new e.Quaternion().setFromEuler(new e.Euler(0,u.y,0)),f=new e.Vector3(0,5,15);f.applyQuaternion(P),I.position.copy(n.position).add(f),L.target.copy(n.position)}I.up.set(0,1,0)}}L.update(),xt&&xt.render(),window.requestAnimationFrame(Wi)},Ct=document.getElementById("welcome-popup"),ht=document.getElementById("enter-site"),Pe=document.getElementById("site-toggle"),he=document.getElementById("space-option"),me=document.getElementById("simple-option"),je=document.getElementById("space-controls");let ti=!1,Ce="space";function oo(){Ct.style.display="flex",he.classList.add("active"),me.classList.remove("active"),je.style.display="block",setTimeout(()=>{Ct.style.opacity="1",Ct.querySelector(".welcome-content").style.transform="translateY(0)"},50)}function Ge(){const t=document.querySelector(".welcome-content");Pe.checked?(Ce="simple",me.classList.add("active"),he.classList.remove("active"),je.style.display="none",t.classList.add("simple-mode"),t.querySelectorAll("h1, h2, h3").forEach(a=>{a.style.fontFamily='"Times New Roman", serif',a.style.fontWeight="normal"}),t.querySelectorAll("p").forEach(a=>{a.style.fontFamily='"Times New Roman", serif',a.style.fontStyle="italic"}),ht.style.background="rgba(255, 255, 255, 0.1)",ht.style.border="1px solid rgba(255, 255, 255, 0.3)",ht.style.fontFamily='"Times New Roman", serif',ht.style.fontWeight="normal",t.style.backgroundColor="rgba(30, 30, 40, 0.85)",t.style.boxShadow="0 0 20px rgba(200, 200, 220, 0.3)",t.style.border="1px solid rgba(200, 200, 220, 0.4)"):(Ce="space",he.classList.add("active"),me.classList.remove("active"),je.style.display="block",t.classList.remove("simple-mode"),t.querySelectorAll("h1, h2, h3").forEach(a=>{a.style.fontFamily='"Orbitron", sans-serif',a.style.fontWeight="bold"}),t.querySelectorAll("p").forEach(a=>{a.style.fontFamily='"Space Mono", monospace',a.style.fontStyle="normal"}),ht.style.background="rgba(93, 156, 236, 0.2)",ht.style.border="1px solid rgba(93, 156, 236, 0.4)",ht.style.fontFamily='"Orbitron", sans-serif',ht.style.fontWeight="bold",t.style.backgroundColor="rgba(10, 20, 40, 0.8)",t.style.boxShadow="0 0 30px rgba(93, 156, 236, 0.4)",t.style.border="2px solid rgba(93, 156, 236, 0.6)")}function Yi(){Ct.style.opacity="0",Ct.querySelector(".welcome-content").style.transform="translateY(20px)",setTimeout(()=>{if(Ct.style.display="none",Jt=!0,Ce==="simple")window.location.href="./simplified/index.html";else{ti||(ti=!0,n.userData.isAtBoundary=!1,Wi()),navigateToPlanet("home");const t=document.querySelector(".ship-controls");t&&(t.style.display="flex",t.style.opacity="1",t.style.zIndex="50"),typeof window.resetAndStartTypingAnimation=="function"&&setTimeout(window.resetAndStartTypingAnimation,500)}},500)}Pe.addEventListener("change",Ge);ht.addEventListener("click",Yi);he.addEventListener("click",()=>{Pe.checked=!1,Ge()});me.addEventListener("click",()=>{Pe.checked=!0,Ge()});document.addEventListener("keydown",t=>{t.key==="Enter"&&Ct.style.display!=="none"&&Yi()});setTimeout(()=>{oo()},1500);
