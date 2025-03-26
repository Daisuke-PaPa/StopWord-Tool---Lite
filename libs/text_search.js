let current_search_index = -1;
let currentMatchOrder = 1;         // 1-indexed order of the current wrapped match.
let cachedValidMatches = [];         // Cached array of wrapped matches.
let previousSearchText = "";         // Store previous search text

let past_search = "";
let past_text = "";
let past_hidegroup = "";
let past_filter = false;

function toggleReplaceAllMenu() {
    document.getElementById("replace-all-menu").classList.toggle("tn_hidden");
}

document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("text_search");
    const searchDirection = 'right';  // Default direction
    let debounceTimer;

    // Define non-character keys to ignore.
    const ignoreKeys = new Set([
        "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Enter"
    ]);

    // Define a function that performs the search logic.
    async function triggerSearch(advance) {
        const currentSearchText = searchBox.value;
        if (!currentSearchText) return; // Do nothing if empty

        document.getElementById('searchtext').value = currentSearchText;
        document.getElementById('search-info').innerHTML = "Searching...";

        // If the search text has changed, reset the search state
        let advanceFlag;
        if (previousSearchText !== currentSearchText) {
            current_search_index = -1;
            currentMatchOrder = 1;
            previousSearchText = currentSearchText;
            advanceFlag = true; // New search: allow advancing
        } else {
            // Same search text; respect the advance flag passed in.
            advanceFlag = advance;
        }


        await fetchGroupData('hide_list').then(globalhideGroup => {hide_json = JSON.stringify(globalhideGroup);console.log("HideJSON"+hide_json)});
        console.log(past_hidegroup);
        if(past_search !== searchBox.value || past_text !== document.getElementById("main-text").value || hide_json !== past_hidegroup || past_filter !== document.getElementById('filtered_search').checked)
        {
            await unwrapMatches();
            document.getElementById('main-text').value = await wrapEligibleMatches();
            console.log("showing new search");

            past_search = searchBox.value;
            past_text = document.getElementById("main-text").value;
            past_hidegroup = hide_json;
            past_filter = document.getElementById('filtered_search').checked;
        }
        else
        {
            console.log("showing old search");
        }
        // Now perform the search (which works on the wrapped text).
        // Pass the advance flag so that if the search text is unchanged,
        // the current_search_index is maintained.
        searchAndSelectText(searchDirection, advanceFlag);
    }

    // Listen for key events in the search box.
    searchBox.addEventListener("keydown", async function (event) {
        // If Enter is pressed, trigger immediately if there is some search text.
        if (event.key === "Enter" && searchBox.value) {
            clearTimeout(debounceTimer);
            await triggerSearch(false);
            event.preventDefault(); // Prevent form submission if applicable
            return;
        }

        // Only trigger debounce for keys that may change the text.
        if (!ignoreKeys.has(event.key)) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                // Only trigger if the search text has actually changed.
                if (searchBox.value && searchBox.value !== previousSearchText) {
                    await triggerSearch(false);
                }
            }, 2000);
        }
    });
});



/**
 * Checks if the match at matchIndex (with given length)
 * overlaps any hidden interval from globalHiddenIndexes.
 */
function isInHiddenRanges(matchIndex, matchLength) {
    if (!globalHiddenIndexes || globalHiddenIndexes.length === 0) return false;
    const matchEnd = matchIndex + matchLength;
    for (let interval of globalHiddenIndexes) {
        if (matchIndex < interval.end && matchEnd > interval.start) {
            return true;
        }
    }
    return false;
}


/**
 * Remove any previous wrapping by replacing every occurrence of
 * "(" + searchText + ")" with searchText.
 */ 
async function unwrapMatches() {
    const searchText = document.getElementById("text_search").value;
    //if (!searchText) return;
    const textBox = document.getElementById("main-text");
    let textContent = textBox.value;
    textContent = textContent.replace(/[()]/g, '');
    textBox.value = textContent;
    await hideWords();
}

/**
 * Pre-process the text by scanning for occurrences of searchText.
 * For each eligible occurrence (not hidden and not having a csw suffix),
 * wrap it with "(" and ")".
 */
