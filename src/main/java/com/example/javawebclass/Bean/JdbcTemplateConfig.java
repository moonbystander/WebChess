package com.example.javawebclass.Bean;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Configuration
public class JdbcTemplateConfig {

    @Autowired
    private final DataSource dataSource; // 数据源依赖

    public JdbcTemplateConfig(DataSource dataSource) {
        this.dataSource = dataSource;
        try {
            Connection connection=this.dataSource.getConnection();
            System.out.println(connection);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }
    }

    @Bean
    public JdbcTemplate jdbcTemplate() {
        return new JdbcTemplate(dataSource);
    }
}
