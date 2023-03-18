function translateCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const url = tabs[0].url;

    // Make an API request to translate the website
    // Replace this with your own translation API
    fetch(`https://your-translation-api.com/translate?url=${url}`)
      .then(response => response.json())
      .then(data => {
        // Display the translated website
        document.body.innerHTML = data.translatedHtml;
      })
      .catch(error => {
        console.error(error);
        alert("An error occurred while translating the website.");
      });
  });
}

document.getElementById("translate-button").addEventListener("click", translateCurrentTab);
