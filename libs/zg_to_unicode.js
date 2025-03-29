var rules = [
  {"from":"$ANY်_ ား_","to":"$ANYျား_"},
  {"from":"$ANYော့_ ်_","to":"$ANYော့်_"},
  {"from":"$ANY_ ့","to":"$ANY့"},
  {"from":"$ANY_ ွ","to":"$ANYွ"},
  {"from":"$ANY_ ်","to":"$ANY်"},
  {"from":"$ANY_ ‌ယ့်","to":"$ANYယ့်"},
  {"from":"$ANY_ ါ","to":"$ANYါ"},
  {"from":"$ANYိ_ ူ‌င်","to":"$ANYိူင်"},
  {"from":"$ANYိ_ ူး_","to":"$ANYိူး"},
  {"from":"_ ေ‌$ANYျာ်","to":"_ $ANYျော်"},
  {"from":"$ANY_ ံး_","to":"$ANYံး_"},
  {"from":"$ANY_ ီး_","to":"$ANYီး_"},
  {"from":"$ANY_ ှ‌","to":"$ANYှ"},
  {"from":"_ ေ_ $ANYး_","to":"_ $ANYေး_"},
  {"from":"_ ေ_ $ANY_ း_","to":"_ $ANYေး_"},
  {"from":"$ANY_ း_","to":"$ANYး_"},
  {"from":"_ $ANY_ င့်","to":"_ $ANYင့်"},
  {"from":"_ ချ်_","to":"ချ်_"},
  {"from":"_ ေ_ $ANY_ ","to":"_ $ANYေ_ "},
  {"from":"$ANYိ_ ူ_ င်","to":"$ANYိူင်"},
  {"from":"$ANY_ စ်","to":"$ANYစ်"},
  {"from":"$ANY_ ည့်","to":"$ANYည့်"},
  {"from":"$ANY_ န့်","to":"$ANYန့်"},
  {"from":"$ANY_ ယ့်","to":"$ANYယ့်"},
  {"from":"$ANY_ ရ့်","to":"$ANYရ့်"},
  {"from":"$ANYြ_ ှင့်","to":"$ANYြှင့်"},
  {"from":"$ANY_ ီး","to":"$ANYီး"},
  {"from":"$ANY_ ီ","to":"$ANYီ"},
  {"from":"$ANY_ ဲ့_","to":"$ANYဲ့_"},
  {"from":"$ANY_ ျု","to":"$ANYျု"},
  {"from":"$ANY_ ျ","to":"$ANYျ"},
  {"from":"$ANYြ_ ှီး","to":"$ANYြှီး"},
  {"from":"$ANY_ ိ","to":"$ANYိ"},
  {"from":"$ANY_ ူး","to":"$ANYူး"},
  {"from":"$ANY_ ံ","to":"$ANYံ"},
  {"from":"$ANYျ_ ု","to":"$ANYျု"},
  {"from":"$ANY_ ှီ","to":"$ANYှီ"},
  {"from":"င်_ ္_ $ANY_ ","to":"င်္$ANY_ "},
  {"from":"$ANY_ ေ့_ ","to":"$ANYေ့_ "},
  {"from":"$ANYု_ ဒ်_ ","to":"$ANYုဒ်_ "},
  {"from":"$ANY_ ာ_ ","to":"$ANYာ_ "},
  {"from":"_ $ANYှ_ ောက်_ ","to":"_ $ANYှောက်_ "},
  {"from":"_ ္_ $ANYီ_","to":"္$ANYီ_"},
  {"from":"$ANYြု_ ုံ","to":"$ANYြုံ"},
  {"from":"$ANY_ ှ_ ဥ်း","to":"$ANYှဥ်း"},
  {"from":"$ANY_ ာ်","to":"$ANYာ်"},
  {"from":"င်္_ $ANY","to":"င်္$ANY"},
  {"from":"$ANYိ_ မ့်_ ","to":"$ANYိမ့်"},
  {"from":"_ $ANYွ_ န်","to":"_ $ANYွန်_ "},
  {"from":"_ ေး_ $ANY","to":"း_ ‌ေ$ANY"},
  {"from":"_ ေ$ANYြ","to":"_ $ANYြေ"},
  {"from":"$ANY_ မ်း","to":"$ANYမ်း"},
  {"from":"$ANY_ ဉ့်_ ","to":"$ANYဉ့်_ "},
  //{"from":"ို_ $ANY်_ ","to":"ို$ANY်_ "},
  //{"from":"ာ_ $ANY်_ ","to":"ာ$ANY်_ "},
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
  
  
  
  