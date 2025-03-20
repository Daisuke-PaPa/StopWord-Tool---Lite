let globalHiddenIndexes = [];
const textarea = document.getElementById("main-text");
var current_text = document.getElementById("main-text").value;

function hideWords(force_reload = false) {
    return fetchGroupData('hide_list')
        .then(groupData => {
            let editorText = document.getElementById('main-text').value;
            let intervals = [];

            // Helper function that validates the current match using DOM selection.
            function shouldIgnoreMatch(matchIndex, searchText) {
                const textBox = document.getElementById('main-text');
                const originalStart = textBox.selectionStart;
                const originalEnd = textBox.selectionEnd;
                try {
                    textBox.focus();
                    textBox.setSelectionRange(matchIndex, matchIndex + searchText.length);
                    const selectedText = window.getSelection().toString();
                    console.log(`Selected match: "${selectedText}"`);
                    window.getSelection().removeAllRanges();
                    // If the selected text does not match the expected search text, ignore this match.
                    if (selectedText !== searchText) {
                        console.log("Text mismatch. Rejecting match.");
                        return true;
                    }
                    return false;
                } finally {
                    textBox.setSelectionRange(originalStart, originalEnd);
                }
            }

            // For each hidden item, find all occurrences in the editor text.
            groupData.forEach(item => {
                let word = item.hide_item;
                if (!word) return;
                let pos = editorText.indexOf(word);
                while (pos !== -1) {
                    // Only add the interval if the DOM selection check confirms the match.
                    if (!shouldIgnoreMatch(pos, word)) {
                        intervals.push({ start: pos, end: pos + word.length });
                    }
                    pos = editorText.indexOf(word, pos + 1);
                }
            });

            // Merge overlapping intervals.
            intervals.sort((a, b) => a.start - b.start);
            let merged = [];
            intervals.forEach(interval => {
                if (merged.length === 0) {
                    merged.push(interval);
                } else {
                    let last = merged[merged.length - 1];
                    if (interval.start <= last.end) {
                        // Overlapping intervals – combine them.
                        last.end = Math.max(last.end, interval.end);
                    } else {
                        merged.push(interval);
                    }
                }
            });

            // Store in global variable.
            globalHiddenIndexes = merged;

            return merged; // Return merged indexes if needed
        })
        .catch(error => {
            console.error("Error calculating hidden indexes:", error);
            throw error;
        });
}


// Listen for user input and adjust indexes dynamically
textarea.addEventListener("input", async (event) => {
    console.log('recalculating');
    await hideWords();  // Call your hideWords function
    console.log('done');
});
