(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const byId={}; CHARTS.forEach(c=>byId[c.id]=c);

/* ---------- 색 ---------- */
const C={s1:"#2a78d6",s2:"#eb6834",s3:"#1baf7a",s4:"#eda100",s5:"#e87ba4",s6:"#008300",s7:"#6250d6",s8:"#e34948",ink:"#1b1f24",mut:"#5b6470",grid:"#e8ebef",axis:"#9aa3ad"};
const GC=["",C.s1,C.s2,C.s3,C.s4,C.s5,C.s6];
const CL=[C.s1,C.s2,C.s3,C.s7,C.s8,C.s6,C.s5,C.s4];   /* 군집 색(모양과 함께 씀) */
function hexA(h,a){const n=parseInt(h.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}
function mix(a,b,t){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const f=s=>Math.round(((A>>s)&255)*(1-t)+((B>>s)&255)*t);return `rgb(${f(16)},${f(8)},${f(0)})`;}
function div(v){ return v<0?mix("#f0f0f0",C.s1,Math.min(1,-v)):mix("#f0f0f0",C.s8,Math.min(1,v)); }

/* ---------- 수학 ---------- */
const SQ=Math.sqrt,E=Math.exp,LN=Math.log,PI=Math.PI;
function erf(x){const s=Math.sign(x);x=Math.abs(x);const t=1/(1+0.5*x);const y=1-t*E(-x*x-1.26551223+t*(1.00002368+t*(0.37409196+t*(0.09678418+t*(-0.18628806+t*(0.27886807+t*(-1.13520398+t*(1.48851587+t*(-0.82215223+t*0.17087277)))))))));return s*y;}
const Phi=z=>0.5*(1+erf(z/Math.SQRT2)), phi=z=>E(-z*z/2)/SQ(2*PI);
function invPhi(p){let lo=-8,hi=8;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(Phi(m)<p)lo=m;else hi=m;}return (lo+hi)/2;}
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function gauss(r){let u=0,v=0;while(u===0)u=r();while(v===0)v=r();return SQ(-2*LN(u))*Math.cos(2*PI*v);}
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const sd=a=>{const m=mean(a);return SQ(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1));};
function quant(sorted,p){const i=(sorted.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return sorted[lo]+(sorted[hi]-sorted[lo])*(i-lo);}
function corr(x,y){const mx=mean(x),my=mean(y);let a=0,b=0,c=0;for(let i=0;i<x.length;i++){a+=(x[i]-mx)*(y[i]-my);b+=(x[i]-mx)**2;c+=(y[i]-my)**2;}return a/SQ(b*c);}
function linfit(x,y){const mx=mean(x),my=mean(y);let a=0,b=0;for(let i=0;i<x.length;i++){a+=(x[i]-mx)*(y[i]-my);b+=(x[i]-mx)**2;}const s=a/b;return [s,my-s*mx];}
const f1=v=>v.toFixed(1), f2=v=>v.toFixed(2), f3=v=>v.toFixed(3), pct=v=>(v*100).toFixed(1)+"%", int=v=>Math.round(v).toLocaleString("ko-KR");

/* ---------- 캐릭터 ---------- */
function spr(k){const a=(window.SPRITE_ALIAS||{})[k]||k;const s=(window.SPRITE||{})[a];if(s)return s;const who=k.split("_")[0];const base={doc:"doc_front",asst:"asst_smile",fly:"fly_coffee",robo:"robo_smile",sia:"sia_explain",moa:"moa_tea",x1:"x1_hint",x2:"x2_hint",x3:"x3_hint"}[who];return (window.SPRITE||{})[(window.SPRITE_ALIAS||{})[base]]||"";}
function say(who,key,text,right,sm){return `<div class="say${right?" right":""}${sm?" sm":""}" data-who="${who}"><img class="who" src="${spr(key)}" alt="" aria-hidden="true"><div><b class="name">${NAMES[who]}</b><p>${text}</p></div></div>`;}
$$("[data-dlg]").forEach(el=>{const d=DLG[el.dataset.dlg];if(d)el.innerHTML=d.map((x,i)=>say(x[0],x[1],x[2],i%2===1)).join("");});
$$("[data-mis]").forEach(el=>{const m=byId[el.dataset.mis].mis;const key={fly:"fly_point",robo:"robo_sigh",asst:"asst_report",doc:"doc_judge"}[m[2]];el.innerHTML=say(m[0],m[0]+"_hint",m[1],false,true)+say(m[2],key,m[3],true,true);});
$$("[data-sayq]").forEach(el=>{const G=GROUPS[+el.dataset.sayq-1];el.innerHTML=say("asst","asst_shock",G.math.ask,false,true);});
$$("[data-saya]").forEach(el=>{const G=GROUPS[+el.dataset.saya-1];el.innerHTML=say("asst","asst_spark",G.math.after,false,true);});
const CAST=[
 ["선생님",[["doc","doc_front","박사","선생님","교시마다 현장 질문으로 수업을 열고, 판정은 늘 숫자대로 합니다."]]],
 ["조교",[["robo","robo_calc","주판봇","조교","계산과 코드 담당. 큰 숫자를 보면 서두르는 버릇이 있어, 일부러 성급한 결론을 내고 함께 고칩니다."],["fly","fly_point","초파리","조교","눈과 감각 담당. 3D 지도를 날아다니며 짝 그림을 이어 주고, 늘 ‘정말?’이라고 묻습니다."]]],
 ["수강생",[["asst","asst_smile","하루","수강생","평소엔 조수지만 오늘은 수강생. 수식이 나오면 대신 묻고, 교시 끝 세 줄 정리를 맡습니다."],["sia","sia_explain","시아","수강생","순서를 ① ② ③으로 정리하고 실험 신호를 줍니다."],["moa","moa_tea","모아","수강생","현장 데이터를 떠올리고 기록을 모읍니다. 차를 챙겨요."],["x1","x1_hint","X1","수강생","‘흔한 오독’ 담당 ①. 일부러 틀리게 읽습니다."],["x2","x2_hint","X2","수강생","‘흔한 오독’ 담당 ②. 숫자를 성급히 믿습니다."],["x3","x3_hint","X3","수강생","‘흔한 오독’ 담당 ③. 상관을 인과로 읽곤 합니다."]]]
];
$("#castgrid").innerHTML=CAST.map(([t,list])=>`<div class="castgroup">${t}</div><div class="castgrid">${list.map(c=>`<div class="castc" style="--cc:var(--c-${c[0].startsWith("x")?"x":c[0]})"><img src="${spr(c[1])}" alt="" aria-hidden="true"><div><b>${c[2]}</b><span class="role">${c[3]}</span><p>${c[4]}</p></div></div>`).join("")}</div>`).join("");
$("#castrow").innerHTML=["doc_front","robo_coin","fly_point","asst_spark","sia_explain","moa_tea","x1_hint","x2_hint","x3_hint"].map(k=>`<img src="${spr(k)}" alt="">`).join("");

/* ---------- 캔버스 틀 ---------- */
function setup(cv,w0,h0){const r=cv.getBoundingClientRect();const dpr=Math.min(2,window.devicePixelRatio||1);const w=w0||Math.max(100,r.width),h=h0||Math.max(60,r.height);cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);const g=cv.getContext("2d");g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle="#fff";g.fillRect(0,0,w,h);return {g,w,h};}
function frame(g,W,H,o){
  const lab=W>=200, fs=lab?11:9;
  const L=o.l!=null?o.l:(lab?(o.yl?48:30):8), R=W-(o.r!=null?o.r:(lab?10:6)), T=o.t!=null?o.t:(lab?10:6), B=H-(o.b!=null?o.b:(lab?(o.xl?34:22):8));
  const X=x=>L+(x-o.x0)/(o.x1-o.x0)*(R-L), Y=y=>B-(y-o.y0)/(o.y1-o.y0)*(B-T);
  g.save(); g.lineWidth=1;
  if(lab&&o.grid!==false){g.strokeStyle=C.grid;(o.yt||[]).forEach(v=>{g.beginPath();g.moveTo(L,Math.round(Y(v))+.5);g.lineTo(R,Math.round(Y(v))+.5);g.stroke();});}
  g.strokeStyle=C.axis;g.beginPath();g.moveTo(L,T);g.lineTo(L,B+.5);g.lineTo(R,B+.5);g.stroke();
  g.fillStyle=C.mut;g.font=`${fs}px IBM Plex Sans KR, sans-serif`;
  if(lab){g.textAlign="right";g.textBaseline="middle";(o.yt||[]).forEach(v=>g.fillText(o.yf?o.yf(v):v,L-4,Y(v)));
    g.textAlign="center";g.textBaseline="top";(o.xt||[]).forEach(v=>g.fillText(o.xf?o.xf(v):v,X(v),B+4));
    if(o.xl){g.fillText(o.xl,(L+R)/2,B+18);} if(o.yl){g.save();g.translate(10,(T+B)/2);g.rotate(-PI/2);g.textBaseline="middle";g.fillText(o.yl,0,0);g.restore();}}
  g.restore(); return {X,Y,L,R,T,B,lab,fs};
}
function path(g,pts,col,w,dash){g.save();g.strokeStyle=col;g.lineWidth=w||2;g.lineJoin="round";if(dash)g.setLineDash(dash);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.restore();}
function marker(g,x,y,r,col,shape){g.beginPath();if(shape===1){g.rect(x-r,y-r,2*r,2*r);}else if(shape===2){g.moveTo(x,y-r*1.2);g.lineTo(x+r*1.1,y+r*.8);g.lineTo(x-r*1.1,y+r*.8);g.closePath();}else if(shape===3){g.moveTo(x,y-r*1.3);g.lineTo(x+r*1.1,y);g.lineTo(x,y+r*1.3);g.lineTo(x-r*1.1,y);g.closePath();}else g.arc(x,y,r,0,2*PI);g.fillStyle=col;g.fill();}
function dots(g,P,xs,ys,col,r,a){g.save();g.globalAlpha=a==null?.75:a;for(let i=0;i<xs.length;i++){marker(g,P.X(xs[i]),P.Y(ys[i]),r||2.2,col);}g.restore();}
function txt(g,s,x,y,o={}){g.save();g.fillStyle=o.c||C.ink;g.font=`${o.b?"700 ":""}${o.s||11}px IBM Plex Sans KR, sans-serif`;g.textAlign=o.a||"left";g.textBaseline=o.bl||"middle";g.fillText(s,x,y);g.restore();}
function areaFill(g,pts,base,col,a){g.save();g.globalAlpha=a;g.fillStyle=col;g.beginPath();g.moveTo(pts[0][0],base);pts.forEach(p=>g.lineTo(p[0],p[1]));g.lineTo(pts[pts.length-1][0],base);g.closePath();g.fill();g.restore();}
function bar(g,x,y,w,h,col){g.fillStyle=col;g.fillRect(x,y,w,h);}
const rng01=(a,b,n)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));

