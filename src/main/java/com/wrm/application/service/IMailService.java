package com.wrm.application.service;

import com.wrm.application.model.Appointment;
import com.wrm.application.model.Rental;
import com.wrm.application.model.Request;
import com.wrm.application.model.User;
import jakarta.mail.MessagingException;
import org.springframework.scheduling.annotation.Async;

import java.io.UnsupportedEncodingException;

public interface IMailService {

    @Async
    void sendPasswordResetEmail(String to, String newPassword) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendRentalExpirationReminders() throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendAppointmentConfirmationEmail(String to, Appointment appointment) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendTaskAssignmentNotification(String to, Appointment appointment) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendAppointmentUpdateNotification(String to, Appointment appointment) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendRentalCreationNotification(String to, Rental rental) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendRequestCreationNotification(String to, Request request) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendRequestUpdateNotification(String to, Request request) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendVerificationEmail(String email, String token) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendPaymentDueNotification(String to, Rental rental) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendOverdueNotification(Rental rental) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendAccountCreationEmail(User user, String password) throws MessagingException, UnsupportedEncodingException;

    @Async
    void sendAppointmentCancellationEmail(String email, Appointment appointment) throws MessagingException, UnsupportedEncodingException;
}
