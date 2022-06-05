# online-remote-desktop
Use nGrok to make someone able to use your computer remotely using only their browser

This project uses peerjs
```json

    "body-parser": "^1.20.0",
    "peerjs-nodejs": "^1.1.3",
    "simple-peer": "^9.11.1",
    "wrtc": "^0.4.7"
```





## How To use:

run 
```bash
node main.js
```
in cmd.

After that open localhost:1337 and allow the page to see your desktop

After that you'll see a link in your console. This is the link of the remote access.
You can change the username and the password in the main.js file.

Change this:
```js

var users = [
    ['USER1','PASSWORD1'],
	['USER2','PASSWORD2']
];
```
### By using, downloading, adapting in any shape or form this project, you agree to [CC By NC](https://creativecommons.org/licenses/by-nc/4.0/) . This work is licensed under the same license (excluding ngrok.js and NGROK).
