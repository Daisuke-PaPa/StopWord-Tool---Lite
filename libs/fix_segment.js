async function fixSpacing() {
    const textarea = document.getElementById('main-text');
    if (!textarea) {
        showStatusNotification("Textarea not found!", false); // Hide close button
        return;
    }

    let content = textarea.value;
    let previousContent;

    // Continue replacing until no more changes occur
    do {
        previousContent = content; // Store the current content
        // Step 1: Replace " _ " with "_ " globally
        content = content.replace(/ _ /g, "_ ");

        // Step 2: Replace " _ " with "_ " again (duplicate step)
        content = content.replace(/ _ /g, "_ ");

        // Step 3: Replace double spaces with a single space globally
        content = content.replace(/  /g, " ");

        // Step 4: Replace "__ " with "_ " globally
        content = content.replace(/__ /g, "_ ");

    } while (previousContent !== content); // Continue until no more changes
    manualValueChange(content);
    await hideWords();
}

//--------------------------------------
// Function to apply the fix segments
function applyFixSegments() {
    showStatusNotification('Fixing Segments...', false);  // Initial status message
    const mainText = document.getElementById('main-text').value; // Get the main text from the textbox
    let updatedText = mainText; // Start with the original text

    updatedText =  applyRules(rules, mainText);

    // Fetch all values of the "fix_segment" group from the database
    fetchGroupData('fix_segment').then(groupData => {
        const totalSegments = groupData.length; // Total number of segments
        let currentSegment = 0; // Start counting from the first segment

        // Loop through each segment in the groupData
        groupData.forEach(segment => {
            const wrongSegment = segment.wrong_segment; // The "wrong" part to find
            const rightSegment = segment.right_segment; // The "right" part to replace with

            // Use normal replace to perform the find-and-replace on the main text
            //updatedText = string.replace(new RegExp("\\b"+wrongSegment+"\\b"), rightSegment);
            updatedText = updatedText.replaceAll(wrongSegment, rightSegment); // Replace all occurrences

            // Update progress information
            currentSegment++;
        });

        // Update the text area with the modified text
        manualValueChange(updatedText);
        showStatusNotification('Done fixing!', true);  // Final notification

    }).catch(error => {
        console.error("Error retrieving group data:", error);
        showStatusNotification('Error occurred while fixing segments.', true); // Error notification
    });
}

// removing undderscores
function removeUnderscores() {
    const textBox = document.getElementById('main-text');
    manualValueChange(textBox.value.replace(/_/g, '')); // Remove all underscores
    hideWords();
    showStatusNotification("Underscores deleted")
}