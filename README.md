# ease-rpc

ease rpc in browser use iframe or electron ipcRenderer and ipcMain.

## usage

### in browser

```javascript
// client
import { RPCClient } from 'ease-rpc';

const client = new RPCClient({
  channelId: 'ease-rpc-child-parent',
  emitter: window.parent,
});

const response = await client.call('message', { content: 'Hello Parent.' });

// server
import { RPCClient } from 'ease-rpc';

const server = new RPCServer({
  channelId: 'ease-rpc-child-parent',
  emitter: document.querySelector('#child').contentWindow,
});

server.regist('message', (data) => {
  message('from child: ' + JSON.stringify(data));
  return { content: 'Hello Child.'};
});
```

### in electron

```javascript
// client
import { RPCClient, EScene } from 'ease-rpc';
import { ipcRenderer } from require('electron');

const client = new RPCClient({
  channelId: 'ease-rpc-child-parent',
  emitter: ipcRenderer,
  scene: EScene.ELECTRON,
});

const response = await client.call('message', { content: 'Hello Parent.' });

// server
import { RPCClient } from 'ease-rpc';
import { ipcMain } from require('electron');

const server = new RPCServer({
  channelId: 'ease-rpc-child-parent',
  emitter: ipcMain,
  scene: EScene.ELECTRON,
});

server.regist('message', (data) => {
  message('from child: ' + JSON.stringify(data));
  return { content: 'Hello Child.'};
});
```