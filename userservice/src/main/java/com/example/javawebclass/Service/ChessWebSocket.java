package com.example.javawebclass.Service;

import com.example.javawebclass.Pojo.ChessBoard;
import com.example.javawebclass.Pojo.FightUser;
import com.example.javawebclass.Pojo.ProtocolData;
import com.example.javawebclass.Pojo.Step;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

//连接处理器，当ws请求时使用通过这个建立连接并存到manager中
public class ChessWebSocket extends TextWebSocketHandler {

    public static WebSocketManagerImpl webSocketManager=new WebSocketManagerImpl();
    public static String CONNECT="0";
    public static String PREPARE="1";
    public static String PLAY="2";
    public static String END="3";
    public static String DISCONNECT="4";

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 处理接收到的消息
        String payload = message.getPayload();
        // 进行相应的处理逻辑
        System.out.println(payload);
        //使用jackson库解析json字符串
        ObjectMapper objectMapper = new ObjectMapper();
        ProtocolData data=objectMapper.readValue(payload, ProtocolData.class);
        JsonNode result = data.getResult();
        Map<String,Object> map=session.getAttributes();
        String id;
        WebSocketSession other;
        ChessBoard board;
        switch (data.getOperation()){
            case "111":
                //接收到客户端的连接请求，若此用户号已连接，则关闭非法连接，未连接，则将连接存放到websocket管理器中,将状态设置为0：连接
                id=result.get("user").get("id").asText();
                if (webSocketManager.get(id) != null){
                    ErrorHappen(session,"{\"msg\":\"该账号已上线，若非本人操作请立刻联系管理员修改密码！\"}");
                    session.close();
                    break;
                }
                map.put("id",id);
                map.put("name",result.get("user").get("name").asText());
                map.put("state",CONNECT);
                webSocketManager.put(id,session);
                System.out.println("ws连接已建立:"+id);
                break;
            case "112":
                //接收到客户端的准备请求，将session转位准备状态,
                if (!map.get("state").equals(PLAY) && !map.get("state").equals(PREPARE)){
                    map.put("state",PREPARE);
                    //遍历所有session，找到其他准备状态的连接后将其拉入对局
                    Map<String,WebSocketSession> webMap=webSocketManager.localWebSocketMap();
                    for (WebSocketSession value:webMap.values()) {
                        //找到对手
                        if (value != session && value.getAttributes().get("state").equals(PREPARE)){
                            //创建棋盘开始对局
                            FightUser a=new FightUser((String) session.getAttributes().get("id"));
                            a.setName((String) session.getAttributes().get("name"));
                            FightUser b=new FightUser((String) value.getAttributes().get("id"));
                            b.setName((String) value.getAttributes().get("name"));
                            //分颜色，并初始化棋盘
                            board=new ChessBoard(a,b);
                            value.getAttributes().put("board",board);
                            map.put("board",board);
                            value.getAttributes().put("state",PLAY);
                            map.put("state",PLAY);
                            startChess(session,a,b);
                            startChess(value,b,a);
                            break;
                        }
                    }
                }else {
                    ErrorHappen(session,"{\"msg\":\"已准备或已对局\"}");
                }
                break;
            case "212":
                //接收到走棋请求,进行走棋判定
                id= (String) map.get("id");
                board= (ChessBoard) map.get("board");
                //对局不处于正常进行的状态,请求无效
                if (board.getEnding() != ChessBoard.PLAYING){
                    break;
                }
                Step step=objectMapper.treeToValue(result.get("step"),Step.class);
                if (board.canMoveChess(id,step)){
                    board.moveChess(id,step);
                    //向双方同步走棋信息
                    SuccessMoveChess(webSocketManager.get(board.users[0].getId()), step,board.getEnding());
                    SuccessMoveChess(webSocketManager.get(board.users[1].getId()), step, board.getEnding());
                }else {
                    //向来源发送重走信息
                    ErrorStep(session);
                }
                break;
            case "215":
                //test
                System.out.println("收到求和请求215");

                //收到求和发起请求
                id= (String) map.get("id");
                board= (ChessBoard) map.get("board");
                //对局不处于正常进行的状态,请求无效
                if (board.getEnding() != ChessBoard.PLAYING){
                    break;
                }
                //求和只能在自己回合内进行
                if(!board.isPlaying(id) ){
                    break;
                }
                //接收到求和请求，中止棋局
                board.setEnding(ChessBoard.WAITING);
                //找到对手的连接，转发求和请求
                Drawthegame(webSocketManager.get(board.getOtherId(id)));

                //test
                System.out.println("转发求和");
                break;
            case "217":
                //test
                System.out.println("217");

                id= (String) map.get("id");
                board= (ChessBoard) map.get("board");
                //对局不处于等待求和的状态,请求无效
                if (board.getEnding() != ChessBoard.WAITING){
                    break;
                }
//                String draw=objectMapper.treeToValue(result.get("draw"),String.class);
                boolean draw= result.get("res").asBoolean();
                if (draw){
                    board.setEnding(ChessBoard.DRAW);
                    //发送和棋通知，通知双方对局结束  321
                    EndChess(webSocketManager.get(board.getUsers()[0].getId()),ChessBoard.DRAW ,"对局结束了");
                    EndChess(webSocketManager.get(board.getUsers()[1].getId()),ChessBoard.DRAW ,"对局结束了");
                }else {
                    //将棋盘状态重置为进行中，下次接收到走棋信息即可正常走棋
                    board.setEnding(ChessBoard.PLAYING);
                    //通知求和发起方，求和请求被拒绝
                    RejectDraw(webSocketManager.get(board.getOtherId(id)));
                }
                break;
            case "218":
                //收到认输信息
                id= (String) map.get("id");
                board= (ChessBoard) map.get("board");
                //非对局中或求和中，非法，不处理请求
                if (!(board.getEnding() == ChessBoard.PLAYING || board.getEnding() == ChessBoard.WAITING)){
                    break;
                }
                //设置棋局状态
                board.giveUpTheGame(id);
                //同步胜负信息
                EndChess(webSocketManager.get(board.getUsers()[0].getId()), board.getEnding(),"对局结束了");
                EndChess(webSocketManager.get(board.getUsers()[1].getId()), board.getEnding(),"对局结束了");
                break;
        }

    }



    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        super.afterConnectionEstablished(session);
    }

    //当连接关闭时，将连接从管理列表中删除
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {

        if (webSocketManager.localWebSocketMap().containsValue(session)){
            //如果有正在进行的对局，直接判负
            String id= (String) session.getAttributes().get("id");
            ChessBoard board= (ChessBoard) session.getAttributes().get("board");
            //检测棋局状态
            if (session.getAttributes().get("state") == PLAY){
                board.giveUpTheGame(id);
                EndChess(webSocketManager.get(board.getOtherId(id)), board.getEnding(), "对方放弃了对局" );
            }
            webSocketManager.remove((String) session.getAttributes().get("id"));
        }
        System.out.println("ws连接已断开:"+session.getAttributes().get("id"));
    }

    //发送对局开始数据包：221，向双方发送颜色 修改：增加对手信息，颜色、名字、id 完成，待测试
    public void startChess(WebSocketSession session,FightUser self,FightUser other){
        ChessBoard board= (ChessBoard) session.getAttributes().get("board");
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNodeFactory nodeFactory = JsonNodeFactory.instance;
            JsonNode jsonNode1 = objectMapper.valueToTree(self);
            JsonNode jsonNode2 = objectMapper.valueToTree(other);
            // 创建一个空的 ObjectNode 对象
            ObjectNode objectNode = nodeFactory.objectNode();
            // 将 jsonNode1 添加到组合节点中
            objectNode.set("self", jsonNode1);
            // 将 jsonNode2 添加到组合节点中
            objectNode.set("other", jsonNode2);

            ProtocolData data=new ProtocolData("221",objectNode);

            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(data)));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    //错误走棋，要求重发 224
    public void ErrorStep(WebSocketSession session){
        ProtocolData data=new ProtocolData("224");
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String json=objectMapper.writeValueAsString(data);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    //正确走棋，同步走棋信息 223 ,将棋局状态----红胜、黑胜、和局、进行中一起发送
    public void SuccessMoveChess(WebSocketSession session,Step step,int ending){
        ProtocolData data=new ProtocolData("223");
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            //走棋信息 --> step,棋盘胜负 --> board.ending
            JsonNodeFactory nodeFactory = JsonNodeFactory.instance;
            JsonNode jsonNode1 = objectMapper.valueToTree(step);
            JsonNode jsonNode2 = objectMapper.valueToTree(ending);


            // 创建一个空的 ObjectNode 对象
            ObjectNode objectNode = nodeFactory.objectNode();

            // 将 jsonNode1 添加到组合节点中
            objectNode.set("step", jsonNode1);
            // 将 jsonNode2 添加到组合节点中
            objectNode.set("ending", jsonNode2);

            data.setResult(objectNode);
            String json=objectMapper.writeValueAsString(data);
            session.sendMessage(new TextMessage(json));
            if (ending != ChessBoard.PLAYING && ending != ChessBoard.WAITING ){
                session.getAttributes().put("state",DISCONNECT);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    //转发求和，226 ,转发求和请求
    public void Drawthegame(WebSocketSession session){
        ProtocolData data=new ProtocolData("226");
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String json=objectMapper.writeValueAsString(data);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    //求和请求被拒绝 228
    public void RejectDraw(WebSocketSession session){
        ProtocolData data=new ProtocolData("228");
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            String json=objectMapper.writeValueAsString(data);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    //棋局直接结束，非走棋引起的结束：认输、求和、超时 321 -1黑，1红，3和
    //直接从result获取值
    public void EndChess(WebSocketSession session,int ending,String text){
        ProtocolData data=new ProtocolData("321");
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            //ending结束信息，text提示文本
            JsonNodeFactory nodeFactory = JsonNodeFactory.instance;
            JsonNode jsonNode1 = objectMapper.valueToTree(text);
            JsonNode jsonNode2 = objectMapper.valueToTree(ending);


            // 创建一个空的 ObjectNode 对象
            ObjectNode objectNode = nodeFactory.objectNode();

            // 将 jsonNode1 添加到组合节点中
            objectNode.set("text", jsonNode1);
            // 将 jsonNode2 添加到组合节点中
            objectNode.set("ending", jsonNode2);

            data.setResult(objectNode);
            String json=objectMapper.writeValueAsString(data);
            session.sendMessage(new TextMessage(json));
            session.getAttributes().put("state",DISCONNECT);

        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    //错误操作：126
    public void ErrorHappen(WebSocketSession session,String msg){

        ObjectMapper objectMapper = new ObjectMapper();
        try {
            ProtocolData data=new ProtocolData("126",objectMapper.readTree(msg));
            String json=objectMapper.writeValueAsString(data);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }



}
