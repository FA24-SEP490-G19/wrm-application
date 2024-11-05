package com.wrm.application.repository;

import com.wrm.application.model.Token;
import com.wrm.application.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TokenRepository extends JpaRepository<Token, Long> {
    List<Token> findByUser(User user);
    Token findByToken(String token);
}
