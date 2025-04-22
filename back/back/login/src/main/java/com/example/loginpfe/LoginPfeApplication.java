package com.example.loginpfe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LoginPfeApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoginPfeApplication.class, args);
    }
}