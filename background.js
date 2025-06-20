chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.mouseButton == 'L') {
    switch (message.gesture) {
      case "L":
        chrome.tabs.goBack(sender.tab.id)
        break;
      case "R":
        chrome.tabs.goForward(sender.tab.id)
        break;
      case "DR":
        chrome.tabs.remove(sender.tab.id);
        break;
      case "UD":
        chrome.tabs.reload(sender.tab.id);
        break;
      case "UR":
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          let currentIndex = tabs.findIndex(tab => tab.id === sender.tab.id);
          let nextIndex = (currentIndex + 1) % tabs.length;
          chrome.tabs.update(tabs[nextIndex].id, { active: true });
        });
        break;
      case "UL":
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          let currentIndex = tabs.findIndex(tab => tab.id === sender.tab.id);
          let prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          chrome.tabs.update(tabs[prevIndex].id, { active: true });
        });
        break;
      case "D":
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          if (tabs && tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { pinned: true });
          }
        });
        break;
      case "DRU":
        chrome.sessions.getRecentlyClosed({ maxResults: 10 }, function (sessions) {
          if (sessions && sessions.length > 0) {
            chrome.sessions.restore(sessions[0].tab.sessionId)
          }
        });
        break;
    }
  } else if (message.mouseButton == 'R') {
    switch (message.gesture) {
      case "R":
        if (!/^https?:\/\//.test(message.dragContent)) {
          message.dragContent = `https://www.google.com/search?q=${encodeURIComponent(message.dragContent)}`;
        }
        chrome.tabs.create({
          url: message.dragContent,
          index: sender.tab.index + 1
        });
        break;
    }
  }
});
