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
import java.time.LocalDateTime;

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
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy cuộc hẹn"));
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
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        return appointmentRepository.findByCustomerId(user.getId(), pageRequest).map(appointment -> {
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
    public AppointmentResponse createAppointment(AppointmentDTO appointmentDTO, String remoteUser) throws Exception {
        if (appointmentDTO.getAppointmentDate() == null) {
            throw new IllegalArgumentException("Ngày hẹn không được để trống");
        }
        if (appointmentDTO.getAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Thời gian hẹn phải lớn hơn thời gian hiện tại");
        }
        if (appointmentDTO.getCustomerId() == null) {
            throw new IllegalArgumentException("ID khách hàng không được để trống");
        }
        if (appointmentDTO.getWarehouseId() == null) {
            throw new IllegalArgumentException("ID kho hàng không được để trống");
        }

        Appointment newAppointment = Appointment.builder()
                .appointmentDate(appointmentDTO.getAppointmentDate())
                .status(AppointmentStatus.PENDING)
                .build();

        User customer = userRepository.findById(appointmentDTO.getCustomerId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        if (customer.getRole().getId() != 1) {
            throw new DataIntegrityViolationException("Người dùng không phải là khách hàng");
        }
        newAppointment.setCustomer(customer);

        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("Người dùng không phải là nhân viên bán hàng");
        }
        newAppointment.setSales(sales);

        Warehouse warehouse = warehouseRepository.findById(appointmentDTO.getWarehouseId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));
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


        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy cuộc hẹn"));

        if (appointment.getStatus() == AppointmentStatus.ACCEPTED) {
            throw new IllegalArgumentException("Không thể chuyển trạng thái cuộc hẹn từ đã chấp nhận sang chờ xác nhận");
        }

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
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy cuộc hẹn"));
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
            throw new IllegalArgumentException("Ngày hẹn không được để trống");
        }
        if (appointmentDTO.getAppointmentDate().toLocalDate().isBefore(LocalDate.now().plusDays(1))) {
            throw new IllegalArgumentException("Ngày hẹn phải là ngày trong tương lai");
        }
        if (appointmentDTO.getWarehouseId() == null) {
            throw new IllegalArgumentException("ID kho hàng không được để trống");
        }

        Appointment newAppointment = Appointment.builder()
                .appointmentDate(appointmentDTO.getAppointmentDate())
                .status(AppointmentStatus.PENDING)
                .build();

        User customer = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        if (customer.getRole().getId() != 1) {
            throw new DataIntegrityViolationException("Người dùng không phải là khách hàng");
        }
        newAppointment.setCustomer(customer);

        Warehouse warehouse = warehouseRepository.findById(appointmentDTO.getWarehouseId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));
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
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
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
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy cuộc hẹn"));
        if (appointment.getSales() != null && (appointment.getStatus().equals(AppointmentStatus.ACCEPTED) || appointment.getStatus().equals(AppointmentStatus.CANCELLED))) {
            throw new IllegalArgumentException("Cuộc hẹn đã được chấp nhận bởi nhân viên bán hàng, không thể gán lại");
        }
        User sales = userRepository.findById(appointmentDTO.getSalesId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        if (sales.getRole().getId() != 3) {
            throw new DataIntegrityViolationException("Người dùng không phải là nhân viên bán hàng");
        }
        appointment.setSales(sales);

        if(appointment.getStatus().equals(AppointmentStatus.REJECTED)){
            appointment.setStatus(AppointmentStatus.PENDING);
        }
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

    @Override
    public Page<AppointmentResponse> getUnassignedAppointments(PageRequest pageRequest) {
        return appointmentRepository.findUnassignedAppointments(pageRequest).map(appointment -> {
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
    public Page<AppointmentResponse> getPendingAppointments(PageRequest pageRequest, String remoteUser) throws Exception {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        return appointmentRepository.findPendingAppointmentsForSales(sales.getId(), pageRequest).map(appointment -> {
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
    public Page<AppointmentResponse> getUpcomingAppointmentsForSales(PageRequest pageRequest, String remoteUser) throws Exception {
        User sales = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));
        LocalDateTime today = LocalDate.now().atStartOfDay();
        ;
        LocalDateTime tenDaysLater = today.plusDays(10);
        return appointmentRepository.findUpcomingAppointmentsForSales(sales.getId(), today, tenDaysLater, pageRequest).map(appointment -> {
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
    public Page<AppointmentResponse> getUpcomingAppointmentsForWarehouse(PageRequest pageRequest, String remoteUser) throws Exception {
        User manager = userRepository.findByEmail(remoteUser)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

        Warehouse warehouse = warehouseRepository.findByManagerId(manager.getId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy kho hàng"));

        LocalDateTime today = LocalDate.now().atStartOfDay();
        ;
        LocalDateTime tenDaysLater = today.plusDays(10);
        return appointmentRepository.findUpcomingAppointmentsForSales(warehouse.getId(), today, tenDaysLater, pageRequest).map(appointment -> {
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
}
