#!/usr/bin/env python3
"""Split the user's Fresh Juice master PNG into the actual PixiJS layer assets.
Run: python -m pip install Pillow
     python scripts/build-reference-art.py "/path/to/Fresh Juice pixel art.png"
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

if len(sys.argv)!=2:
    raise SystemExit("Usage: build-reference-art.py path/to/source-1536x1024.png")
source=Path(sys.argv[1])
im=Image.open(source).convert("RGB")
if im.size!=(1536,1024):
    raise SystemExit(f"Expected 1536x1024 source, got {im.size}")
output=Path("public/pixel-shop/reference")
output.mkdir(parents=True,exist_ok=True)
im.save(output/"scene.webp","WEBP",quality=93,method=6)

# Coordinates in SOURCE pixels, not logical room coordinates (logical scale 5/16).
spec={
"roof-sign":((562,113,1045,226),[(570,136),(590,121),(1000,115),(1038,137),(1045,195),(1028,213),(583,224),(564,205)],8),
"menu-board":((965,292,1222,467),[(971,293),(1214,293),(1222,306),(1221,452),(1210,463),(978,462),(966,452),(965,303)],90),
"counter-front":((633,526,1236,690),[(646,533),(1232,528),(1235,668),(1215,683),(646,679),(635,667),(633,553)],217),
"fruit-display":((1017,456,1225,562),[(1021,482),(1040,470),(1207,471),(1215,485),(1224,546),(1202,553),(1026,554)],181),
"table-left":((8,544,369,830),[(18,596),(70,552),(247,551),(289,616),(284,705),(350,700),(360,807),(8,817)],249),
"table-center":((584,581,912,866),[(616,624),(701,586),(801,591),(879,636),(863,699),(910,789),(890,850),(586,854),(591,750)],256),
"table-right":((1180,542,1535,830),[(1220,618),(1265,558),(1446,553),(1522,612),(1533,804),(1184,810),(1190,736)],249),
"table-back-left":((270,714,595,962),[(299,802),(390,721),(483,731),(584,799),(576,944),(275,954)],295),
"table-back-right":((902,713,1249,966),[(931,809),(1020,727),(1134,725),(1231,804),(1246,946),(907,960)],295),
"canopy":((181,0,1377,300),[(182,196),(436,116),(750,7),(1003,34),(1376,190),(1346,288),(253,290)],6),
"tree-canopy-left":((0,0,605,480),[(0,0),(604,0),(567,125),(363,203),(245,304),(106,478),(0,470)],18),
"tree-canopy-right":((1120,65,1535,618),[(1535,65),(1535,617),(1422,530),(1327,382),(1165,290),(1122,178)],18)
}
layers={}
for name,(bounds,polygon,z) in spec.items():
    mask=Image.new("L",im.size,0)
    ImageDraw.Draw(mask).polygon(polygon,fill=255)
    result=Image.new("RGBA",im.size,(0,0,0,0))
    result.paste(im,(0,0),mask)
    result=result.crop(bounds)
    result.save(output/(name+".webp"),"WEBP",quality=92,method=6)
    x0,y0,x1,y1=bounds
    layers[name]={"file":name+".webp","bbox":bounds,"z":z,"size":[x1-x0,y1-y0]}
manifest={"world":{"width":480,"height":320},
          "source":{"size":[1536,1024],"attribution":"User-supplied Fresh Juice pixel art reference"},
          "scene":"scene.webp","layers":layers,
          "hotspots":[
            {"id":"menu-board","action":"menu","rect":[303,93,78,49]},
            {"id":"fruit-case","action":"fruit","rect":[320,144,61,34]},
            {"id":"daily-board","action":"daily","rect":[273,174,58,17]},
            {"id":"counter","action":"counter","rect":[203,165,179,47]}
          ]}
(output/"manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
print(f"Saved scene.webp and {len(layers)} layers to {output}")
