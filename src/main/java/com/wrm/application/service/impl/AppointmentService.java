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
import com.wrm.application.service.IMailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AppointmentService implements IAppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final IMailService mailService;

    @Override
    public Page<AppointmentResponse> getAllAppointments(PageRequest pageRequest) {
        return appointmentRepository.findAll(pageRequest).map(appointment -> {
            return AppointmentResponse.builder()
                    .id(appointment.getId())
                    .customerId(appointment.getCustomer().getId())
                    .salesId(appointment.getSales() != null ? appointment.getSales().getId() : null)
                    .warehouseId(appointment.getWarehouse().getId())
                    .appointmentDate(appointment.getAppointmentDate())
                    .status(appointment.getStatus())
                    .build();
        });
    }

    @Override
    public AppointmentResponse getAppointmentById(Long id) throws Exception {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Appointment not found"));
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .customerId(appointment.getCustomer().getId())
                .salesId(appointment.getSales() != null ? appointment.getSales().getId() : null)
                .warehouseId(appointment.getWarehouse().getId())
                .appointmentDate(appointment.getAppointmentDate())
                .status(appointment.getStatus())
                .build();
    }

    @Override
    public Page<AppointmentResponse> getAppointmentByCustomerId(String remoteUser, PageRequest pageRequest) throws Exception {
        User user = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        return appointmentRepository.findByCustomerId(user.getId(), pageRequest).map(appointment -> {
            return AppointmentResponse.builder()
                    .id(appointment.getId())
                    .customerId(appointment.getCustomer().getId())
                    .salesId(appointment.getSales().getId())
                    .warehouseId(appointment.getWarehouse().getId())
                    .appointmentDate(appointment.getAppointmentDate())
                    .status(appointment.getStatus())
                    .build();
        });
    }

    @Override
    public AppointmentResponse createAppointment(AppointmentDTO appointmentDTO, String remoteUser) throws Exception {
        if (appointmentDTO.getAppointmentDate() == null) {
            throw new IllegalArgumentException("Appointment date cannot be empty");
        }
        if (appointmentDTO.getAppointmentDate().toLocalDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new IllegalArgumentException("Appointment date must be in the future");
        }
        if (appointmentDTO.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID cannot be empty");
        }
        if (appointmentDTO.getWarehouseId() == null) {
            throw new IllegalArgumentException("Warehouse ID cannot be empty");
        }

        Appointment newAppointment = Appointment.builder()
                .appointmentDate(appointmentDTO.getAppointmentDate())
                .status(AppointmentStatus.PENDING)
                .build();

        User customer = userRepository.findById(appointmentDTO.getCustomerId())
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        if (customer.getRole().getId() != 1) {
            throw new DataIntegrityViolationException("User is not a customer");
        }
        newAppointment.setCustomer(customer);

        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("User is not a salesman");
        }
        newAppointment.setSales(sales);

        Warehouse warehouse = warehouseRepository.findById(appointmentDTO.getWarehouseId())
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
        newAppointment.setWarehouse(warehouse);

        appointmentRepository.save(newAppointment);

        mailService.sendAppointmentConfirmationEmail(customer.getEmail(), newAppointment);

        return AppointmentResponse.builder()
                .id(newAppointment.getId())
                .customerId(newAppointment.getCustomer().getId())
                .salesId(newAppointment.getSales().getId())
                .warehouseId(newAppointment.getWarehouse().getId())
                .appointmentDate(newAppointment.getAppointmentDate())
                .status(newAppointment.getStatus())
                .build();
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentDTO appointmentDTO) throws Exception {
        if (appointmentDTO.getAppointmentDate() == null) {
            throw new IllegalArgumentException("Appointment date cannot be empty");
        }
        if (appointmentDTO.getAppointmentDate().toLocalDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new IllegalArgumentException("Appointment date must be in the future");
        }
        if (appointmentDTO.getStatus() == null) {
            throw new IllegalArgumentException("Appointment status cannot be empty");
        }

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Appointment not found"));
        appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        appointment.setStatus(appointmentDTO.getStatus());

        appointmentRepository.save(appointment);

        mailService.sendAppointmentUpdateNotification(appointment.getCustomer().getEmail(), appointment);

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .customerId(appointment.getCustomer().getId())
                .salesId(appointment.getSales().getId())
                .warehouseId(appointment.getWarehouse().getId())
                .appointmentDate(appointment.getAppointmentDate())
                .status(appointment.getStatus())
                .build();
    }

    @Override
    public void deleteAppointment(Long id) throws Exception {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
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
                    .build();
        });
    }

    @Override
    public AppointmentResponse createAppointmentByCustomer(AppointmentDTO appointmentDTO, String remoteUser) throws Exception {
        if (appointmentDTO.getAppointmentDate() == null) {
            throw new IllegalArgumentException("Appointment date cannot be empty");
        }
        if (appointmentDTO.getAppointmentDate().toLocalDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new IllegalArgumentException("Appointment date must be in the future");
        }
        if (appointmentDTO.getWarehouseId() == null) {
            throw new IllegalArgumentException("Warehouse ID cannot be empty");
        }

        Appointment newAppointment = Appointment.builder()
                .appointmentDate(appointmentDTO.getAppointmentDate())
                .status(AppointmentStatus.PENDING)
                .build();

        User customer = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        if (customer.getRole().getId() != 1) {
            throw new DataIntegrityViolationException("User is not a customer");
        }
        newAppointment.setCustomer(customer);

        Warehouse warehouse = warehouseRepository.findById(appointmentDTO.getWarehouseId())
                .orElseThrow(() -> new DataNotFoundException("Warehouse not found"));
        newAppointment.setWarehouse(warehouse);

        appointmentRepository.save(newAppointment);
        return AppointmentResponse.builder()
                .id(newAppointment.getId())
                .customerId(newAppointment.getCustomer().getId())
                .warehouseId(newAppointment.getWarehouse().getId())
                .appointmentDate(newAppointment.getAppointmentDate())
                .status(newAppointment.getStatus())
                .build();
    }

    @Override
    public Page<AppointmentResponse> getAppointmentBySalesId(String remoteUser, PageRequest pageRequest) throws Exception {
        User user = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        return appointmentRepository.findBySalesId(user.getId(), pageRequest).map(appointment -> {
            return AppointmentResponse.builder()
                    .id(appointment.getId())
                    .customerId(appointment.getCustomer().getId())
                    .salesId(appointment.getSales().getId())
                    .warehouseId(appointment.getWarehouse().getId())
                    .appointmentDate(appointment.getAppointmentDate())
                    .status(appointment.getStatus())
                    .build();
        });
    }

    @Override
    public AppointmentResponse assignAppointment(Long id, AppointmentDTO appointmentDTO) throws Exception {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Appointment not found"));
        User sales = userRepository.findById(appointmentDTO.getSalesId())
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("User is not a salesman");
        }
        appointment.setSales(sales);

        appointmentRepository.save(appointment);

        mailService.sendTaskAssignmentNotification(sales.getEmail(), appointment);

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .customerId(appointment.getCustomer().getId())
                .salesId(appointment.getSales().getId())
                .warehouseId(appointment.getWarehouse().getId())
                .appointmentDate(appointment.getAppointmentDate())
                .status(appointment.getStatus())
                .build();
    }
}
