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
const cswSuffixList = ['န့်','‌ေ','‌ည့်', 'က်', 'ခ်', 'ဂ်', 'ဃ်', 'င်', 'စ်', 'ဆ်', 'ဇ်', 'ဈ်', 'ဉ်', 'ည်', 'ဋ်', 'ဌ်', 'ဍ်', 'ဎ်', 'ဏ်', 'တ်', 'ထ်', 'ဒ်', 'ဓ်', 'န်', 'ပ်', 'ဖ်', 'ဗ်', 'ဘ်', 'မ်', 'ယ်', 'ရ်', 'လ်', 'ဝ်', 'ဟ်', 'သ်', 'ဟ်', 'ဠ်', 'အ်' , 'ဿ်', 'ာ', 'ါ', 'ိ', 'ီ', 'ု', 'ူ', 'ဲ', 'ံ', '့', 'း', '်', 'ျ', 'ွ', 'ှ', 'ြ','ြာ်']; 


function csw_delete() {
  // Fetch the value from the 'csw_list_textbox' textbox
  let cswList = document.getElementById('csw_list_textbox').value;
  let skipped = 0;
  let deleted = 0;

  // Split the value by line breaks to create an array of items
  let cswArray = cswList.split('\n');
  console.log("Array of words to search for:", cswArray);

  // Get the content from the 'main-text' textbox
  let mainText = document.getElementById('main-text').value;

  console.log("Original text in 'main-text':", mainText);

  // Start looping through each item in the array
  let lastIndex = 0;  // Start searching from index 0
  
  for (let i = 0; i < cswArray.length; i++) {
    let searchValue = cswArray[i].trim();
    
    if (searchValue === "") {
      console.log(`Skipping empty search term at index ${i}`);
      continue; // Skip empty search terms
    }

    console.log(`Searching for "${searchValue}" in the main text`);

    // Continue searching until the end of the content for the current word
    let foundIndex = -1;
    while (lastIndex < mainText.length) {
      // Find the search value in the text, starting from the last index
      foundIndex = mainText.indexOf(searchValue, lastIndex);
      console.log(`Searching from index ${lastIndex}: Found "${searchValue}" at index ${foundIndex}`);

      if (foundIndex !== -1) {
        // Check if the match is inside any bracketed region
        let isHidden = false;
        for (let j = 0; j < globalHiddenIndexes.length; j++) {
          let bracket = globalHiddenIndexes[j];
          if (foundIndex >= bracket.start && foundIndex <= bracket.end) {
            isHidden = true;
            break;
          }
        }

        if (isHidden) {
          console.log(`Skipping match "${searchValue}" at index ${foundIndex} because it's inside brackets`);
          lastIndex = foundIndex + searchValue.length;
          skipped++;
          continue;  // Skip this match
        }

        // Check if the word has a CSW suffix before replacing it
        if (hasCswSuffix(mainText, searchValue, foundIndex)) {
          console.log(`Skipping match "${searchValue}" at index ${foundIndex} due to CSW suffix`);
          lastIndex = foundIndex + searchValue.length;
          skipped++;
          continue; // Don't delete if it has a CSW suffix
        }

        // Replace the target with '#' placeholders to avoid disturbing the globalHiddenIndexes
        console.log(`Replacing match "${searchValue}" with '#' at index ${foundIndex}`);
        let placeholder = '#'.repeat(searchValue.length);
        mainText = mainText.substring(0, foundIndex) + placeholder + mainText.substring(foundIndex + searchValue.length);
        
        // After replacement, continue searching from the last found index
        lastIndex = foundIndex + placeholder.length;
        deleted++;
      } else {
        // If no more matches are found, break out of the inner loop and move to the next word in the list
        console.log(`No more matches found for "${searchValue}" from index ${lastIndex}. Moving to the next word.`);
        break;
      }
    }
    // Reset the lastIndex for the next search term in the array, if any
    lastIndex = 0; 
    document.getElementById('main-text').value = mainText;
  }

  // Collect skipped words before deleting '#'
  let skippedWords = cswArray.filter((word) => mainText.includes(word.trim()));

  // Check if skipped words are inside hidden ranges or have CSW suffixes
  skippedWords = skippedWords.filter((word) => {
    let trimmedWord = word.trim();
    let foundIndex = mainText.indexOf(trimmedWord);
    
    if (foundIndex !== -1) {
      for (let j = 0; j < globalHiddenIndexes.length; j++) {
        let bracket = globalHiddenIndexes[j];
        if (foundIndex >= bracket.start && foundIndex <= bracket.end) {
          skipped--;  // Adjust skipped count
          return false; // Remove from skippedWords list
        }
      }
    }
    return true; // Keep it if not inside hidden range or suffix check
  });

  // Now remove '#' from mainText
  mainText = mainText.replace(/#/g, '');

  // Update the CSW text box with skipped words
  document.getElementById('csw_list_textbox').value = skippedWords.join('\n');

  // Adjust skipped count based on actual remaining skipped words
  skipped = skippedWords.length;

  document.getElementById('main-text').value = mainText;
  fixSpacing();
  showStatusNotification(`Deleted ${deleted} words${skipped !== 0 ? ` and skipped ${skipped} words` : ''}`);
}

