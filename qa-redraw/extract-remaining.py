import json
from pathlib import Path
from PIL import Image, ImageDraw

jobs = json.loads(Path('qa-redraw/remaining-sheets.json').read_text())
for job in jobs:
    image = Image.open(job['path']).convert('RGBA')
    alpha = image.getchannel('A').point(lambda a: 255 if a >= 64 else 0)
    w, h = image.size
    row_split = min(range(int(h*.43), int(h*.57)),
                    key=lambda y: (sum(alpha.crop((0,y,w,y+1)).getdata()), abs(y-h/2)))
    rows = [(0,row_split), (row_split,h)]
    frames = []
    for top,bottom in rows:
        xs = [0]
        for column in range(1,job['cols']):
            expected = w*column/job['cols']
            xs.append(min(range(int(expected-w/job['cols']*.12),int(expected+w/job['cols']*.12)),
                          key=lambda x: (sum(alpha.crop((x,top,x+1,bottom)).getdata()), abs(x-expected))))
        xs.append(w)
        for left,right in zip(xs,xs[1:]):
            cell = image.crop((left,top,right,bottom))
            mask = alpha.crop((left,top,right,bottom))
            box = mask.getbbox()
            assert box, job
            if box[0] == 0 or box[1] == 0 or box[2] == cell.width or box[3] == cell.height:
                print('EDGE',job['who'],job['action'],len(frames),box,cell.size)
            cell = cell.crop(box)
            cell.putalpha(cell.getchannel('A').point(lambda a: a if a >= 32 else 0))
            frames.append(cell)
    assert len(frames) == job['count']
    employee = job['who'] == 'employee'
    size = (384,512) if employee else (256,256)
    max_width = 350 if employee else 240
    max_height = (380 if job['action'] == 'pet_cat' else 310 if job['action'] == 'pet_dog' else 486) if employee else 210
    # One scale per sequence preserves relative body size between its poses.
    scale = min(max_width/max(im.width for im in frames),max_height/max(im.height for im in frames))
    out = Path('qa-redraw/remaining-packed')/job['who']/job['action']
    out.mkdir(parents=True,exist_ok=True)
    sheet = Image.new('RGB',(job['cols']*size[0],2*size[1]),'#e6ede5')
    draw=ImageDraw.Draw(sheet)
    for i,im in enumerate(frames):
        im=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
        canvas=Image.new('RGBA',size)
        canvas.alpha_composite(im,((size[0]-im.width)//2,(500 if employee else 245)-im.height))
        canvas.save(out/f'{i:02}.webp','WEBP',lossless=True)
        x=i%job['cols']*size[0]; y=i//job['cols']*size[1]
        sheet.paste(canvas,(x,y),canvas);draw.text((x+3,y+3),f'{i:02}',fill='black')
    sheet.save(out/'contact.png')
    print(job['who'],job['action'],len(frames),'packed')
