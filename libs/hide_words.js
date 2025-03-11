let globalHiddenIndexes = [];
const textarea = document.getElementById("main-text");
var lastProcessedText = "";
var current_text = document.getElementById("main-text").value;

function hideWords(force_reload=false) {
    var current_text = document.getElementById("main-text").value;
    if (current_text === lastProcessedText && !force_reload) {
        console.log("Skipping hideWords because text is unchanged and hidden indexes exist.");
        return;
    }

    lastProcessedText = current_text;

    return fetchGroupData('hide_list')
        .then(groupData => {
            let editorText = document.getElementById('main-text').value;
            let intervals = [];

            // For each hidden item, find all occurrences in the editor text.
            groupData.forEach(item => {
                let word = item.hide_item;
                if (!word) return;
                let pos = editorText.indexOf(word);
                while (pos !== -1) {
                    intervals.push({ start: pos, end: pos + word.length });
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
    await hideWords();  // Call your hideWords function
    console.log('recalculating index');
});
