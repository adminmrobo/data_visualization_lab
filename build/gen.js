// 정적 HTML 조립: node gen.js → ../index.html
const fs=require("fs"), path=require("path");
const H=__dirname;
eval(fs.readFileSync(path.join(H,"content.js"),"utf8"));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const byId={}; CHARTS.forEach(c=>byId[c.id]=c);
const pairsOf=id=>EDGES.filter(e=>e[0]===id||e[1]===id).map(e=>[e[0]===id?e[1]:e[0],e[2]]);
const STAGE=["탐색","확인·비교","모델링·평가","설명"], DT=["연속값","범주·개수","시간 순서","모델 점수·예측"];

/* ---------- 실험 패널 (교시별) ---------- */
const EXP={
1:`<div class="panel" id="exp-1"><div class="ptitle">실험 ① 데이터 모양을 바꾸면 세 그림은 어떻게 달라질까?</div>
<div class="ctrl"><div class="group" role="group" aria-label="데이터 모양"><span class="glabel">모양</span><button class="bt" data-shape="norm" aria-pressed="true">정규(종 모양)</button><button class="bt" data-shape="skew" aria-pressed="false">오른쪽 꼬리</button><button class="bt" data-shape="bimo" aria-pressed="false">두 봉우리</button></div>
<label class="group"><span class="glabel">데이터 수 n</span><input type="range" id="e1-n" min="50" max="1000" step="50" value="400"><span class="val" id="e1-nv">400</span></label></div>
<div class="tri"><figure><canvas id="e1-h" role="img" aria-label="히스토그램"></canvas><figcaption>히스토그램</figcaption></figure><figure><canvas id="e1-b" role="img" aria-label="상자그림"></canvas><figcaption>상자그림</figcaption></figure><figure><canvas id="e1-q" role="img" aria-label="QQ 플롯"></canvas><figcaption>QQ 플롯 (정규분포 기준)</figcaption></figure></div>
<div class="minis" id="e1-m"></div><div class="insight" id="e1-i"></div></div>`,
2:`<div class="panel" id="exp-2"><div class="ptitle">실험 ② 상관의 세기를 바꾸고, 튀는 점 하나를 넣어 보자</div>
<div class="ctrl"><label class="group"><span class="glabel">진짜 관계의 세기</span><input type="range" id="e2-r" min="-0.95" max="0.95" step="0.05" value="0.6"><span class="val" id="e2-rv">0.60</span></label>
<button class="bt" id="e2-out" aria-pressed="false">튀는 점 하나 넣기</button><button class="bt" id="e2-u" aria-pressed="false">U자 관계로 바꾸기</button></div>
<div class="duo"><figure><canvas id="e2-s" role="img" aria-label="산점도"></canvas><figcaption>산점도와 추세선</figcaption></figure><figure><canvas id="e2-c" role="img" aria-label="상관계수 비교 막대"></canvas><figcaption>상관계수 r (튀는 점 빼기 전·후)</figcaption></figure></div>
<div class="minis" id="e2-m"></div><div class="insight" id="e2-i"></div></div>`,
3:`<div class="panel" id="exp-3"><div class="ptitle">실험 ③ 기준선을 옮기고, 양성(사기) 비율을 바꿔 보자</div>
<div class="ctrl"><label class="group"><span class="glabel">기준선 (점수)</span><input type="range" id="e3-t" min="-1.5" max="4" step="0.1" value="1.5"><span class="val" id="e3-tv">1.5</span></label>
<div class="group" role="group" aria-label="양성 비율"><span class="glabel">양성 비율</span><button class="bt" data-prev="0.5" aria-pressed="false">50%</button><button class="bt" data-prev="0.1" aria-pressed="true">10%</button><button class="bt" data-prev="0.01" aria-pressed="false">1%</button></div></div>
<div class="quad"><figure><canvas id="e3-e" role="img" aria-label="두 분포와 기준선"></canvas><figcaption>두 분포와 기준선 (빨강 α 헛경보, 주황 β 놓침)</figcaption></figure><figure><div id="e3-cm" class="cmbox" aria-live="polite"></div><figcaption>혼동행렬 (거래 10,000건)</figcaption></figure><figure><canvas id="e3-r" role="img" aria-label="ROC 곡선"></canvas><figcaption>ROC 곡선 위 지금 위치</figcaption></figure><figure><canvas id="e3-p" role="img" aria-label="PR 곡선"></canvas><figcaption>PR 곡선 위 지금 위치</figcaption></figure></div>
<div class="minis" id="e3-m"></div><div class="insight" id="e3-i"></div></div>`,
4:`<div class="panel" id="exp-4"><div class="ptitle">실험 ④ 모델 복잡도(다항식 차수)를 올려 보자</div>
<div class="ctrl"><label class="group"><span class="glabel">복잡도 (차수)</span><input type="range" id="e4-d" min="1" max="12" step="1" value="3"><span class="val" id="e4-dv">3</span></label></div>
<div class="duo"><figure><canvas id="e4-f" role="img" aria-label="학습 데이터와 모델 곡선"></canvas><figcaption>학습 데이터 30개(점)와 모델 곡선, 정답 곡선(점선)</figcaption></figure><figure><canvas id="e4-c" role="img" aria-label="복잡도별 오차"></canvas><figcaption>복잡도별 학습 오차·검증 오차</figcaption></figure></div>
<div class="minis" id="e4-m"></div><div class="insight" id="e4-i"></div></div>`,
5:`<div class="panel" id="exp-5"><div class="ptitle">실험 ⑤ 군집 수 k를 바꿔 보자 (진짜 무리는 몇 개일까?)</div>
<div class="ctrl"><label class="group"><span class="glabel">군집 수 k</span><input type="range" id="e5-k" min="1" max="8" step="1" value="2"><span class="val" id="e5-kv">2</span></label></div>
<div class="tri"><figure><canvas id="e5-s" role="img" aria-label="K-평균 결과"></canvas><figcaption>K-평균 결과</figcaption></figure><figure><canvas id="e5-e" role="img" aria-label="엘보 곡선"></canvas><figcaption>엘보 곡선 (WCSS)</figcaption></figure><figure><canvas id="e5-l" role="img" aria-label="평균 실루엣"></canvas><figcaption>평균 실루엣 점수</figcaption></figure></div>
<div class="minis" id="e5-m"></div><div class="insight" id="e5-i"></div></div>`,
6:`<div class="panel" id="exp-6"><div class="ptitle">실험 ⑥ 이동평균 창과 계절성을 바꿔 보자</div>
<div class="ctrl"><label class="group"><span class="glabel">이동평균 창 (개월)</span><input type="range" id="e6-w" min="1" max="24" step="1" value="3"><span class="val" id="e6-wv">3</span></label>
<button class="bt" id="e6-s" aria-pressed="true">계절성 켜기</button></div>
<div class="duo"><figure><canvas id="e6-l" role="img" aria-label="월별 매출과 이동평균"></canvas><figcaption>월별 매출 72개월과 이동평균</figcaption></figure><figure><canvas id="e6-a" role="img" aria-label="자기상관 막대"></canvas><figcaption>자기상관(ACF), 띠 = 95% 범위</figcaption></figure></div>
<div class="minis" id="e6-m"></div><div class="insight" id="e6-i"></div></div>`
};

