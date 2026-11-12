from pathlib import Path
from PIL import Image

source = Path('qa-redraw/employee-run-originals')
target = Path('public/art/frames/employee/run')
target.mkdir(parents=True, exist_ok=True)
frames = []
for path in sorted(source.glob('*.png')):
    image = Image.open(path).convert('RGBA')
    box = image.getchannel('A').point(lambda value: 255 if value >= 32 else 0).getbbox()
    if not box:
        raise ValueError(f'Empty image: {path}')
    image = image.crop(box)
    image.putalpha(image.getchannel('A').point(lambda value: value if value >= 32 else 0))
    frames.append((path, image))
scale = min(360 / max(im.width for _, im in frames),
            486 / max(im.height for _, im in frames))
for path, image in frames:
    size = (round(image.width * scale), round(image.height * scale))
    image = image.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (384, 512))
    canvas.alpha_composite(image, ((384-size[0])//2, 500-size[1]))
    canvas.save(target / f'{path.stem}.webp', 'WEBP', lossless=True)
