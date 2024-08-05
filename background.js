chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        console.log('Error during authentication:', chrome.runtime.lastError);
        return;
      }
      fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token)
        .then(response => response.json())
        .then(data => {
          const userEmail = data.email;
          console.log('User email:', userEmail);
          
          // Make POST request to your Django backend
          fetch('https://lexal-api.fly.dev/scoura/auth', {
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
            });
          })
          .catch(error => {
            console.error('Error posting to backend:', error);
          });
        })
        .catch(error => {
          console.log('Error fetching user info:', error);
        });
    });
  });