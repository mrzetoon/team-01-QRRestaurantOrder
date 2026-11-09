import math, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Rectangle, FancyArrowPatch

W,H=124,82
fig, ax = plt.subplots(figsize=(12.4, 8.2), dpi=200)
ax.set_xlim(0, W); ax.set_ylim(0, H); ax.axis("off")
ax.add_patch(Rectangle((20, 3), 82, 75, fill=False, lw=1.6, ec="#1F3A5F"))
ax.text(61, 75.3, "QR Code Restaurant Menu & Ordering System", ha="center", fontsize=12, weight="bold", color="#1F3A5F")

EW, EH = 19, 8.6
U = {}
def uc(key, label, x, y, main=True):
    U[key]=(x,y)
    ax.add_patch(Ellipse((x,y), EW, EH, fc="#E8F0FB" if main else "#F6F7F9", ec="#3B6FB6" if main else "#7A8796", lw=1.2, ls="-" ))
    ax.text(x, y, label, ha="center", va="center", fontsize=8.6, style="normal" if main else "italic")

uc("browse","Browse Menu",36,68,False)
uc("uc1","UC-01\nPlace Order",36,54)
uc("cust","Customize Item",36,40,False)
uc("uc2","UC-02\nTrack Order Status",36,26)
uc("uc7","UC-07\nPay Bill",36,12)
uc("cancel","Cancel Order",62,66,False)
uc("uc3","UC-03\nProcess Incoming\nOrders",86,66)
uc("uc4","UC-04\nUpdate Item\nAvailability",86,50)
uc("login","Log In",62,38,False)
uc("uc5","UC-05\nManage Menu",86,32)
uc("uc6","UC-06\nSet Up Tables\n& QR Codes",86,15)

def edge(key, tx, ty):
    x,y=U[key]; dx,dy=tx-x,ty-y
    a,b=EW/2,EH/2
    t=1/math.sqrt((dx/a)**2+(dy/b)**2)
    return x+dx*t, y+dy*t

def actor(x, y, name):
    ax.add_patch(plt.Circle((x, y+5.2), 1.3, fill=False, lw=1.3))
    ax.plot([x, x], [y+3.9, y+0.5], color="k", lw=1.3)
    ax.plot([x-2.2, x+2.2], [y+2.8, y+2.8], color="k", lw=1.3)
    ax.plot([x, x-1.8], [y+0.5, y-2.5], color="k", lw=1.3)
    ax.plot([x, x+1.8], [y+0.5, y-2.5], color="k", lw=1.3)
    ax.text(x, y-4.6, name, ha="center", fontsize=9.5, weight="bold")
    return (x, y+2)

cA=actor(9,42,"Customer")
sA=actor(115,58,"Staff")
mA=actor(115,22,"Manager")
# payment gateway: system actor box
ax.add_patch(Rectangle((2,6), 15, 11, fc="#FFF4E5", ec="#B26A00", lw=1.3))
ax.text(9.5,14.2,"«system»",ha="center",fontsize=7.5,color="#7A4A00")
ax.text(9.5,10.6,"Payment\nGateway",ha="center",va="center",fontsize=9,weight="bold",color="#7A4A00")
ax.text(9.5,3.6,"supporting actor",ha="center",fontsize=7.5,style="italic",color="#7A4A00")

def assoc(p, key):
    q=edge(key,*p); ax.plot([p[0],q[0]],[p[1],q[1]],color="#333",lw=1)
assoc((11.5,44),"uc1"); assoc((11.5,44),"uc2"); assoc((11.5,44),"uc7")
assoc((17,12),"uc7")
assoc((112.5,60),"uc3"); assoc((112.5,60),"uc4")
assoc((112.5,24),"uc5"); assoc((112.5,24),"uc6")
ax.annotate("", xy=(115,52.8), xytext=(115,27.6), arrowprops=dict(arrowstyle="-|>,head_length=1.0,head_width=0.6", fc="white", ec="k", lw=1.1))
ax.text(116.6,39,"inherits\nStaff's\nuse cases",fontsize=7.5,color="#444")

def dep(src, dst, label, lx=0, ly=0):
    sx,sy=U[src]; dx,dy=U[dst]
    p=edge(src,dx,dy); q=edge(dst,sx,sy)
    ax.annotate("", xy=q, xytext=p, arrowprops=dict(arrowstyle="->,head_length=0.8,head_width=0.45", ls=(0,(4,3)), color="#555", lw=1))
    ax.text((p[0]+q[0])/2+lx,(p[1]+q[1])/2+ly,label,fontsize=7.6,color="#1F3A5F",ha="center",
            bbox=dict(fc="white",ec="none",pad=0.5))
dep("uc1","browse","«include»",4.5,0)
dep("cust","uc1","«extend»",4.5,0)
dep("cancel","uc3","«extend»",0,3.2)
for k,(lx,ly) in {"uc3":(0,0),"uc4":(0,0),"uc5":(0,0),"uc6":(0,0)}.items():
    dep(k,"login","",lx,ly)
ax.text(70.5,44.5,"«include»",fontsize=7.6,color="#1F3A5F",ha="center",bbox=dict(fc="white",ec="none",pad=0.5))
ax.text(70.5,28.5,"«include»",fontsize=7.6,color="#1F3A5F",ha="center",bbox=dict(fc="white",ec="none",pad=0.5))
plt.savefig("usecase.png", bbox_inches="tight", facecolor="white")
