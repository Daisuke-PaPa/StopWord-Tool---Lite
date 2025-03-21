    var rules = [
      //{"from":"$ANY_ $ANY_ ့်_","to":"‌$ANY$ANY့်_"},
      {"from":"$ANY်_ ား_","to":"‌$ANYျား_"},
      {"from":"$ANYော့_ ်_","to":"‌$ANYော့်_"},
      {"from":"$ANY_ ့","to":"‌$ANY့"},
      {"from":"$ANY_ ွ","to":"‌$ANYွ"},
      {"from":"$ANY_ ်","to":"‌$ANY်"},
      {"from":"$ANY_ ‌ယ့်","to":"$ANYယ့်"},
      {"from":"$ANY_ ါ","to":"$ANYါ"},
      {"from":"$ANYိ_ ူ‌င်","to":"$ANYိူ‌င်"},
      {"from":"$ANYိ_ ူး_","to":"$ANYိူး"},
      {"from":"ေ‌$ANYျာ်","to":"‌‌$ANYျော်"},
      {"from":"$ANY_ ံး_","to":"$ANYံး_"},
      //{"from":"$ANYိ_ $ANY်","to":"$ANYိ$ANY်"},
      {"from":"$ANY_ ီး_","to":"$ANYီး_"},
      {"from":"$ANY_ ှ‌","to":"$ANYှ‌"},
      {"from":"_ ေ_ $ANYး_","to":"_ $ANYေး_"},
      {"from":"_ ေ_ $ANY_ း_","to":"_ $ANYေး_"},
      {"from":"$ANY_ း_","to":"$ANYး_"},
      {"from":"_ $ANY_ င့်","to":"_ $ANYင့်"},
      {"from":"_ ချ်_","to":"ချ်_"},
      {"from":"_ ေ_ $ANY_ ","to":"_ $ANYေ_ "},
      //{"from":"$ANYို_ $ANY့်_","to":"$ANYို$ANY့်_"},
      {"from":"$ANYိ_ ူ_ င်","to":"$ANYိူင်"},
      {"from":"$ANY_ စ်","to":"$ANYစ်"},
      //{"from":"$ANYွ_ $ANY်","to":"$ANYွ$ANY်"},
      {"from":"$ANY_ ည့်","to":"$ANYည့်"},
      {"from":"$ANY_ န့်","to":"$ANYန့်"},
      {"from":"$ANY_ ယ့်","to":"$ANYယ့်"},
      {"from":"$ANY_ ရ့်","to":"$ANYရ့်"},
      {"from":"$ANYြ_ ှင့်","to":"$ANYြှင့်"},
      {"from":"$ANY_ ီး","to":"$ANYီး"},
      //{"from":"$ANY_ $ANY်ျ","to":"$ANY$ANY်ျ"},
      {"from":"$ANY_ ျု","to":"$ANYျု"},
      {"from":"$ANY_ ျ","to":"$ANYျ"},
      {"from":"$ANYြ_ ှီး","to":"$ANYြှီး"},
      {"from":"$ANY_ ိ","to":"$ANYိ"},
      {"from":"$ANY_ ူး","to":"$ANYူး"},
      {"from":"$ANY_ ံ","to":"$ANYံ"},
      {"from":"$ANYျ_ ု","to":"$ANYျု"},
      {"from":"$ANY_ ှီ","to":"$ANYှီ"},
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
  
  
  
  