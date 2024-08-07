chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getToken') {
        getToken(sendResponse);
        return true;  // Will respond asynchronously.
    }
});

function getToken(sendResponse) {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError || !token) {
            console.error('Error during authentication:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError });
            return;
        }
        fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token)
            .then(response => response.json())
            .then(data => {
                const userEmail = data.email;
                console.log('User email:', userEmail);
                
                // Make POST request to your Django backend
                fetch('https://lexal-api.fly.dev/api/scoura-create/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: userEmail })
                })
                .then(response => response.json())
                .then(data => {
                    const backendToken = data.token;
                    console.log('Token from backend:', backendToken);
    
                    // Store the token in local storage
                    chrome.storage.local.set({ backendToken }, () => {
                        console.log('Token stored in local storage');
                        sendResponse({ success: true, token: backendToken });
                    });
                })
                .catch(error => {
                    console.error('Error posting to backend:', error);
                    sendResponse({ success: false, error: error.message });
                });
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
                sendResponse({ success: false, error: error.message });
            });
    });
}