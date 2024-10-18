package com.wrm.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class WrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(WrmApplication.class, args);
    }

}
