async function fixSpacing() {
    const textarea = document.getElementById('main-text');
    if (!textarea) {
        showStatusNotification("Textarea not found!", false);
        return;
    }

    let content = textarea.value;
    let previousContent;

    do {
        previousContent = content;

        // Replace " _ " with "_ "
        content = content.replace(/ _ /g, "_ ");

        // Replace multiple spaces with a single space
        content = content.replace(/ {2,}/g, " ");

        // Replace double underscores followed by a space with a single underscore followed by a space
        content = content.replace(/__ /g, "_ ");

        // Remove invisible characters following an underscore (if another underscore follows later, that underscore remains)
        content = content.replace(/(_)[\s\u200B\u200C\u200D]+/g, "$1");
        // Remove invisible characters preceding an underscore
        content = content.replace(/[\s\u200B\u200C\u200D]+(_)/g, "$1");

        // Replace multiple newlines (of any type) with a single newline
        content = content.replace(/(\r\n|\n|\r)+/g, "\n");

    } while (previousContent !== content);
    content = content.replaceAll("_", "_ ");

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
        document.getElementById('main-text').value = updatedText;
        fixSpacing();
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