/* ---------- 고정 예시 데이터 ---------- */
const DATA=(function(){
  const r=rng(20261124), D={};
  D.mix=Array.from({length:600},()=>r()<.7?gauss(r):3+0.7*gauss(r));
  D.boxg=[Array.from({length:120},()=>5+gauss(r)),Array.from({length:120},()=>6+1.5*gauss(r)),Array.from({length:120},()=>3+E(0.5*gauss(r))*1.4)];
  D.ecdf=Array.from({length:60},()=>{let s=0;for(let k=0;k<3;k++)s+=-LN(r());return s;}).sort((a,b)=>a-b);
  D.qq=Array.from({length:80},()=>E(0.6*gauss(r))).sort((a,b)=>a-b);
  D.sx=[],D.sy=[];for(let i=0;i<80;i++){const x=gauss(r),y=0.7*x+SQ(1-0.49)*gauss(r);D.sx.push(x);D.sy.push(y);}
  D.p3=Array.from({length:70},()=>{const a=gauss(r),b=0.8*a+0.6*gauss(r),c=-0.3*a+0.95*gauss(r);return [a,b,c];});
  D.rx=Array.from({length:80},()=>r()*10);D.ry=D.rx.map(x=>0.15*(x-5)**2-1.2+0.6*gauss(r));
  D.shap=[0.9,0.7,0.5,0.35,0.25,0.15].map(w=>Array.from({length:45},()=>{const v=r();return [v,w*(v-.5)*2+0.08*gauss(r)];}));
  D.ice=Array.from({length:26},(_,i)=>{const up=i%2===0,a=(up?1:-1)*(0.25+0.25*r()),b=0.5+0.3*gauss(r);return x=>b+a/(1+E(-(x-50)/6));});
  D.bip=Array.from({length:60},(_,i)=>{const c=i<30?-1:1;return [c*1.3+0.7*gauss(r),0.6*c*0.3+0.8*gauss(r)];});
  D.ts=Array.from({length:4},(_,k)=>{const cx=[-3,3,-2,3.5][k],cy=[2.5,3,-3,-2][k];return Array.from({length:35},()=>[cx+0.8*gauss(r),cy+0.8*gauss(r)]);});
  D.sil=[0.72,0.58,0.1,0.66].map((m,k)=>Array.from({length:[22,18,16,20][k]},()=>Math.max(-0.25,Math.min(0.95,m+0.18*gauss(r)))).sort((a,b)=>b-a));
  D.series=Array.from({length:72},(_,t)=>100+0.8*t+12*Math.sin(2*PI*t/12)+5*gauss(r));
  return D;
})();

/* ---------- 32장 그리기 ---------- */
const R={};
R.hist=(g,W,H)=>{const P=frame(g,W,H,{x0:-3,x1:5.5,y0:0,y1:0.36,xt:[-2,0,2,4],yt:[0,.1,.2,.3],xl:"값",yl:"비율"});const nb=26,w=8.5/nb,cnt=new Array(nb).fill(0);DATA.mix.forEach(v=>{const k=Math.floor((v+3)/w);if(k>=0&&k<nb)cnt[k]++;});
  cnt.forEach((c,k)=>{const y=c/DATA.mix.length/w;const x0=P.X(-3+k*w)+1,x1=P.X(-3+(k+1)*w)-1;bar(g,x0,P.Y(y),Math.max(1,x1-x0),P.B-P.Y(y),hexA(C.s1,.45));});
  const xs=rng01(-3,5.5,120);path(g,xs.map(x=>[P.X(x),P.Y(0.7*phi(x)+0.3*phi((x-3)/0.7)/0.7)]),"#1d5fae",2);};
R.box=(g,W,H)=>{const P=frame(g,W,H,{x0:0,x1:3,y0:0,y1:12,yt:[0,4,8,12],xt:[.5,1.5,2.5],xf:v=>["A 지점","B 지점","C 지점"][Math.floor(v)],yl:"대기 시간"});
  DATA.boxg.forEach((arr,k)=>{const s=arr.slice().sort((a,b)=>a-b),q1=quant(s,.25),q2=quant(s,.5),q3=quant(s,.75),iq=q3-q1,lo=Math.max(s[0],q1-1.5*iq),hi=Math.min(s[s.length-1],q3+1.5*iq),cx=P.X(k+.5),bw=(P.X(1)-P.X(0))*.22;
   // 바이올린
   const ys=rng01(s[0],s[s.length-1],40),h=0.5*sd(s)*Math.pow(s.length,-.2),dens=ys.map(y=>s.reduce((a,v)=>a+phi((y-v)/h),0)/(s.length*h)),mx=Math.max(...dens);
   g.save();g.fillStyle=hexA(GC[1],.14);g.beginPath();ys.forEach((y,i)=>{const x=cx+dens[i]/mx*bw*1.6;i?g.lineTo(x,P.Y(y)):g.moveTo(x,P.Y(y));});for(let i=ys.length-1;i>=0;i--)g.lineTo(cx-dens[i]/mx*bw*1.6,P.Y(ys[i]));g.fill();g.restore();
   g.strokeStyle=C.ink;g.lineWidth=1.4;g.beginPath();g.moveTo(cx,P.Y(lo));g.lineTo(cx,P.Y(q1));g.moveTo(cx,P.Y(q3));g.lineTo(cx,P.Y(hi));g.stroke();
   g.fillStyle="#fff";g.fillRect(cx-bw/2,P.Y(q3),bw,P.Y(q1)-P.Y(q3));g.strokeRect(cx-bw/2,P.Y(q3),bw,P.Y(q1)-P.Y(q3));
   g.lineWidth=2.4;g.beginPath();g.moveTo(cx-bw/2,P.Y(q2));g.lineTo(cx+bw/2,P.Y(q2));g.stroke();
   s.filter(v=>v<lo||v>hi).forEach(v=>marker(g,cx,P.Y(Math.min(v,12)),2.4,C.s8));});};
R.ecdf=(g,W,H)=>{const s=DATA.ecdf,n=s.length;const P=frame(g,W,H,{x0:0,x1:9,y0:0,y1:1,xt:[0,3,6,9],yt:[0,.5,.9,1],xl:"응답 시간(초)",yl:"누적 비율"});
  const pts=[[P.X(0),P.Y(0)]];s.forEach((v,i)=>{pts.push([P.X(v),P.Y(i/n)]);pts.push([P.X(v),P.Y((i+1)/n)]);});pts.push([P.X(9),P.Y(1)]);path(g,pts,C.s1,2);
  const q=quant(s,.9);path(g,[[P.L,P.Y(.9)],[P.X(q),P.Y(.9)],[P.X(q),P.B]],C.s8,1.4,[4,3]);if(P.lab)txt(g,"90% 지점 ≈ "+f1(q)+"초",P.X(q)+6,P.Y(.9)+12,{c:C.ink,s:11});};
R.qq=(g,W,H)=>{const s=DATA.qq,n=s.length,m=mean(s),d=sd(s);const P=frame(g,W,H,{x0:-2.6,x1:2.6,y0:-2.2,y1:4.4,xt:[-2,0,2],yt:[-2,0,2,4],xl:"이론 분위수(정규)",yl:"표본 분위수"});
  path(g,[[P.X(-2.2),P.Y(-2.2)],[P.X(2.6),P.Y(2.6)]],C.mut,1.4,[5,4]);s.forEach((v,i)=>marker(g,P.X(invPhi((i+.5)/n)),P.Y((v-m)/d),2.4,C.s7));
  if(P.lab)txt(g,"오른쪽 끝이 위로 휨 → 꼬리가 두꺼움",P.X(-2.4),P.Y(3.9),{s:11});};
R.ks=(g,W,H)=>{const P=frame(g,W,H,{x0:-3,x1:4.5,y0:0,y1:1,xt:[-2,0,2,4],yt:[0,.5,1],xl:"점수",yl:"누적 비율"});const xs=rng01(-3,4.5,150);
  const A=x=>Phi(x),B=x=>Phi((x-1.2)/1.1);path(g,xs.map(x=>[P.X(x),P.Y(A(x))]),C.s1,2);path(g,xs.map(x=>[P.X(x),P.Y(B(x))]),C.s2,2);
  let bx=0,bd=0;xs.forEach(x=>{const dd=A(x)-B(x);if(dd>bd){bd=dd;bx=x;}});g.save();g.strokeStyle=C.ink;g.lineWidth=1.6;g.beginPath();g.moveTo(P.X(bx),P.Y(A(bx)));g.lineTo(P.X(bx),P.Y(B(bx)));g.stroke();g.restore();
  if(P.lab){txt(g,"D = "+f2(bd),P.X(bx)+6,P.Y((A(bx)+B(bx))/2),{b:1});txt(g,"불량",P.X(-1.6),P.Y(.2),{c:C.ink});txt(g,"우량",P.X(2.4),P.Y(.62),{c:C.ink});}};
R.scatter=(g,W,H)=>{const P=frame(g,W,H,{x0:-3,x1:3,y0:-3,y1:3,xt:[-2,0,2],yt:[-2,0,2],xl:"광고비(표준화)",yl:"매출(표준화)"});dots(g,P,DATA.sx,DATA.sy,C.s1,2.4,.7);const [a,b]=linfit(DATA.sx,DATA.sy);path(g,[[P.X(-3),P.Y(a*-3+b)],[P.X(3),P.Y(a*3+b)]],C.s2,2);if(P.lab)txt(g,"r = "+f2(corr(DATA.sx,DATA.sy)),P.X(-2.8),P.Y(2.6),{b:1});};
R.pair=(g,W,H)=>{const n=3,pad=W>=200?18:4,cw=(W-pad*2)/n,ch=(H-pad*2)/n,names=["나이","소득","방문"];
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x0=pad+j*cw,y0=pad+i*ch;g.strokeStyle=C.grid;g.strokeRect(x0+1,y0+1,cw-2,ch-2);
   if(i===j){const v=DATA.p3.map(p=>p[i]),nb=8,cnt=new Array(nb).fill(0);v.forEach(x=>{const k=Math.min(nb-1,Math.max(0,Math.floor((x+2.5)/5*nb)));cnt[k]++;});const mx=Math.max(...cnt);cnt.forEach((c,k)=>bar(g,x0+4+k*(cw-8)/nb,y0+ch-3-c/mx*(ch-8),(cw-8)/nb-1,c/mx*(ch-8),hexA(C.s2,.6)));if(W>=200)txt(g,names[i],x0+4,y0+8,{s:10,c:C.mut});}
   else{DATA.p3.forEach(p=>{const X=x0+4+(p[j]+2.5)/5*(cw-8),Y=y0+ch-4-(p[i]+2.5)/5*(ch-8);if(X>x0&&X<x0+cw&&Y>y0&&Y<y0+ch)marker(g,X,Y,1.3,C.s1);});}}};
const HM=[[1,.82,.35,-.12,.05,-.4],[.82,1,.3,-.05,.1,-.35],[.35,.3,1,.55,-.2,-.1],[-.12,-.05,.55,1,-.6,.15],[.05,.1,-.2,-.6,1,.02],[-.4,-.35,-.1,.15,.02,1]];
R.heat=(g,W,H)=>{const n=6,lab=W>=200,off=lab?34:4,s=Math.min((W-off-6)/n,(H-(lab?18:4)-6)/n),x0=off,y0=lab?14:4;const nm=["나이","소득","방문","구매","이탈","할인"];
  for(let i=0;i<n;i++){for(let j=0;j<n;j++){g.fillStyle=div(HM[i][j]);g.fillRect(x0+j*s+1,y0+i*s+1,s-2,s-2);if(s>22)txt(g,HM[i][j].toFixed(1),x0+j*s+s/2,y0+i*s+s/2,{a:"center",s:10,c:Math.abs(HM[i][j])>.6?"#fff":C.ink});}
   if(lab){txt(g,nm[i],x0-4,y0+i*s+s/2,{a:"right",s:10,c:C.mut});txt(g,nm[i],x0+i*s+s/2,y0-7,{a:"center",s:10,c:C.mut});}}};
R.cross=(g,W,H)=>{const lab=W>=200,L=lab?8:4,T=lab?18:4,Wd=W-L-(lab?62:4),Hd=H-T-(lab?22:4);const ages=[["20대",300,[.4,.35,.25]],["30대",250,[.5,.3,.2]],["50대",100,[.6,.25,.15]]],tot=650,cols=[C.s1,C.s2,C.s3],plans=["무제한","기본","알뜰"];
  let x=L;ages.forEach(a=>{const w=Wd*a[1]/tot;let y=T;a[2].forEach((p,k)=>{const h=Hd*p;g.fillStyle=cols[k];g.fillRect(x+1,y+1,w-2,h-2);if(lab&&h>14&&w>30)txt(g,Math.round(p*100)+"%",x+w/2,y+h/2,{a:"center",s:10,c:"#fff",b:1});y+=h;});if(lab)txt(g,a[0]+" "+a[1]+"명",x+w/2,T+Hd+10,{a:"center",s:10,c:C.mut});x+=w;});
  if(lab)plans.forEach((p,k)=>{g.fillStyle=cols[k];g.fillRect(W-56,T+6+k*18,10,10);txt(g,p,W-42,T+11+k*18,{s:10});});};
