// ipc-messenger.js
export class IPCPostMessage {
  constructor(targetOrigin = "*", channel = "default") {
    this.targetOrigin = targetOrigin;
    this.channel = channel;
    this.listeners = new Map();
    this.messageId = 0;
    this.isPause = false;

    // 监听消息
    window.addEventListener("message", this.handleMessage.bind(this));
  }

  /**
   * 发送消息到目标窗口
   * @param {Window} targetWindow - 目标窗口
   * @param {string} type - 消息类型
   * @param {any} data - 消息数据
   * @param {Function} callback - 可选回调
   * @returns {Promise} - 返回Promise（如果使用异步）
   */
  send(targetWindow, type, data, callback) {
    return new Promise((resolve, reject) => {
      const messageId = ++this.messageId;

      const message = {
        channel: this.channel,
        type,
        data,
        messageId,
        timestamp: Date.now()
      };

      // 如果需要回调，注册监听器
      if (callback) {
        this.listeners.set(messageId, {
          callback: callback || resolve,
          timeout: setTimeout(() => {
            this.listeners.delete(messageId);
            reject(new Error("IPC timeout"));
          }, 5000)
        });
      }

      // 发送消息
      targetWindow.postMessage(message, this.targetOrigin);
    });
  }

  /**
   * 发送响应消息
   * @param {Window} targetWindow - 目标窗口
   * @param {Object} originalMessage - 原始消息
   * @param {any} responseData - 响应数据
   * @param {boolean} success - 是否成功
   */
  sendResponse(targetWindow, originalMessage, responseData, success = true) {
    const response = {
      channel: this.channel,
      type: "response",
      responseTo: originalMessage.messageId,
      data: responseData,
      success,
      messageId: ++this.messageId,
      timestamp: Date.now()
    };

    targetWindow.postMessage(response, this.targetOrigin);
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(event) {
    // 验证来源
    if (
      (this.targetOrigin !== "*" && event.origin !== this.targetOrigin) ||
      this.isPause
    ) {
      return;
    }

    const message = event.data;

    // 检查是否是本通道的消息
    if (!message || message.channel !== this.channel) {
      return;
    }

    // 如果是响应消息
    if (message.type === "response" && message.responseTo) {
      const listener = this.listeners.get(message.responseTo);
      if (listener) {
        clearTimeout(listener.timeout);
        listener.callback(message.data);
        this.listeners.delete(message.responseTo);
      }
      return;
    }

    // 触发消息事件
    this.emit("message", {
      type: message.type,
      data: message.data,
      source: event.source,
      origin: event.origin,
      respond: (responseData, success = true) => {
        if (event.source) {
          this.sendResponse(event.source, message, responseData, success);
        }
      }
    });
  }

  /**
   * 事件监听
   */
  on(event, callback) {
    if (!this._events) this._events = {};
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
  }

  off(event, callback) {
    if (!this._events || !this._events[event]) return;
    const index = this._events[event].indexOf(callback);
    if (index > -1) this._events[event].splice(index, 1);
  }

  emit(event, data) {
    if (!this._events || !this._events[event]) return;
    this._events[event].forEach((callback) => callback(data));
  }

  async pauseTracking(callback) {
    this.isPause = true;
    try {
      await callback();
    } finally {
      this.isPause = false;
    }
  }

  /**
   * 清理资源
   */
  destroy() {
    window.removeEventListener("message", this.handleMessage.bind(this));
    this.listeners.forEach((listener) => clearTimeout(listener.timeout));
    this.listeners.clear();
  }
}
