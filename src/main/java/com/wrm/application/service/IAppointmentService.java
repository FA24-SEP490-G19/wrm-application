package com.wrm.application.service;

import com.wrm.application.dto.AppointmentDTO;
import com.wrm.application.model.Appointment;

import java.util.List;

public interface IAppointmentService {
    List<Appointment> getAllAppointment();
    Appointment getAppointmentById(Long id);
    Appointment createAppointment(AppointmentDTO appointmentDTO, String remoteUser);
    Appointment updateAppointment(Long id, AppointmentDTO appointmentDTO);
    void deleteAppointment(Long id);
}
