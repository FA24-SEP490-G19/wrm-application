package com.wrm.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(WrmApplication.class, args);
    }

}
