package com.wrm.application.service;

import com.wrm.application.model.Token;
import com.wrm.application.model.User;
import org.springframework.stereotype.Service;

@Service
public interface ITokenService {
    Token addToken(User user, String token);
}