R.resid=(g,W,H)=>{const P=frame(g,W,H,{x0:0,x1:10,y0:-3,y1:4,xt:[0,5,10],yt:[-2,0,2,4],xl:"예측값",yl:"잔차"});path(g,[[P.L,P.Y(0)],[P.R,P.Y(0)]],C.mut,1.2,[4,3]);dots(g,P,DATA.rx,DATA.ry,C.s1,2.3,.75);
  const xs=rng01(0,10,60);path(g,xs.map(x=>[P.X(x),P.Y(0.15*(x-5)**2-1.2)]),C.s2,2);if(P.lab)txt(g,"U자 → 직선 모델이 놓친 곡선",P.X(2.3),P.Y(3.4),{s:11});};
function cmGrid(g,W,H,v){const lab=W>=200,L=lab?52:4,T=lab?30:4,s=Math.min((W-L-8)/2,(H-T-6)/2),mx=Math.max(...v);const nm=["TN","FP","FN","TP"];
  for(let k=0;k<4;k++){const i=k>>1,j=k&1,x=L+j*s,y=T+i*s;g.fillStyle=mix("#f4f7fb",C.s1,0.15+0.85*Math.sqrt(v[k]/mx));g.fillRect(x+1,y+1,s-2,s-2);const dark=v[k]/mx>.35;txt(g,int(v[k]),x+s/2,y+s/2-(lab?6:0),{a:"center",b:1,s:lab?15:11,c:dark?"#fff":C.ink});if(lab)txt(g,nm[k],x+s/2,y+s/2+12,{a:"center",s:10,c:dark?"#fff":C.mut});}
  if(lab){txt(g,"예측 정상",L+s/2,T-18,{a:"center",s:10,c:C.mut});txt(g,"예측 사기",L+1.5*s,T-18,{a:"center",s:10,c:C.mut});txt(g,"실제 정상",L-4,T+s/2,{a:"right",s:10,c:C.mut});txt(g,"실제 사기",L-4,T+1.5*s,{a:"right",s:10,c:C.mut});}}
R.cm=(g,W,H)=>cmGrid(g,W,H,[860,40,30,70]);
function errPlot(g,W,H,t,m1){const P=frame(g,W,H,{x0:-3.5,x1:m1+3.5,y0:0,y1:0.45,xt:[0,m1],xf:v=>v===0?"정상 평균":"이상 평균",yt:[],xl:"점수"});const xs=rng01(-3.5,m1+3.5,200);
  const a=xs.filter(x=>x>=t).map(x=>[P.X(x),P.Y(phi(x))]),b=xs.filter(x=>x<=t).map(x=>[P.X(x),P.Y(phi(x-m1))]);if(a.length>1)areaFill(g,a,P.B,C.s8,.45);if(b.length>1)areaFill(g,b,P.B,C.s2,.4);
  path(g,xs.map(x=>[P.X(x),P.Y(phi(x))]),C.s1,2);path(g,xs.map(x=>[P.X(x),P.Y(phi(x-m1))]),C.s7,2);path(g,[[P.X(t),P.T],[P.X(t),P.B]],C.ink,1.6,[5,3]);
  if(P.lab){txt(g,"α "+pct(1-Phi(t)),P.X(t)+5,P.T+10,{c:C.ink,b:1});txt(g,"β "+pct(Phi(t-m1)),P.X(t)-5,P.T+10,{a:"right",c:C.ink,b:1});}return P;}
R.err=(g,W,H)=>errPlot(g,W,H,1.5,2.5);
function rocCurve(m){return rng01(-4,m+4,160).map(t=>[1-Phi(t),1-Phi(t-m)]).reverse();}
function rocPlot(g,W,H,m,pt){const P=frame(g,W,H,{x0:0,x1:1,y0:0,y1:1,xt:[0,.5,1],yt:[0,.5,1],xl:"헛경보율 FPR",yl:"재현율 TPR"});path(g,[[P.X(0),P.Y(0)],[P.X(1),P.Y(1)]],C.mut,1.2,[4,3]);const c=rocCurve(m).map(p=>[P.X(p[0]),P.Y(p[1])]);areaFill(g,c,P.B,C.s1,.1);path(g,c,C.s1,2.2);
  if(P.lab)txt(g,"AUC = "+f2(Phi(m/Math.SQRT2)),P.X(.45),P.Y(.25),{b:1});if(pt){marker(g,P.X(pt[0]),P.Y(pt[1]),6,"#fff");marker(g,P.X(pt[0]),P.Y(pt[1]),4.5,C.s8);}}
R.roc=(g,W,H)=>rocPlot(g,W,H,2);
function prPts(m,pi){return rng01(-4,m+4,200).map(t=>{const tp=1-Phi(t-m),fp=1-Phi(t);return [tp,pi*tp/(pi*tp+(1-pi)*fp)];}).filter(p=>isFinite(p[1]));}
function prPlot(g,W,H,m,pi,pt){const P=frame(g,W,H,{x0:0,x1:1,y0:0,y1:1,xt:[0,.5,1],yt:[0,.5,1],xl:"재현율",yl:"정밀도"});path(g,[[P.X(0),P.Y(pi)],[P.X(1),P.Y(pi)]],C.mut,1.2,[4,3]);path(g,prPts(m,pi).map(p=>[P.X(p[0]),P.Y(p[1])]),C.s3,2.2);
  if(P.lab)txt(g,"무작위 기준선 = 양성 비율 "+Math.round(pi*100)+"%",P.X(.04),P.Y(pi)-8,{s:10,c:C.mut});if(pt){marker(g,P.X(pt[0]),P.Y(pt[1]),6,"#fff");marker(g,P.X(pt[0]),P.Y(pt[1]),4.5,C.s8);}}
R.pr=(g,W,H)=>prPlot(g,W,H,2,0.1);
R.cal=(g,W,H)=>{const P=frame(g,W,H,{x0:0,x1:1,y0:0,y1:1,xt:[0,.5,1],yt:[0,.5,1],xl:"모델이 말한 확률",yl:"실제로 일어난 비율"});path(g,[[P.X(0),P.Y(0)],[P.X(1),P.Y(1)]],C.mut,1.2,[4,3]);const pts=Array.from({length:10},(_,i)=>{const p=(i+.5)/10;return [P.X(p),P.Y(Math.pow(p,1.6))];});path(g,pts,C.s2,2);pts.forEach(p=>marker(g,p[0],p[1],3.5,C.s2));if(P.lab)txt(g,"대각선 아래 = 과신",P.X(.52),P.Y(.18),{s:11});};
R.lift=(g,W,H)=>{const m=2,pi=.1;const P=frame(g,W,H,{x0:0,x1:1,y0:0,y1:1,xt:[0,.2,.5,1],xf:v=>Math.round(v*100)+"%",yt:[0,.5,1],yf:v=>Math.round(v*100)+"%",xl:"점수 상위 고객 비율",yl:"잡은 양성 비율"});path(g,[[P.X(0),P.Y(0)],[P.X(1),P.Y(1)]],C.mut,1.2,[4,3]);
  const pts=rng01(m+4,-4,160).map(t=>{const tp=1-Phi(t-m),fp=1-Phi(t);return [pi*tp+(1-pi)*fp,tp];});path(g,pts.map(p=>[P.X(p[0]),P.Y(p[1])]),C.s1,2.2);
  let best=pts[0];pts.forEach(p=>{if(Math.abs(p[0]-.2)<Math.abs(best[0]-.2))best=p;});marker(g,P.X(best[0]),P.Y(best[1]),4.5,C.s8);if(P.lab)txt(g,"상위 20% → "+Math.round(best[1]*100)+"% 포착, 리프트 "+f1(best[1]/best[0]),P.X(.24),P.Y(best[1])+12,{s:11});};
R.bv=(g,W,H)=>{const P=frame(g,W,H,{x0:0,x1:1,y0:0,y1:1,xt:[],yt:[],xl:"모델 복잡도 →",yl:"오차"});const xs=rng01(0,1,100),b=x=>0.85*E(-4.5*x)+0.03,v=x=>0.04*E(3.3*x),t=x=>b(x)+v(x)+0.06;
  path(g,xs.map(x=>[P.X(x),P.Y(b(x))]),C.s1,2);path(g,xs.map(x=>[P.X(x),P.Y(v(x))]),C.s2,2);path(g,xs.map(x=>[P.X(x),P.Y(t(x))]),C.s3,2.4);let bm=0;xs.forEach(x=>{if(t(x)<t(bm))bm=x;});path(g,[[P.X(bm),P.T],[P.X(bm),P.B]],C.mut,1,[4,3]);
  if(P.lab){txt(g,"총오차",P.X(.84),P.Y(t(.84))-10,{s:11});txt(g,"분산",P.X(.86),P.Y(v(.86))+12,{s:11});txt(g,"편향²",P.X(.04),P.Y(b(.04)),{s:11,bl:"bottom"});txt(g,"적정",P.X(bm)+4,P.B-8,{s:10,c:C.mut});}};
R.lc=(g,W,H)=>{const P=frame(g,W,H,{x0:0.1,x1:1,y0:0.5,y1:1,xt:[.1,.5,1],xf:v=>Math.round(v*100)+"%",yt:[.5,.75,1],xl:"학습 데이터 양",yl:"점수"});const xs=rng01(.1,1,40),tr=x=>0.99-0.09*x,va=x=>0.88-0.3*E(-3.2*(x-.1));
  areaFill(g,xs.map(x=>[P.X(x),P.Y(va(x)+.025)]),P.B,"#fff",0);g.save();g.globalAlpha=.12;g.fillStyle=C.s2;g.beginPath();xs.forEach((x,i)=>i?g.lineTo(P.X(x),P.Y(va(x)+.03)):g.moveTo(P.X(x),P.Y(va(x)+.03)));for(let i=xs.length-1;i>=0;i--)g.lineTo(P.X(xs[i]),P.Y(va(xs[i])-.03));g.fill();g.restore();
  path(g,xs.map(x=>[P.X(x),P.Y(tr(x))]),C.s1,2);path(g,xs.map(x=>[P.X(x),P.Y(va(x))]),C.s2,2);if(P.lab){txt(g,"학습",P.X(.12),P.Y(tr(.12))+10,{s:11});txt(g,"검증",P.X(.14),P.Y(va(.14))+12,{s:11});}};
R.loss=(g,W,H)=>{const P=frame(g,W,H,{x0:1,x1:60,y0:0,y1:1.3,xt:[1,20,40,60],yt:[0,.5,1],xl:"반복 횟수(에폭)",yl:"손실"});const xs=rng01(1,60,60),tr=e=>1.2*E(-e/12)+0.08,va=e=>1.1*E(-e/12)+0.2+0.00025*e*e;
  path(g,xs.map(x=>[P.X(x),P.Y(tr(x))]),C.s1,2);path(g,xs.map(x=>[P.X(x),P.Y(va(x))]),C.s2,2);let bm=1;xs.forEach(x=>{if(va(x)<va(bm))bm=x;});path(g,[[P.X(bm),P.T],[P.X(bm),P.B]],C.mut,1,[4,3]);marker(g,P.X(bm),P.Y(va(bm)),4,C.s8);
  if(P.lab){txt(g,"학습",P.X(50),P.Y(tr(50))-10,{s:11});txt(g,"검증",P.X(50),P.Y(va(50))-10,{s:11});txt(g,"멈출 곳",P.X(bm)+4,P.T+8,{s:10,c:C.mut});}};
R.gini=(g,W,H)=>{const P=frame(g,W,H,{x0:0,x1:1,y0:0,y1:1.05,xt:[0,.5,1],yt:[0,.5,1],xl:"한 범주의 비율 p",yl:"불순도"});const xs=rng01(0.001,0.999,120),en=p=>-p*Math.log2(p)-(1-p)*Math.log2(1-p),gi=p=>2*p*(1-p);
  path(g,xs.map(x=>[P.X(x),P.Y(en(x))]),C.s1,2.2);path(g,xs.map(x=>[P.X(x),P.Y(gi(x))]),C.s2,2.2);if(P.lab){txt(g,"엔트로피",P.X(.5),P.Y(1)+12,{a:"center",s:11});txt(g,"지니",P.X(.5),P.Y(.5)+12,{a:"center",s:11});}};
