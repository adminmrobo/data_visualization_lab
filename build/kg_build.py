import json,subprocess,os
H=os.path.dirname(os.path.abspath(__file__))
D=json.loads(subprocess.check_output(['node','-e',"eval(require('fs').readFileSync('content.js','utf8'));process.stdout.write(JSON.stringify({C:CHARTS,G:GROUPS,E:EDGES}))"],cwd=H))
PAGE="data_visualization_lab"; DOM=["stats","ai"]
nodes=[];edges=[]
def N(id,type,ko,en,anchor,level,cov="explained",conf="high",definition=None,family=None,**kw):
    n={"id":id,"type":type,"label":{"ko":ko,"en":en},"page":PAGE,"anchor":anchor,"level":level,"status":"known","confidence":conf,"coverage":cov,"match":[],"domain":DOM}
    if definition:n["definition"]={"ko":definition}
    if family:n["family"]=family
    n.update(kw);nodes.append(n);return id
def Ed(s,p,o,anchor,conf="high"):edges.append({"s":s,"p":"lab:"+p,"o":o,"anchor":anchor,"confidence":conf})
BR={"hist":["probability-statistics"],"box":["probability-statistics"],"ecdf":["probability-statistics"],"qq":["probability-statistics"],"ks":["probability-statistics","accuracy-metrics"],
"scatter":["probability-statistics"],"pair":["probability-statistics"],"heat":["probability-statistics","feature-engineering"],"cross":["probability-statistics"],"resid":["linear-regression"],
"cm":["confusion-matrix"],"err":["probability-statistics","confusion-matrix"],"roc":["roc-auc"],"pr":["precision-recall"],"cal":["accuracy-metrics"],"lift":["accuracy-metrics"],
"bv":["bias-variance"],"lc":["generalization"],"loss":["early-stopping"],"gini":["decision-tree"],"imp":["interpretability"],"shap":["interpretability"],"pdp":["interpretability"],
"scree":["pca"],"biplot":["pca"],"tsne":["tsne-umap"],"elbow":["clustering"],"sil":["clustering"],"dendro":["clustering"],"line":["time-series"],"decomp":["time-series"],"acf":["time-series"]}
FAM={"probability-statistics":"math","accuracy-metrics":"evaluation","feature-engineering":"ml-basics","linear-regression":"classical","confusion-matrix":"evaluation","roc-auc":"evaluation","precision-recall":"evaluation",
"bias-variance":"ml-basics","generalization":"ml-basics","early-stopping":"regularization","decision-tree":"classical","interpretability":"responsible","pca":"unsupervised","tsne-umap":"unsupervised","clustering":"unsupervised","time-series":"sequence"}
SLUG={"hist":"histogram","box":"box-violin-plot","ecdf":"ecdf-plot","qq":"qq-plot","ks":"ks-plot","scatter":"scatter-plot","pair":"pair-plot","heat":"correlation-heatmap","cross":"contingency-table-mosaic","resid":"residual-plot",
"cm":"confusion-matrix-plot","err":"type-i-ii-error-plot","roc":"roc-curve","pr":"precision-recall-curve","cal":"calibration-curve","lift":"lift-gain-chart","bv":"bias-variance-plot","lc":"learning-curve","loss":"loss-curve",
"gini":"gini-entropy-plot","imp":"feature-importance-plot","shap":"shap-summary-plot","pdp":"pdp-ice-plot","scree":"scree-plot","biplot":"pca-biplot","tsne":"tsne-umap-map","elbow":"elbow-curve","sil":"silhouette-plot","dendro":"dendrogram",
"line":"moving-average-line","decomp":"seasonal-decomposition","acf":"acf-pacf-plot"}
cid=lambda k:"lab:method/"+SLUG[k]
GKEY={1:"distribution-view",2:"relationship-view",3:"model-evaluation-view",4:"diagnosis-interpretation-view",5:"reduction-grouping-view",6:"time-series-view"}
gid=lambda n:"lab:concept/chart-"+GKEY[n]
for G in D["G"]:
    N(gid(G["n"]),"Concept",f'{G["n"]}교시 {G["ko"]}',["Viewing distributions","Viewing relationships","Model evaluation charts","Diagnosis and interpretation charts","Dimension reduction and clustering charts","Time series charts"][G["n"]-1],f'#g{G["n"]}',1 if G["n"]<=2 else 2,definition=G["q"]+" — 이 질문에 답하는 차트 묶음",family="math" if G["n"]<=2 else None)
    N(f'lab:limitation/chart-{GKEY[G["n"]]}-limit',"Limitation",f'{G["n"]}교시의 한계',f'Limit of lesson {G["n"]}',f'#g{G["n"]}',2,definition=G["limit"])
    Ed(gid(G["n"]),"hasLimitation",f'lab:limitation/chart-{GKEY[G["n"]]}-limit',f'#g{G["n"]}')
    if G["n"]<6:
        Ed(gid(G["n"]),"prerequisiteOf",gid(G["n"]+1),f'#g{G["n"]+1}')
        Ed(f'lab:limitation/chart-{GKEY[G["n"]]}-limit',"addressedBy",gid(G["n"]+1),f'#g{G["n"]+1}')
    N(f'lab:simulation/chart-lab-exp-{G["n"]}',"Simulation",f'실험 {"①②③④⑤⑥"[G["n"]-1]}',f'Experiment {G["n"]}',f'#exp-{G["n"]}',2,definition=G["q"]+"를 조작해 보는 실험 패널")
    Ed(gid(G["n"]),"demonstratedBy",f'lab:simulation/chart-lab-exp-{G["n"]}',f'#exp-{G["n"]}')
    N(f'lab:quiz/p{PAGE}-g{G["n"]}-1',"QuizItem",G["quiz"]["q"][:60],f'Quiz {G["n"]}',f'#quiz-{G["n"]}',2)
    Ed(f'lab:quiz/p{PAGE}-g{G["n"]}-1',"assesses",gid(G["n"]),f'#quiz-{G["n"]}')
