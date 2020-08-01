export enum EScene {
  ELECTRON = 'electron',
  BROWSER = 'browser',
}

export interface IOptions {
  emitter: any;
  channelId: string;
  scene?: EScene;
}

class RPCBase {
  protected channelId: string;
  protected emitter: any;
  protected scene: EScene;

  constructor({ emitter, channelId, scene = EScene.BROWSER }: IOptions) {
    this.emitter = emitter;
    this.channelId = channelId;
    this.scene = scene;
  }

  send(channelId: string, data: any) {
    if (this.scene === EScene.ELECTRON) {
      this.emitter.send(this.channelId, data);
    }
    
    data.channelId = this.channelId;
    this.emitter.postMessage(data, '*');
    return;
  }

  on(channelId: string, listener: any) {
    if (this.scene === EScene.ELECTRON) {
      this.emitter.on(channelId, listener);
      return
    }

    window.addEventListener('message', (e) => {
      if (e.data.channelId === this.channelId) {
        listener.apply(this, [e.data]);
      }
    });
  }
}

export class RPCServer extends RPCBase{
  private methods = new Map<string, any>();

  constructor(options) {
    super(options);

    this.methods = new Map();
    this.bind();
  }

  bind() {
    this.on(this.channelId, async ({ method, params, requestId }) => {
      const ins = this.methods.get(method);
      const constructorName = ins.constructor.name;
      let finalIns = null;

      if (constructorName === 'Function') {
        finalIns = (params) => new Promise((resolve, reject) => {
          resolve(ins(params));
        });
      } else {
        finalIns = ins;
      }

      try {
        const result = await finalIns(params);
        this.send(this.channelId, { requestId, result });
      } catch(err) {
        this.send(this.channelId, { requestId, result: { error: err.message || err.stack } });
      }
      
    });
  }

  regist(mehtod, ins) {
    this.methods.set(mehtod, ins);
  }
}

export class RPCClient extends RPCBase{
  private callbackMap = new Map<string, any>();

  constructor(options) {
    super(options);

    this.callbackMap = new Map();
    this.bind();
  }

  bind() {
    this.on(this.channelId, this.onCallback.bind(this));
  }

  onCallback(resp) {
    const { result, requestId } = resp;
    const callback = this.callbackMap.get(requestId);

    if (result && requestId && callback) {
      callback(null, result);
      this.callbackMap.delete(requestId);
    }
  }

  async call(method, params = {}) {
    const requestId = Date.now().toString();

    this.send(this.channelId, { method, params, requestId });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`rpc time out, name: ${method}`));
      }, 10 * 1000);

      this.callbackMap.set(requestId, (err, data) => {
        resolve(data);
      });
    });
  }
}