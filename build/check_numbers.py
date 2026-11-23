import numpy as np
x=[2,3,4,5,6,7,30]; print("numpy Q1,Q3",np.percentile(x,25),np.percentile(x,75))
a=np.array([1,2,3.]);b=np.array([2,4,5.]); print("r",np.corrcoef(a,b)[0,1], ((a-a.mean())*(b-b.mean())).sum(), ((b-b.mean())**2).sum())
TP,FP,FN,TN=8,2,4,86; print("prec",TP/(TP+FP),"rec",TP/(TP+FN),"acc",(TP+TN)/100,"fpr",FP/(FP+TN))
g=lambda p:1-p**2-(1-p)**2; print("gini",g(.3),g(.75),0.4*g(.75))
print("sil",(5-2)/5,(3-4)/4, np.hypot(3,4))
print("ma",[np.mean([10,12,14,13,15][i:i+3]) for i in range(3)])
print("cross",120/300,60/100)
