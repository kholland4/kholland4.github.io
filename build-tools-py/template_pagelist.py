#!/usr/bin/python3

import json, os, bs4

tag_colors = {
    "category": ["#3f9fc6", "#fff"]
}

def parse(args, target, soup, workdir, out_dir):
    source_info = {
        "type": "script",
        "file": __file__,
        "children": []
    }
    
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
        
        source_info["children"].append({
            "type": "source",
            "file": filename,
            "children": []
        })
    
    nav = soup.new_tag("div")
    nav["class"] = "pagelist-nav"
    target.append(nav)
    
    for item in tile_data:
        entry = soup.new_tag("div")
        entry["class"] = "pagelist-entry"
        
        # Clickable title
        title = soup.new_tag("div")
        title["class"] = "pagelist-entry-title"
        title_a = soup.new_tag("a", href=item["click"])
        title_a.string = item["title"]
        title.append(title_a)
        entry.append(title)
        
        # Tag and link bubbles
        if "tags" in item:
            tag_container = soup.new_tag("div")
            tag_container["class"] = "pagelist-tag-container"
            
            if "tags" in item:
                for name, text in item["tags"]:
                    tag_el = soup.new_tag("span")
                    tag_el["class"] = "tag"
                    tag_el["data-name"] = name
                    
                    if name in tag_colors:
                        tag_el["style"] = "background-color: " + tag_colors[name][0] + "; color: " + tag_colors[name][1] + ";"
                    
                    tag_el.string = text
                    
                    tag_container.append(tag_el)
                    tag_container.append(bs4.NavigableString(" "))
            
            entry.append(tag_container)
        
        # Body
        if "body" in item:
            body = soup.new_tag("div")
            body["class"] = "pagelist-entry-desc"
            body_content = bs4.BeautifulSoup(item["body"], "lxml")
            body.extend(body_content.body.contents)
            entry.append(body)
        
        target.append(entry)
    
    return source_info
