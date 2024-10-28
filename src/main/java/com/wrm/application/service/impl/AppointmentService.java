package com.wrm.application.service.impl;

import com.wrm.application.constant.enums.AppointmentStatus;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.Appointment;
import com.wrm.application.dto.AppointmentDTO;
import com.wrm.application.model.User;
import com.wrm.application.model.Warehouse;
import com.wrm.application.repository.AppointmentRepository;
import com.wrm.application.repository.UserRepository;
import com.wrm.application.repository.WarehouseRepository;
import com.wrm.application.response.appointment.AppointmentResponse;
import com.wrm.application.service.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppointmentService implements IAppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    public Page<AppointmentResponse> getAllAppointments(PageRequest pageRequest) {
        return appointmentRepository.findAll(pageRequest).map(appointment -> {
            return AppointmentResponse.builder()
                    .id(appointment.getId())
                    .customerId(appointment.getCustomer().getId())
                    .salesId(appointment.getSales().getId())
                    .warehouseId(appointment.getWarehouse().getId())
                    .appointmentDate(appointment.getAppointmentDate())
                    .status(appointment.getStatus())
                    .createdDate(appointment.getCreatedDate())
                    .lastModifiedDate(appointment.getLastModifiedDate())
                    .build();
        });
    }

    @Override
    public AppointmentResponse getAppointmentById(Long id) throws Exception{
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Appointment not found"));
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .customerId(appointment.getCustomer().getId())
                .salesId(appointment.getSales().getId())
                .warehouseId(appointment.getWarehouse().getId())
                .appointmentDate(appointment.getAppointmentDate())
                .status(appointment.getStatus())
                .createdDate(appointment.getCreatedDate())
                .lastModifiedDate(appointment.getLastModifiedDate())
                .build();
    }

    @Override
    public Page<AppointmentResponse> getAppointmentByCustomerId(String remoteUser, PageRequest pageRequest) {
        User user = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataIntegrityViolationException("User not found"));
        return appointmentRepository.findByCustomerId(user.getId(), pageRequest).map(appointment -> {
            return AppointmentResponse.builder()
                    .id(appointment.getId())
                    .customerId(appointment.getCustomer().getId())
                    .salesId(appointment.getSales().getId())
                    .warehouseId(appointment.getWarehouse().getId())
                    .appointmentDate(appointment.getAppointmentDate())
                    .status(appointment.getStatus())
                    .createdDate(appointment.getCreatedDate())
                    .lastModifiedDate(appointment.getLastModifiedDate())
                    .build();
        });
    }

    @Override
    public AppointmentResponse createAppointment(AppointmentDTO appointmentDTO, String remoteUser) {

        Appointment newAppointment = Appointment.builder()
                .appointmentDate(appointmentDTO.getAppointmentDate())
                .status(AppointmentStatus.PENDING)
                .build();

        User customer = userRepository.findById(appointmentDTO.getCustomerId())
                .orElseThrow(() -> new DataIntegrityViolationException("User not found"));
        if(customer.getRole().getId() != 1){
            throw new DataIntegrityViolationException("User is not a customer");
        }
        newAppointment.setCustomer(customer);

        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataIntegrityViolationException("User not found"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("User is not a salesman");
        }
        newAppointment.setSales(sales);

        Warehouse warehouse = warehouseRepository.findById(appointmentDTO.getWarehouseId())
                .orElseThrow(() -> new DataIntegrityViolationException("Warehouse not found"));
        newAppointment.setWarehouse(warehouse);

        appointmentRepository.save(newAppointment);
        return AppointmentResponse.builder()
                .id(newAppointment.getId())
                .customerId(newAppointment.getCustomer().getId())
                .salesId(newAppointment.getSales().getId())
                .warehouseId(newAppointment.getWarehouse().getId())
                .appointmentDate(newAppointment.getAppointmentDate())
                .status(newAppointment.getStatus())
                .createdDate(newAppointment.getCreatedDate())
                .lastModifiedDate(newAppointment.getLastModifiedDate())
                .build();
    }

    @Override
    public AppointmentResponse updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new DataIntegrityViolationException("Appointment not found"));
        appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        appointment.setStatus(appointmentDTO.getStatus());

        appointmentRepository.save(appointment);
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .customerId(appointment.getCustomer().getId())
                .salesId(appointment.getSales().getId())
                .warehouseId(appointment.getWarehouse().getId())
                .appointmentDate(appointment.getAppointmentDate())
                .status(appointment.getStatus())
                .createdDate(appointment.getCreatedDate())
                .lastModifiedDate(appointment.getLastModifiedDate())
                .build();
    }

    @Override
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new DataIntegrityViolationException("Warehouse not found"));
        appointment.setDeleted(true);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    @Override
    public Page<AppointmentResponse> getAppointmentsByWarehouseId(Long id, PageRequest pageRequest) {
        return appointmentRepository.findByWarehouseId(id, pageRequest).map(appointment -> {
            return AppointmentResponse.builder()
                    .id(appointment.getId())
                    .customerId(appointment.getCustomer().getId())
                    .salesId(appointment.getSales().getId())
                    .warehouseId(appointment.getWarehouse().getId())
                    .appointmentDate(appointment.getAppointmentDate())
                    .status(appointment.getStatus())
                    .createdDate(appointment.getCreatedDate())
                    .lastModifiedDate(appointment.getLastModifiedDate())
                    .build();
        });
    }
}