const FEAT=["소득","연체이력","나이","한도","카드 수","지역"];
R.imp=(g,W,H)=>{const v=[.31,.24,.15,.11,.06,.03],lab=W>=200,L=lab?62:6,T=lab?8:6,bh=(H-T-(lab?20:6))/v.length,mx=.35;v.forEach((x,i)=>{const w=(W-L-12)*x/mx;g.fillStyle=C.s1;g.fillRect(L,T+i*bh+2,w,bh-4);if(lab){txt(g,FEAT[i],L-5,T+i*bh+bh/2,{a:"right",s:10.5,c:C.mut});txt(g,f2(x),L+w+4,T+i*bh+bh/2,{s:10});}});if(lab)txt(g,"성능이 떨어진 양(순열 중요도)",L,H-8,{s:10,c:C.mut});};
R.shap=(g,W,H)=>{const lab=W>=200,L=lab?62:6,T=lab?8:6,B=H-(lab?20:6),rh=(B-T)/6,X=v=>L+(v+1)/2*(W-L-10);path(g,[[X(0),T],[X(0),B]],C.axis,1);
  DATA.shap.forEach((arr,i)=>{const cy=T+i*rh+rh/2,bins={};arr.forEach(([v,s])=>{const k=Math.round(s*20);bins[k]=(bins[k]||0)+1;const j=bins[k];const y=cy+((j%2?1:-1)*Math.ceil(j/2-.5))*Math.min(2.6,rh/10);marker(g,X(s),y,lab?2.2:1.4,div(v*2-1));});if(lab)txt(g,FEAT[i],L-5,cy,{a:"right",s:10.5,c:C.mut});});
  if(lab){txt(g,"← 위험 낮춤",L+2,H-8,{s:10,c:C.mut});txt(g,"위험 높임 →",W-12,H-8,{a:"right",s:10,c:C.mut});}};
R.pdp=(g,W,H)=>{const P=frame(g,W,H,{x0:20,x1:80,y0:0,y1:1.3,xt:[20,50,80],yt:[0,.5,1],xl:"나이",yl:"예측 위험"});const xs=rng01(20,80,50);DATA.ice.forEach(f=>path(g,xs.map(x=>[P.X(x),P.Y(f(x))]),hexA(C.s1,.28),1));
  path(g,xs.map(x=>[P.X(x),P.Y(mean(DATA.ice.map(f=>f(x))))]),C.ink,3);if(P.lab)txt(g,"굵은 선(평균)은 평평, 얇은 선은 갈라짐",P.X(21),P.Y(1.22),{s:11});};
R.scree=(g,W,H)=>{const v=[.42,.21,.12,.08,.06,.04,.03,.02,.01,.01];const P=frame(g,W,H,{x0:.5,x1:10.5,y0:0,y1:1,xt:[1,5,10],yt:[0,.5,.9,1],xl:"주성분 번호",yl:"설명분산"});const bw=(P.X(1)-P.X(0))*.6;let cum=0;const st=[];
  v.forEach((x,i)=>{bar(g,P.X(i+1)-bw/2,P.Y(x),bw,P.B-P.Y(x),hexA(C.s1,.7));cum+=x;st.push([P.X(i+1),P.Y(cum)]);});path(g,st,C.s2,2);st.forEach(p=>marker(g,p[0],p[1],2.6,C.s2));path(g,[[P.L,P.Y(.9)],[P.R,P.Y(.9)]],C.s8,1.2,[4,3]);if(P.lab)txt(g,"누적 90%: 주성분 6개",P.X(6.3),P.Y(.9)+10,{s:10.5});};
R.biplot=(g,W,H)=>{const P=frame(g,W,H,{x0:-3.6,x1:3.6,y0:-2.6,y1:2.6,xt:[-2,0,2],yt:[-2,0,2],xl:"주성분 1",yl:"주성분 2"});DATA.bip.forEach(p=>marker(g,P.X(p[0]),P.Y(p[1]),2.3,hexA(C.s1,.6)));
  [["소득",2.4,.6],["구매액",2.1,1.2],["나이",.3,2.1],["할인 사용",-2,-.9]].forEach(a=>{path(g,[[P.X(0),P.Y(0)],[P.X(a[1]),P.Y(a[2])]],C.s8,1.8);marker(g,P.X(a[1]),P.Y(a[2]),2.6,C.s8);if(P.lab)txt(g,a[0],P.X(a[1])+(a[1]<0?-4:4),P.Y(a[2])-7,{s:10.5,a:a[1]<0?"right":"left",b:1});});};
R.tsne=(g,W,H)=>{const P=frame(g,W,H,{x0:-5.5,x1:6,y0:-5.5,y1:5.5,xt:[],yt:[],grid:false});DATA.ts.forEach((cl,k)=>cl.forEach(p=>marker(g,P.X(p[0]),P.Y(p[1]),P.lab?2.6:1.8,CL[k],k)));if(P.lab)txt(g,"무리 사이 거리는 믿지 않기",P.X(-5.2),P.B-8,{s:10.5,c:C.mut});};
const WC=[100,52,28,14,12,10.5,9.3,8.4,7.7,7.1];
R.elbow=(g,W,H)=>{const P=frame(g,W,H,{x0:.5,x1:10.5,y0:0,y1:105,xt:[1,4,7,10],yt:[0,50,100],xl:"군집 수 k",yl:"WCSS"});const pts=WC.map((v,i)=>[P.X(i+1),P.Y(v)]);path(g,pts,C.s1,2);pts.forEach(p=>marker(g,p[0],p[1],2.8,C.s1));
  g.save();g.strokeStyle=C.s8;g.lineWidth=2;g.beginPath();g.arc(pts[3][0],pts[3][1],P.lab?9:6,0,2*PI);g.stroke();g.restore();if(P.lab)txt(g,"팔꿈치 k = 4",pts[3][0]+12,pts[3][1]-14,{s:11,b:1});};
R.sil=(g,W,H)=>{const lab=W>=200,L=lab?40:6,T=lab?6:4,B=H-(lab?22:4),X=v=>L+(v+.3)/1.3*(W-L-8);const tot=DATA.sil.reduce((s,a)=>s+a.length,0)+3*3,rh=(B-T)/tot;let y=T;const all=[];
  DATA.sil.forEach((arr,k)=>{arr.forEach(v=>{all.push(v);g.fillStyle=CL[k];g.fillRect(Math.min(X(0),X(v)),y,Math.abs(X(v)-X(0)),Math.max(1,rh-.3));y+=rh;});if(lab)txt(g,"군집 "+(k+1),L-4,y-arr.length*rh/2,{a:"right",s:10,c:C.mut});y+=3*rh;});
  path(g,[[X(0),T],[X(0),B]],C.axis,1);const m=mean(all);path(g,[[X(m),T],[X(m),B]],C.s8,1.4,[4,3]);if(lab){txt(g,"평균 "+f2(m),X(m)+4,B+11,{s:10});txt(g,"0",X(0),B+11,{a:"center",s:10,c:C.mut});}};
R.dendro=(g,W,H)=>{const lab=W>=200,L=lab?30:6,R2=W-8,T=lab?8:6,B=H-(lab?20:6);const n=8,lx=i=>L+(i+.5)*(R2-L)/n,Y=h=>B-h/5*(B-T);
  const nodes={};for(let i=0;i<n;i++)nodes["L"+i]={x:lx(i),h:0};const merges=[["L0","L1",.6,"a"],["L2","L3",.9,"b"],["a","b",1.8,"c"],["L4","L5",.5,"d"],["d","L6",1.1,"e"],["e","L7",1.6,"f"],["c","f",4.4,"g"]];
  g.strokeStyle=C.ink;g.lineWidth=1.6;merges.forEach(([a,b,h,id])=>{const A=nodes[a],Bn=nodes[b];g.beginPath();g.moveTo(A.x,Y(A.h));g.lineTo(A.x,Y(h));g.lineTo(Bn.x,Y(h));g.lineTo(Bn.x,Y(Bn.h));g.stroke();nodes[id]={x:(A.x+Bn.x)/2,h};});
  path(g,[[L,Y(1.4)],[R2,Y(1.4)]],C.s8,1.4,[5,3]);if(lab){txt(g,"여기서 자르면 3개 군집",L+2,Y(1.4)-8,{s:10.5});for(let i=0;i<n;i++)txt(g,String.fromCharCode(65+i),lx(i),B+10,{a:"center",s:10,c:C.mut});txt(g,"합친 거리",4,T+6,{s:10,c:C.mut});}};
function maArr(s,w){return s.map((_,i)=>i<w-1?null:mean(s.slice(i-w+1,i+1)));}
R.line=(g,W,H)=>{const s=DATA.series;const P=frame(g,W,H,{x0:0,x1:71,y0:70,y1:190,xt:[0,24,48,71],xf:v=>Math.round(v/12)+1+"년",yt:[80,130,180],xl:"월",yl:"매출"});path(g,s.map((v,i)=>[P.X(i),P.Y(v)]),hexA(C.mut,.7),1.2);const m=maArr(s,12);path(g,m.map((v,i)=>v==null?null:[P.X(i),P.Y(v)]).filter(Boolean),C.s1,2.6);if(P.lab)txt(g,"12개월 이동평균",P.X(40),P.Y(170),{s:11,c:C.ink});};
R.decomp=(g,W,H)=>{const lab=W>=200,n=72,L=lab?46:6,R2=W-6,rows=[["원자료",t=>100+0.8*t+12*Math.sin(2*PI*t/12)],["추세",t=>100+0.8*t],["계절",t=>12*Math.sin(2*PI*t/12)],["나머지",t=>DATA.series[t]-(100+0.8*t+12*Math.sin(2*PI*t/12))]],rh=(H-8)/4;
  rows.forEach((r,k)=>{const ys=Array.from({length:n},(_,t)=>k===0?DATA.series[t]:r[1](t)),lo=Math.min(...ys),hi=Math.max(...ys),y0=4+k*rh;g.strokeStyle=C.grid;g.beginPath();g.moveTo(L,y0+rh-1.5);g.lineTo(R2,y0+rh-1.5);g.stroke();
   path(g,ys.map((v,t)=>[L+t/(n-1)*(R2-L),y0+rh-4-(v-lo)/(hi-lo||1)*(rh-8)]),[C.mut,C.s1,C.s2,C.s3][k],1.6);if(lab)txt(g,r[0],L-5,y0+rh/2,{a:"right",s:10,c:C.mut});});};
function acf(s,maxLag){const m=mean(s),d=s.reduce((a,x)=>a+(x-m)**2,0);return Array.from({length:maxLag},(_,k)=>{let c=0;for(let t=k+1;t<s.length;t++)c+=(s[t]-m)*(s[t-k-1]-m);return c/d;});}
function acfPlot(g,W,H,a,n){const P=frame(g,W,H,{x0:0,x1:a.length+1,y0:-1,y1:1,xt:[1,12,24,36].filter(v=>v<=a.length),yt:[-1,0,1],xl:"시차(개월)",yl:"자기상관"});const band=1.96/SQ(n);g.fillStyle=hexA(C.s1,.12);g.fillRect(P.L,P.Y(band),P.R-P.L,P.Y(-band)-P.Y(band));path(g,[[P.L,P.Y(0)],[P.R,P.Y(0)]],C.axis,1);
  const bw=Math.max(1.5,(P.X(1)-P.X(0))*.5);a.forEach((v,k)=>{const out=Math.abs(v)>band;g.fillStyle=out?C.s8:C.mut;g.fillRect(P.X(k+1)-bw/2,Math.min(P.Y(0),P.Y(v)),bw,Math.abs(P.Y(v)-P.Y(0)));});}
