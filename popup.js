document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('researchForm');
    const resultsDiv = document.getElementById('results');
  
    form.addEventListener('submit', function(e) {
        e.preventDefault();
  
        const person = document.getElementById('name').value;
        const relevant_words = document.getElementById('keywords').value;
        const linkedin_url = document.getElementById('linkedinUrl').value;
        const twitter_url = document.getElementById('twitterUrl').value;
        const youtube_url = document.getElementById('youtubeUrl').value;

        // Retrieve the token from Chrome's local storage
        chrome.storage.local.get('backendToken', function(items) {
            const token = items.backendToken;
  
            // Call your API here
            fetch('https://lexal-api.fly.dev/scoura/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    person,
                    relevant_words,
                    linkedin_url,
                    twitter_url,
                    youtube_url
                }),
            })
            .then(response => response.json())
            .then(data => {
                // Display the results
                resultsDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            })
            .catch(error => {
                resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
            });
        });
    });
});