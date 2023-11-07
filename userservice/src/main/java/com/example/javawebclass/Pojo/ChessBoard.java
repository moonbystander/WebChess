package com.example.javawebclass.Pojo;

import org.springframework.web.socket.WebSocketSession;

import java.util.Random;

public class ChessBoard {
    public static final int PLAYING=0;//棋局进行中
    public static final int BLACK=-1;//黑胜
    public static final int RED=1;//红胜
    public static final int WAITING=2;//求和中
    public final static int DRAW=3;//和
    public static final String BLACKCOLOR="b";
    public static final String REDCOLOR="r";
    public FightUser[] users=new FightUser[2];
    private String[][] board;
    private int ending=PLAYING;
    private int stepnum=0;

    private String next=REDCOLOR;

    public FightUser[] getUsers() {
        return users;
    }

    public void setUsers(FightUser[] users) {
        this.users = users;
    }

    public int getEnding() {
        return ending;
    }

    public void setEnding(int ending) {
        this.ending = ending;
    }

    public int getStepnum() {
        return stepnum;
    }

    public String getNext() {
        return next;
    }

    public void setNext(String next) {
        this.next = next;
    }

    public void setStepnum(int stepnum) {
        this.stepnum = stepnum;
    }

    public ChessBoard() {
    }

    public ChessBoard(FightUser a,FightUser b){
        this.users=giveColor(a,b);
        this.board=new String[][]{
                new String[]{
                        "b4","b3","b5","b6","b7","b6","b5","b3","b4"
                },
                new String[]{
                        "  ","  ","  ","  ","  ","  ","  ","  ","  "
                } ,
                new String[]{
                        "  ","b2","  ","  ","  ","  ","  ","b2","  "
                },
                new String[]{
                        "b1","  ","b1","  ","b1","  ","b1","  ","b1"
                },
                new String[]{
                        "  ","  ","  ","  ","  ","  ","  ","  ","  "
                } ,
                new String[]{
                        "  ","  ","  ","  ","  ","  ","  ","  ","  "
                } ,
                new String[]{
                        "r1","  ","r1","  ","r1","  ","r1","  ","r1"
                },
                new String[]{
                        "  ","r2","  ","  ","  ","  ","  ","r2","  "
                },
                new String[]{
                        "  ","  ","  ","  ","  ","  ","  ","  ","  "
                } ,
                new String[]{
                        "r4","r3","r5","r6","r7","r6","r5","r3","r4"
                }
        };
    }

    //分配随机颜色
    public static FightUser[] giveColor(FightUser a,FightUser b){
        Random random = new Random();
        int randomNumber = random.nextInt(2);
        FightUser[] ret=new FightUser[2];
        if (randomNumber==0){
            a.setColor("r");
            b.setColor("b");
            ret[0]=a;
            ret[1]=b;
        }else {
            a.setColor("b");
            b.setColor("r");
            ret[0]=b;
            ret[1]=a;
        }
        return ret;
    }

    //验证可否走棋
    public boolean canMoveChess(String id,Step step){
        return true;
    }

    //查看是否轮到此用户行动，用于求和
    public boolean isPlaying(String id){
        for (FightUser f:users) {
            if (f.getId().equals(id) && f.getColor().equals(next)){
                return true;
            }
        }
        return false;
    }

    //走棋
    public void moveChess(String id, Step step) {
        if (this.board[step.getNewy()][step.getNewx()].equals("b7")) {
            //如果落点为将，红胜
            System.out.println("红");
            ending = RED;
        } else if (this.board[step.getNewy()][step.getNewx()].equals("r7")) {
            //如果落点为帅，黑胜
            System.out.println("黑");
            ending = BLACK;
        }
        this.board[step.getNewy()][step.getNewx()] = this.board[step.getOldy()][step.getOldx()];
        this.board[step.getOldy()][step.getOldx()] = "  ";
        switch (next){
            case BLACKCOLOR:
                next=REDCOLOR;
                break;
            case REDCOLOR:
                next=BLACKCOLOR;
                break;
        }
    }

    //用户认输
    public void giveUpTheGame(String id){
        //找到胜利方，并将胜负设置为胜方颜色
        if (!users[0].getId().equals(id)){
            switch (users[0].getColor()){
                case BLACKCOLOR:
                    setEnding(BLACK);
                    break;
                case REDCOLOR:
                    setEnding(RED);
                    break;
            }
        }else {
            switch (users[1].getColor()){
                case BLACKCOLOR:
                    setEnding(BLACK);
                    break;
                case REDCOLOR:
                    setEnding(RED);
                    break;
            }
        }
    }

    //获取对手id
    public String getOtherId(String id){
        if (users[0].getId().equals(id)){
            return users[1].getId();
        }else return users[0].getId();
    }
}
