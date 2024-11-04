package com.wrm.application.service;

import com.wrm.application.dto.AppointmentDTO;
import com.wrm.application.response.appointment.AppointmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface IAppointmentService {

    Page<AppointmentResponse> getAllAppointments(PageRequest pageRequest);

    AppointmentResponse getAppointmentById(Long id) throws Exception;

    Page<AppointmentResponse> getAppointmentByCustomerId(String remoteUser, PageRequest pageRequest);

    AppointmentResponse createAppointment(AppointmentDTO appointmentDTO, String remoteUser);

    AppointmentResponse updateAppointment(Long id, AppointmentDTO appointmentDTO);

    void deleteAppointment(Long id);

    Page<AppointmentResponse> getAppointmentsByWarehouseId(Long id, PageRequest pageRequest);

    AppointmentResponse createAppointmentByCustomer(AppointmentDTO appointmentDTO, String remoteUser);

    Page<AppointmentResponse> getAppointmentBySalesId(String remoteUser, PageRequest pageRequest);

    AppointmentResponse assignAppointment(Long id, AppointmentDTO appointmentDTO);
}
