package com.example.javawebclass.Controller;


import com.example.javawebclass.Entity.User;
import com.example.javawebclass.Service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
@Controller
//@RestController
public class HtmlController {

    @Autowired
    public UserService userService;

    @RequestMapping(value = {"/"})
    public String index(){
        return "index.html";
    }

    //登录验证，返回验证结果
    @ResponseBody
    @RequestMapping("/login")
    public String login(HttpServletRequest request,String id,String password) {
        User user=userService.userLogin(id, password);
        if (user != null){
            HttpSession session= request.getSession();
            session.setAttribute("user",user);
            return "true";
        }else {
            return "error";
        }
    }

    @ResponseBody
    @RequestMapping("/register")
    public String register(HttpServletRequest request,@RequestParam("id") String id,@RequestParam("name") String name,
                           @RequestParam("password") String password){
        User user=userService.userisExist(id);
        String ret="error";
        if (user != null){
            ret="error";
        }else{
            ret="true";
        }
        user=userService.register(id,name,password);
        HttpSession session= request.getSession();
        System.out.println("register:"+ret);
        session.setAttribute("user",user);
        return ret;
    }

    @RequestMapping("/room")
    public String room() {
        return "room.html";
    }

    @ResponseBody
    @RequestMapping("/getData")
    public User getData(HttpSession session) {
        User data = (User) session.getAttribute("user");
        System.out.println(data);
        if (data != null) {
            return data;  // 将数据直接响应给客户端
        } else {
            return null;  // 如果数据不存在，则返回相应的提示信息
        }
    }


}
