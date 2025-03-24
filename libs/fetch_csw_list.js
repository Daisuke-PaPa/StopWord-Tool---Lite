let globalCSWMatches = [];     // We'll update this below

// This function processes the CSW list and updates the csw_list_textbox.
async function processCSWMatches() {
  // Optionally, fix spacing first if needed.
  await fixSpacing();

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
        matches.push({ start: matchStart, end: matchEnd, text: match[0] });}
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
const cswSuffixList = ['က့်','င့်','စ့်','ည့်','မ့်','န့်','‌ည့်', 'က်', 'ခ်', 'ဂ်', 'ဃ်', 'င်', 'စ်', 'ဆ်', 'ဇ်', 'ဈ်', 'ဉ်', 'ည်', 'ဋ်', 'ဌ်', 'ဍ်', 'ဎ်', 'ဏ်', 'တ်', 'ထ်', 'ဒ်', 'ဓ်', 'န်', 'ပ်', 'ဖ်', 'ဗ်', 'ဘ်', 'မ်', 'ယ်', 'ရ်', 'လ်', 'ဝ်', 'ဟ်', 'သ်', 'ဟ်', 'ဠ်', 'အ်' , 'ဿ်', 'ာ', 'ါ', 'ိ', 'ီ', 'ု', 'ူ', 'ဲ', 'ံ', '့', 'း', '်', 'ျ', 'ွ', 'ှ', 'ြ','ြာ်']; 


async function csw_delete() {
  
  // Fetch the value from the 'csw_list_textbox' textbox
  let cswList = document.getElementById('csw_list_textbox').value;
  let cswArray = cswList.split('\n');
  console.log("Array of words to search for:", cswArray);

  // Get the content from the 'main-text' textbox
  let mainText = document.getElementById('main-text').value;

  let deleted = 0;
  let skipped = 0;

  // Process each search term without updating the DOM immediately
  cswArray.forEach(term => {
    let searchValue = term.trim();
    if (searchValue === "") {
      console.log(`Skipping empty search term`);
      return;
    }
    console.log(`Searching for "${searchValue}" in the main text`);
    
    let lastIndex = 0;
    let foundIndex = -1;
    while (lastIndex < mainText.length) {
      foundIndex = mainText.indexOf(searchValue, lastIndex);
      console.log(`Searching from index ${lastIndex}: Found "${searchValue}" at index ${foundIndex}`);
      
      if (foundIndex !== -1) {
        // Use isInHiddenRanges to determine if the match is within a hidden bracketed region.
        if (isInHiddenRanges(foundIndex, searchValue.length)) {
            console.log(`Skipping "${searchValue}" at index ${foundIndex} (inside brackets)`);
            lastIndex = foundIndex + searchValue.length;
            skipped++;
            continue;
        }
        
        // Check if the word has a CSW suffix before replacing it
        if (hasCswSuffix(mainText, searchValue, foundIndex)) {
            console.log(`Skipping "${searchValue}" at index ${foundIndex} due to CSW suffix`);
            lastIndex = foundIndex + searchValue.length;
            skipped++;
            continue;
        }
        
        console.log(`Replacing "${searchValue}" at index ${foundIndex}`);
        let placeholder = '#'.repeat(searchValue.length);
        mainText = mainText.substring(0, foundIndex) + placeholder + mainText.substring(foundIndex + searchValue.length);
        lastIndex = foundIndex + placeholder.length;
        deleted++;
    }
     else {
        console.log(`No more matches found for "${searchValue}" from index ${lastIndex}`);
        break;
      }
    }
  });

  // Post-processing: Remove placeholder '#' characters
  mainText = mainText.replace(/#/g, '');

  // Optionally update csw_list_textbox with any remaining skipped words
  let skippedWords = cswArray.filter(word => mainText.includes(word.trim()));
  document.getElementById('csw_list_textbox').value = skippedWords.join('\n');
  skipped = skippedWords.length;

  // Update the text area only once after all processing is complete
  document.getElementById('main-text').value = mainText;
  await fixSpacing();
  showStatusNotification(`Deleted ${deleted} words${skipped !== 0 ? ` and skipped ${skipped} words` : ''}`);
}


