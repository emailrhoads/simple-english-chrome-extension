chrome.contextMenus.create({
  id: "translateSimpleEnglish",
  title: "Translate to Simple English",
  contexts: ["selection"] // Only show the menu item when text is selected
});

// stylize the prompt for ChatGPT-3
function transformTextToPrompt(text) {
  return `
    Can you please take the following text and paraphrase it to only use the 2000 words in the Basic English combined word list?
    Here is the text:

    ${text}
  `
}

// send text over to ChatGPT-3
async function requestTranslation(prompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TODO: elegant solution for this? prompt user for API key?
      "Authorization": "Bearer <YOUR_API_KEY>"
    },
    body: JSON.stringify({
      "model": "gpt-3.5-turbo",
      "messages": [{"role": "user", "content": prompt}],
      "temperature": 0.5,
      "max_tokens": 50
    })
  });
  const data = await response.json();
  // console.log(data);

  return data.choices[0].message.content;
}

// Inject a content script into the active tab to add the translated text to the page
function injectTranslatedText(text, translatedText, tab) {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: function(text, translatedText) {
      // Create a new div element to display the translated text
      const translatedDiv = document.createElement("div");
      translatedDiv.textContent = translatedText;

      // Set the style of the div element
      translatedDiv.style.position = "fixed";
      translatedDiv.style.top = "0";
      translatedDiv.style.left = "0";
      translatedDiv.style.zIndex = "9999";
      translatedDiv.style.backgroundColor = "white";
      translatedDiv.style.padding = "1em";
      translatedDiv.style.border = "1px solid black";

      // Add the div element to the page
      document.body.appendChild(translatedDiv);
    },
    args: [text, translatedText]
  });
  // console.log('injected!');
}

// Handle the context menu item click
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "translateSimpleEnglish") {
    var text = info.selectionText;

    // TODO: we want the div to pop up right after the selected text
    // but having issues with that ... so for now just put it up top
    let range = info.range;
    if (!range) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }
    }
    // console.log(range);

    // Do something with the selected text, such as sending it for translation
    //console.log("Selected text: " + text);

    prompt = transformTextToPrompt(text);
    //console.log("Prompt text: " + prompt);

    requestTranslation(prompt).then((translatedText) => {
      //console.log("Translated text: " + translatedText);
      injectTranslatedText(text, translatedText, tab);
    });
  }
});