for c in D["C"]:
    lvl=3 if c["id"] in("shap","pdp","tsne","cal","lift") else (1 if c["g"]<=2 else 2)
    top=BR[c["id"]]
    N(cid(c["id"]),"Method",c["ko"],c["en"],"#c-"+c["id"],lvl,definition=c["q"]+" "+c["read"].split(".")[0]+".",family=FAM[top[0]])
    Ed(cid(c["id"]),"partOf",gid(c["g"]),"#c-"+c["id"])
    for t in top: Ed(cid(c["id"]),"broader","lab:topic/"+t,"#c-"+c["id"])
# 짝 관계
PRE={("ecdf","ks"),("hist","ecdf"),("scatter","heat"),("scatter","resid"),("cm","roc"),("cm","err"),("gini","imp"),("imp","shap"),("scree","biplot"),("line","decomp"),("decomp","acf")}
for a,b,lab in D["E"]:
    if (a,b) in PRE: Ed(cid(a),"prerequisiteOf",cid(b),"#c-"+b)
    else: Ed(cid(a),"contrastsWith",cid(b),"#c-"+b)
# 지표
MET=[("precision","정밀도","Precision","#math-3","‘사기’라고 외친 것 중 진짜 비율 TP÷(TP+FP)",["cm","pr"]),("recall","재현율","Recall (TPR)","#math-3","진짜 사기 중 잡아낸 비율 TP÷(TP+FN)",["cm","roc","pr"]),
("false-positive-rate","헛경보율","False positive rate","#math-3","정상 중 잘못 경보한 비율 FP÷(FP+TN)",["roc"]),("auc","AUC","Area under the ROC curve","#c-roc","ROC 곡선 아래 넓이, 0.5 무작위·1 완벽",["roc"]),
("ks-statistic","KS 통계량 D","Kolmogorov–Smirnov statistic","#c-ks","두 누적분포 사이 최대 세로 거리",["ks","ecdf"]),("pearson-r","상관계수 r","Pearson correlation coefficient","#math-2","두 변수의 직선 관계 세기(−1~1)",["scatter","heat"]),
("silhouette-score","실루엣 점수","Silhouette score","#math-5","(b−a)÷max(a,b), 1에 가까울수록 잘 묶임",["sil"]),("wcss","군집 안 제곱합 WCSS","Within-cluster sum of squares","#c-elbow","무리 안 점들이 중심에서 떨어진 정도의 합",["elbow"]),
("gini-impurity","지니 불순도","Gini impurity","#math-4","1−Σp², 섞인 정도",["gini"]),("iqr","사분위 범위 IQR","Interquartile range","#math-1","Q3−Q1, 가운데 50%의 폭",["box"]),("explained-variance-ratio","설명분산 비율","Explained variance ratio","#c-scree","주성분 하나가 담는 분산 비율",["scree"])]
for k,ko,en,an,df,uses in MET:
    N("lab:metric/"+k,"Metric",ko,en,an,2,definition=df)
    for u in uses: Ed(cid(u),"evaluatedBy","lab:metric/"+k,an)