/* ---------- 카드 ---------- */
function card(c){
  const pr=pairsOf(c.id);
  return `<details class="card" id="c-${c.id}" style="--gc:var(--g${c.g})">
<summary><canvas class="mini" data-chart="${c.id}" role="img" aria-label="${esc(c.ko)} 예시 그림"></canvas>
<span class="ct"><b>${esc(c.ko)}</b><small>${esc(c.en)}</small></span><span class="cq">${esc(c.q)}</span>
<span class="ctags"><span>${STAGE[c.st]}</span><span>${DT[c.dt]}</span></span><span class="open">자세히</span></summary>
<div class="cbody">
<dl><dt>이 그림이 답하는 질문</dt><dd>${esc(c.q)}</dd><dt>읽는 법</dt><dd>${esc(c.read)}</dd><dt>회사에서는</dt><dd>${esc(c.work)}</dd></dl>
<div class="mis"><b class="mt">흔한 오독</b><div data-mis="${c.id}"></div></div>
<div class="pairs"><b>함께 보는 짝</b>${pr.map(p=>`<a class="chip" href="#c-${p[0]}" data-open="${p[0]}">${esc(byId[p[0]].ko)} <small>${esc(p[1])}</small></a>`).join("")}${c.link?`<a class="chip ext" href="${esc(c.link[0])}">${esc(c.link[1])} ↗</a>`:""}</div>
<details class="fold"><summary>파이썬 코드로 보면 (몰라도 됩니다)</summary><pre><code>${esc(c.py)}</code></pre></details>
<div class="prompt"><b>생성 AI에게 이렇게 부탁해 보세요</b><p>${esc(c.prompt)}</p><button class="bt copy" data-copy="${esc(c.prompt)}">프롬프트 복사</button></div>
<a class="maplink" href="#map" data-map="${c.id}">3D 지도에서 위치 보기 ↑</a>
</div></details>`;
}