R.acf=(g,W,H)=>{const s=DATA.series,d=s.map((v,t)=>v-(100+0.8*t));acfPlot(g,W,H,acf(d,36),s.length);};

function drawChart(cv,id){const o=setup(cv);R[id](o.g,o.w,o.h);}
function drawCards(){$$("canvas.mini").forEach(cv=>{if(cv.offsetParent!==null)drawChart(cv,cv.dataset.chart);});}
$$("details.card").forEach(d=>d.addEventListener("toggle",()=>requestAnimationFrame(()=>{const cv=d.querySelector("canvas.mini");drawChart(cv,cv.dataset.chart);})));

/* ---------- 실험 ① 분포 ---------- */
let e1shape="norm";
function e1data(shape,n){const r=rng(7+n);return Array.from({length:n},()=>shape==="norm"?50+10*gauss(r):shape==="skew"?30+15*E(0.7*gauss(r)):(r()<.55?40+6*gauss(r):68+6*gauss(r)));}
function e1(){const n=+$("#e1-n").value;$("#e1-nv").textContent=n;const d=e1data(e1shape,n),s=d.slice().sort((a,b)=>a-b),m=mean(d),med=quant(s,.5),q1=quant(s,.25),q3=quant(s,.75),iq=q3-q1,out=d.filter(v=>v<q1-1.5*iq||v>q3+1.5*iq).length;
  const lo=Math.min(10,s[0]),hi=Math.max(110,s[s.length-1]);
  {const o=setup($("#e1-h")),P=frame(o.g,o.w,o.h,{x0:lo,x1:hi,y0:0,y1:1,xt:[20,50,80,110].filter(v=>v>=lo&&v<=hi),yt:[],xl:"값"});const nb=30,w=(hi-lo)/nb,c=new Array(nb).fill(0);d.forEach(v=>{const k=Math.min(nb-1,Math.floor((v-lo)/w));c[k]++;});const mx=Math.max(...c);c.forEach((v,k)=>{const x0=P.X(lo+k*w)+1;bar(o.g,x0,P.B-v/mx*(P.B-P.T),Math.max(1,P.X(lo+(k+1)*w)-x0-1),v/mx*(P.B-P.T),hexA(C.s1,.55));});
   path(o.g,[[P.X(m),P.T],[P.X(m),P.B]],C.s8,1.6,[4,3]);path(o.g,[[P.X(med),P.T],[P.X(med),P.B]],C.ink,1.6);txt(o.g,"평균",P.X(m)+3,P.T+8,{s:10,c:C.s8,b:1});txt(o.g,"중앙값",P.X(med)-3,P.T+20,{s:10,a:"right",b:1});}
  {const o=setup($("#e1-b")),P=frame(o.g,o.w,o.h,{x0:0,x1:1,y0:lo,y1:hi,yt:[20,50,80,110].filter(v=>v>=lo&&v<=hi),xt:[]});const cx=P.X(.5),bw=(P.R-P.L)*.3,wl=Math.max(s[0],q1-1.5*iq),wh=Math.min(s[s.length-1],q3+1.5*iq),g=o.g;g.strokeStyle=C.ink;g.lineWidth=1.5;g.beginPath();g.moveTo(cx,P.Y(wl));g.lineTo(cx,P.Y(q1));g.moveTo(cx,P.Y(q3));g.lineTo(cx,P.Y(wh));g.stroke();g.fillStyle=hexA(C.s1,.15);g.fillRect(cx-bw/2,P.Y(q3),bw,P.Y(q1)-P.Y(q3));g.strokeRect(cx-bw/2,P.Y(q3),bw,P.Y(q1)-P.Y(q3));g.lineWidth=2.6;g.beginPath();g.moveTo(cx-bw/2,P.Y(med));g.lineTo(cx+bw/2,P.Y(med));g.stroke();d.filter(v=>v<wl||v>wh).forEach((v,i)=>marker(g,cx+((i%5)-2)*3,P.Y(v),2.3,C.s8));}
  {const o=setup($("#e1-q")),z=s.map(v=>(v-m)/sd(d)),P=frame(o.g,o.w,o.h,{x0:-3.3,x1:3.3,y0:-3.5,y1:4.5,xt:[-2,0,2],yt:[-2,0,2,4],xl:"이론 분위수"});path(o.g,[[P.X(-3.3),P.Y(-3.3)],[P.X(3.3),P.Y(3.3)]],C.mut,1.2,[4,3]);const step=Math.max(1,Math.floor(n/150));for(let i=0;i<n;i+=step)marker(o.g,P.X(invPhi((i+.5)/n)),P.Y(Math.max(-3.5,Math.min(4.5,z[i]))),2,C.s7);}
  const skew=d.reduce((a,v)=>a+((v-m)/sd(d))**3,0)/n;
  $("#e1-m").innerHTML=`<div class="mini"><span>평균</span><b>${f1(m)}</b></div><div class="mini"><span>중앙값</span><b>${f1(med)}</b></div><div class="mini"><span>이상치 후보</span><b>${out}개</b></div><div class="mini"><span>치우침(왜도)</span><b>${f2(skew)}</b></div>`;
  const I=[];if(e1shape==="norm")I.push(["g","종 모양이면 평균과 중앙값이 거의 같고, QQ 플롯 점들이 대각선에 붙습니다. 평균 하나로 요약해도 크게 틀리지 않는 경우입니다."]);
  if(e1shape==="skew")I.push(["r",`오른쪽 꼬리: 평균(${f1(m)})이 중앙값(${f1(med)})보다 큽니다. 긴 꼬리가 평균을 끌어올린 것입니다. QQ 플롯 오른쪽 끝이 위로 휩니다.`]);
  if(e1shape==="bimo")I.push(["a","두 봉우리: 히스토그램엔 봉우리가 둘인데 상자그림은 하나의 넓은 상자로만 보입니다. 상자그림만 보면 두 집단이 섞인 것을 놓칩니다."]);
  I.push(["",n<150?"데이터가 적으면 히스토그램 모양이 크게 흔들립니다. n을 늘려 모양이 안정되는지 보세요.":"데이터가 많을수록 모양이 안정됩니다. 그래도 이상치 후보 점은 지우기 전에 이유(입력 오류인지, 진짜 큰 값인지)를 확인합니다."]);
  $("#e1-i").innerHTML=I.map(x=>`<p class="${x[0]}">${x[1]}</p>`).join("");}
