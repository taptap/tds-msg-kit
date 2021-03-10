import EventEmitter from 'eventemitter3';
export interface TdsMsg<P = any> {
  type: TDS_MESSAGE_TYPE;
  /**
   * code 错误代码
   */
  code?: number;
  /**
   * time 发出时间
   */
  time: number;
  /**
   * ticket 仅 TAP_MESSAGE_TYPE_GO 携带
   */
  ticket?: string;
  /**
   * path 仅 TAP_MESSAGE_TYPE_GO 携带
   */
  path?: string;
  /**
   * projectId 仅 TAP_MESSAGE_TYPE_GO 携带
   */
  payload?: P;
}

export enum ERROR_CODE {
  TICKET_EXPIRED = 100,
  PERMISSION_DENIED = 101,
}

export type TdsCallback = (tdsMsg: TdsMsg) => void;
/**
 * Tds 消息类型
 */
export enum TDS_MESSAGE_TYPE {
  TAP_MESSAGE_TYPE_READY = 'tdsMsg.ready',
  TAP_MESSAGE_TYPE_GO = 'tdsMsg.go',
  TAP_MESSAGE_TYPE_MESSAGE = 'tdsMsg.message',
  TAP_MESSAGE_TYPE_ERROR = 'tdsMsg.error',
  TAP_MESSAGE_TYPE_REFRESH_TICKET = 'tdsMsg.refreshTicket',
  TAP_MESSAGE_TYPE_SYNC_PATH = 'tdsMsg.syncPath',
}

/**
 * TdsMsg 服务基础类
 */
export class TdsMsgSubject extends EventEmitter {
  constructor(protected readonly fn: (event: MessageEvent<TdsMsg>) => void) {
    super();
    window.addEventListener('message', this.fn, false);
  }
  destroy() {
    window.removeEventListener('message', this.fn);
  }
}

/**
 * TdsMsg 类型基础类
 */
export class TdsMsgBase {
  time = new Date().getTime();
}

/**
 * TdsMsg client 用于要求 server 主动发送 ticket 更新操作时使用
 * 无附加参数
 */
export class TdsMsgRefreshTicket extends TdsMsgBase implements TdsMsg {
  type = TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_REFRESH_TICKET;
}

/**
 * TdsMsg client 用于要求 server 同步路由使用
 * 需要传递 path 信息
 */
export class TdsMsgSyncPath extends TdsMsgBase implements TdsMsg<{ path: string }> {
  type = TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_SYNC_PATH;
  constructor(public payload: { path }) {
    super();
  }
}

/**
 * TdsMsg 准备完成类型
 * 无附加参数
 */
export class TdsMsgReady extends TdsMsgBase implements TdsMsg {
  type = TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_READY;
}

/**
 * TdsMsg 前进类型
 * 需要传递 前往的路径，签名，以及 payload，payload 由双方共同约定
 */
export class TdsMsgGo<T = any> extends TdsMsgBase implements TdsMsg<T> {
  type = TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_GO;
  constructor(public path: string, public ticket: string, public payload: T) {
    super();
  }
}

/**
 * TdsMsg 用于传输数据
 */
export class TdsMsgMessage<T> extends TdsMsgBase implements TdsMsg<T> {
  type = TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_MESSAGE;
  constructor(public payload: T) {
    super();
  }
}

/**
 * TdsMsg 错误类型
 */
export class TdsMsgError<T> extends TdsMsgBase implements TdsMsg<T> {
  type = TDS_MESSAGE_TYPE.TAP_MESSAGE_TYPE_ERROR;

  /**
   * @param code 错误代码
   * @param payload 携带的其他信息
   */
  constructor(public code: number, public payload?: T) {
    super();
  }
}
