package com.wrm.application.configuration;

import com.wrm.application.security.JwtTokenFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
@EnableWebSecurity
@EnableWebMvc
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final JwtTokenFilter jwtTokenFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(requests -> {
                    requests
                            .requestMatchers(
                                    "/users/register",
                                    "/users/login",
                                    "/users/reset-password",
                                    "/users/verify"
                            )
                            .permitAll()
                            .requestMatchers(GET,
                                    "/warehouses").permitAll()
                            .requestMatchers(GET,
                                    "/warehouses/payment-requests/confirm/user").permitAll()
                            .requestMatchers(POST,
                                    "/warehouses/payment-requests").permitAll()
                            .requestMatchers(POST,
                                    "/warehouses/auto-create-payment").permitAll()
                            .requestMatchers(GET,
                                    "/warehouses/**").permitAll()
                            .requestMatchers(GET,
                                    "/lots/{lotId}").permitAll()
                            .requestMatchers(GET,
                                    "/lots").permitAll()
                            .anyRequest().authenticated();
                });
        return http.build();
    }
}