/* ---------- 교시 ---------- */
function lesson(G){
  const m=G.math, cs=CHARTS.filter(c=>c.g===G.n);
  return `<section class="sec" id="g${G.n}" aria-labelledby="h-g${G.n}" style="--gc:var(--g${G.n})">
<h2 id="h-g${G.n}"><span class="hex">${G.n}</span>${G.n}교시 · ${esc(G.ko)}</h2>
<div class="tags"><span class="tag">질문: ${esc(G.q)}</span><span class="tag">차트 ${cs.length}장</span><span class="tag">방법: 그림 ${cs.length}장과 실험 1개</span></div>
<p class="where"><b>지도 위치</b> ${esc(G.prev)} → <b>${G.n}교시 ${esc(G.ko)}</b> → ${esc(G.next)}</p>
<div data-dlg="g${G.n}"></div>
<div class="pair2">
 <div class="whybox" id="why-${G.n}"><h3>왜 이 그림들을 쓰나</h3><ol><li><b>문제 상황</b> ${esc(G.why.problem)}</li><li><b>앞 방법의 한계</b> ${esc(G.why.limit)}</li><li><b>해법</b> ${esc(G.why.fix)}</li></ol><p class="easy"><b>쉽게 말하면</b> ${esc(G.why.easy)}</p></div>
 <div class="mathbox" id="math-${G.n}"><h3>수학 수식을 어려워하는 하루가 대신 물어봅니다</h3><div data-sayq="${G.n}"></div>
  <p class="school"><b>학교 수학으로 보면</b> ${esc(m.school)}</p>
  <table class="sym"><tbody>${m.rows.map(r=>`<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join("")}</tbody></table>
  <p class="calc"><b>숫자로 한 번 해 보기</b> ${esc(m.calc)}</p><p class="note">${esc(m.note)}</p><div data-saya="${G.n}"></div></div>
</div>
<div class="pair"><div><div class="tl">일상으로 치면</div>${esc(G.daily)}</div><div><div class="tr">회사에서는</div>${esc(G.work)}</div></div>
<div data-dlg="g${G.n}x"></div>
${EXP[G.n]}
<div class="lim"><b>이 교시의 한계</b> ${esc(G.limit)}</div>
<details class="fold"><summary>교안의 파이썬 코드로 보면 (몰라도 됩니다)</summary>${G.code.map(c=>`<pre><code>${esc(c[0])}</code></pre><p class="cm">→ ${esc(c[1])}</p>`).join("")}</details>
<h3 class="cardsh">${G.n}교시 차트 카드 ${cs.length}장 <small>눌러서 펼치기</small></h3>
<div class="cards">${cs.map(card).join("")}</div>
<div class="quiz" data-quiz="${G.n}" id="quiz-${G.n}"><div class="q">확인 퀴즈 · ${esc(G.quiz.q)}</div><div class="opts">${G.quiz.opts.map((o,i)=>`<button class="bt" data-i="${i}">${esc(o)}</button>`).join("")}</div><div class="fb" aria-live="polite"></div></div>
<div data-dlg="g${G.n}s"></div>
</section>`;
}

const tpl=fs.readFileSync(path.join(H,"page.src.html"),"utf8");
const steps=GROUPS.map(G=>`<a class="step" href="#g${G.n}" style="--gc:var(--g${G.n})"><b>${G.n}교시 · ${esc(G.ko)}</b>${esc(G.q)}<small>${CHARTS.filter(c=>c.g===G.n).map(c=>esc(c.ko)).join(" · ")}</small></a>`).join("");
const navLinks=GROUPS.map(G=>`<a href="#g${G.n}">${G.n} ${esc(G.ko)}</a>`).join("");
const out=tpl.replace("<!--@@STEPS@@-->",steps).replace("<!--@@NAV@@-->",navLinks).replace("<!--@@LESSONS@@-->",GROUPS.map(lesson).join("\n"))
 .replace("/*@@SPRITES@@*/",()=>fs.readFileSync(path.join(H,"sprites.js"),"utf8"))
 .replace("/*@@CONTENT@@*/",()=>fs.readFileSync(path.join(H,"content.js"),"utf8"))
 .replace("/*@@APP@@*/",()=>fs.readFileSync(path.join(H,"app.js"),"utf8"));
fs.writeFileSync(path.join(H,"..","index.html"),out);
console.log("index.html",Math.round(out.length/1024),"KB");
