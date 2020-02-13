let aes = document.createElement('script');
aes.src = "https://cdn.rawgit.com/ricmoo/aes-js/e27b99df/index.js";
document.documentElement.appendChild(aes);
var s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
document.documentElement.appendChild(s);




