## IPC 跨 iframe DOM 操作框架

这是一个让一个网页控制另一个网页中的 DOM 元素的工具

核心功能
🎯 主要用途
在父页面中操作子 iframe 页面里的 HTML 元素

实现跨页面边界的 DOM 操作（创建元素、设置属性、绑定事件等）

🔧 三大核心能力
元素创建 - 在子页面创建 div、input 等元素

属性操作 - 设置元素的 value、style 等属性

事件处理 - 绑定点击、输入等事件，并能跨页面响应

🌟 特色功能
透明 API - 使用方式和原生 JavaScript 几乎一样

javascript
const div = document.createElement('div');
div.append(input);
跨域支持 - 通过 postMessage 实现安全通信

异步管理 - 自动处理跨页面操作的等待和顺序

简单示例

```javascript
// 在父页面中控制子页面的 DOM
const button = document.createElement("button");
button.textContent = "点我";
button.onclick = function (e) {
  console.log("按钮被点击了！");
};
document.append(button); // 这个 div 会出现在子 iframe 中
```

技术原理
text
父页面（控制端） ↔ [postMessage 通信] ↔ 子页面（被控制端）
↓ ↓
创建虚拟元素 实际 DOM 操作
发送指令到子页面 执行真实 DOM 操作
接收事件反馈 返回事件数据
适用场景
✅ 微前端架构中的跨应用 DOM 操作

✅ 插件系统中动态创建 UI 组件

✅ 需要在 iframe 中动态生成内容的场景

✅ 跨域页面间的 UI 协作

简单来说
就像用遥控器操作电视：你在父页面（遥控器）按按钮，子页面（电视）就会显示相应的内容。所有 DOM 操作都是跨页面透明进行的，使用者感觉就像在操作本地 DOM 一样。
