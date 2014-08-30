pronyan = (function() {

	var categories = ["they", "them", "their", "theirs", "themselves"];

	var genders = [];

	genders.push({
		they: "they",
	  them: "them",
	  their: "their",
	  theirs: "theirs",
	  themselves: "themselves"
	});

	genders.push({
	  they: "he",
	  them: "him",
	  their: "his",
	  theirs: "his",
	  themselves: "himself"
	});

	genders.push({
	  they: "she",
	  them: "her",
	  their: "her",
	  theirs: "hers",
	  themselves: "herself"
	});

	var triggers = [];

	genders.forEach(function(gender) {
	  categories.forEach(function(category) {
	    var pronoun = gender[category];
	    if(triggers.indexOf(pronoun) == -1) {
	      triggers.push(pronoun);
	    }
	  });
	});

	var old = window.onload;
	window.onload = function() {
		if (document.body.addEventListener) {
		  document.body.addEventListener("keyup", handleKeyUp, false);
			document.body.addEventListener("click", handleKeyUp, false);
		} else {
		  document.body.attachEvent("onkeyup", handleKeyUp);
			document.body.attachEvent("onclick", handleKeyUp);
		}
		if(old) {old();}
	}

	var buffer = "";
	var atTrigger = false;
	var users = [];
	var usersPronouns = [];

	var timeout = -1;

	function insertTextAtCaret(match, text) {
    var sel, range, html;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
						var startOffset = match.indexOf("|");
						range.setStart(range.startContainer, range.startOffset - startOffset);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
	}

	function handleKeyUp(event) {
		if(!event) {
			event = window.event;
		}
		if(!event.target) {
			return;
		}
		if(event.target.className.indexOf("pronoun") == -1) {
			return;
		}
		var content = String(event.target.value || event.target.innerText);
		if(content) {
			var selectionEnd = event.target.selectionEnd || content.length;
			var wordEx = /[\w@]*\|\w*/gmi;
			var model = content.slice(0, selectionEnd) + "|" + content.slice(selectionEnd);
			var match = wordEx.exec(model);
			if(match) {
				var word = match.toString().split("|").join("").toLowerCase();

				content.split(" ").forEach(function(tag) {
					if(tag == word) {return false;}
					if(tag.slice(0,1) != "@") {return false;}
					tag = tag.trim().toLowerCase();

					if(users.indexOf(tag) == -1) {
						// Ask server for user:
						users.push(tag);
						var position = usersPronouns.push({user: tag, pronouns: {}}) - 1;
						getPronouns(tag, function resolver(pronouns) {
							usersPronouns[position].pronouns = pronouns;
							setTimeout(function() {
								getPronouns(tag, resolver);
							}, 5000);
							genders.push(pronouns);
						});
					}
				});

				var target = event.target;

				function replace(replacement, event) {
					hidePronouns();
					if(target.value) {
						target.value = target.value.slice(0,match.index) + replacement + target.value.slice(match.index + word.length);
						target.selectionStart = target.selectionEnd = match.index + replacement.length;
					} else {
						insertTextAtCaret(match.toString(), replacement);
					}
					target.focus();
					event.preventDefault();
				}

				if(word) {
					if(triggers.indexOf(word) != -1) {
						timeout = setTimeout(showPronouns.bind(undefined, word, event.target, replace), 200);
					} else {
						clearTimeout(timeout);
						hidePronouns();
					}
				}
			}
		}
	}

	var suggest = undefined;

	function showPronouns(word, target, replace) {
		if(suggest) {
			document.body.removeChild(suggest);
			suggest = undefined;
		}
		var offsets = offset(target);
		suggest = document.createElement("div");
		var suggestions = getSuggestions(word);
		if(!suggestions.length) {suggest = undefined; return;}
		formatSuggestions(suggest, suggestions, replace);
		suggest.style.background = "white";
		suggest.style.position = "absolute";
		suggest.style.left = offsets.left + "px";
		suggest.style.top = offsets.top + offsets.height + "px";
		suggest.style.minWidth = offsets.width + "px";
		suggest.style.opacity = "0";
		suggest.style.transition = "0.1s opacity ease-in-out";
		suggest.style.WebkitTransition = "0.1s opacity ease-in-out";
		suggest.style.MozTransition = "0.1s opacity ease-in-out";
		suggest.style.fontFamily = "sans-serif";
		suggest.style.fontSize = target.style.fontSize;
		suggest.style.padding = "5px";
		suggest.style.borderBottom = "5px solid #efefef";
		suggest.style.borderBottomLeftRadius = "5px";
		suggest.style.borderBottomRightRadius = "5px";
		suggest.style.background = "#f8f8f8";
		document.body.appendChild(suggest);
		setTimeout(function() {
			if(suggest) {
				suggest.style.opacity = "1";
			}
		}, 1);
	}

	function getSuggestions(word) {
		var types = [];
		genders.forEach(function(gender) {
			categories.forEach(function(category) {
				var pronoun = gender[category];
				if(word == pronoun) {
					types.push(category);
				}
			});
		});
		var people = usersPronouns.map(function(pronouns) {
			return {
				name: pronouns.user,
				pronouns: types.map(function(type) {
					return (pronouns.pronouns[type] || "").toLowerCase();
				}).filter(function(pronoun) {
					return pronoun.length && pronoun != word;
				})
			};
		}).filter(function(pronouns) {
			return pronouns.pronouns.length;
		});
		return people;
	}

	function formatSuggestions(container, suggestions, replace) {
		while (container.hasChildNodes()) {
        container.removeChild(content.lastChild);
    }

		suggestions.forEach(function(suggest) {
			var suggestion = document.createElement("div");
			var content = document.createTextNode(suggest.name + " uses ");
			suggestion.appendChild(content);
			suggest.pronouns.forEach(function(pronoun, i) {
				if(i!=0) {
					suggestion.appendChild(document.createTextNode(", "));
				}
				var clickable = document.createElement("a");
				clickable.appendChild(document.createTextNode(pronoun));
				clickable.href = "#";
				clickable.style.color = "#000";
				if (clickable.addEventListener) {
					clickable.addEventListener("click", replace.bind(undefined, pronoun), false);
				} else {
					clickable.attachEvent("onclick", replace.bind(undefined, pronoun));
				}
				suggestion.appendChild(clickable);
			});
			suggestion.style.margin = "2px";
			suggestion.style.padding = "2px";
			suggestion.style.cursor = "default";
			container.appendChild(suggestion);
		});
	}

	function hidePronouns() {
		if(suggest) {
			setTimeout(function() {
				if(suggest) {
					document.body.removeChild(suggest);
					suggest = undefined;
				}
			}, 100);
			suggest.style.opacity = "0";
		}
	}

	function offset(element) {
	  var body = document.body;
	  var win = document.defaultView;
	  var docElem = document.documentElement;
		var box = document.createElement('div');
		box.style.paddingLeft = box.style.width = "1px";
		body.appendChild(box);
		var isBoxModel = box.offsetWidth == 2;
		body.removeChild(box);
	  box = element.getBoundingClientRect();
	  var clientTop  = docElem.clientTop  || body.clientTop  || 0;
	  var clientLeft = docElem.clientLeft || body.clientLeft || 0;
	  var scrollTop  = win.pageYOffset || isBoxModel && docElem.scrollTop  || body.scrollTop;
	  var scrollLeft = win.pageXOffset || isBoxModel && docElem.scrollLeft || body.scrollLeft;
	  return {
	    top : box.top  + scrollTop  - clientTop,
	    left: box.left + scrollLeft - clientLeft,
			width: box.width,
			height: box.height
		};
	}

	var getPronouns = function(tag, resolve) {
		tag = tag.slice(1);	// Remove @ symbol;
		var xmlhttp;
		if (window.XMLHttpRequest) {
			xmlhttp=new XMLHttpRequest();
		} else {
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState==4 && xmlhttp.status==200) {
				if(xmlhttp.responseText.length) {
					var pronouns = eval("("+xmlhttp.responseText+")");
					resolve(pronouns.pronouns);
				}
			}
		}
		xmlhttp.open("GET","http://172.22.87.17:8080/getUserPreferences?userId=" + tag.toLowerCase(),true);
		xmlhttp.send();
	};

	return {
		setGetPronounsMethod: function(callback) {getPronouns = callback;}
	};

})();

//
