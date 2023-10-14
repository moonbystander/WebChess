// 创建WebSocket连接
const socket = new WebSocket("ws://localhost:8099/websocket");

// 连接建立时触发
socket.onopen = function(event) {
    // 发送消息到服务器
    console.log("WebSocket连接已建立");
    let data={
        protocol:"ws",
        operation:0
    }
    socket.send(JSON.stringify(data));
};

// 接收到服务器发送的消息时触发
socket.onmessage = function(event) {
    const message = event.data;
    console.log("收到服务器消息: " + message);
};

// 发生错误时触发
socket.onerror = function(event) {
    console.error("WebSocket错误:", event);
};

// 连接关闭时触发
socket.onclose = function(event) {
    console.log("WebSocket连接已关闭");
};

// 当页面关闭或离开时关闭WebSocket连接
window.addEventListener("beforeunload", function() {
    socket.close();
});