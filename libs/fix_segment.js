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

        content = content.replaceAll("_", "_ ");

    } while (previousContent !== content);
    manualValueChange(content);
    await hideWords();
}





function applyFixSegments() {
    const mainTextElement = document.getElementById('main-text');
    const originalText = mainTextElement.value; // Get the current text from the textbox

    // First, apply any predefined rules
    let updatedText = applyRules(rules, originalText);

    // Fetch all values of the "fix_segment" group from the database
    fetchGroupData('fix_segment').then(groupData => {
        // Loop through each segment and perform replacements
        groupData.forEach(segment => {
            const wrongSegment = segment.wrong_segment;
            const rightSegment = segment.right_segment;
            updatedText = updatedText.replaceAll(wrongSegment, rightSegment);
        });

        // Check if any changes were made during this iteration
        if (updatedText !== originalText) {
            // If changes occurred, update the textbox and repeat the process
            mainTextElement.value = updatedText;
            fixSpacing();
            applyFixSegments();  // Recursively call the function
        } else {
            // No further changes: finalize the process
            mainTextElement.value = updatedText;
            fixSpacing();
            showStatusNotification('Done fixing!', true);
        }
    }).catch(error => {
        console.error("Error retrieving group data:", error);
        showStatusNotification('Error occurred while fixing segments.', true);
    });
}


// removing undderscores
function removeUnderscores() {
    const textBox = document.getElementById('main-text');
    manualValueChange(textBox.value.replace(/_/g, '')); // Remove all underscores
    hideWords();
    showStatusNotification("Underscores deleted")
}