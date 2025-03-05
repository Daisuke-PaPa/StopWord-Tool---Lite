let current_search_index = -1;

function toggleReplaceAllMenu() {
    document.getElementById("replace-all-menu").classList.toggle("tn_hidden");
}

document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("text_search");
    const searchDirection = 'right';  // Default direction

    // Make the listener async so we can await hideWords()
    searchBox.addEventListener("keydown", async function (event) {
        if (event.key === "Enter" && searchBox.value) {
            document.getElementById('searchtext').value = searchBox.value;
            
            // Reset search index
            current_search_index = -1;
            
            // Wait for hideWords to finish processing
            await hideWords();
            
            // Now perform the search
            searchAndSelectText(searchDirection);
            
            // Prevent form submission if inside a form
            event.preventDefault();
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
        // If the match overlaps with the interval at all, return true.
        if (matchIndex < interval.end && matchEnd > interval.start) {
            return true;
        }
    }
    return false;
}

function searchAndSelectText(searchDirection) {
    const searchText = document.getElementById("text_search").value;
    const textBox = document.getElementById("main-text");
    const textContent = textBox.value;

    if (!searchText) return;

    // Prepare regex to match the search text globally.
    const regex = new RegExp(searchText, "g");
    let matches = [...textContent.matchAll(regex)];

    if (matches.length === 0) {
        console.log("No match found.");
        document.getElementById('search-navigation').classList.add('tn_hidden');
        return;
    }

    console.log(`Total matches: ${matches.length}`);
    console.log(`Current search index: ${current_search_index}`);

    let foundIndex = -1;

    if (searchDirection === 'left') {
        console.log("Searching to the left...");
        // Look for a valid match to the left of the current search index.
        for (let i = matches.length - 1; i >= 0; i--) {
            let matchIndex = matches[i].index;
            console.log(`Checking match at index: ${matchIndex}`);

            if (!isInHiddenRanges(matchIndex, searchText.length) &&
                !hasCswSuffix(textContent, searchText, matchIndex) &&
                matchIndex < current_search_index) {
                foundIndex = matchIndex;
                console.log(`Found valid match to the left at index: ${foundIndex}`);
                break;
            }
        }
        // Wrap-around: if none found, take the last valid match.
        if (foundIndex === -1) {
            console.log("No valid match to the left. Wrapping around...");
            for (let i = matches.length - 1; i >= 0; i--) {
                let matchIndex = matches[i].index;
                if (!isInHiddenRanges(matchIndex, searchText.length) &&
                    !hasCswSuffix(textContent, searchText, matchIndex)) {
                    foundIndex = matchIndex;
                    console.log(`Wrapped around to match at index: ${foundIndex}`);
                    break;
                }
            }
        }
    } else if (searchDirection === 'right') {
        console.log("Searching to the right...");
        // Look for a valid match to the right of the current search index.
        for (let i = 0; i < matches.length; i++) {
            let matchIndex = matches[i].index;
            console.log(`Checking match at index: ${matchIndex}`);

            if (!isInHiddenRanges(matchIndex, searchText.length) &&
                !hasCswSuffix(textContent, searchText, matchIndex) &&
                matchIndex > current_search_index) {
                foundIndex = matchIndex;
                console.log(`Found valid match to the right at index: ${foundIndex}`);
                break;
            }
        }
        // Wrap-around: if none found, take the first valid match.
        if (foundIndex === -1) {
            console.log("No valid match to the right. Wrapping around...");
            for (let i = 0; i < matches.length; i++) {
                let matchIndex = matches[i].index;
                if (!isInHiddenRanges(matchIndex, searchText.length) &&
                    !hasCswSuffix(textContent, searchText, matchIndex)) {
                    foundIndex = matchIndex;
                    console.log(`Wrapped around to match at index: ${foundIndex}`);
                    break;
                }
            }
        }
    }

    if (foundIndex !== -1) {
        // Save current scroll position
        const scrollTop = textBox.scrollTop;
        
        jumptomatch(foundIndex);

        // Update the current search index
        current_search_index = foundIndex;
        console.log(`Updated current search index to: ${current_search_index}`);

        // Show search navigation.
        document.getElementById('search-navigation').classList.remove('tn_hidden');
        countAndDisplayMatches();
    } else {
        console.log("No valid match found.");
        document.getElementById('search-navigation').classList.add('tn_hidden');
    }
}




async function countAndDisplayMatches() {
    const searchBox = document.getElementById("text_search");
    const textBox = document.getElementById("main-text");
    const matchListDiv = document.getElementById("match_list_div");
    const searchText = searchBox.value;
    const textContent = textBox.value;

    if (!searchText) return;

    // Prepare a regex to match all occurrences of the search term.
    const regex = new RegExp(searchText, "g");
    let matchCount = 0;
    let match;
    const validMatches = [];

    while ((match = regex.exec(textContent)) !== null) {
        let matchIndex = match.index;
        // Only count matches that are not hidden and do not have a csw suffix.
        if (!isInHiddenRanges(matchIndex, searchText.length) &&
            !hasCswSuffix(textContent, searchText, matchIndex)) {
            matchCount++;
            // Define a context window for display.
            const contextSize = 50; // Adjust as needed.
            const start = Math.max(0, matchIndex - contextSize);
            const end = Math.min(textContent.length, matchIndex + searchText.length + contextSize);
            const contextText = textContent.substring(start, end);
            validMatches.push({ matchText: match[0], matchIndex, contextText });
        }
    }

// Update the search count display.
const searchCountDiv = document.getElementById("search_count");
if (searchCountDiv) {
    // Find the position in the validMatches array where the matchIndex equals current_search_index.
    const currentPosition = validMatches.findIndex(match => match.matchIndex === current_search_index);
    // If found, add 1 for human-friendly indexing, otherwise default to 0.
    const displayCurrent = currentPosition >= 0 ? currentPosition + 1 : 0;
    const totalMatches = validMatches.length;
    searchCountDiv.textContent = `Found: ${displayCurrent}/${totalMatches}`;
}

    // Clear previous match results.
    matchListDiv.innerHTML = "";

    // Populate the match list with valid matches.
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

    // Highlight and scroll to the current match in the list.
    const currentMatchIndex = validMatches.findIndex(m => m.matchIndex === current_search_index);
    if (currentMatchIndex !== -1) {
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
            event.preventDefault(); // Prevent the default browser find dialog
            searchBox.focus();      // Focus the search box
        }
    });
});


