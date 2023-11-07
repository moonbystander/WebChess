package com.example.javawebclass.Service;


import org.springframework.web.socket.WebSocketSession;

import java.util.Map;

public interface WebSocketManager {
    public WebSocketSession get(String identifier);
    public void put(String identifier, WebSocketSession session);
    public void remove(String identifier);
    public Map<String,WebSocketSession> localWebSocketMap();
    default public int size(){
        return localWebSocketMap().size();
    }
    public void sendMessage(String identifier, String message);

}
