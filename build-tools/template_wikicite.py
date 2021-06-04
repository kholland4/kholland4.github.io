#!/usr/bin/python3

import bs4

def parse(args, target, soup, workdir, out_dir):
    i = soup.new_tag("i")
    
    i.append("This page uses material from the Wikipedia article \"")
    
    article_title = args[1]
    
    if len(args) >= 3:
        article_link = args[2]
    else:
        article_link = "https://en.wikipedia.org/wiki/" + article_title.replace(" ", "_")
    
    article = soup.new_tag("a", href=article_link)
    article.string = article_title
    i.append(article)
    
    i.append("\", which is released under the ")
    
    license = soup.new_tag("a", href="https://creativecommons.org/licenses/by-sa/3.0/")
    license.string = "Creative Commons Attribution-Share-Alike License 3.0"
    i.append(license)
    
    i.append(".")
    
    target.append(i)
