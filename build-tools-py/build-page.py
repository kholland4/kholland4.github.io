#!/usr/bin/python3

# Takes a bare HTML document and adds website features like meta tags,
# <link rel="stylesheet">s, headers and footers, etc.
#
# Also processes {{template}}s given in the source file.

import sys, os, argparse, bs4
import template_tiles, template_pagelist, template_wikicite, template_toc

include_css = [
    "styles/page.css"
]
main_title = "a blog"
titlebar_buttons = [
    ["showcase", "pages/", "src/pages/index.html"],
    ["all projects", "pages/projects.html", "src/pages/projects.html"],
    ["pages", "pages/page-list.html", "src/pages/page-list.html"],
    ["ctf tools", "pages/ctf.html", "src/pages/ctf.html"],
    ["ctf challenges", "pages/flags.html", "src/pages/flags.html"]
]

arg_parser = argparse.ArgumentParser(description="Page builder.")
arg_parser.add_argument("source_file", type=str, nargs=1, help="Bare HTML file to use as source. May include {{templates}}.")
arg_parser.add_argument("-o", metavar="output_file", type=str, nargs=1, required=True, help="Output HTML file.")
arg_parser.add_argument("--baseurl", metavar="base_url", type=str, nargs=1, required=False, help="Base URL of site, i. e. https://example.com/")

args = arg_parser.parse_args()
source_file = args.source_file[0]
output_file = args.o[0]
base_url = args.baseurl
if base_url is not None:
    base_url = base_url[0]
else:
    base_url = ""


workdir = os.path.dirname(source_file)
out_dir = os.path.dirname(output_file)

# type is "script" or "source"
source_file_info = {
    "type": "script",
    "file": __file__,
    "children": [
        {
            "type": "source",
            "file": source_file,
            "children": []
        }
    ]
}

with open(source_file, "r") as f:
    soup = bs4.BeautifulSoup(f.read(), "lxml")

# Wrap source body content in <main id="content">
main = soup.new_tag("main", id="content")
body_children = list(soup.body.contents)
soup.body.clear()
soup.body.append(main)
for child in body_children:
    main.append(child)

# Append meta tags & CSS tags
soup.html["lang"] = "en"
soup.head.append(soup.new_tag("meta", charset="utf-8"))
viewport_tag = soup.new_tag("meta", content="width=device-width")
viewport_tag["name"] = "viewport"
soup.head.append(viewport_tag)
# TODO character encoding
for c in include_css:
    rel = os.path.relpath(c, start=out_dir)
    soup.head.append(soup.new_tag("link", rel="stylesheet", href=rel, type="text/css"))

header = soup.new_tag("header")
# Put in the titlebar and navigation
titlebar = soup.new_tag("div", id="titlebar_main")
titlebar["class"] = "titlebar"
titlebar.string = main_title
header.append(titlebar)

titlebar_sub = soup.new_tag("nav", id="titlebar_sub")
titlebar_sub["class"] = "titlebar"
titlebar_nav = soup.new_tag("ul")
for label, link, match in titlebar_buttons:
    button_div = soup.new_tag("li")
    button_div["class"] = "titlebar_button"
    if source_file.endswith(match):
        button_div["class"] += " selected"
    link_rel = os.path.relpath(link, start=out_dir)
    a = soup.new_tag("a", href=link_rel)
    a.string = label
    button_div.append(a)
    titlebar_nav.append(button_div)
titlebar_sub.append(titlebar_nav)
header.append(titlebar_sub)

soup.body.insert(0, header)

# Skip link
skip_link = soup.new_tag("a", href="#content")
skip_link["class"] = "skipLink"
skip_link.string = "Skip to content"
soup.body.insert(0, skip_link)


# Traverse the tree adding id attributes for headings
for child in soup.body.descendants:
    # Look only for tags containing a single string as a child
    # Exclude the actual string tags themselves
    if isinstance(child, bs4.NavigableString):
        continue
    # Headings only
    if child.name.lower() not in ["h1", "h2", "h3", "h4", "h5", "h6"]:
        continue
    # Don't overwrite existing id attributes
    if child.has_attr("id"):
        continue
    
    if child.string is not None:
        content = child.string.strip()
    else:
        content = child.text.strip()
    fragment = content.replace(" ", "_")
    if len(fragment) == 0:
        raise ValueError("empty tag, can't generate id: %s" % child)
    
    child["id"] = fragment