$$("[data-shape]").forEach(b=>b.onclick=()=>{e1shape=b.dataset.shape;$$("[data-shape]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));e1();});
$("#e1-n").oninput=e1;

/* ---------- 실험 ② 관계 ---------- */
let e2out=false,e2u=false;
function e2(){const rho=+$("#e2-r").value;$("#e2-rv").textContent=f2(rho);const r=rng(99),x=[],y=[];for(let i=0;i<60;i++){const a=gauss(r),b=gauss(r);x.push(a);y.push(e2u?(a*a-1)*0.9+0.35*b:rho*a+SQ(1-rho*rho)*b);}
  const r0=corr(x,y);if(e2out){x.push(4.2);y.push(rho>=0&&!e2u?-4.2:4.2);}const r1=corr(x,y);
  {const o=setup($("#e2-s")),P=frame(o.g,o.w,o.h,{x0:-3.2,x1:4.6,y0:-4.6,y1:4.6,xt:[-2,0,2,4],yt:[-4,-2,0,2,4],xl:"광고비(표준화)",yl:"매출(표준화)"});dots(o.g,P,x.slice(0,60),y.slice(0,60),C.s1,2.6,.7);if(e2out){marker(o.g,P.X(x[60]),P.Y(y[60]),6,C.s8);txt(o.g,"튀는 점",P.X(x[60])-8,P.Y(y[60])+(y[60]<0?-12:12),{a:"right",s:11,b:1});}
   const [a,b]=linfit(x,y);path(o.g,[[P.X(-3.2),P.Y(a*-3.2+b)],[P.X(4.6),P.Y(a*4.6+b)]],C.s2,2);}
  {const o=setup($("#e2-c")),P=frame(o.g,o.w,o.h,{x0:0,x1:2,y0:-1,y1:1,yt:[-1,-.5,0,.5,1],xt:[.5,1.5],xf:v=>v<1?"튀는 점 빼고":"튀는 점 넣고",yl:"r"});path(o.g,[[P.L,P.Y(0)],[P.R,P.Y(0)]],C.axis,1);[[.5,r0,C.s1],[1.5,r1,e2out?C.s8:C.s1]].forEach(([cx,v,c])=>{const bw=(P.R-P.L)*.22;bar(o.g,P.X(cx)-bw/2,Math.min(P.Y(0),P.Y(v)),bw,Math.abs(P.Y(v)-P.Y(0)),c);txt(o.g,f2(v),P.X(cx),P.Y(v)+(v>=0?-9:11),{a:"center",b:1,s:12});});}
  $("#e2-m").innerHTML=`<div class="mini"><span>r (60개)</span><b>${f2(r0)}</b></div><div class="mini"><span>r (튀는 점 포함)</span><b>${f2(r1)}</b></div><div class="mini"><span>변화</span><b>${f2(r1-r0)}</b></div><div class="mini"><span>설명력 r²</span><b>${pct(r1*r1)}</b></div>`;
  const I=[];if(e2u)I.push(["a",`U자 관계: 점들은 분명한 모양을 이루는데 r은 ${f2(r0)}입니다. r은 직선 관계만 잽니다. 숫자보다 산점도가 먼저입니다.`]);
  if(e2out)I.push(["r",`점 하나 넣었을 뿐인데 r이 ${f2(r0)} → ${f2(r1)}로 바뀌었습니다. 보고서에 r만 적으면 이 점을 아무도 모릅니다.`]);
  if(!e2u&&!e2out)I.push(["g",`진짜 관계 세기 ${f2(rho)}로 만든 데이터에서 r = ${f2(r0)}이 나왔습니다. 표본 60개라 정확히 같지는 않습니다.`]);
  I.push(["","어느 경우든 산점도는 ‘함께 움직인다’까지만 말합니다. 광고가 매출을 올렸는지는 실험(A/B 테스트)으로 확인해야 합니다."]);
  $("#e2-i").innerHTML=I.map(x=>`<p class="${x[0]}">${x[1]}</p>`).join("");}
$("#e2-r").oninput=e2;$("#e2-out").onclick=function(){e2out=!e2out;this.setAttribute("aria-pressed",String(e2out));e2();};$("#e2-u").onclick=function(){e2u=!e2u;this.setAttribute("aria-pressed",String(e2u));e2();};

/* ---------- 실험 ③ 평가 ---------- */
let e3pi=0.1;const M1=2,NTOT=10000;
function counts(t,pi,m){const P=NTOT*pi,N=NTOT-P,tpr=1-Phi(t-m),fpr=1-Phi(t);const TP=Math.round(P*tpr),FN=Math.round(P)-TP,FP=Math.round(N*fpr),TN=Math.round(N)-FP;return {TP,FN,FP,TN,tpr,fpr,prec:TP+FP?TP/(TP+FP):1,acc:(TP+TN)/NTOT};}
function cmTable(c){return `<table class="cmt" aria-label="혼동행렬"><tr><th></th><th>예측 정상</th><th>예측 사기</th></tr><tr><th>실제 정상</th><td class="tn"><b>${int(c.TN)}</b>TN 맞음</td><td class="fp"><b>${int(c.FP)}</b>FP 헛경보</td></tr><tr><th>실제 사기</th><td class="fn"><b>${int(c.FN)}</b>FN 놓침</td><td class="tp"><b>${int(c.TP)}</b>TP 잡음</td></tr></table>`;}
function e3(){const t=+$("#e3-t").value;$("#e3-tv").textContent=f1(t);const c=counts(t,e3pi,M1);
  {const o=setup($("#e3-e"));errPlot(o.g,o.w,o.h,t,M1);}
  $("#e3-cm").innerHTML=cmTable(c);
  {const o=setup($("#e3-r"));rocPlot(o.g,o.w,o.h,M1,[c.fpr,c.tpr]);}
  {const o=setup($("#e3-p"));prPlot(o.g,o.w,o.h,M1,e3pi,[c.tpr,c.prec]);}
  $("#e3-m").innerHTML=`<div class="mini"><span>정확도</span><b>${pct(c.acc)}</b></div><div class="mini"><span>정밀도</span><b>${pct(c.prec)}</b></div><div class="mini"><span>재현율 (TPR)</span><b>${pct(c.tpr)}</b></div><div class="mini"><span>헛경보율 (FPR = α)</span><b>${pct(c.fpr)}</b></div>`;
  const I=[];I.push(["",`기준선 ${f1(t)}: 진짜 사기 ${int(c.TP+c.FN)}건 중 ${int(c.TP)}건을 잡고 ${int(c.FN)}건을 놓칩니다(β = ${pct(1-c.tpr)}). 정상 거래 ${int(c.FP)}건에는 헛경보가 갑니다.`]);
  if(t<0.5)I.push(["r","기준선을 많이 낮췄습니다. 재현율은 높지만 헛경보가 수천 건입니다. 정상 고객에게 카드 정지 문자가 쏟아지는 상황입니다."]);
  if(t>3)I.push(["a","기준선을 많이 올렸습니다. 헛경보는 거의 없지만 사기 대부분을 놓칩니다."]);
  if(e3pi===0.01)I.push(["a",`양성 1%: ROC 위 점은 거의 그대로인데 정밀도는 ${pct(c.prec)}까지 떨어졌습니다. 경보 ${int(c.TP+c.FP)}건 중 진짜 사기는 ${int(c.TP)}건뿐입니다. 드문 사건에서는 PR 곡선을 같이 봅니다.`]);
  I.push(["g",`이 모델의 AUC는 양성 비율과 상관없이 ${f2(Phi(M1/Math.SQRT2))}입니다. AUC는 기준선을 정해 주지 않습니다. 두 실수의 비용을 따져 기준선을 고르는 건 사람의 몫입니다.`]);
  $("#e3-i").innerHTML=I.map(x=>`<p class="${x[0]}">${x[1]}</p>`).join("");}
$("#e3-t").oninput=e3;$$("[data-prev]").forEach(b=>b.onclick=()=>{e3pi=+b.dataset.prev;$$("[data-prev]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));e3();});

/* ---------- 실험 ④ 복잡도 (체비쇼프 기저 최소제곱) ---------- */
const E4=(function(){const r=rng(4242),truth=x=>Math.sin(2.6*x)+0.3*x,tr=[],va=[];for(let i=0;i<30;i++){const x=-1+2*r();tr.push([x,truth(x)+0.28*gauss(r)]);}for(let i=0;i<300;i++){const x=-1+2*r();va.push([x,truth(x)+0.28*gauss(r)]);}
  const basis=(x,d)=>{const b=[1,x];for(let k=2;k<=d;k++)b.push(2*x*b[k-1]-b[k-2]);return b.slice(0,d+1);};
  function fit(d){const n=d+1,A=Array.from({length:n},()=>new Array(n+1).fill(0));tr.forEach(([x,y])=>{const b=basis(x,d);for(let i=0;i<n;i++){for(let j=0;j<n;j++)A[i][j]+=b[i]*b[j];A[i][n]+=b[i]*y;}});for(let i=0;i<n;i++)A[i][i]+=1e-9;
   for(let c=0;c<n;c++){let p=c;for(let r2=c+1;r2<n;r2++)if(Math.abs(A[r2][c])>Math.abs(A[p][c]))p=r2;[A[c],A[p]]=[A[p],A[c]];for(let r2=0;r2<n;r2++){if(r2===c)continue;const f=A[r2][c]/A[c][c];for(let k=c;k<=n;k++)A[r2][k]-=f*A[c][k];}}
   const w=A.map((row,i)=>row[n]/row[i]);return x=>basis(x,d).reduce((s,b,i)=>s+b*w[i],0);}
  const mse=(f,D)=>mean(D.map(([x,y])=>(f(x)-y)**2));const fits={},err=[];for(let d=1;d<=12;d++){fits[d]=fit(d);err.push([d,mse(fits[d],tr),mse(fits[d],va)]);}
  return {truth,tr,fits,err};})();
function e4(){const d=+$("#e4-d").value;$("#e4-dv").textContent=d;const f=E4.fits[d],e=E4.err[d-1],best=E4.err.reduce((a,b)=>b[2]<a[2]?b:a);
  {const o=setup($("#e4-f")),P=frame(o.g,o.w,o.h,{x0:-1,x1:1,y0:-2,y1:2,xt:[-1,0,1],yt:[-2,-1,0,1,2],xl:"입력 x",yl:"y"});const xs=rng01(-1,1,200);path(o.g,xs.map(x=>[P.X(x),P.Y(E4.truth(x))]),C.mut,1.4,[5,4]);dots(o.g,P,E4.tr.map(p=>p[0]),E4.tr.map(p=>p[1]),C.s1,3,.85);
   o.g.save();o.g.beginPath();o.g.rect(P.L,P.T,P.R-P.L,P.B-P.T);o.g.clip();path(o.g,xs.map(x=>[P.X(x),P.Y(f(x))]),C.s2,2.4);o.g.restore();}
  {const o=setup($("#e4-c")),mx=0.5,P=frame(o.g,o.w,o.h,{x0:1,x1:12,y0:0,y1:mx,xt:[1,3,6,9,12],yt:[0,.25,.5],xl:"복잡도(차수)",yl:"평균 제곱 오차"});const cl=v=>Math.min(mx,v);path(o.g,E4.err.map(r=>[P.X(r[0]),P.Y(cl(r[1]))]),C.s1,2);path(o.g,E4.err.map(r=>[P.X(r[0]),P.Y(cl(r[2]))]),C.s2,2);
   path(o.g,[[P.X(d),P.T],[P.X(d),P.B]],C.ink,1.4,[4,3]);marker(o.g,P.X(d),P.Y(cl(e[2])),5,C.s2);marker(o.g,P.X(d),P.Y(cl(e[1])),5,C.s1);txt(o.g,"학습",P.X(1.2),P.Y(cl(E4.err[0][1]))-10,{s:11});txt(o.g,"검증",P.X(11.8),P.Y(cl(E4.err[11][2]))-10,{s:11,a:"right"});}
  $("#e4-m").innerHTML=`<div class="mini"><span>학습 오차</span><b>${f3(e[1])}</b></div><div class="mini"><span>검증 오차</span><b>${f3(e[2])}</b></div><div class="mini"><span>두 오차의 차이</span><b>${f3(e[2]-e[1])}</b></div><div class="mini"><span>검증 오차가 가장 낮은 차수</span><b>${best[0]}</b></div>`;
  const I=[];if(d<=2)I.push(["a","과소적합: 곡선이 너무 단순해 학습 데이터도 잘 못 따라갑니다. 학습·검증 오차가 함께 높습니다(편향이 큼)."]);
  else if(e[2]<=best[2]*1.15)I.push(["g",`적정 구간: 검증 오차가 가장 낮은 차수(${best[0]}) 근처입니다. 정답 곡선(점선)을 잘 따라갑니다.`]);
  else I.push(["r","과적합: 학습 오차는 계속 내려가는데 검증 오차가 올라갑니다. 곡선이 점 하나하나를 쫓아 꿈틀거립니다(분산이 큼)."]);
  I.push(["","이 오른쪽 그림이 ‘편향-분산 트레이드오프’ 카드의 실제 버전입니다. 학습 오차만 보고 고르면 늘 가장 복잡한 모델을 고르게 됩니다."]);
  $("#e4-i").innerHTML=I.map(x=>`<p class="${x[0]}">${x[1]}</p>`).join("");}
$("#e4-d").oninput=e4;

/* ---------- 실험 ⑤ 군집 ---------- */
const E5=(function(){const r=rng(555),cs=[[-3,2.5],[3,3],[-2,-3],[3.5,-2]],X=[];cs.forEach(c=>{for(let i=0;i<40;i++)X.push([c[0]+0.9*gauss(r),c[1]+0.9*gauss(r)]);});
  const d2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
  function km(k,seed){const rr=rng(seed),C0=[X[Math.floor(rr()*X.length)]];while(C0.length<k){const ds=X.map(p=>Math.min(...C0.map(c=>d2(p,c))));const s=ds.reduce((a,b)=>a+b,0);let u=rr()*s,i=0;while(u>ds[i]){u-=ds[i];i++;}C0.push(X[Math.min(i,X.length-1)]);}
   let cen=C0.map(c=>c.slice()),lab=new Array(X.length).fill(0);for(let it=0;it<50;it++){lab=X.map(p=>{let b=0;cen.forEach((c,j)=>{if(d2(p,c)<d2(p,cen[b]))b=j;});return b;});cen=cen.map((c,j)=>{const m=X.filter((_,i)=>lab[i]===j);return m.length?[mean(m.map(p=>p[0])),mean(m.map(p=>p[1]))]:c;});}
   const w=X.reduce((s,p,i)=>s+d2(p,cen[lab[i]]),0);return {lab,cen,w};}
  function sil(lab,k){if(k<2)return null;const D=X.map(p=>X.map(q=>SQ(d2(p,q))));return mean(X.map((p,i)=>{const own=lab[i];const avg=j=>{let s=0,n=0;X.forEach((_,t)=>{if(lab[t]===j&&t!==i){s+=D[i][t];n++;}});return n?s/n:0;};const nOwn=lab.filter(l=>l===own).length;if(nOwn<2)return 0;const a=avg(own);let b=Infinity;for(let j=0;j<k;j++)if(j!==own&&lab.includes(j))b=Math.min(b,avg(j));return (b-a)/Math.max(a,b);}));}
  const res={};for(let k=1;k<=8;k++){let best=null;for(let s=0;s<6;s++){const r2=km(k,100+s*7+k);if(!best||r2.w<best.w)best=r2;}best.s=sil(best.lab,k);res[k]=best;}return {X,res};})();
function e5(){const k=+$("#e5-k").value;$("#e5-kv").textContent=k;const r=E5.res[k];
  {const o=setup($("#e5-s")),P=frame(o.g,o.w,o.h,{x0:-6,x1:6.5,y0:-6,y1:6,xt:[],yt:[],grid:false});E5.X.forEach((p,i)=>marker(o.g,P.X(p[0]),P.Y(p[1]),2.8,CL[r.lab[i]],r.lab[i]%4));r.cen.forEach(c=>{o.g.save();o.g.strokeStyle=C.ink;o.g.lineWidth=2.2;const x=P.X(c[0]),y=P.Y(c[1]);o.g.beginPath();o.g.moveTo(x-6,y-6);o.g.lineTo(x+6,y+6);o.g.moveTo(x+6,y-6);o.g.lineTo(x-6,y+6);o.g.stroke();o.g.restore();});}
  {const ws=Array.from({length:8},(_,i)=>E5.res[i+1].w),mx=ws[0]*1.05,o=setup($("#e5-e")),P=frame(o.g,o.w,o.h,{x0:.5,x1:8.5,y0:0,y1:mx,xt:[1,2,4,6,8],yt:[0,Math.round(mx/2)],xl:"k",yl:"WCSS"});const pts=ws.map((v,i)=>[P.X(i+1),P.Y(v)]);path(o.g,pts,C.s1,2);pts.forEach(p=>marker(o.g,p[0],p[1],3,C.s1));marker(o.g,pts[k-1][0],pts[k-1][1],6,C.s8);}
  {const o=setup($("#e5-l")),P=frame(o.g,o.w,o.h,{x0:1.5,x1:8.5,y0:0,y1:1,xt:[2,4,6,8],yt:[0,.5,1],xl:"k",yl:"평균 실루엣"});const bw=(P.X(1)-P.X(0))*.55;for(let j=2;j<=8;j++){const v=E5.res[j].s;bar(o.g,P.X(j)-bw/2,P.Y(v),bw,P.B-P.Y(v),j===k?C.s8:hexA(C.s1,.6));}}
  const best=[2,3,4,5,6,7,8].reduce((a,b)=>E5.res[b].s>E5.res[a].s?b:a);
  $("#e5-m").innerHTML=`<div class="mini"><span>WCSS</span><b>${f1(r.w)}</b></div><div class="mini"><span>평균 실루엣</span><b>${r.s==null?"–":f2(r.s)}</b></div><div class="mini"><span>실루엣 최고 k</span><b>${best}</b></div><div class="mini"><span>진짜 무리 수</span><b>4</b></div>`;
  const I=[];if(k===1)I.push(["a","k = 1이면 모두 한 무리라 실루엣 점수를 계산할 수 없습니다."]);else if(k<4)I.push(["a",`k = ${k}: 진짜로는 떨어진 무리 둘이 한 군집에 묶였습니다. WCSS가 아직 크게 줄어드는 중입니다.`]);else if(k===4)I.push(["g","k = 4: 엘보 곡선이 꺾이는 곳이고 실루엣 점수도 가장 높습니다. 두 기준이 같은 답을 냈습니다."]);else I.push(["r",`k = ${k}: WCSS는 조금 더 줄었지만, 한 무리를 억지로 쪼개 실루엣 점수가 떨어졌습니다.`]);
  I.push(["","실제 데이터는 두 기준이 다른 답을 내기도 합니다. 그때는 덴드로그램과 업무 해석(마케팅팀이 다룰 수 있는 무리 수)을 함께 봅니다."]);
  $("#e5-i").innerHTML=I.map(x=>`<p class="${x[0]}">${x[1]}</p>`).join("");}
$("#e5-k").oninput=e5;

/* ---------- 실험 ⑥ 시계열 ---------- */
let e6s=true;
function e6series(){const r=rng(66);return Array.from({length:72},(_,t)=>100+0.8*t+(e6s?12*Math.sin(2*PI*t/12):0)+5*gauss(r));}
function e6(){const w=+$("#e6-w").value;$("#e6-wv").textContent=w;const s=e6series(),m=maArr(s,w);
  {const o=setup($("#e6-l")),P=frame(o.g,o.w,o.h,{x0:0,x1:71,y0:70,y1:190,xt:[0,24,48,71],xf:v=>Math.round(v/12)+1+"년",yt:[80,130,180],xl:"월",yl:"매출"});path(o.g,s.map((v,i)=>[P.X(i),P.Y(v)]),hexA(C.mut,.75),1.2);path(o.g,m.map((v,i)=>v==null?null:[P.X(i),P.Y(v)]).filter(Boolean),C.s1,2.6);}
  const d=s.map((v,t)=>v-(100+0.8*t)),a=acf(d,36);{const o=setup($("#e6-a"));acfPlot(o.g,o.w,o.h,a,72);}
  const rough=mean(m.filter(v=>v!=null).map((v,i,arr)=>i?Math.abs(v-arr[i-1]):0));
  $("#e6-m").innerHTML=`<div class="mini"><span>창 크기</span><b>${w}개월</b></div><div class="mini"><span>이동평균 월 변동(평균)</span><b>${f1(rough)}</b></div><div class="mini"><span>시차 12 자기상관</span><b>${f2(a[11])}</b></div><div class="mini"><span>띠(95%)</span><b>±${f2(1.96/SQ(72))}</b></div>`;
  const I=[];if(w===1)I.push(["a","창 1은 원래 값 그대로입니다. 출렁임이 모두 남습니다."]);else if(e6s&&w%12!==0)I.push(["a",`창 ${w}개월: 계절 물결이 이동평균에 일부 남아 있습니다. 창을 12나 24로 맞추면 1년 주기가 정확히 상쇄됩니다.`]);else I.push(["g",`창 ${w}개월: 출렁임이 걷히고 추세가 보입니다. 대신 이동평균은 실제 변화보다 약 ${Math.floor((w-1)/2)}개월 늦게 따라옵니다.`]);
  I.push([e6s?"g":"",e6s?`계절성이 있을 때 시차 12의 자기상관은 ${f2(a[11])}로 띠 밖에 크게 솟습니다. 시차 6 근처는 음수입니다(반년 뒤는 반대 계절).`:`계절성을 끄면 막대 대부분이 띠 안으로 들어옵니다. 띠 밖 막대가 한두 개 보여도 우연일 수 있습니다(36개 중 5%면 약 2개).`]);
  $("#e6-i").innerHTML=I.map(x=>`<p class="${x[0]}">${x[1]}</p>`).join("");}
$("#e6-w").oninput=e6;$("#e6-s").onclick=function(){e6s=!e6s;this.setAttribute("aria-pressed",String(e6s));this.textContent=e6s?"계절성 켜기":"계절성 꺼짐";e6();};

/* ---------- 대결 ---------- */
function duel(){const t=+$("#d-t").value;$("#d-tv").textContent=f1(t);const A={TP:0,FN:100,FP:0,TN:9900,tpr:0,fpr:0,prec:NaN,acc:.99},B=counts(t,0.01,M1);const cost=c=>c.FN*100+c.FP*1;
  const box=(c)=>cmTable(c)+`<div class="metrics"><div>정확도 <b>${pct(c.acc)}</b></div><div>재현율 <b>${pct(c.tpr)}</b></div><div>정밀도 <b>${isNaN(c.prec)?"계산 불가(경보 0건)":pct(c.prec)}</b></div><div>예상 손실 <b>${int(cost(c))}만 원</b></div></div>`;
  $("#d-a").innerHTML=box(A);$("#d-b").innerHTML=box(B);const wB=cost(B)<cost(A);
  $("#d-v").innerHTML=say("doc","doc_judge",`판정입니다. 정확도는 A ${pct(A.acc)}, B ${pct(B.acc)}로 ${B.acc>A.acc?"B":"A"}가 높습니다. 하지만 A는 사기 100건 중 0건을 잡고, B는 ${B.TP}건을 잡습니다. 예상 손실은 A ${int(cost(A))}만 원, B ${int(cost(B))}만 원입니다. <b>${wB?"초파리 팀 승":"이 기준선에서는 주판봇 팀 승"}</b>. ${wB?"정확도가 낮은 모델이 회사에는 더 쌉니다.":"기준선을 너무 낮춰 헛경보 비용이 커졌습니다. 기준선을 다시 옮겨 보세요."}`)+
   (wB?say("robo","robo_sigh","정확도 6%p 차이에 속았다… 혼동행렬부터 열어 볼게.",true):say("fly","fly_magnify","헛경보 비용도 공짜가 아니야. 기준선을 1.5 근처로 옮겨 봐.",true));}
$("#d-t").oninput=duel;
$("#ai-btn").onclick=function(){const a=$("#ai-ans");a.hidden=!a.hidden;this.setAttribute("aria-expanded",String(!a.hidden));this.textContent=a.hidden?"확인할 것 보기":"닫기";};

/* ---------- 퀴즈 ---------- */
$$("[data-quiz]").forEach(q=>{const G=GROUPS[+q.dataset.quiz-1];q.querySelectorAll(".bt").forEach(b=>b.onclick=()=>{const ok=+b.dataset.i===G.quiz.a;q.querySelectorAll(".bt").forEach(x=>x.classList.remove("ok","no"));b.classList.add(ok?"ok":"no");const fb=q.querySelector(".fb");fb.className="fb "+(ok?"ok":"no");fb.textContent=(ok?"맞았어요. ":"다시 생각해 볼까요? 처음엔 다들 여기서 오래 봅니다. ")+G.quiz.ex;});});

/* ---------- 쪽지시험 ---------- */
const got={};
$("#examgrid").innerHTML=QUIZ.map((q,i)=>`<div class="eq" id="ex-${i}"><canvas data-ex="${q.chart}" role="img" aria-label="문제 ${i+1} 그림"></canvas><div class="q">${i+1}. ${esc(q.q)}</div><div class="opts">${q.opts.map((o,j)=>`<button class="bt" data-j="${j}">${esc(o)}</button>`).join("")}</div><div class="fb" aria-live="polite"></div></div>`).join("");
QUIZ.forEach((q,i)=>{const el=$("#ex-"+i);el.querySelectorAll(".bt").forEach(b=>b.onclick=()=>{const ok=+b.dataset.j===q.a;el.querySelectorAll(".bt").forEach(x=>x.classList.remove("ok","no"));b.classList.add(ok?"ok":"no");got[i]=ok;el.querySelector(".fb").innerHTML=ok?"정답!":`다시 보기 → <a href="#c-${q.chart}" data-open="${q.chart}">${esc(byId[q.chart].ko)} 카드</a>`;const sc=Object.values(got).filter(Boolean).length;$("#examscore").textContent=`${sc} / ${QUIZ.length}`+(Object.keys(got).length===QUIZ.length?(sc>=5?" — 훌륭해요!":sc>=4?" — 좋아요. 틀린 카드만 다시 펼쳐 보세요.":" — 괜찮아요. 연결된 카드를 펼쳐 보고 다시 풀어 보세요."):"");wireOpen(el);});});
function drawExam(){$$("canvas[data-ex]").forEach(cv=>drawChart(cv,cv.dataset.ex));}

/* ---------- 카드 열기·복사 ---------- */
function openCard(id){const d=$("#c-"+id);if(!d)return;d.open=true;setTimeout(()=>d.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"}),30);}
function wireOpen(root){(root||document).querySelectorAll("[data-open]").forEach(a=>a.onclick=e=>{e.preventDefault();openCard(a.dataset.open);});}
wireOpen();
$$(".copy").forEach(b=>b.onclick=()=>{const t=b.dataset.copy;const done=()=>{b.textContent="복사했어요";setTimeout(()=>b.textContent="프롬프트 복사",1500);};if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,()=>{b.textContent="복사 실패 — 직접 선택하세요";});else b.textContent="직접 선택해 복사하세요";});
function openHash(){const m=(location.hash||"").match(/^#c-([a-z]+)$/);if(m)openCard(m[1]);}
window.addEventListener("hashchange",openHash);

/* ---------- 3D 관계 지도 ---------- */
const MAP={};
(function(){
  const stage=$("#stage");let ok=!!window.THREE;let renderer;
  if(ok){try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){ok=false;}}
  if(!ok){stage.style.display="none";$("#nogl").style.display="block";return;}
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));stage.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,0.1,400),world=new THREE.Group();scene.add(world);
  const SX=9,LZ=4.6,HY=2.1;
  const pos={};const buckets={};CHARTS.forEach(c=>{const k=c.g+"_"+c.st;(buckets[k]=buckets[k]||[]).push(c);});
  Object.values(buckets).forEach(list=>{const n=list.length,cols=Math.min(n,3),rows=Math.ceil(n/3);list.forEach((c,i)=>{const col=i%3,row=Math.floor(i/3),nc=row===rows-1?n-row*3:cols;pos[c.id]=new THREE.Vector3((c.st-1.5)*SX+(col-(nc-1)/2)*2.85,0.9+c.dt*HY,(c.g-3.5)*LZ+(row-(rows-1)/2)*1.7);});});
  /* 바닥과 교시 줄 */
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(4*SX+3,6*LZ+2),new THREE.MeshBasicMaterial({color:0xf1f4f7,transparent:true,opacity:.9,side:THREE.DoubleSide}));floor.rotation.x=-PI/2;world.add(floor);
  const lanes=[];GROUPS.forEach(G=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(4*SX+2,LZ-0.6),new THREE.MeshBasicMaterial({color:new THREE.Color(GC[G.n]),transparent:true,opacity:.12,side:THREE.DoubleSide}));m.rotation.x=-PI/2;m.position.set(0,0.01,(G.n-3.5)*LZ);world.add(m);lanes.push(m);});
  for(let s=0;s<=4;s++){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3((s-2)*SX,0.02,-3*LZ-1),new THREE.Vector3((s-2)*SX,0.02,3*LZ+1)]);world.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0xc9d1da})));}
  /* 높이 눈금 기둥 */
  const pole=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2*SX-1,0,-3*LZ-1),new THREE.Vector3(-2*SX-1,0.9+3*HY+0.6,-3*LZ-1)]);world.add(new THREE.Line(pole,new THREE.LineBasicMaterial({color:0x9aa3ad})));
  const axEls=[];const mkAx=(t,v,cls,gc)=>{const el=document.createElement("div");el.className="axlbl"+(cls?" "+cls:"");el.textContent=t;if(gc)el.style.setProperty("--gc",gc);stage.appendChild(el);axEls.push({el,v});};
  ["탐색","확인·비교","모델링·평가","설명"].forEach((t,i)=>mkAx("단계 "+(i+1)+" · "+t,new THREE.Vector3((i-1.5)*SX,0,3*LZ+1.4)));
  ["연속값","범주·개수","시간 순서","모델 점수·예측"].forEach((t,i)=>mkAx("↑ "+t,new THREE.Vector3(-2*SX-1,0.9+i*HY,-3*LZ-1)));
  GROUPS.forEach(G=>mkAx(G.n+"교시 "+G.ko,new THREE.Vector3(2*SX+0.6,0,(G.n-3.5)*LZ),"lane",GC[G.n]));
  /* 카드(차트 그림 판) */
  const nodes={};
  CHARTS.forEach(c=>{const cv=document.createElement("canvas");cv.width=320;cv.height=200;const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,320,200);R[c.id](g,320,200);g.strokeStyle=GC[c.g];g.lineWidth=8;g.strokeRect(0,0,320,200);
    const tex=new THREE.CanvasTexture(cv);tex.anisotropy=4;const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.62),mat);mesh.position.copy(pos[c.id]);world.add(mesh);
    const st=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(pos[c.id].x,0,pos[c.id].z),new THREE.Vector3(pos[c.id].x,pos[c.id].y-0.81,pos[c.id].z)]);const sm=new THREE.LineBasicMaterial({color:new THREE.Color(GC[c.g]),transparent:true,opacity:.6});world.add(new THREE.Line(st,sm));
    const el=document.createElement("div");el.className="lbl";el.style.setProperty("--gc",GC[c.g]);el.textContent=c.ko;el.tabIndex=0;el.setAttribute("role","button");el.onclick=e=>{e.stopPropagation();select(c.id);};el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select(c.id);}};stage.appendChild(el);
    nodes[c.id]={mesh,mat,sm,el,g:c.g};});
  /* 짝 선 */
  const edges=EDGES.map(e=>{const a=pos[e[0]],b=pos[e[1]],mid=a.clone().add(b).multiplyScalar(.5);mid.y+=0.9;const curve=new THREE.QuadraticBezierCurve3(a,mid,b);const geo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));const mat=new THREE.LineBasicMaterial({color:0x6b7685,transparent:true,opacity:.35});const line=new THREE.Line(geo,mat);world.add(line);
    const el=document.createElement("div");el.className="elbl";el.textContent=e[2];stage.appendChild(el);return {e,line,mat,mid:curve.getPoint(.5),el};});
  const portrait=()=>stage.clientWidth<stage.clientHeight;const dYaw=()=>portrait()?-PI/2+0.12:-0.12,dPitch=()=>portrait()?0.8:0.6;let sel=null,lane=null,yaw=dYaw(),pitch=dPitch(),tYaw=yaw,tPitch=pitch,zoom=1,spin=false;
  function refresh(){const nb=new Set();if(sel){nb.add(sel);EDGES.forEach(e=>{if(e[0]===sel)nb.add(e[1]);if(e[1]===sel)nb.add(e[0]);});}
    CHARTS.forEach(c=>{const n=nodes[c.id];const on=(!sel||nb.has(c.id))&&(!lane||c.g===lane);n.mat.opacity=on?1:.15;n.sm.opacity=on?.6:.1;n.el.classList.toggle("dim",!on);n.el.classList.toggle("sel",c.id===sel);n.mesh.scale.setScalar(c.id===sel?1.25:1);});
    edges.forEach(o=>{const on=sel?(o.e[0]===sel||o.e[1]===sel):(!lane||(byId[o.e[0]].g===lane||byId[o.e[1]].g===lane));o.mat.opacity=sel?(on?.95:.05):(on?.35:.06);o.mat.color.set(sel&&on?0xe34948:0x6b7685);o.el.style.display=sel&&on?"block":"none";});
    lanes.forEach((m,i)=>m.material.opacity=!lane||lane===i+1?.12:.03);
    const ib=$("#infobar");if(!sel){ib.innerHTML=lane?`<b>${lane}교시 · ${esc(GROUPS[lane-1].ko)}</b> — ${esc(GROUPS[lane-1].q)} <div class="acts"><a class="chip" href="#g${lane}">${lane}교시로 가기</a></div>`:"이름표를 누르면 그 차트와 짝 관계가 강조됩니다.";return;}
    const c=byId[sel],pr=EDGES.filter(e=>e[0]===sel||e[1]===sel);ib.innerHTML=`<b>${esc(c.ko)}</b> <span class="muted">${esc(c.en)} · ${c.g}교시</span><br>${esc(c.q)}<div class="acts"><a class="chip" href="#c-${c.id}" data-open="${c.id}">카드 펼치기</a>${pr.map(e=>{const o=e[0]===sel?e[1]:e[0];return `<button class="chip" data-sel="${o}">${esc(byId[o].ko)} <small>${esc(e[2])}</small></button>`;}).join("")}</div>`;wireOpen(ib);ib.querySelectorAll("[data-sel]").forEach(b=>b.onclick=()=>select(b.dataset.sel));}
  function select(id){sel=id;if(id){lane=null;$$("#lanechips .chip").forEach(b=>b.setAttribute("aria-pressed","false"));}refresh();}
  MAP.select=id=>{select(id);};
  $("#mapidx").innerHTML=GROUPS.map(G=>`<div><b style="--gc:${GC[G.n]}">${G.n}교시</b>${CHARTS.filter(c=>c.g===G.n).map(c=>`<button class="chip" data-sel="${c.id}">${esc(c.ko)}</button>`).join("")}</div>`).join("");
  $$("#mapidx [data-sel]").forEach(b=>b.onclick=()=>select(b.dataset.sel));
  $("#lanechips").innerHTML=`<span class="glabel">교시</span>`+GROUPS.map(G=>`<button class="chip" data-lane="${G.n}" aria-pressed="false"><span class="dot" style="background:${GC[G.n]}"></span>${G.n} ${esc(G.ko)}</button>`).join("");
  $$("#lanechips .chip").forEach(b=>b.onclick=()=>{const n=+b.dataset.lane;lane=lane===n?null:n;sel=null;$$("#lanechips .chip").forEach(x=>x.setAttribute("aria-pressed",String(+x.dataset.lane===lane)));refresh();});
  $("#v-front").onclick=()=>{tYaw=dYaw();tPitch=dPitch();};$("#v-top").onclick=()=>{tYaw=0;tPitch=1.45;};$("#v-side").onclick=()=>{tYaw=-PI/2+0.05;tPitch=0.25;};
  $("#v-spin").onclick=function(){spin=!spin;this.setAttribute("aria-pressed",String(spin));};$("#v-reset").onclick=()=>{sel=null;lane=null;$$("#lanechips .chip").forEach(x=>x.setAttribute("aria-pressed","false"));refresh();};
  let dragging=false,px=0,py=0,pid=null,moved=0;
  stage.addEventListener("pointerdown",e=>{if(e.target.closest(".lbl"))return;dragging=true;pid=e.pointerId;px=e.clientX;py=e.clientY;moved=0;stage.classList.add("dragging");});
  window.addEventListener("pointermove",e=>{if(!dragging||e.pointerId!==pid)return;const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);tYaw+=dx*0.008;if(e.pointerType!=="touch")tPitch=Math.max(0.08,Math.min(1.5,tPitch+dy*0.006));});
  const end=()=>{dragging=false;pid=null;stage.classList.remove("dragging");};window.addEventListener("pointerup",end);window.addEventListener("pointercancel",end);
  stage.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.6,Math.min(3,zoom*Math.exp(-e.deltaY*0.0012)));},{passive:false});
  const ray=new THREE.Raycaster(),mv=new THREE.Vector2();
  stage.addEventListener("click",e=>{if(e.target.closest(".lbl")||moved>=6)return;const r=renderer.domElement.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,camera);
    const hits=ray.intersectObjects(CHARTS.map(c=>nodes[c.id].mesh));if(hits.length){const id=CHARTS.find(c=>nodes[c.id].mesh===hits[0].object).id;select(id);return;}if(sel){sel=null;refresh();}});
  function size(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<520?44:32;camera.updateProjectionMatrix();}
  window.addEventListener("resize",size);size();
  const tmp=new THREE.Vector3();
  function place(el,v,dx,dy){tmp.copy(v).applyMatrix4(world.matrixWorld).project(camera);if(tmp.z>1||tmp.x<-1.2||tmp.x>1.2){el.style.visibility="hidden";return;}el.style.visibility="visible";const x=(tmp.x*.5+.5)*stage.clientWidth,y=(-tmp.y*.5+.5)*stage.clientHeight;el._x=Math.round(x+dx(el));el._y=Math.round(y+dy(el));el.style.transform=`translate(${el._x}px,${el._y}px)`;}
  const lv=new THREE.Vector3();let visible=true;
  if("IntersectionObserver" in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;},{rootMargin:"200px"}).observe(stage);
  function loop(){requestAnimationFrame(loop);if(!visible)return;if(spin&&!dragging)tYaw+=0.002;yaw+=(tYaw-yaw)*.12;pitch+=(tPitch-pitch)*.12;world.rotation.set(pitch,yaw,0);
    const asp=camera.aspect,dist=(asp<1?66:54)/zoom;camera.position.set(0,0,dist);camera.lookAt(0,0.5,0);world.updateMatrixWorld();
    CHARTS.forEach(c=>{const n=nodes[c.id];n.mesh.quaternion.copy(world.quaternion).invert().multiply(camera.quaternion);});
    renderer.render(scene,camera);
    const placed=[];const order=CHARTS.map(c=>{tmp.copy(pos[c.id]).applyMatrix4(world.matrixWorld);return [c,tmp.z];}).sort((a,b)=>b[1]-a[1]);
    order.forEach(([c])=>{const n=nodes[c.id];lv.copy(pos[c.id]);lv.y-=1.0;place(n.el,lv,el=>-el.offsetWidth/2,()=>0);if(n.el.style.visibility==="hidden")return;
      const x=n.el._x,y=n.el._y,w=n.el.offsetWidth,h=n.el.offsetHeight;
      const must=c.id===sel||(sel&&EDGES.some(e=>(e[0]===sel&&e[1]===c.id)||(e[1]===sel&&e[0]===c.id)));
      const hit=placed.some(r=>x<r[0]+r[2]&&x+w>r[0]&&y<r[1]+r[3]&&y+h>r[1]);
      if(hit&&!must){n.el.style.visibility="hidden";return;}placed.push([x,y,w,h]);});
    edges.forEach(o=>{if(o.el.style.display!=="block")return;place(o.el,o.mid,el=>-el.offsetWidth/2,el=>-el.offsetHeight/2);if(o.el.style.visibility==="hidden")return;const x=o.el._x,y=o.el._y,w=o.el.offsetWidth,h=o.el.offsetHeight;if(placed.some(r=>x<r[0]+r[2]&&x+w>r[0]&&y<r[1]+r[3]&&y+h>r[1])){o.el.style.visibility="hidden";return;}placed.push([x,y,w,h]);});
    axEls.forEach(a=>place(a.el,a.v,el=>a.el.classList.contains("lane")?0:-el.offsetWidth/2,el=>-el.offsetHeight/2));}
  loop();refresh();
})();
$$("[data-map]").forEach(a=>a.onclick=e=>{e.preventDefault();if(MAP.select)MAP.select(a.dataset.map);$("#map").scrollIntoView({behavior:reduce?"auto":"smooth"});});

/* ---------- 첫 그리기 ---------- */
function drawAll(){drawCards();drawExam();e1();e2();e3();e4();e5();e6();duel();}
drawAll();openHash();
let rt=null;window.addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(drawAll,150);});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawAll);
})();
