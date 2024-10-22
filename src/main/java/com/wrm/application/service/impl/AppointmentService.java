package com.wrm.application.service.impl;

import com.wrm.application.component.enums.AppointmentStatus;
import com.wrm.application.model.Appointment;
import com.wrm.application.dto.AppointmentDTO;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.repository.AppointmentRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.service.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService implements IAppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @Override
    public List<Appointment> getAllAppointment() {
        return appointmentRepository.findAll();
    }

    @Override
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id).orElse(null);
    }

    @Override
    public Appointment createAppointment(AppointmentDTO appointmentDTO) {

        Appointment newAppointment = Appointment.builder()
                .customerId(appointmentDTO.getCustomerId())
                .warehouseId(appointmentDTO.getWarehouseId())
                .appointmentDate(appointmentDTO.getAppointmentDate())
                .status(AppointmentStatus.PENDING)
                .build();

        User sales = userRepository.findById(appointmentDTO.getSalesId())
                .orElseThrow(() -> new DataIntegrityViolationException("User not found"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("User is not a salesman");
        }

        newAppointment.setSalesId(sales.getId());
        return appointmentRepository.save(newAppointment);
    }

    @Override
    public Appointment updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new DataIntegrityViolationException("Appointment not found"));
        appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        appointment.setStatus(appointmentDTO.getStatus());
        return appointmentRepository.save(appointment);
    }

    @Override
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new DataIntegrityViolationException("Warehouse not found"));
        appointment.setDeleted(true);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

}
