chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === "install") {
        chrome.runtime.openOptionsPage();
    }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.runtime.openOptionsPage()
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "openOptionsPage") {
      chrome.runtime.openOptionsPage();
  }
});

// Proxy API requests through the service worker to bypass CORS,
// streaming response chunks back to the caller via the port.
chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== 'api-proxy') {
        return;
    }

    port.onMessage.addListener(async (request) => {
        const { url, options } = request;
        const safePost = (msg) => {
            try {
                port.postMessage(msg);
            } catch (e) { /* port already closed */ }
        };
        try {
            const response = await fetch(url, options);

            safePost({ type: 'status', status: response.status });

            if (!response.ok) {
                let body = '';
                try {
                    body = await response.text();
                } catch (e) {}
                safePost({
                    type: 'error',
                    message: 'HTTP Error, Code: ' + response.status + (body ? ': ' + body : '')
                });
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                safePost({ type: 'chunk', chunk: decoder.decode(value, { stream: true }) });
            }
            const rest = decoder.decode();
            if (rest) {
                safePost({ type: 'chunk', chunk: rest });
            }
            safePost({ type: 'done' });
        } catch (error) {
            safePost({ type: 'error', message: error.message || String(error) });
        }
    });
});