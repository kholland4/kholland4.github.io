document.addEventListener("DOMContentLoaded", function() {
  function enactFilter(listContainer, catFilterContainer, searchFilter) {
    // show and hide entries based on filters
    
    var tagStatus = {};
    for(var section of catFilterContainer.childNodes) {
      if(!("name" in section.dataset))
        continue;
      var tagName = section.dataset.name;
      for(var c of section.childNodes) {
        if(c.tagName != "LABEL")
          continue;
        var tagText = c.innerText;
        var check = document.getElementById(c.htmlFor);
        if(check.checked) {
          if(!(tagName in tagStatus))
            tagStatus[tagName] = new Set();
          
          tagStatus[tagName].add(tagText);
        }
      }
    }
    
    var searchText = searchFilter.value.toLowerCase();
    
    
    for(var entry of listContainer.childNodes) {
      if(entry.className != "pagelist-entry")
        continue;
      
      // find the tag list of the entry (if present)
      var tagContainer = null;
      for(var c of entry.childNodes) {
        if(c.className != "pagelist-tag-container")
          continue;
        tagContainer = c;
        break;
      }
      
      var allTagMatch = true;
      for(var tagName in tagStatus) {
        var tagMatch = false;
        
        for(var tagEl of tagContainer.childNodes) {
          if(tagEl.className != "tag")
            continue;
          if(tagEl.dataset.name != tagName)
            continue;
          if(tagStatus[tagName].has(tagEl.innerText)) {
            tagMatch = true;
            break;
          }
        }
        
        if(!tagMatch) {
          allTagMatch = false;
          break;
        }
      }
      
      if(!allTagMatch) {
        entry.style.display = "none";
        continue;
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
  var navElementList = document.getElementsByClassName("pagelist-nav");
  for(var navElement of navElementList) {
    var listContainer = navElement.parentElement;
    
    // get all tags that exist
    var haveTags = {};
    var entries = listContainer.childNodes;
    for(var entry of entries) {
      // exclude the nav element and anything else
      if(entry.className != "pagelist-entry")
        continue;
      
      // find the tag list of the entry (if present)
      var tagContainer = null;
      for(var c of entry.childNodes) {
        if(c.className != "pagelist-tag-container")
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
        var tagName = tagEl.dataset.name;
        var tagText = tagEl.innerText;
        if(!(tagName in haveTags))
          haveTags[tagName] = new Set();
        haveTags[tagName].add(tagText);
      }
    }
    
    var tagList = [];
    for(var key in haveTags)
      tagList.push({
        name: key,
        values: Array.from(haveTags[key]).sort()
      });
    tagList.sort();
    
    
    var searchFilter = document.createElement("input");
    searchFilter.className = "pagelist-nav-search";
    searchFilter.id = "pagelist-nav-searchfilter";
    var catFilterContainer = document.createElement("div");
    catFilterContainer.className = "pagelist-nav-category-c";
    
    // make some checkboxes to allow filtering by tags
    if(tagList.length == 0)
      catFilterContainer.style.display = "none";
    
    for(var tagType of tagList) {
      var tagName = tagType.name;
      var tagValues = tagType.values;
      
      if(tagValues.length == 0)
        continue;
      
      var container = document.createElement("div");
      container.className = "pagelist-nav-category-inner";
      container.dataset.name = tagName;
      
      var header = document.createElement("div");
      header.innerText = tagName + ":";
      header.className = "pagelist-nav-category";
      container.appendChild(header);
      
      for(var tag of tagValues) {
        var outer = document.createElement("div");
        outer.className = "pagelist-nav-category-item";
        
        var check = document.createElement("input");
        check.type = "checkbox";
        check.id = "pagelist-filter" + n + "-" + tag;
        check.className = "pagelist-nav-category-item";
        check.oninput = function(a, b, c) {
          enactFilter(a, b, c);
        }.bind(null, listContainer, catFilterContainer, searchFilter);
        outer.appendChild(check);
        
        var label = document.createElement("label");
        label.htmlFor = check.id;
        label.className = "pagelist-nav-category-item";
        var labelContent = document.createTextNode(tag);
        label.appendChild(labelContent);
        outer.appendChild(label);
        
        container.appendChild(outer);
      }
      
      catFilterContainer.appendChild(container);
    }
    
    navElement.appendChild(catFilterContainer);
    
    
    // a search box
    var searchBox = document.createElement("div");
    
    searchBox.className = "pagelist-nav-search-c";
    var searchLabel = document.createElement("label");
    searchLabel.htmlFor = "pagelist-nav-searchfilter";
    searchLabel.innerText = "Search: ";
    searchLabel.className = "pagelist-nav-search";
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
    clearFilters.className = "pagelist-nav-clear";
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