# 개념
N("lab:concept/overfitting","Concept","과적합","Overfitting","#exp-4",2,definition="학습 데이터를 외워 처음 보는 데이터에서 오차가 커지는 현상")
for u in ("bv","lc","loss"): Ed(cid(u),"demonstratedBy","lab:simulation/chart-lab-exp-4","#exp-4") if u=="bv" else None
Ed("lab:concept/overfitting","measuredBy" if False else "relatedTo",cid("loss"),"#c-loss")
N("lab:method/early-stopping","Method","조기 종료","Early stopping","#c-loss",2,cov="mentioned",definition="검증 손실이 다시 오르기 전에 학습을 멈추는 방법")
Ed(cid("loss"),"relatedTo","lab:method/early-stopping","#c-loss")
N("lab:concept/type-i-error","Concept","1종 오류","Type I error","#c-err",2,definition="차이가 없는데 있다고 판정하는 실수(헛경보), 확률 α")
N("lab:concept/type-ii-error","Concept","2종 오류","Type II error","#c-err",2,definition="차이가 있는데 놓치는 실수, 확률 β")
Ed(cid("err"),"relatedTo","lab:concept/type-i-error","#c-err");Ed(cid("err"),"relatedTo","lab:concept/type-ii-error","#c-err")
Ed("lab:concept/type-i-error","contrastsWith","lab:concept/type-ii-error","#c-err")
N("lab:concept/accuracy-paradox","Concept","정확도의 함정","Accuracy paradox","#duel",2,definition="양성이 드물면 모두 음성이라고 해도 정확도가 높게 나와, 정확도만으로는 모델을 고를 수 없다")
Ed(cid("cm"),"demonstratedBy","lab:simulation/chart-lab-duel","#duel")
N("lab:simulation/chart-lab-duel","Simulation","대결 — 정확도 99% 사기 탐지 모델","Duel: 99% accuracy fraud model","#duel",2,definition="두 모델의 혼동행렬과 예상 손실을 비교하는 대결 패널")
Ed("lab:concept/accuracy-paradox","demonstratedBy","lab:simulation/chart-lab-duel","#duel")
N("lab:concept/correlation-vs-causation","Concept","상관과 인과의 구분","Correlation vs causation","#c-scatter",1,definition="두 변수가 함께 움직여도 한쪽이 다른 쪽을 일으켰다고 말할 수 없다")
Ed(cid("scatter"),"relatedTo","lab:concept/correlation-vs-causation","#c-scatter")
N("lab:simulation/chart-lab-ai-corner","Simulation","AI 판단 코너","AI judgment corner","#ai-corner",2,definition="AI 보고서 문장에서 확인할 점을 찾는 활동")
Ed("lab:concept/accuracy-paradox","demonstratedBy","lab:simulation/chart-lab-ai-corner","#ai-corner")
N("lab:quiz/p"+PAGE+"-exam","QuizItem","박사 선생님의 쪽지시험 6문항","Final quiz","#exam",2)
for k in ("ecdf","cross","pr","loss","sil","acf"): Ed("lab:quiz/p"+PAGE+"-exam","assesses",cid(k),"#exam")
# 문헌과 주장
REFS=[("anscombe1973graphs","article-journal","Graphs in Statistical Analysis",[["Anscombe","F. J."]],1973,"The American Statistician"),
("rousseeuw1987silhouettes","article-journal","Silhouettes: A graphical aid to the interpretation and validation of cluster analysis",[["Rousseeuw","Peter J."]],1987,"Journal of Computational and Applied Mathematics"),
("niculescu-mizil2005predicting","paper-conference","Predicting good probabilities with supervised learning",[["Niculescu-Mizil","Alexandru"],["Caruana","Rich"]],2005,"Proceedings of the 22nd International Conference on Machine Learning"),
("vandermaaten2008visualizing","article-journal","Visualizing Data using t-SNE",[["van der Maaten","Laurens"],["Hinton","Geoffrey"]],2008,"Journal of Machine Learning Research"),
("saito2015precision","article-journal","The Precision-Recall Plot Is More Informative than the ROC Plot When Evaluating Binary Classifiers on Imbalanced Datasets",[["Saito","Takaya"],["Rehmsmeier","Marc"]],2015,"PLOS ONE"),
("wattenberg2016how","article-journal","How to Use t-SNE Effectively",[["Wattenberg","Martin"],["Viégas","Fernanda"],["Johnson","Ian"]],2016,"Distill"),
("lundberg2017unified","paper-conference","A Unified Approach to Interpreting Model Predictions",[["Lundberg","Scott M."],["Lee","Su-In"]],2017,"Advances in Neural Information Processing Systems 30")]
CL=[("pr-informative-imbalanced","양성이 드문 데이터에서는 PR 곡선이 ROC 곡선보다 성능 차이를 더 잘 보여 준다","On imbalanced data the PR plot is more informative than ROC","#c-pr","saito2015precision",cid("pr")),
("same-r-different-scatter","상관계수가 같아도 산점도 모양은 전혀 다를 수 있어 그림을 먼저 봐야 한다","Datasets with equal correlation can look very different","#exp-2","anscombe1973graphs",cid("scatter")),
("silhouette-definition","실루엣 점수는 (b−a)÷max(a,b)로 각 점이 자기 군집에 얼마나 잘 들어맞는지 잰다","Silhouette width measures how well each point fits its cluster","#math-5","rousseeuw1987silhouettes",cid("sil")),
("auc-not-calibration","구분력이 좋은 모델도 예측 확률은 보정되지 않았을 수 있다","Good ranking does not imply calibrated probabilities","#c-cal","niculescu-mizil2005predicting",cid("cal")),
("tsne-preserves-neighbors","t-SNE는 가까운 이웃 관계를 지키도록 고차원 데이터를 2차원에 펼친다","t-SNE embeds high-dimensional data preserving local neighborhoods","#c-tsne","vandermaaten2008visualizing",cid("tsne")),
("tsne-distances-unreliable","t-SNE 지도에서 무리의 크기와 무리 사이 거리는 설정값에 따라 달라져 해석에 주의해야 한다","Cluster sizes and distances in t-SNE plots may mean little","#c-tsne","wattenberg2016how",cid("tsne")),
("shap-additive-attribution","SHAP은 한 예측을 변수별 기여의 합으로 나눠 보여 준다","SHAP attributes a prediction additively to features","#c-shap","lundberg2017unified",cid("shap"))]
refs=[]
for rid,typ,title,auth,yr,cont in REFS:
    sup=["lab:claim/"+c[0] for c in CL if c[4]==rid]
    refs.append({"id":rid,"type":typ,"title":title,"author":[{"family":a,"given":b} for a,b in auth],"issued":{"date-parts":[[yr]]},"container-title":cont,
      "lab":{"work":"lab:work/"+rid,"role":"background","supports":sup,"locs":[],"verified":{"title":True,"author":True,"year":True,"container":True,"pages":False,"doi":False},"checkedBy":"작성자 지식으로 서지 작성, 외부 대조 안 함","checkedSource":"page"}})
    N("lab:work/"+rid,"Work",title,title,"#export",2,cov="mentioned")
