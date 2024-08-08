document.addEventListener('DOMContentLoaded', function() {
    // Function to retrieve and store token
    function retrieveToken() {
        chrome.runtime.sendMessage({ action: 'getToken' }, function(response) {
            if (response.success) {
                console.log('Token retrieved:', response.token);
            } else {
                console.error('Error retrieving token:', response.error);
                alert('Error retrieving token.');
            }
        });
    }

    // Automatically retrieve the token on popup load
    retrieveToken();

    document.getElementById('researchForm').addEventListener('submit', function(event) {
        event.preventDefault();

        console.log('Form submitted.');

        const name = document.getElementById('name').value;
        const keywords = document.getElementById('keywords').value;
        const linkedinUrl = document.getElementById('linkedinUrl').value;
        const twitterUrl = document.getElementById('twitterUrl').value;
        const youtubeUrl = document.getElementById('youtubeUrl').value;
        const loadingDiv = document.getElementById('loading');
        const resultsDiv = document.getElementById('results');

        console.log('Collected input values:', {
            name: name,
            keywords: keywords,
            linkedinUrl: linkedinUrl,
            twitterUrl: twitterUrl,
            youtubeUrl: youtubeUrl
        });

        // Show the loading message
        loadingDiv.style.display = 'block';
        resultsDiv.style.display = 'none'; // Hide the results div
        resultsDiv.innerHTML = '';
        console.log('Loading message displayed.');

        chrome.storage.local.get('backendToken', function(result) {
            const token = result.backendToken;
            console.log('Retrieved token from storage:', token);

            if (!token) {
                console.error('No token found in storage.');
                loadingDiv.style.display = 'none';
                resultsDiv.style.display = 'block';
                resultsDiv.innerHTML = '<p>Error: No token found in storage.</p>';
                return;
            }

            console.log('Sending request to backend...');
            fetch('https://lexal-api.fly.dev/api/scoura/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    person: name,
                    relevant_words: keywords,
                    linkedin_url: linkedinUrl,
                    twitter_url: twitterUrl,
                    youtube_url: youtubeUrl
                })
            })
            .then(response => {
                console.log('Received response:', response);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                // Hide the loading message
                loadingDiv.style.display = 'none';
                // Display the results
                displayResults(data, resultsDiv);
            })
            .catch(error => {
                console.error('Error during fetch:', error);
                // Hide the loading message
                loadingDiv.style.display = 'none';
                resultsDiv.style.display = 'block';
                // Display the error message
                resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
            });
        });
    });

    function displayResults(data, resultsDiv) {
        resultsDiv.style.display = 'block'; // Show the results div
        let htmlContent = `
            <h2>Person: ${data.person}</h2>
            <h3>Summary</h3>
            <p>${data.summary}</p>
            <h3>Personality Summary</h3>
            <p>${data.personality_summary}</p>
            <h3>Key Data Points</h3>
            <ul>
        `;

        data.data.forEach(item => {
            htmlContent += `<li>${item}</li>`;
        });

        htmlContent += `</ul><h3>References</h3><ul>`;

        data.websites_to_use.forEach(website => {
            htmlContent += `<li><a href="${website}" target="_blank">${website}</a></li>`;
        });

        htmlContent += `</ul>`;

        resultsDiv.innerHTML = htmlContent;
    }
});
