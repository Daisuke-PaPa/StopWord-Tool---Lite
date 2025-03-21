// dropdown and modals ini
var dropdowns = document.querySelectorAll('.dropdown-trigger')
for (var i = 0; i < dropdowns.length; i++){
    M.Dropdown.init(dropdowns[i],{coverTrigger:false,constrainWidth:false});
}

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);
  });

  document.addEventListener('DOMContentLoaded', function() {
    ini_select_shit();
  });

function ini_select_shit() {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);
}

// Handle Ctrl + S for Save
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
      e.preventDefault(); // Prevent default save behavior
      saveFile();
  }
});

// Save File Function (Save as .txt with same filename)
let currentFileName = ''; // To store the current file name

function saveFile() {
  // Get the editor's value (assuming you have a textarea with id "editor")
  const editorValue = document.getElementById("main-text").value;

  // Set the key for localStorage as 'work_file'
  const workFile = editorValue.trim();

  // Update localStorage with the 'work_file' group
  localStorage.setItem("work_file", JSON.stringify(workFile));
  localStorage.setItem("work_file_name", JSON.stringify(currentFileName));
  showStatusNotification("File Saved");
  console.log("File saved to localStorage:", workFile);
}

function downloadFile() {
  let text = document.getElementById('main-text').value;
  
  if (currentFileName == '') {
      currentFileName = '_SW.txt';
  }

  // Loop to adjust spaces until no new changes are made
  let previousText;
  do {
      previousText = text;
      text = text.replace(/  /g, ' '); // Replace double spaces with a single space
  } while (text !== previousText); // Continue until no changes are made

  // Remove common special characters using the provided regex
  text = text.replace(
    /[\\~!@#$%^&*()_\-+=`|{}\[\]:";'<>.,?\/…၊။•↪⭐■▪━༻༺“”‘’–—]|[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Extended_Pictographic}/gu, 
    ''
  );

  // Save the text content as a .txt file with the same name as the opened file
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = currentFileName.replace(/\.[^/.]+$/, '.txt'); // Replace any extension with .txt
  link.click();
  showStatusNotification("File downloaded");
}



// Open File Function (Handle both .docx and .txt)
function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx, .txt'; // Allow both Word and text files
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            currentFileName = file.name; // Store the name of the file being opened
            localStorage.setItem("work_file_name", JSON.stringify(currentFileName));
            const reader = new FileReader();
            
            // If it's a .docx file, use Mammoth.js to extract text
            if (file.name.endsWith('.docx')) {
                reader.onload = function(event) {
                    const arrayBuffer = event.target.result;
                    mammoth.extractRawText({arrayBuffer: arrayBuffer})
                        .then((result) => {
                            manualValueChange(result.value);
                            hideWords();
                            showStatusNotification("File opened")
                            saveFile();
                        })
                        .catch((error) => {
                            console.error("Error reading Word file:", error);
                        });
                };
                reader.readAsArrayBuffer(file);
            }
            // If it's a .txt file, read it as plain text
            else if (file.name.endsWith('.txt')) {
                reader.onload = function(event) {
                    manualValueChange(event.target.result);
                    hideWords();
                    showStatusNotification("File opened")
                    saveFile();
                };
                reader.readAsText(file);
            }
            if(currentFileName!==""){document.title = currentFileName;}
        }
    });
    
    input.click();
}

// Font size adjustment
let fontSize = 18; // Initial font size

// Increase font size
function increase_font_size() {
    fontSize += 2;
    document.getElementById('main-text').style.fontSize = fontSize + 'px';
    document.getElementById('main-text').style.lineHeight = fontSize*2 + 'px';
}

// Decrease font size
function decrease_font_size() {
    fontSize -= 2;
    document.getElementById('main-text').style.fontSize = fontSize + 'px';
    document.getElementById('main-text').style.lineHeight = fontSize*2 + 'px';
}

function maximize() {
    // Enter full-screen mode
    if (!document.fullscreenElement &&    // Not in fullscreen mode
        !document.mozFullScreenElement && // For Firefox
        !document.webkitFullscreenElement && // For Chrome, Safari
        !document.msFullscreenElement) { // For IE
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    }
  }

  function minimize() {
    // Exit full-screen mode
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  function deleteSaveFile() {
    if (confirm("This will delete save file! Are you sure?")) {
        localStorage.setItem("work_file", JSON.stringify(""));
        localStorage.setItem("work_file_name", JSON.stringify(""));
        manualValueChange('');
        currentFileName = "";
        showStatusNotification("Save file deleted successfully.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("textarea, input").forEach(el => {
      el.setAttribute("spellcheck", "false");
      el.setAttribute("autocomplete", "off");
  });
});

function updateClock() {
  const now = new Date();
  
  // Get the hours, minutes, and seconds
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  // Determine AM/PM
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // If it's 0 (midnight), display 12

  // Update time without leading zeros
  document.getElementById('time').textContent = `${hours}:${minutes} ${ampm}`;

  // Update date (show only the day, like Saturday)
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  document.getElementById('date').textContent = day;
}

// Update the clock every second
setInterval(updateClock, 1000);

// Initial call to set the clock immediately
updateClock();

// Event listener for keydown event
document.getElementById('sw_list').addEventListener('keydown', function(event) {
  // Check if the textarea is focused and if left or right arrow keys are pressed
  if (event.key === 'ArrowLeft') {
      // Call moveSwIndex with -1 for left arrow
      moveSwIndex(-1);
  } else if (event.key === 'ArrowRight') {
      // Call moveSwIndex with 1 for right arrow
      moveSwIndex(1);
  }
});