for k,ko,en,an,rid,m in CL:
    N("lab:claim/"+k,"Claim",ko,en,an,3,source=[{"ref":rid,"loc":""}])
    Ed("lab:claim/"+k,"supports",m,an);Ed("lab:claim/"+k,"assertedIn","lab:work/"+rid,"#refs")
GB={1:["probability-statistics"],2:["probability-statistics"],3:["accuracy-metrics"],4:["generalization","interpretability"],5:["clustering","pca"],6:["time-series"]}
for n,ts in GB.items():
    for t in ts:
        Ed(gid(n),"broader","lab:topic/"+t,f"#g{n}"); Ed(f"lab:limitation/chart-{GKEY[n]}-limit","broader","lab:topic/"+t,f"#g{n}")
MB={"precision":"precision-recall","recall":"precision-recall","false-positive-rate":"roc-auc","auc":"roc-auc","ks-statistic":"probability-statistics","pearson-r":"probability-statistics","silhouette-score":"clustering","wcss":"clustering","gini-impurity":"decision-tree","iqr":"probability-statistics","explained-variance-ratio":"pca"}
for k,t in MB.items(): Ed("lab:metric/"+k,"broader","lab:topic/"+t,"#export")
for k,t in (("overfitting","generalization"),("type-i-error","probability-statistics"),("type-ii-error","probability-statistics"),("accuracy-paradox","accuracy-metrics"),("correlation-vs-causation","probability-statistics")):
    Ed("lab:concept/"+k,"broader","lab:topic/"+t,"#export")