# Traverse the tree looking for templates
def template_parse(content, child):
    args = content[2:-2].split("|")
    args = [a.strip() for a in args]
    if args[0] == "tiles":
        res = template_tiles.parse(args, child, soup, workdir, out_dir)
    elif args[0] == "pagelist":
        res = template_pagelist.parse(args, child, soup, workdir, out_dir)
    elif args[0] == "wikicite":
        res = template_wikicite.parse(args, child, soup, workdir, out_dir)
    elif args[0] == "toc":
        res = template_toc.parse(args, child, soup, workdir, out_dir)
    else:
        raise ValueError("'" + args[0] + "' is not a valid template")
    
    source_file_info["children"].append(res)

for child in soup.body.descendants:
    # Look only for tags containing a single string as a child
    # Exclude the actual string tags themselves
    if isinstance(child, bs4.NavigableString):
        continue
    if child.string is None:
        continue
    content = child.string.strip()
    
    if content.startswith("{{") and content.endswith("}}"):
        # Found a template!
        child.clear()
        template_parse(content, child)

# Gather list of all source files
def get_source_files(what):
    files = []
    if what["type"] == "source":
        files.append(os.path.relpath(what["file"], start="."))
    for c in what["children"]:
        files.extend(get_source_files(c))
    return files
source_files = get_source_files(source_file_info)

# Show source files and links in footer
source_footer = soup.new_tag("footer")
source_footer["class"] = "source_info_footer"
soup.body.append(source_footer)

sf_details = soup.new_tag("details")
source_footer.append(sf_details)

sf_summary = soup.new_tag("summary")
sf_summary.string = "Page info"
sf_details.append(sf_summary)

sf_text = soup.new_tag("p")
sf_text.string = "Source files:"
sf_details.append(sf_text)

source_list = soup.new_tag("table")
sf_details.append(source_list)
for file in source_files:
    item = soup.new_tag("tr")
    source_list.append(item)
    
    td_link = soup.new_tag("td")
    item.append(td_link)
    source_link = soup.new_tag("a")
    source_link["href"] = base_url + file
    source_link.string = file
    td_link.append(source_link)
    
    td_history = soup.new_tag("td")
    item.append(td_history)
    history_link = soup.new_tag("a")
    history_link["href"] = "https://github.com/kholland4/kholland4.github.io/commits/master/" + file
    history_link.string = "history"
    td_history.append(history_link)

sf_issues = soup.new_tag("p")
sf_issues_link = soup.new_tag("a")
sf_issues_link["href"] = "https://github.com/kholland4/kholland4.github.io/issues"
sf_issues_link.string = "File an issue"
sf_issues.append(sf_issues_link)
sf_details.append(sf_issues)


out_str = str(soup)

# Source file info
def gen_source_info(what, indent=0):
    cur_name = os.path.splitext(os.path.basename(what["file"]))[0]
    cur_file = os.path.relpath(what["file"], start=".")
    
    indent_str = (" " * indent) + " - "
    
    cur_blurb = "%s (%s)" % (cur_file, base_url + cur_file)
    if what["type"] == "script":
        cur_blurb = "%s (%s)" % (cur_name, base_url + cur_file)
    
    if len(what["children"]) == 0:
        return indent_str + cur_blurb + "\n"
    else:
        out = indent_str + cur_blurb + ", using:\n"
        for child in what["children"]:
            out += gen_source_info(child, indent=(indent+2))
        return out

source_info_str = "<!--\n"
source_info_str += os.path.relpath(output_file, start=".")
source_info_str += " (" + base_url + os.path.relpath(output_file, start=".") + ")\n"
source_info_str += "Built with:\n" + gen_source_info(source_file_info) + "-->\n"
out_str = source_info_str + out_str

os.makedirs(out_dir, exist_ok=True)
with open(output_file, "w") as outf:
    outf.write(out_str)
