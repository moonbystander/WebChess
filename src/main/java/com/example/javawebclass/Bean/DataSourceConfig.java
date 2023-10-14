package com.example.javawebclass.Bean;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource() {
        // 创建数据源并进行配置
//        return DataSourceBuilder.create()
//                .url("jdbc:mysql://103.153.101.244:3306/chessClass")
//                .username("root")
//                .password("root")
//                .build();
        return DataSourceBuilder.create()
                .url("jdbc:mysql://localhost:3306/chessClass")
                .username("root")
                .password("875428767")
                .build();
    }
}