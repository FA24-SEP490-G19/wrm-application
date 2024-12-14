package com.wrm.application.service.impl;

import com.wrm.application.model.Token;
import com.wrm.application.model.User;
import com.wrm.application.repository.TokenRepository;
import com.wrm.application.security.JwtTokenUtil;
import com.wrm.application.service.ITokenService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TokenService implements ITokenService {
    private static final int MAX_TOKENS = 3;
    @Value("${jwt.expiration}")
    private int expiration;

    private final TokenRepository tokenRepository;
    private final JwtTokenUtil jwtTokenUtil;

    @Transactional
    @Override
    public Token addToken(User user, String token) {
        List<Token> userTokens = tokenRepository.findByUser(user);
        int tokenCount = userTokens.size();
        if (tokenCount >= MAX_TOKENS) {
            Token tokenToDelete = userTokens.get(0);
            tokenRepository.delete(tokenToDelete);
        }
        long expirationInSeconds = expiration;
        LocalDateTime expirationDateTime = LocalDateTime.now().plusSeconds(expirationInSeconds);
        Token newToken = Token.builder()
                .user(user)
                .token(token)
                .revoked(false)
                .expired(false)
                .tokenType("Bearer")
                .expirationDate(expirationDateTime)
                .build();
        tokenRepository.save(newToken);
        return newToken;
    }

    @Transactional
    @Override
    public void revokeToken(String token) {
        Token existingToken = tokenRepository.findByToken(token);
        if (existingToken != null) {
            existingToken.setRevoked(true);
            tokenRepository.save(existingToken);
        }
    }
}