//fucking hide it
document.addEventListener("DOMContentLoaded", function () {
    const searchBox = document.getElementById("text_search");
    const searchNavigation = document.getElementById('search-navigation');

    // Add event listener for input change on the search box
    searchBox.addEventListener("input", function () {
        // If the search box is empty, hide the search navigation
        if (searchBox.value === "") {
            searchNavigation.classList.add('tn_hidden');
        } 
    });
});

function replaceAllText() {
    const searchValue = document.getElementById("searchtext").value;
    const replaceValue = document.getElementById("replacetext").value;
    const textBox = document.getElementById("main-text");
    const textContent = textBox.value;

    if (!searchValue) return; // Prevent replacing empty search values

    // Escape special regex characters so that the searchValue is treated as a raw string.
    const safeSearchValue = escapeRegExp(searchValue);
    const regex = new RegExp(safeSearchValue, "g");

    let updatedText = "";
    let lastIndex = 0;
    let match;

    // Iterate through all matches.
    while ((match = regex.exec(textContent)) !== null) {
        const matchIndex = match.index;
        // Append text from lastIndex up to the match start.
        updatedText += textContent.substring(lastIndex, matchIndex);
        
        // Check if the match is not hidden and does not have an immediate csw suffix.
        if (!isInHiddenRanges(matchIndex, searchValue.length) &&
            !hasCswSuffix(textContent, searchValue, matchIndex)) {
            updatedText += replaceValue;
        } else {
            // Otherwise, keep the original text.
            updatedText += textContent.substr(matchIndex, searchValue.length);
        }

        // Move past the current match.
        lastIndex = matchIndex + searchValue.length;
    }

    // Append any remaining text after the last match.
    updatedText += textContent.substring(lastIndex);

    // Update the text with the modified string.
    manualValueChange(updatedText);
    hideWords();

    if (replaceValue !== '') {
        showStatusNotification("Replaced '" + searchValue + "' with '" + replaceValue + "'");
    } else {
        showStatusNotification("Deleted '" + searchValue + "'");
    }
}





function escapeRegExp(string) {
    // Escapes characters: . * + ? ^ $ { } ( ) | [ ] \ /
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}



async function jumptomatch(index) {
    const textBox = document.getElementById("main-text");
    const searchText = document.getElementById("text_search").value;
    const textContent = textBox.value;

    if (searchText === textContent.substring(index, index + searchText.length)) {
        // Select the match in the text.
        textBox.selectionEnd = textBox.selectionStart = index;
        textBox.blur();
        textBox.focus();
        textBox.setSelectionRange(index, index + searchText.length);

        // Update the current search index.
        current_search_index = index;

        // Show search navigation.
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


// Checks if the match contains a suffix or mismatched text
function hasCswSuffix(textContent, searchText, matchIndex) {
    const textBox = document.getElementById('main-text');
    
    // Save original selection state
    const originalStart = textBox.selectionStart;
    const originalEnd = textBox.selectionEnd;

    try {
        // Set temporary selection
        textBox.focus();
        textBox.setSelectionRange(matchIndex, matchIndex + searchText.length);

        // Get the selected text
        const selectedText = window.getSelection().toString();
        console.log(`Selected match: "${selectedText}"`);

        // Immediately clear selection
        window.getSelection().removeAllRanges();

        // Perform checks
        if (selectedText !== searchText) {
            console.log("Text mismatch. Rejecting match.");
            return true;
        }

        const suffixStart = matchIndex + searchText.length;
        return cswSuffixList.some(suffix => 
            textContent.substr(suffixStart, suffix.length) === suffix
        );
    } finally {
        // Restore original selection state
        textBox.setSelectionRange(originalStart, originalEnd);
    }
}
