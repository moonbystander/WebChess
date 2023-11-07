package com.example.javawebclass.Dao;

import com.example.javawebclass.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.util.*;

@Component
public class UserMysql {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("${usertable}")
    public String table;

    public String hasaccount(String id,String password){
        String sql="";
        sql = "select * from "+table+" where id = \""+id+"\" and password = \"" +password +"\"" ;
        List<Map<String, Object>> list =  jdbcTemplate.queryForList(sql);
        User user=null;
        try {
            user=jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<User>(User.class));
        }catch (Exception e){
            e.printStackTrace();
        }
        return user!=null?"Y":"N";
    }


    public User getUserByidAndPassword(String id,String password){
        String sql="";
        sql = "select * from "+table+" where id = \""+id+"\" and password = \"" +password +"\"" ;
//        List<Map<String, Object>> list =  jdbcTemplate.queryForList(sql);
        User user=null;
        try {
            user=jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<User>(User.class));
        }catch (Exception e){
            e.printStackTrace();
        }
        return user;
    }
    public User getUserById(String id){
        String sql="";
        sql = "select * from "+table+" where id = \""+id+"\"";
        User user=null;
        try {
            user=jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<User>(User.class));
            return user;
        }catch (Exception e){
            System.out.println("数据库无此id，允许注册");
            return null;
        }
    }

    public User register(String id,String name ,String password){
        String sql = "INSERT into "+table+" ( id,name, password) VALUES(?,?,?);";
        int update = 0;
        if (id != null && !id.equals("")){
            update = jdbcTemplate.update(sql,id, name, password);
        }
        return this.getUserById(id);
    }

    public boolean hasid(String id){
        String sql = "SELECT * FROM "+table+" WHERE id = ?";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, id);
        if (rows.size() > 0) {
            return true;
        }
        return false;
    }

    public int addaccount(String id,String name ,String password){
        String sql = "INSERT into "+table+" ( id,name, password) VALUES(?,?,?);";
        int update = 0;
        if (id != null && !id.equals("")){
            update = jdbcTemplate.update(sql,id, name, password);
        }
        return update;
    }

    public int updateaccount(String id,String name,String password) {
        String sql = "UPDATE "+table+" SET name=? ,password=? WHERE id=?;";
        int update = 0;
        if (id != null && !id.equals("")){
            update = jdbcTemplate.update(sql, name,password,id);
        }
        return update;
    }

    public int deleteaccount(String id){
        String sql= "DELETE FROM "+table+" where id=?;";
        int update = 0;
        if (id != null && !id.equals("")){
            update = jdbcTemplate.update(sql, id);
        }
        return update;
    }

    public List<User> selectacounts(){
        String sql = "SELECT * FROM "+table+";";
        List<Map<String,Object>> list;
        LinkedList<User> usersLinkedList ;
        list=new LinkedList<Map<String, Object>>();
        try {
            list=jdbcTemplate.queryForList(sql);
        }catch (Exception e){
            e.printStackTrace();
            list=null;
        }
        usersLinkedList = new LinkedList<User>();
        if (list != null) {
            for (Map<String, Object> map : list) {
                Set<Map.Entry<String, Object>> entries = map.entrySet();
                if (entries != null) {
                    Iterator<Map.Entry<String, Object>> iterator = entries.iterator();
                    User user;
                    Object[] obj=new Object[5];
                    int i = 0;
                    while (iterator.hasNext()) {
                        Map.Entry<String, Object> entry = (Map.Entry<String, Object>) iterator.next();
                        Object key = entry.getKey();
                        Object value = entry.getValue();
                        obj[i]=value;
                        i++;
                    }
                    user = new User((String) obj[0],(String) obj[1],(String) obj[2],(int) obj[3],(int)obj[4]);
                    usersLinkedList.add(user);
                }
            }
        }
        return usersLinkedList;
    }

    public List<User> selectacount(String name){
        String sql = "SELECT * FROM "+table+" WHERE name=?;";
        List<Map<String,Object>> list;
        LinkedList<User> usersLinkedList;
        list=new LinkedList<Map<String, Object>>();
        try {
            list=jdbcTemplate.queryForList(sql,name);
        }catch (Exception e){
            e.printStackTrace();
            list=null;
        }
        usersLinkedList = new LinkedList<User>();
        if (list != null) {
            for (Map<String, Object> map : list) {
                Set<Map.Entry<String, Object>> entries = map.entrySet();
                if (entries != null) {
                    Iterator<Map.Entry<String, Object>> iterator = entries.iterator();
                    User user;
                    Object[] obj=new Object[5];
                    int i = 0;
                    while (iterator.hasNext()) {
                        Map.Entry<String, Object> entry = (Map.Entry<String, Object>) iterator.next();
                        Object key = entry.getKey();
                        Object value = entry.getValue();
                        obj[i]=value;
                        i++;
                    }
                    user = new User((String) obj[0],(String) obj[1],(String) obj[2],(int) obj[3],(int)obj[4]);
                    usersLinkedList.add(user);
                }
            }
        }
        return usersLinkedList;
    }

    //修改对战场数
    public int updatefight(String id,int addnum) {
        String sql = "UPDATE "+table+" SET fightnum = fightnum + ? WHERE id=?;";
        int update = 0;
        update = jdbcTemplate.update(sql, addnum ,id);
        return update;
    }

    //修改胜利场数
    public int updatevictory(String id,int addnum) {
        String sql = "UPDATE "+table+" SET victory = tictory + ? WHERE id=?;";
        int update = 0;
        update = jdbcTemplate.update(sql, addnum,id);
        return update;
    }

}
