#!/usr/bin/python3

# Takes a bare HTML document and adds website features like meta tags,
# <link rel="stylesheet">s, headers and footers, etc.
#
# Also processes {{template}}s given in the source file.

import sys, os, argparse, bs4
import template_tiles

include_css = [
    "../styles/main.css",
    "../styles/page.css"
]
main_title = "a blog"
titlebar_buttons = [
    ["showcase", "../pages/", "src/pages/index.html"],
    ["all projects", "../pages/projects.html", "src/pages/projects.html"],
    ["all pages", "../pages/page-list.html", "src/pages/page-list.html"]
]

arg_parser = argparse.ArgumentParser(description="Page builder.")
arg_parser.add_argument("source_file", type=str, nargs=1, help="Bare HTML file to use as source. May include {{templates}}.")
arg_parser.add_argument("-o", metavar="output_file", type=str, nargs=1, required=True, help="Output HTML file.")

args = arg_parser.parse_args()
source_file = args.source_file[0]
output_file = args.o[0]


workdir = os.path.dirname(source_file)

with open(source_file, "r") as f:
    soup = bs4.BeautifulSoup(f.read(), "lxml")


# Append meta tags & CSS tags
soup.head.append(soup.new_tag("meta", charset="utf-8"))
viewport_tag = soup.new_tag("meta", content="width=device-width")
viewport_tag["name"] = "viewport"
soup.head.append(viewport_tag)
for c in include_css:
    soup.head.append(soup.new_tag("link", rel="stylesheet", href=c, type="text/css"))

# Put in the titlebar
titlebar_sub = soup.new_tag("div", id="titlebar_sub")
titlebar_sub["class"] = "titlebar"
for label, link, match in titlebar_buttons:
    button_div = soup.new_tag("div")
    button_div["class"] = "titlebar_button"
    if source_file.endswith(match):
        button_div["class"] += " selected"
    a = soup.new_tag("a", href=link)
    a.string = label
    button_div.append(a)
    titlebar_sub.append(button_div)

soup.body.insert(0, titlebar_sub)
titlebar = soup.new_tag("div", id="titlebar_main")
titlebar["class"] = "titlebar"
titlebar.string = main_title
soup.body.insert(0, titlebar)

# Traverse the tree looking for templates
def template_parse(content, child):
    args = content[2:-2].split("|")
    if args[0] == "tiles":
        template_tiles.parse(args, child, soup, workdir)
    else:
        raise ValueError("'" + args[0] + "' is not a valid template")

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

with open(output_file, "w") as outf:
    outf.write(str(soup))