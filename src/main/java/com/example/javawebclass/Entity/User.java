package com.example.javawebclass.Entity;

import org.springframework.jdbc.core.RowMapper;

import java.io.Serializable;
import java.sql.ResultSet;
import java.sql.SQLException;

public class User implements RowMapper<User>, Serializable {
    private String id;
    private String name;
    private String password;
    private int fightnum;
    private int victorynum;

    public User() {
    }

    public User(String id, String name, String password, int fightnum, int victorynum) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.fightnum = fightnum;
        this.victorynum = victorynum;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getFightnum() {
        return fightnum;
    }

    public void setFightnum(int fightnum) {
        this.fightnum = fightnum;
    }

    public int getVictorynum() {
        return victorynum;
    }

    public void setVictorynum(int victorynum) {
        this.victorynum = victorynum;
    }

    @Override
    public User mapRow(ResultSet rs, int rowNum) throws SQLException {
        User user=new User();
        user.setId(rs.getString("id"));
        user.setName(rs.getString("name"));
        user.setPassword(rs.getString("password"));
        user.setFightnum(rs.getInt("fightnum"));
        user.setVictorynum(rs.getInt("victorynum"));
        return user;
    }
}