async function wrapEligibleMatches() {
    const searchText = document.getElementById("text_search").value;
    if (!searchText) return;
    
    let textBox = document.getElementById("main-text");
    let textContent = textBox.value.replace(/[()]/g, '');
    let updatedText = "";
    let lastIndex = 0;
    const regex = new RegExp(searchText, "g");
    let match;
    while ((match = regex.exec(textContent)) !== null) {
        let matchIndex = match.index;
        updatedText += textContent.substring(lastIndex, matchIndex);
        
        // only check if checkbox checked
        const filtered_check = document.getElementById("filtered_search");
        if (filtered_check.checked){
            if (!isInHiddenRanges(matchIndex, searchText.length) &&
                !hasCswSuffix(textContent, searchText, matchIndex)) {
                // Wrap eligible match.
                updatedText += "(" + searchText + ")";
            } else {
                // Leave ineligible match unchanged.
                updatedText += textContent.substr(matchIndex, searchText.length);
            }
        }
        else{
            updatedText += "(" + searchText + ")";
        }
        lastIndex = matchIndex + searchText.length;
    }
    updatedText += textContent.substring(lastIndex);
    //manualValueChange(updatedText);
    return updatedText;
    //hideWords();
}

/**
 * Searches for wrapped occurrences (i.e. "(" + searchText + ")") in the text.
 * Uses the global currentMatchOrder (if already set) or defaults to 1.
 * Navigation in a given direction updates the currentMatchOrder.
 */
function searchAndSelectText(searchDirection, advance = true) {
    const searchText = document.getElementById("text_search").value;
    const textBox = document.getElementById("main-text");
    const textContent = textBox.value;
    if (!searchText) return;
    
    // Build regex to find wrapped occurrences.
    const wrappedRegex = new RegExp('\\(' + escapeRegExp(searchText) + '\\)', "g");
    let matches = [...textContent.matchAll(wrappedRegex)];
    
    if (matches.length === 0) {
        console.log("No match found.");
        document.getElementById('search-navigation').classList.add('tn_hidden');
        document.getElementById('search-info').innerHTML = "No match found :(";
        return;
    }
    
    // Update the global cached matches.
    cachedValidMatches = matches.map(m => ({
        matchText: m[0],
        matchIndex: m.index,
        contextText: textContent.substring(
            Math.max(0, m.index - 50),
            Math.min(textContent.length, m.index + m[0].length + 50)
        )
    }));
    
    let newIndex;
    // Find the current match in the updated list.
    let foundOrder = cachedValidMatches.findIndex(match => match.matchIndex === current_search_index);
    
    if (foundOrder === -1) {
        // Current match was removed.
        if (searchDirection === 'right') {
            // Look for the first match with an index greater than current_search_index.
            let candidateIndex = cachedValidMatches.findIndex(match => match.matchIndex > current_search_index);
            newIndex = candidateIndex === -1 ? 0 : candidateIndex;
        } else if (searchDirection === 'left') {
            // Look for the last match with an index less than current_search_index.
            let candidateIndex = -1;
            for (let i = cachedValidMatches.length - 1; i >= 0; i--) {
                if (cachedValidMatches[i].matchIndex < current_search_index) {
                    candidateIndex = i;
                    break;
                }
            }
            newIndex = candidateIndex === -1 ? cachedValidMatches.length - 1 : candidateIndex;
        }
        // In deletion scenario, do not apply an extra advance.
    } else {
        // If current match still exists, start from its index.
        newIndex = foundOrder;
        if (advance) {
            if (searchDirection === 'right') {
                newIndex = (newIndex + 1) % cachedValidMatches.length;
            } else if (searchDirection === 'left') {
                newIndex = (newIndex - 1 + cachedValidMatches.length) % cachedValidMatches.length;
            }
        }
    }
    
    // Update global values and jump to the new match.
    currentMatchOrder = newIndex + 1;
    current_search_index = cachedValidMatches[newIndex].matchIndex;
    jumptomatch(current_search_index);
    
    document.getElementById('search-navigation').classList.remove('tn_hidden');
    document.getElementById('search-info').innerHTML = "";
    countAndDisplayMatches();
}


/**
 * Recalculates the wrapped matches and updates the navigation display.
 * Also, if the previously selected match is no longer present
 * (e.g. after deletion), selects the next available match.
 */
