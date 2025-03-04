
let globalCSWMatches = [];     // We'll update this below

// This function processes the CSW list and updates the csw_list_textbox.
async function processCSWMatches() {
  // Optionally, fix spacing first if needed.
  fixSpacing();

  // Get the editor text.
  let editorText = document.getElementById('main-text').value;

  // Fetch the csw_list data from the database.
  fetchGroupData('csw_list').then(groupData => {
    // Sort csw items by length (longest first) to avoid partial replacements.
    groupData.sort((a, b) => b.csw_item.length - a.csw_item.length);

    // Array to collect all found matches.
    let matches = [];

    // Iterate over each csw group item.
    groupData.forEach(item => {
      let word = item.csw_item;
      if (!word) return; // Skip null or empty keys.

      // Create a safe regex from the csw_item.
      let safeWord = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      let regex = new RegExp(safeWord, 'g');

      // Find every occurrence of this word in the editor text.
      let match;
      while ((match = regex.exec(editorText)) !== null) {
        let matchStart = match.index;
        let matchEnd = match.index + match[0].length;
        // Check whether this match falls entirely within any hidden index interval.
        let isHidden = globalHiddenIndexes.some(interval => {
          return (matchStart >= interval.start && matchEnd <= interval.end);
        });
        if (!isHidden) {
          matches.push({ start: matchStart, end: matchEnd, text: match[0] });
        }
      }
    });

    // Sort matches by starting index.
    matches.sort((a, b) => a.start - b.start);

    // Merge overlapping or adjacent matches into larger keys.
    let mergedMatches = [];
    matches.forEach(match => {
      if (mergedMatches.length === 0) {
        mergedMatches.push(match);
      } else {
        let last = mergedMatches[mergedMatches.length - 1];
        // If current match overlaps or touches the previous match, merge them.
        if (match.start <= last.end) {
          last.end = Math.max(last.end, match.end);
          // Update the text to be the substring from the merged range.
          last.text = editorText.substring(last.start, last.end);
        } else {
          mergedMatches.push(match);
        }
      }
    });

    // Filter out duplicate keys (using the text property).
    let uniqueKeysSet = new Set();
    mergedMatches.forEach(match => {
      uniqueKeysSet.add(match.text);
    });
    let uniqueKeys = Array.from(uniqueKeysSet);

    // Sort keys: first by descending length, then by Burmese alphabetical order.
    uniqueKeys.sort((a, b) => {
      if (b.length !== a.length) {
        return b.length - a.length; // Longer keys come first.
      } else {
        // Compare alphabetically using the Burmese locale.
        return a.localeCompare(b, 'my');
      }
    });

    // Optionally, you could also "align" them (for example, by padding if needed)
    // but here we simply sort and display the keys.

    // Update the global CSW matches array if desired.
    globalCSWMatches = uniqueKeys;

    // Populate the csw_list_textbox with one key per line.
    document.getElementById('csw_list_textbox').value = uniqueKeys.join("\n");

    // Notify the user of success.
    showStatusNotification('CSW list applied and extracted successfully!', true);
  }).catch(error => {
    console.error("Error retrieving CSW list:", error);
    showStatusNotification('Error occurred while applying CSW list.', true);
  });
}

const cswPrefixList = ['‌ေ','က'];
const cswSuffixList = ['‌ေ','‌ည့်', 'က်', 'ခ်', 'ဂ်', 'ဃ်', 'င်', 'စ်', 'ဆ်', 'ဇ်', 'ဈ်', 'ဉ်', 'ည်', 'ဋ်', 'ဌ်', 'ဍ်', 'ဎ်', 'ဏ်', 'တ်', 'ထ်', 'ဒ်', 'ဓ်', 'န်', 'ပ်', 'ဖ်', 'ဗ်', 'ဘ်', 'မ်', 'ယ်', 'ရ်', 'လ်', 'ဝ်', 'ဟ်', 'သ်', 'ဟ်', 'ဠ်', 'အ်' , 'ဿ်', 'ာ', 'ါ', 'ိ', 'ီ', 'ု', 'ူ', 'ဲ', 'ံ', '့', 'း', '်', 'ျ', 'ွ', 'ှ', 'ြ','ြာ်']; 

// Helper function to count occurrences of a substring in a string.
function countOccurrences(text, sub) {
  if (sub === "") return 0;
  const regex = new RegExp(escapeRegExp(sub), 'g');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function csw_delete() {
  // Fix spacing and get the current text and CSW list from the textbox
  fixSpacing();
  const textArea = document.getElementById('main-text');
  const cswTextBox = document.getElementById('csw_list_textbox');
  let text = textArea.value;
  let cswListText = cswTextBox.value.trim();

  if (!cswListText) {
    showStatusNotification("Please Get CSW List First");
    return;
  }

  // Build an array of target words (filter out empty entries)
  let cswArray = cswListText
    .split("\n")
    .map(item => item.trim())
    .filter(item => item.length > 0);

  let totalDeleted = 0;
  let totalSkipped = 0;

  // Loop until no more deletions occur
  while (true) {
    let iterationDeleted = 0;
    let iterationSkipped = 0;
    let updatedList = [];

    cswArray.forEach(target => {
      let regex = new RegExp(escapeRegExp(target), 'g');
      let targetDeletedCount = 0;
      let targetSkippedCount = 0;
      
      // Replace each occurrence in the text
      text = text.replace(regex, function(match, offset, str) {
        let conflict = false;

        // 1. Check for suffix conflict using our function
        conflict = hasCswSuffix(str, target, offset);

        // 2. Check if the occurrence is entirely within a hidden interval
        if (globalHiddenIndexes.some(interval => (offset >= interval.start && offset + target.length <= interval.end))) {
          conflict = true;
        }

        if (conflict) {
          targetSkippedCount++;
          return match; // leave this occurrence intact
        } else {
          targetDeletedCount++;
          return ''; // delete this occurrence
        }
      });

      iterationDeleted += targetDeletedCount;
      iterationSkipped += targetSkippedCount;

      // Only keep the target if at least one deletion occurred
      if (targetDeletedCount > 0) {
        updatedList.push(target);
      }
    });

    totalDeleted += iterationDeleted;
    totalSkipped += iterationSkipped;
    cswArray = updatedList; // update the CSW list

    // Update the text area and CSW textbox after each pass
    textArea.value = text;
    cswTextBox.value = cswArray.join("\n");

    // If no deletions occurred during this iteration, break out of the loop
    if (iterationDeleted === 0) break;
  }

  console.log('Total Deleted Terms:', totalDeleted);
  console.log('Total Skipped Terms:', totalSkipped);
  fixSpacing();
  // Show the final status message once the loop is complete
  showStatusNotification(`${totalDeleted} words deleted, ${totalSkipped} words skipped.`);
}


// Helper function to escape special regex characters.
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
