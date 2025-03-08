    var rules = [
      {"from":"$ANY_ $ANY_ ့်_","to":"‌$ANY$ANY့်_"},
      {"from":"$ANY်_ ား_","to":"‌$ANYျား_"},
      {"from":"$ANYော့_ ်_","to":"‌$ANYော့်_"},
      {"from":"$ANY_ ့","to":"‌$ANY့"},
      {"from":"$ANY_ ွ","to":"‌$ANYွ"},
      {"from":"_ $ANY_ ်","to":"‌$ANY်"},
      {"from":"$ANY_ ‌ယ့်","to":"$ANYယ့်"},
      {"from":"$ANY_ ါ","to":"$ANYါ"},
      {"from":"$ANYိ_ ူ‌င်","to":"$ANYိူ‌င်"},
      {"from":"$ANYိ_ ူး_","to":"$ANYိူး"},
      {"from":"ေ‌$ANYျာ်","to":"‌‌$ANYျော်"},
      {"from":"$ANY_ ံး_","to":"$ANYံး_"},
      //{"from":"_ $ANY်_","to":"$ANY်_"},
    ]

    function applyRules(rules, output) {
      rules.forEach(rule => {
          // Convert "$ANY" into a regex group that captures characters up to an underscore
          let regexPattern = rule.from
              .replace(/\$ANY/g, "([^_\\s]+)") // Match sequences without underscores or spaces
              .replace(/_/g, "_"); // Ensure underscores are matched literally
      
          let regex = new RegExp(regexPattern, "g");
      
          output = output.replace(regex, (...matches) => {
              let replacement = rule.to;
              let capturedIndex = 1;
      
              // Replace "$ANY" in "to" with captured values
              replacement = replacement.replace(/\$ANY/g, () => matches[capturedIndex++] || "");
      
              return replacement;
          });
      });
      
      return output;
    }
  

  
  
  function removeNonEnglishSpaces(text) {
    // Process each line separately so that newline characters are preserved.
    return text.split('\n').map(line => 
      // Replace spaces/tabs that are not adjacent to English letters.
      line.replace(/(?<![A-Za-z])[ \t]+(?![A-Za-z])/g, '')
    ).join('\n');
  }
  
  
  
  