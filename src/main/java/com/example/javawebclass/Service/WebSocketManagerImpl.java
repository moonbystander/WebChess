package com.example.javawebclass.Service;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


public class WebSocketManagerImpl implements WebSocketManager {

    //存放所有的websocket连接
    private ConcurrentHashMap<String, WebSocketSession> WEBMANAGER=new ConcurrentHashMap<>();

    @Override
    public WebSocketSession get(String identifier) {
        Map<String, WebSocketSession> map=localWebSocketMap();
        return map.get(identifier);
    }

    @Override
    public void put(String identifier, WebSocketSession session) {
        Map<String, WebSocketSession> map=localWebSocketMap();
        map.put(identifier, session);
    }

    @Override
    public void remove(String identifier) {
        Map<String, WebSocketSession> map=localWebSocketMap();
        map.remove(identifier);
    }

    @Override
    public Map<String, WebSocketSession> localWebSocketMap() {
        return WEBMANAGER;
    }

    @Override
    public void sendMessage(String identifier, String message) {
        WebSocketSession session=get(identifier);
        try {
            session.sendMessage(new TextMessage(message));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
