#!/usr/bin/python3

import json, os, bs4
from datetime import datetime
from PIL import Image

tag_colors = {
    "lang": ["#4aa54a", "#fff"],
    "hardware": ["#4aa54a", "#fff"],
    "status-bad": ["#c55", "#fff"],
    "status-good": ["#3f9fc6", "#fff"]
}

def parse(args, target, soup, workdir, out_dir):
    tile_data = []
    for filename_raw in args[1:]:
        parts = filename_raw.split("#")
        filename_actual = parts[0]
        if len(parts) > 1:
            use_ids_raw = parts[1].split(",")
        else:
            use_ids_raw = None
        
        data_items = {}
        
        filename = os.path.join(workdir, filename_actual)
        with open(filename, "r") as f:
            data = json.load(f)
            for item in data:
                if use_ids_raw is not None:
                    data_items[item["id"]] = item
                else:
                    tile_data.append(item)
        
        if use_ids_raw is not None:
            for n in use_ids_raw:
                if n.count("-") == 1:
                    bits = n.split("-")
                    min_ = int(bits[0])
                    max_ = int(bits[1])
                    
                    if max_ >= min_:
                        for i in range(min_, max_ + 1):
                            tile_data.append(data_items[i])
                    else:
                        for i in range(min_, max_ - 1, -1):
                            tile_data.append(data_items[i])
                else:
                    tile_data.append(data_items[int(n)])
    
    for item in tile_data:
        entry = soup.new_tag("div", id=("post." + str(item["id"])))
        entry["class"] = "tile"
        
        # Clickable image
        img = soup.new_tag("img")
        img["class"] = "tile-image"
        if "image" in item:
            real_image_loc = os.path.join(workdir, item["image"])
            img["alt"] = "Depiction of '" + item["title"] + "'"
        else:
            real_image_loc = "images/projects/placeholder.png"
            img["alt"] = "Placeholder image"
        
        img["src"] = os.path.relpath(real_image_loc, start=out_dir)
        entry_image = Image.open(os.path.normpath(real_image_loc))
        img["width"], img["height"] = entry_image.size
        
        if "click" in item:
            img_a = soup.new_tag("a", href=item["click"])
            img_a.append(img)
            entry.append(img_a)
        else:
            entry.append(img)
        
        # Date
        if "time" in item:
            when = datetime.utcfromtimestamp(item["time"])
            when_str = when.strftime("%b %e, %Y")
            
            when_div = soup.new_tag("div")
            when_div["class"] = "tile-date"
            when_div.string = when_str
            entry.append(when_div)
        
        # Title
        title = soup.new_tag("div")
        title["class"] = "tile-title"
        title.string = item["title"]
        entry.append(title)
        
        # Tag and link bubbles
        if ("tags" in item) or ("links" in item):
            tag_container = soup.new_tag("div")
            tag_container["class"] = "tile-tag-container"
            
            if "tags" in item:
                for name, text in item["tags"]:
                    tag_el = soup.new_tag("span")
                    tag_el["class"] = "tag"
                    
                    if name in tag_colors:
                        tag_el["style"] = "background-color: " + tag_colors[name][0] + "; color: " + tag_colors[name][1] + ";"
                    
                    tag_el.string = text
                    
                    tag_container.append(tag_el)
                    tag_container.append(bs4.NavigableString(" "))
            
            if "links" in item:
                for props in item["links"]:
                    text = props["text"]
                    dest = props["dest"]
                    
                    link_el = soup.new_tag("a")
                    link_el["class"] = "tag"
                    link_el["href"] = dest
                    
                    icon = soup.new_tag("img")
                    icon["src"] = "../icons/link.png" #material icon (https://material.io/tools/icons/) (under https://www.apache.org/licenses/LICENSE-2.0.html)
                    icon["alt"] = "link: "
                    icon["class"] = "tag-link-icon"
                    link_el.append(icon)
                    
                    text_el = soup.new_tag("span")
                    text_el.string = text
                    link_el.append(text_el)
                    
                    tag_container.append(link_el)
                    tag_container.append(bs4.NavigableString(" "))
            
            entry.append(tag_container)
        
        # Body
        body = soup.new_tag("div")
        body["class"] = "tile-body"
        body_content = bs4.BeautifulSoup(item["body"], "lxml")
        body.extend(body_content.body.contents)
        entry.append(body)
        
        target.append(entry)
    
    # Add some dummy spacers to make everything display as desired
    for i in range(10):
        spacer = soup.new_tag("div")
        spacer["class"] = "tile-spacer"
        target.append(spacer)
