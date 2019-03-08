var tagColors = {"lang": ["#6b6", "#fff"], "status": ["#c55", "#fff"]};

function init() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onload = function() {
    showBlog(JSON.parse(this.responseText));
  };
  xmlhttp.open("GET", "blog.json?r=" + Math.random());
  xmlhttp.send();
}

document.addEventListener("DOMContentLoaded", init);

function genBlogEntry(data) {
  var entry = document.createElement("div");
  entry.className = "blogEntry";
  
  var a = document.createElement("a");
  a.id = "post." + data.id;
  entry.appendChild(a);
  
  var image = document.createElement("img");
  image.className = "blogEntryImage";
  if("image" in data) {
    image.src = data.image;
  } else {
    image.src = "images/placeholder.png";
  }
  
  
  if("click" in data) {
    var link = document.createElement("a");
    link.href = data.click;
    link.appendChild(image);
    entry.appendChild(link);
  } else {
    entry.appendChild(image);
  }
  
  //date/time
  var date = new Date(data.time * 1000); //pass unix timestamp in milliseconds
  var dateText = document.createElement("div");
  dateText.className = "blogEntryDate";
  dateText.innerText = date.toLocaleString("en-US", {weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit"});
  entry.appendChild(dateText);
  
  var title = document.createElement("div");
  title.className = "blogEntryTitle";
  title.innerText = data.title;
  entry.appendChild(title);
  
  if(("links" in data) || ("tags" in data)) {
    var linkContainer = document.createElement("div");
    linkContainer.className = "linkContainer";
    
    if("tags" in data) {
      for(var i = 0; i < data.tags.length; i++) {
        var tagName = data.tags[i][0];
        var tagText = data.tags[i][1];
        
        var tag = document.createElement("span");
        tag.className = "tag";
        if(tagName in tagColors) {
          tag.style.backgroundColor = tagColors[tagName][0];
          tag.style.color = tagColors[tagName][1];
        }
        
        var text = document.createElement("span");
        text.innerText = tagText;
        tag.appendChild(text);
        
        linkContainer.appendChild(tag);
      }
    }
    
    if("links" in data) {
      for(var i = 0; i < data.links.length; i++) {
        var link = document.createElement("a");
        link.className = "tag";
        link.href = data.links[i].dest;
        
        var icon = document.createElement("img");
        icon.src = "icons/link.png"; //material icon (https://material.io/tools/icons/) (under https://www.apache.org/licenses/LICENSE-2.0.html)
        icon.style.height = "8px";
        icon.style.verticalAlign = "middle";
        icon.style.marginRight = "4px";
        link.appendChild(icon);
        
        var text = document.createElement("span");
        text.innerText = data.links[i].text;
        link.appendChild(text);
        
        linkContainer.appendChild(link);
      }
    }
    
    entry.appendChild(linkContainer);
  }
  
  var body = document.createElement("div");
  body.className = "blogEntryBody";
  body.innerHTML = data.body;
  entry.appendChild(body);
  
  return entry;
}

function showBlog(data) {
  //TODO: lazy loading?
  data.sort(function(a, b) {
    if(a.time > b.time) {
      return -1;
    }
    if(a.time < b.time) {
      return 1;
    }
    return 0;
  });
  
  var container = document.getElementById("blog");
  
  for(var i = 0; i < data.length; i++) {
    var entry = genBlogEntry(data[i]);
    container.appendChild(entry);
  }
  
  for(var i = 0; i < 10; i++) {
    var el = document.createElement("div");
    el.className = "blogEntrySpacer";
    container.appendChild(el);
  }
}
