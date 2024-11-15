package com.wrm.application.service;

import com.wrm.application.model.Appointment;
import jakarta.mail.MessagingException;

public interface IMailService {

    void sendPasswordResetEmail(String to, String newPassword) throws MessagingException;

    void sendRentalExpirationReminders() throws MessagingException;

    void sendAppointmentConfirmationEmail(String to, String appointmentDetails) throws MessagingException;

    String generateAppointmentDetails(Appointment appointment);
}