Ed("lab:method/early-stopping","broader","lab:topic/early-stopping","#c-loss")
kg={"version":"1.0","page":PAGE,"nodes":nodes,"edges":edges}
meta={"title":"시각화 차트 도감","number":"1","series":"데이터 시각화 연구실","about":[gid(3),cid("cm"),cid("roc"),cid("hist"),gid(1),gid(5)],"basedOn":[],
"educationalLevel":"입문","creator":[{"name":"안상선","role":"author"}],"contributor":[{"name":"AI 보조 제작","role":"assistant"}],"date":"2026-11-24","version":"1.0","language":["ko"],"license":"",
"url":"https://adminmrobo.github.io/data_visualization_lab/","registry":"KG_00_registry 0.2","learningResourceType":"interactive explainer","seeAlso":"","domain":DOM,
"suggestedCitation":"안상선 (2026). 시각화 차트 도감. 데이터 시각화 연구실 1, v1.0."}
O=os.path.join(H,"..","kg")
for n,o in (("kg.json",kg),("refs.json",refs),("meta.json",meta)): json.dump(o,open(os.path.join(O,n),"w"),ensure_ascii=False,indent=1)
ids={n["id"] for n in nodes}; rel=sum(e["p"]=="lab:relatedTo" for e in edges)
print(len(nodes),"nodes",len(edges),"edges","relatedTo %.1f%%"%(100*rel/len(edges)), "dangling",[e for e in edges if e["s"] not in ids or (e["o"] not in ids and not e["o"].startswith("lab:topic/"))][:3])
