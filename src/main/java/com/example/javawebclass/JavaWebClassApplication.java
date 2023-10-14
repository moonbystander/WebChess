package com.example.javawebclass;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

//(exclude = {DataSourceAutoConfiguration.class})
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class JavaWebClassApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavaWebClassApplication.class, args);
    }

}
