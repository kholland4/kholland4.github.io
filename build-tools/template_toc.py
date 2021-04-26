#!/usr/bin/python3

import bs4

def parse(args, target, soup, workdir):
    heading_list = []
    
    for child in soup.body.descendants:
        if isinstance(child, bs4.NavigableString):
            continue
        # Ignore h1 -- it's for the page title
        if child.name.lower() not in ["h2", "h3", "h4", "h5", "h6"]:
            continue
        if not child.has_attr("id"):
            raise ValueError("template_toc: no id value for %s" % child)
        
        fragment = child["id"]
        if child.string is not None:
            content = child.string.strip()
        else:
            content = child.text.strip()
        
        if len(content) == 0:
            raise ValueError("template_toc: empty content for %s" % child)
        
        heading_level = int(child.name[1])
        heading_list.append((heading_level, content, fragment))
    
    def generate_toc_level(cursor, start_level):
        current = heading_list[cursor]
        
        ul = soup.new_tag("ul")
        ul["class"] = "toc"
        while current[0] >= start_level:
            li = soup.new_tag("li")
            li["class"] = "toc toc%d" % current[0]
            ul.append(li)
            
            if current[0] == start_level:
                entry = soup.new_tag("a")
                entry.string = current[1]
                entry["href"] = "#" + current[2]
                li.append(entry)
                
                cursor += 1
                if cursor == len(heading_list):
                    break
                current = heading_list[cursor]
            
            if current[0] > start_level:
                cursor, sub_ul = generate_toc_level(cursor, current[0])
                li.append(sub_ul)
                
                if cursor == len(heading_list):
                    break
                current = heading_list[cursor]
        
        return (cursor, ul)
    
    box = soup.new_tag("div")
    box["class"] = "tocBox"
    
    s = soup.new_tag("span")
    s["class"] = "tocHeader"
    s.string = "Contents"
    box.append(s)
    
    toc = generate_toc_level(0, 2)[1]
    toc["class"] += " tocRoot"
    box.append(toc)
    
    target.append(box)
