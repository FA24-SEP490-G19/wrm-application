package com.wrm.application.service;

import com.wrm.application.model.Appointment;
import com.wrm.application.model.Rental;
import com.wrm.application.model.Request;
import jakarta.mail.MessagingException;
import org.springframework.scheduling.annotation.Async;

public interface IMailService {

    @Async
    void sendPasswordResetEmail(String to, String newPassword) throws MessagingException;

    @Async
    void sendRentalExpirationReminders() throws MessagingException;

    @Async
    void sendAppointmentConfirmationEmail(String to, Appointment appointment) throws MessagingException;

    @Async
    void sendTaskAssignmentNotification(String to, Appointment appointment) throws MessagingException;

    @Async
    void sendAppointmentUpdateNotification(String to, Appointment appointment) throws MessagingException;

    @Async
    void sendRentalCreationNotification(String to, Rental rental) throws MessagingException;

    @Async
    void sendRentalStatusUpdateNotification(String to, Rental rental) throws MessagingException;

    @Async
    void sendRequestCreationNotification(String to, Request request) throws MessagingException;

    @Async
    void sendRequestUpdateNotification(String to, Request request) throws MessagingException;

    @Async
    void sendVerificationEmail(String email, String token) throws MessagingException;

    @Async
    void sendPaymentDueNotification(String to, Rental rental) throws MessagingException;
}
