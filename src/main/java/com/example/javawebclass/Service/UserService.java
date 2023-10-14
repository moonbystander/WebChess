package com.example.javawebclass.Service;

import com.example.javawebclass.Dao.UserMysql;
import com.example.javawebclass.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    public UserMysql userMysql;

    //用户登录
    public User userLogin(String id, String password){
        return userMysql.getUserByidAndPassword(id,password);
    }

    public User userisExist(String id){
        return userMysql.getUserById(id);
    }

    public User register(String id,String name,String password){
        return userMysql.register(id,name,password);
    }
}