async function countAndDisplayMatches() {
    const searchBox = document.getElementById("text_search");
    const textBox = document.getElementById("main-text");
    const matchListDiv = document.getElementById("match_list_div");
    const searchText = searchBox.value;
    const textContent = textBox.value;
    if (!searchText) return;
    
    const wrappedRegex = new RegExp('\\(' + escapeRegExp(searchText) + '\\)', "g");
    let match;
    let validMatches = [];
    while ((match = wrappedRegex.exec(textContent)) !== null) {
         let matchIndex = match.index;
         const contextSize = 50;
         const start = Math.max(0, matchIndex - contextSize);
         const end = Math.min(textContent.length, matchIndex + match[0].length + contextSize);
         const contextText = textContent.substring(start, end);
         validMatches.push({ matchText: match[0], matchIndex, contextText });
    }
    
    // Update cached matches.
    cachedValidMatches = validMatches;
    const searchCountDiv = document.getElementById("search_count");
    if (validMatches.length > 0) {
         // If the currently selected wrapped match is no longer found,
         // move forward (i.e. keep the order increasing).
         let foundOrder = validMatches.findIndex(match => match.matchIndex === current_search_index);
         if (foundOrder === -1) {
             // If not found, try to select the next available match.
             let candidate = validMatches.find(match => match.matchIndex > current_search_index);
             if (candidate) {
                 currentMatchOrder = validMatches.indexOf(candidate) + 1;
             } else {
                 currentMatchOrder = 1;
             }
             current_search_index = validMatches[currentMatchOrder - 1].matchIndex;
         } else {
             currentMatchOrder = foundOrder + 1;
         }
         searchCountDiv.textContent = `Found: ${currentMatchOrder}/${validMatches.length}`;
    } else {
         searchCountDiv.textContent = `Found: 0/0`;
    }
    
    // Render the match list.
    matchListDiv.innerHTML = "";
    validMatches.forEach((match, i) => {
         const rowDiv = document.createElement("div");
         rowDiv.className = "row";
         rowDiv.id = `sw_match_${i}`;
         rowDiv.setAttribute("onclick", `jumptomatch(${match.matchIndex})`);
         rowDiv.style.cursor = 'pointer';
    
         const contextSize = 50;
         const start = Math.max(0, match.matchIndex - contextSize);
         const localIndex = match.matchIndex - start;
         const originalContext = match.contextText;
    
         const before = originalContext.substring(0, localIndex);
         const toHighlight = originalContext.substring(localIndex, localIndex + match.matchText.length);
         const after = originalContext.substring(localIndex + match.matchText.length);
         const highlightedText = before + `<mark>${toHighlight}</mark>` + after;
    
         const cellDiv = document.createElement("div");
         cellDiv.className = "cell";
         cellDiv.innerHTML = highlightedText;
    
         rowDiv.appendChild(cellDiv);
         matchListDiv.appendChild(rowDiv);
    });
    
    // Highlight and scroll to the active match.
    const currentMatchIndex = currentMatchOrder - 1;
    if (currentMatchIndex >= 0) {
         const currentMatchDiv = document.getElementById(`sw_match_${currentMatchIndex}`);
         if (currentMatchDiv) {
              currentMatchDiv.classList.add("sw_tb_active");
              matchListDiv.scrollTo({ 
                 top: currentMatchDiv.offsetTop - matchListDiv.offsetTop, 
                 behavior: "smooth" 
              });
         }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("text_search");
    document.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && event.code === "KeyF") {
            event.preventDefault(); // Prevent default browser find dialog.
            searchBox.focus();      // Focus our search box.
            searchBox.value = previousSearchText;
            searchBox.select();
        }
    });
});

// Hide search navigation if the search box is empty.
document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("text_search");
    const searchNavigation = document.getElementById('search-navigation');
    searchBox.addEventListener("input", function () {
        // Remove all occurrences of ( and )
        searchBox.value = searchBox.value.replace(/[()]/g, "");
        if (searchBox.value === "") {
            searchNavigation.classList.add('tn_hidden');
            let textContent = document.getElementById('main-text').value;
            textContent = textContent.replace(/[()]/g, '');
            document.getElementById('main-text').value = textContent;
            document.getElementById('search-info').innerHTML = "";
        } 
    });
});

