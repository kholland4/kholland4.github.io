#!/usr/bin/python3
import sys, PIL, cairosvg, os
from PIL import Image
from io import BytesIO

# Takes either a SVG or raster input
src_filename = sys.argv[1]

def save_png(img, filename):
    img.save(filename)
def save_ico(img, filename):
    img.save(filename, sizes=[(16, 16), (32, 32), (48, 48)])

# (output filename, render resolution, save function)
output_formats = [
    ("favicon.ico", (96, 96), save_ico),
#    ("favicon-32.png", (32, 32), save_png),
#    ("favicon-128.png", (128, 128), save_png),
#    ("favicon-152.png", (152, 152), save_png),
#    ("favicon-167.png", (167, 167), save_png),
#    ("favicon-180.png", (180, 180), save_png),
#    ("favicon-192.png", (192, 192), save_png),
#    ("favicon-196.png", (196, 196), save_png)
]

if src_filename == "--list-out-files":
    print(" ".join([x[0] for x in output_formats]))
    exit()

root, ext = os.path.splitext(src_filename)

if ext == ".svg":
    with open(src_filename, "rb") as f:
        svg_data = f.read()

    for outfile, res, outfunc in output_formats:
        render_raw = BytesIO()
        # FIXME setting resolution doesn't seem to work?
        cairosvg.svg2png(bytestring=svg_data, write_to=render_raw,
                         output_width=res[0], output_height=res[1])
        render = PIL.Image.open(render_raw)
        
        outfunc(render, outfile)
else:
    src_image = PIL.Image.open(src_filename)
    
    for outfile, res, outfunc in output_formats:
        render = src_image.resize(res)
        outfunc(render, outfile)
