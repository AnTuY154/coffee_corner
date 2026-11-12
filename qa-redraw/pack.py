from pathlib import Path
from PIL import Image

source = Path('qa-redraw/dog-walk-originals')
target = Path('public/art/frames/dog/walk')
target.mkdir(parents=True, exist_ok=True)
for path in sorted(source.glob('*.png')):
    image = Image.open(path).convert('RGBA')
    alpha = image.getchannel('A')
    box = alpha.point(lambda value: 255 if value >= 32 else 0).getbbox()
    if not box:
        raise ValueError(f'Empty image: {path}')
    image = image.crop(box)
    image.putalpha(image.getchannel('A').point(lambda value: value if value >= 32 else 0))
    width = 240
    height = round(width * image.height / image.width)
    if height > 210:
        height = 210
        width = round(height * image.width / image.height)
    image = image.resize((width, height), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (256, 256))
    canvas.alpha_composite(image, ((256-width)//2, 245-height))
    canvas.save(target / f'{path.stem}.webp', 'WEBP', lossless=True)
