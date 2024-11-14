package com.wrm.application.service;

import jakarta.mail.MessagingException;

public interface IMailService {

    void sendPasswordResetEmail(String to, String newPassword) throws MessagingException;
}
