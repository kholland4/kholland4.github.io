document.addEventListener("DOMContentLoaded", function() {
  function enactFilter(listContainer, catFilterContainer, searchFilter) {
    // show and hide entries based on filters
    
    var tagStatus = {};
    var anyTagsSelected = false;
    for(var c of catFilterContainer.childNodes) {
      if(c.tagName != "LABEL")
        continue;
      var name = c.innerText;
      var check = document.getElementById(c.htmlFor);
      tagStatus[name] = check.checked;
      anyTagsSelected |= check.checked;
    }
    
    var searchText = searchFilter.value.toLowerCase();
    
    
    for(var entry of listContainer.childNodes) {
      if(entry.className != "entry")
        continue;
      
      // find the tag list of the entry (if present)
      var tagContainer = null;
      for(var c of entry.childNodes) {
        if(c.className != "tag_container")
          continue;
        tagContainer = c;
        break;
      }
      
      // match against user-selected tags
      if(!anyTagsSelected) {
        // no need to check tags, none were selected
      } else if(tagContainer == null) {
        // has no tags but some were selected
        entry.style.display = "none";
        continue;
      } else {
        var tagMatch = false;
        for(var tagEl of tagContainer.childNodes) {
          if(tagEl.className != "tag")
            continue;
          if(tagStatus[tagEl.innerText] === true) {
            tagMatch = true;
            break;
          }
        }
        
        if(!tagMatch) {
          entry.style.display = "none";
          continue;
        }
      }
      
      // match against user search
      if(searchText != "") {
        var text = entry.textContent;
        if(!text.toLowerCase().includes(searchText)) {
          // doesn't match search
          entry.style.display = "none";
          continue;
        }
      }
      
      // everything matched
      entry.style.display = "block";
    }
  }
  
  var n = 0;
  var navElementList = document.getElementsByClassName("pagelist_nav");
  for(var navElement of navElementList) {
    var listContainer = navElement.parentElement;
    
    // get all tags that exist
    var haveTags = new Set();
    var entries = listContainer.childNodes;
    for(var entry of entries) {
      // exclude the nav element and anything else
      if(entry.className != "entry")
        continue;
      
      // find the tag list of the entry (if present)
      var tagContainer = null;
      for(var c of entry.childNodes) {
        if(c.className != "tag_container")
          continue;
        tagContainer = c;
        break;
      }
      if(tagContainer == null)
        continue;
      
      // add each tag to haveTags
      for(var tagEl of tagContainer.childNodes) {
        if(tagEl.className != "tag")
          continue;
        haveTags.add(tagEl.innerText);
      }
    }
    
    var tagList = Array.from(haveTags);
    tagList.sort();
    
    
    var searchFilter = document.createElement("input");
    searchFilter.className = "pagelist_nav_search";
    var catFilterContainer = document.createElement("div");
    catFilterContainer.className = "pagelist_nav_category_c";
    
    // make some checkboxes to allow filtering by tags
    if(tagList.length > 0) {
      var header = document.createElement("div");
      header.innerText = "Filter tags:";
      header.className = "pagelist_nav_category";
      // add to main container so that columns of checkboxes look nicer
      navElement.appendChild(header);
    } else {
      catFilterContainer.style.display = "none";
    }
    
    for(var tag of tagList) {
      var check = document.createElement("input");
      check.type = "checkbox";
      check.id = "pagelist_filter" + n + "_" + tag;
      check.className = "pagelist_nav_category";
      check.oninput = function(a, b, c) {
        enactFilter(a, b, c);
      }.bind(null, listContainer, catFilterContainer, searchFilter);
      catFilterContainer.appendChild(check);
      
      var label = document.createElement("label");
      label.htmlFor = check.id;
      label.innerText = tag;
      label.className = "pagelist_nav_category";
      catFilterContainer.appendChild(label);
      
      var br = document.createElement("br");
      catFilterContainer.appendChild(br);
    }
    
    navElement.appendChild(catFilterContainer);
    
    
    // a search box
    var searchBox = document.createElement("div");
    
    searchBox.className = "pagelist_nav_search_c";
    var searchLabel = document.createElement("div");
    searchLabel.innerText = "Search:";
    searchLabel.className = "pagelist_nav_search";
    searchBox.appendChild(searchLabel);
    
    searchFilter.type = "text";
    searchFilter.oninput = function(a, b, c) {
      enactFilter(a, b, c);
    }.bind(null, listContainer, catFilterContainer, searchFilter);
    searchBox.appendChild(searchFilter);
    
    navElement.appendChild(searchBox);
    
    
    // clear filters button
    var clearFilters = document.createElement("button");
    clearFilters.innerText = "Clear all filters";
    clearFilters.className = "pagelist_nav_clear";
    clearFilters.onclick = function(a, b, c) {
      for(var label of b.childNodes) {
        if(label.tagName != "LABEL")
          continue;
        var check = document.getElementById(label.htmlFor);
        check.checked = false;
      }
      
      c.value = "";
      
      enactFilter(a, b, c);
    }.bind(null, listContainer, catFilterContainer, searchFilter);
    navElement.appendChild(clearFilters);
    
    
    // need unique IDs for each nav element
    n++;
  }
});
