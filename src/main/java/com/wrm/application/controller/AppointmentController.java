package com.wrm.application.controller;

import com.wrm.application.dto.AppointmentDTO;
import com.wrm.application.response.appointment.AppointmentListResponse;
import com.wrm.application.response.appointment.AppointmentResponse;
import com.wrm.application.service.IAppointmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/appointments")
public class AppointmentController {
    private final IAppointmentService appointmentService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<AppointmentListResponse> getAllAppointments(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit,
            @RequestParam(value = "warehouse_id", required = false) Long warehouseId) {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<AppointmentResponse> appointmentPage;
        if (warehouseId != null) {
            appointmentPage = appointmentService.getAppointmentsByWarehouseId(warehouseId, pageRequest);
        } else {
            appointmentPage = appointmentService.getAllAppointments(pageRequest);
        }

        int totalPage = appointmentPage.getTotalPages();

        List<AppointmentResponse> appointments = appointmentPage.getContent();

        return ResponseEntity.ok().body(AppointmentListResponse.builder()
                .appointments(appointments)
                .totalPages(totalPage)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<?> createAppointment(@Valid @RequestBody AppointmentDTO appointmentDTO, BindingResult result, HttpServletRequest req) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessage);
            }
            AppointmentResponse appointment = appointmentService.createAppointment(appointmentDTO, req.getRemoteUser());
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentDTO appointmentDTO, BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessage);
            }
            AppointmentResponse appointment = appointmentService.updateAppointment(id, appointmentDTO);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok("Appointment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<AppointmentListResponse> getMyAppointment(
            HttpServletRequest req,
            @RequestParam("page") int page,
            @RequestParam("limit") int limit
    ) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<AppointmentResponse> appointmentPage = appointmentService.getAppointmentByCustomerId(req.getRemoteUser(), pageRequest);

        int totalPage = appointmentPage.getTotalPages();

        List<AppointmentResponse> appointments = appointmentPage.getContent();
        return ResponseEntity.ok(AppointmentListResponse.builder()
                .appointments(appointments)
                .totalPages(totalPage)
                .build());
    }

    @PostMapping("/customer-create")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> createAppointmentByCustomer(@Valid @RequestBody AppointmentDTO appointmentDTO, BindingResult result, HttpServletRequest req) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessage);
            }
            AppointmentResponse appointment = appointmentService.createAppointmentByCustomer(appointmentDTO, req.getRemoteUser());
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("sales-appointments")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<AppointmentListResponse> getAppointmentsBySales(
            HttpServletRequest req,
            @RequestParam("page") int page,
            @RequestParam("limit") int limit
    ) throws Exception {
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("createdDate").descending());
        Page<AppointmentResponse> appointmentPage = appointmentService.getAppointmentBySalesId(req.getRemoteUser(), pageRequest);

        int totalPage = appointmentPage.getTotalPages();

        List<AppointmentResponse> appointments = appointmentPage.getContent();
        return ResponseEntity.ok(AppointmentListResponse.builder()
                .appointments(appointments)
                .totalPages(totalPage)
                .build());
    }

    @PutMapping("/assign/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> assignAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentDTO appointmentDTO, BindingResult result) {
        try {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessage);
            }
            AppointmentResponse appointment = appointmentService.assignAppointment(id, appointmentDTO);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
