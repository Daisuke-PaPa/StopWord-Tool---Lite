// Declare the necessary variables globally
let history = [];
let currentHistoryIndex = -1; // Tracks the current position in the history array.
const maxHistory = 30;         // Maximum history size to keep.
let lastSavedText = '';
let textArea = null;           // Reference to the textarea element
let isSaving = false;          // Prevent re-entrant saves

// Initialize the textarea and event listeners
function initTextArea() {
  textArea = document.getElementById('main-text');
  if (!textArea) return;
  
  lastSavedText = textArea.value;
  
  // Update current history's cursor on click (and mouseup to cover non-click interactions)
  const updateCursor = () => {
    if (currentHistoryIndex >= 0 && history[currentHistoryIndex]) {
      history[currentHistoryIndex].cursor = textArea.selectionStart;
    }
  };
  textArea.addEventListener('click', updateCursor);
  textArea.addEventListener('mouseup', updateCursor);
  
  // Listen for input events and record history
  textArea.addEventListener('input', () => {
    if (isSaving) return;
    isSaving = true;
    
    const currentValue = textArea.value;
    // Capture the exact cursor position
    let cursorPosition = textArea.selectionStart;
    
    // Only save if the text actually changed
    if (currentValue !== lastSavedText) {
      // If not at the end of history, truncate future states
      if (currentHistoryIndex < history.length - 1) {
        history = history.slice(0, currentHistoryIndex + 1);
      }
      saveState(currentValue, cursorPosition);
      lastSavedText = currentValue;
    }
    
    isSaving = false;
  });
  
  // Listen for undo (Ctrl+Z) and redo (Ctrl+Y) key combinations
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.code === 'KeyZ') {
        e.preventDefault();
        undo();
      } else if (e.code === 'KeyY') {
        e.preventDefault();
        redo();
      }
    }
  });
  
  // Save the initial state
  saveState(textArea.value, textArea.selectionStart);
}

// Save the current state into history
function saveState(currentValue, cursorPosition) {
  // Remove the oldest entry if at max and adjust the index accordingly
  if (history.length >= maxHistory) {
    history.shift();
    currentHistoryIndex = Math.max(0, currentHistoryIndex - 1);
  }
  
  history.push({ text: currentValue, cursor: cursorPosition });
  currentHistoryIndex = history.length - 1;
}

// Restore a saved state exactly as saved
function restoreState(state,msg) {
  if (textArea) {
    textArea.value = state.text;
    lastSavedText = state.text; // Sync lastSavedText to the restored text
    // Simply restore the saved cursor position.
    textArea.selectionEnd = textArea.selectionStart = state.cursor;
    textArea.blur();
    textArea.focus();
    textArea.setSelectionRange(state.cursor, state.cursor);
    if(msg=="redo"){showStatusNotification("ရှေ့ဆက်ဖို့အားထုတ်မှ ပြန်လည်ကာသတိရမိ")};
    if(msg=="undo"){showStatusNotification("နောက်ဆုတ်ဖို့ကြိုးစားရင်းရှေ့တိုးမိ")};
  }
}

// Undo: restore the previous state (if available)
function undo() {
  if (currentHistoryIndex > 0) {
    currentHistoryIndex--;
    restoreState(history[currentHistoryIndex],"undo");
  }
}

// Redo: restore the next state (if available)
function redo() {
  if (currentHistoryIndex < history.length - 1) {
    currentHistoryIndex++;
    restoreState(history[currentHistoryIndex],"redo");
  }
}

// Manually trigger a change when the value of the textarea is altered programmatically
function manualValueChange(newValue) {
  if (!textArea) return;
  
  const current = history[currentHistoryIndex] || { text: "", cursor: textArea.selectionStart };
  // Only update if newValue differs from the current state
  if (current.text === newValue) {
    console.log("New value matches current history. No update.");
    return;
  }
  
  textArea.value = newValue;
  const currentCursor = textArea.selectionStart;
  saveState(newValue, currentCursor);
  hideWords();
}

// Initialize the textarea when the page loads
document.addEventListener('DOMContentLoaded', initTextArea);
