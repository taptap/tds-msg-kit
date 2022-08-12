import {
  TDS_MESSAGE_TYPE,
  TdsCallback,
  TdsMsg,
  TdsMsgGo,
  TdsMsgMessage,
  TdsMsgSubject,
  ERROR_CODE,
  isValidOrigin,
} from './common';

class TdsMsgServer extends TdsMsgSubject {
  static TdsMsgGo = TdsMsgGo;
  public ready = false;
  private targetOrigin?: string;

  static ERROR_CODE = ERROR_CODE;

  static ServerEventReady = 'onReady';
  static ServerEventMessage = 'onMessage';
  static ServerEventError = 'onError';
  static ServerEventRefreshTicket = 'onRefreshTicket';
  static ServerEventSyncPath = 'onSyncPath';
  static ServerEventAll = 'onAll';

  /**
   * @param host 受信域名 需要 protocol + origin 组成
   * @param iframe 一个用于获取 iframe 的函数
   * @param onError 错误情况 回调
   * @param onReady 准备完成 回调
   * @param onMessage 自定义通讯 回调
   * @param onRefreshTicket 当客户端需要服务端更新 ticket 时使用
   * @param onSyncPath 当客户端通知服务端同步 path 时使用
   */
  constructor(
    private readonly host,
    private iframe: () => HTMLIFrameElement | null,
    {
      onError,
      onReady,
      onMessage,
      onRefreshTicket,
      onSyncPath,
    }: {
      onError?: TdsCallback;
      onReady?: TdsCallback;
      onMessage?: TdsCallback;
      onRefreshTicket?: TdsCallback;
      onSyncPath?: TdsCallback;
    } = {},
  ) {
    super((event) => {
      if (isValidOrigin(event.origin, host)) {
        const msg = event.data;
        this.emit(TdsMsgServer.ServerEventAll, msg);
        switch (msg.type) {
          case TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_READY:
            console.log('[TdsMsgServer]: TapMsgClient 准备就绪');
            this.ready = true;
            if (msg['origin']) {
              if (isValidOrigin(msg['origin'], host)) {
                this.targetOrigin = msg['origin'];
              }
            }
            this.emit(TdsMsgServer.ServerEventReady, msg);
            return;
          case TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_MESSAGE:
            this.emit(TdsMsgServer.ServerEventMessage, msg);
            return;
          case TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_GO:
            console.log('[TdsMsgServer]: 服务端理应不接收 Go');
            return;
          case TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_ERROR:
            this.emit(TdsMsgServer.ServerEventError, msg);
            return;
          case TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_REFRESH_TICKET:
            this.emit(TdsMsgServer.ServerEventRefreshTicket, msg);
            return;
          case TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_SYNC_PATH:
            this.emit(TdsMsgServer.ServerEventSyncPath, msg);
            return;
          default:
        }
      }
    });
    if (onError && typeof onError === 'function') {
      this.on(TdsMsgServer.ServerEventError, onError);
    }
    if (onSyncPath && typeof onSyncPath === 'function') {
      this.on(TdsMsgServer.ServerEventSyncPath, onSyncPath);
    }
    if (onRefreshTicket && typeof onRefreshTicket === 'function') {
      this.on(TdsMsgServer.ServerEventRefreshTicket, onRefreshTicket);
    }
    if (onMessage && typeof onMessage === 'function') {
      this.on(TdsMsgServer.ServerEventMessage, onMessage);
    }
    if (onReady && typeof onReady === 'function') {
      this.on(TdsMsgServer.ServerEventReady, onReady);
    }
  }

  /**
   * iframe 需要绑定的完整网址
   */
  get origin() {
    return `${this.host}/tap-dm/wait`;
  }

  /**
   * 发送消息 message
   * @param msg
   */
  protected sendMessage(msg: TdsMsg) {
    const iframe = this.iframe();
    if (iframe) {
      iframe.contentWindow?.postMessage?.(msg, this.targetOrigin ?? this.host);
    }
  }

  /**
   * 告诉第三方需要前往的地址
   * @param path 需要前往的路由
   * @param ticket 签名，用于验证用户是否有效
   * @param payload 需要携带的额外参数，由双方共同约定
   */
  go(path: string, ticket: string, payload: any) {
    this.sendMessage(new TdsMsgGo(path, ticket, payload));
  }

  /**
   * 发送自定义 msg
   * @param payload
   */
  msg(payload: any) {
    this.sendMessage(new TdsMsgMessage(payload));
  }
}

export default TdsMsgServer;