async function replaceAllText() {
    const searchValue = document.getElementById("searchtext").value;
    if (!searchValue) return;
    
    const textSearchValue = document.getElementById("text_search").value;
    const textBox = document.getElementById("main-text");
    const textContent = textBox.value;
    const replaceValue = document.getElementById("replacetext").value;
    
    if (textSearchValue === searchValue) {
        // Brute force method:
        // 1. Create the target string by wrapping searchValue with parentheses.
        // 2. Use the replacement value (if provided) or delete (if empty).
        const target = `(${searchValue})`;
        const regex = new RegExp(escapeRegExp(target), "g");
        const updatedText = textContent.replace(regex, replaceValue);
        
        await manualValueChange(updatedText);
        
        if (replaceValue !== '') {
            showStatusNotification("Replaced '" + target + "' with '" + replaceValue + "'");
        } else {
            showStatusNotification("Deleted '" + target + "'");
        }
    } else {
        // Old method:
        await unwrapMatches();
        // Re-read the textContent after unwrapping:
        const textBox = document.getElementById("main-text");
        const textContent = textBox.value;
    
        const safeSearchValue = escapeRegExp(searchValue);
        const regex = new RegExp(safeSearchValue, "g");
        let updatedText = "";
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(textContent)) !== null) {
            const matchIndex = match.index;
            updatedText += textContent.substring(lastIndex, matchIndex);
            if (!isInHiddenRanges(matchIndex, searchValue.length) &&
                !hasCswSuffix(textContent, searchValue, matchIndex)) {
                updatedText += replaceValue;
            } else {
                updatedText += textContent.substr(matchIndex, searchValue.length);
            }
            lastIndex = matchIndex + searchValue.length;
        }
        updatedText += textContent.substring(lastIndex);
    
        // Preserve the old behavior: if text_search matches searchValue, remove parentheses.
        if (textSearchValue == searchValue) {
            updatedText = updatedText.replace(/[()]/g, '');
            await manualValueChange(updatedText);
        } else {
            document.getElementById('main-text').value = updatedText;
            await hideWords();
            updatedText = await wrapEligibleMatches();
            await manualValueChange(updatedText);
            searchAndSelectText("right", false);
        }
    }    
}


function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Jump to the wrapped match at the given index.
 * Now, if a wrapped match is found, the entire thing (parentheses and inner text)
 * is selected.
 */
async function jumptomatch(index) {
    const textBox = document.getElementById("main-text");
    const searchText = document.getElementById("text_search").value;
    const textContent = textBox.value;
    if (textContent.charAt(index) === "(" &&
        textContent.substr(index + 1, searchText.length) === searchText &&
        textContent.charAt(index + searchText.length + 1) === ")") {
        // Select the entire wrapped match.
        const selectStart = index;
        const selectEnd = index + searchText.length + 2;
        textBox.selectionEnd = textBox.selectionStart = selectStart;
        textBox.blur();
        textBox.focus();
        textBox.setSelectionRange(selectStart, selectEnd);
    
        current_search_index = index;
        document.getElementById('search-navigation').classList.remove('tn_hidden');
        countAndDisplayMatches();        
    } else {   
        if (current_search_index > index) {
            current_search_index = index;
            searchAndSelectText('left');
        } else if (current_search_index < index) {
            current_search_index = index;
            searchAndSelectText('right');
        }
    }
}

/**
 * Checks if the match contains a csw suffix or mismatched text.
 */
function hasCswSuffix(textContent, searchText, matchIndex) {
    const textBox = document.getElementById('main-text');
    const originalStart = textBox.selectionStart;
    const originalEnd = textBox.selectionEnd;
    try {
        textBox.focus();
        textBox.setSelectionRange(matchIndex, matchIndex + searchText.length);
        const selectedText = window.getSelection().toString();
        console.log(`Selected match: "${selectedText}"`);
        window.getSelection().removeAllRanges();
        if (selectedText !== searchText) {
            console.log("Text mismatch. Rejecting match.");
            return true;
        }
        const suffixStart = matchIndex + searchText.length;
        return cswSuffixList.some(suffix =>
            textContent.substr(suffixStart, suffix.length) === suffix
        );
    } finally {
        textBox.setSelectionRange(originalStart, originalEnd);
    }
}

document.addEventListener("input", function (event) {
    // Check if the event target is a textarea inside a modal
    if (event.target.tagName === "TEXTAREA" && event.target.closest(".modal")) {
        let textarea = event.target;
        let cursorPosition = textarea.selectionStart;
        let originalLength = textarea.value.length;

        // Remove all occurrences of ( and )
        textarea.value = textarea.value.replace(/[()]/g, "");

        let newLength = textarea.value.length;
        let diff = originalLength - newLength;

        // Adjust cursor position to account for removed characters
        textarea.setSelectionRange(cursorPosition - diff, cursorPosition - diff);
    }
});
