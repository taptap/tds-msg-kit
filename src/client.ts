import {
  TDS_MESSAGE_TYPE,
  TdsCallback,
  TdsMsg,
  TdsMsgError,
  TdsMsgMessage,
  TdsMsgReady,
  TdsMsgSubject,
  TdsMsgRefreshTicket,
  TdsMsgSyncPath,
  ERROR_CODE,
  isValidOrigin,
  SyncPathPayload,
} from './common';

class TdsMsgClient extends TdsMsgSubject {
  static ClientReady = TdsMsgReady;
  static ClientError = TdsMsgError;
  static ClientMsg = TdsMsgMessage;
  static ClientRefreshTicket = TdsMsgRefreshTicket;
  static ClientSyncPath = TdsMsgSyncPath;

  static ERROR_CODE = ERROR_CODE;

  static ClientEventGo = 'onGo';
  static ClientEventMessage = 'onMessage';

  /**
   * 通讯方法，不建议暴露
   * @param data
   * @protected
   */
  protected sendMessage<T = any> (data: TdsMsgReady | TdsMsgError<T>) {
    window.parent.postMessage(data, this.tdsOrigin);
  }

  /**
   * @param tdsOrigin tds 的域名，通常是 http://developer.taptap.com ,测试域名需向 DC 申请
   * @param onGo 当触发前往操作时的回调
   * @param onMessage 当 server 发送自定义 data 事件
   */
  constructor (
    private readonly tdsOrigin: string,
    {
      onGo,
      onMessage,
    }: {
      onGo?: (tdsMsg: TdsMsg) => void;
      onMessage?: TdsCallback;
    } = {},
  ) {
    super((tdsMsgEvent) => {
      let origin = tdsMsgEvent.origin;
      if (!isValidOrigin(origin, tdsOrigin)) {
        console.warn(`[TdsMsgClient]: 试图在非 Tds 域名下接收数据, origin: ${origin}, 目标 Tds Origin: ${tdsOrigin}`);
        return;
      }
      if (!this.ready) {
        console.warn(`[TdsMsgClient]: 子页尚未初始化完毕`);
        return;
      }
      let msg = tdsMsgEvent.data;
      switch (msg.type) {
        case TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_ERROR:
          console.warn(`[TdsMsgClient]: tdsClient 理应不接受error事件`);
          return;
        case TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_GO:
          if (!msg.path) {
            console.warn(`[TdsMsgClient]: 跳转必须包含path`);
            return;
          }
          this.emit(TdsMsgClient.ClientEventGo, msg);
          return;
        case TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_MESSAGE:
          this.emit(TdsMsgClient.ClientEventMessage, msg);
          break;
        case TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_READY:
          console.warn(`[TdsMsgClient]: tdsClient 理应不接受Ready事件`);
          break;
        default:
          return;
      }
    });
    if (onGo && typeof onGo === 'function') {
      this.on(TdsMsgClient.ClientEventGo, onGo);
    }
    if (onMessage && typeof onMessage === 'function') {
      this.on(TdsMsgClient.ClientEventMessage, onMessage);
    }
  }

  protected ready = false;

  /**
   * 向 DC 告知自己已经准备完成
   * @param currentOrigin 当前域名，通常情况下无需指定，仅当 server 使用通配符的时候需要 client 向其汇报准确的 origin
   */
  setReady (currentOrigin?: string) {
    this.ready = true;
    this.sendMessage(new TdsMsgClient.ClientReady(currentOrigin));
  }

  /**
   * 向 DC 告知错误情况
   * @param code 错误编码，需要与 DC 约定
   * @param payload 携带的错误信息，可选
   */
  setError (code: number, payload = {}) {
    this.sendMessage(new TdsMsgClient.ClientError(code, payload));
  }

  /**
   * 用于主动向服务端交换数据使用
   * @param payload
   */
  sendMsg (payload: any) {
    this.sendMessage(new TdsMsgClient.ClientMsg(payload));
  }

  /**
   * 告诉服务端需要同步的路径
   * @param path
   * @param options
   */
  syncPath (path: string, options?: SyncPathPayload['options']) {
    this.sendMessage(new TdsMsgClient.ClientSyncPath({ path, options }));
  }

  /**
   * 用于主动要求服务端更新 ticket 使用
   */
  refreshTicket () {
    this.sendMessage(new TdsMsgClient.ClientRefreshTicket());
  }
}

export default TdsMsgClient;
