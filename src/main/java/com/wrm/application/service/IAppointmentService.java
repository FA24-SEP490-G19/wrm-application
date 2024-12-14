package com.wrm.application.service;

import com.wrm.application.dto.AppointmentDTO;
import com.wrm.application.response.appointment.AppointmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface IAppointmentService {

    Page<AppointmentResponse> getAllAppointments(PageRequest pageRequest);

    AppointmentResponse getAppointmentById(Long id) throws Exception;

    Page<AppointmentResponse> getAppointmentByCustomerId(String remoteUser, PageRequest pageRequest) throws Exception;

    AppointmentResponse createAppointment(AppointmentDTO appointmentDTO, String remoteUser) throws Exception;

    AppointmentResponse updateAppointment(Long id, AppointmentDTO appointmentDTO) throws Exception;

    void deleteAppointment(Long id) throws Exception;

    Page<AppointmentResponse> getAppointmentsByWarehouseId(Long id, PageRequest pageRequest);

    AppointmentResponse createAppointmentByCustomer(AppointmentDTO appointmentDTO, String remoteUser) throws Exception;

    Page<AppointmentResponse> getAppointmentBySalesId(String remoteUser, PageRequest pageRequest) throws Exception;

    AppointmentResponse assignAppointment(Long id, AppointmentDTO appointmentDTO) throws Exception;

    Page<AppointmentResponse> getUnassignedAppointments(PageRequest pageRequest);
}
