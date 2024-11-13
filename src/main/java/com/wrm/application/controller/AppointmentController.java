package com.wrm.application.controller;

import com.wrm.application.dto.AppointmentDTO;
import com.wrm.application.response.ResponseObject;
import com.wrm.application.response.appointment.AppointmentListResponse;
import com.wrm.application.response.appointment.AppointmentResponse;
import com.wrm.application.service.impl.AppointmentService;
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
    private final AppointmentService appointmentService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> getAllAppointments(
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
        AppointmentListResponse.builder()
                .appointments(appointments)
                .totalPages(totalPage)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get appointments successfully")
                .status(HttpStatus.OK)
                .data(appointments)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SALES') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> getAppointmentById(@PathVariable Long id) throws Exception {
        AppointmentResponse appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ResponseObject.builder()
                .message("Get appointment's details successfully")
                .status(HttpStatus.OK)
                .data(appointment)
                .build());
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<ResponseObject> createAppointment(@Valid @RequestBody AppointmentDTO appointmentDTO, BindingResult result, HttpServletRequest req) throws Exception {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(ResponseObject.builder()
                        .message(errorMessage.toString())
                        .status(HttpStatus.BAD_REQUEST)
                        .data(null)
                        .build());
            }
            AppointmentResponse appointment = appointmentService.createAppointment(appointmentDTO, req.getRemoteUser());
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Create appointment successfully")
                    .status(HttpStatus.OK)
                    .data(appointment)
                    .build());
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<ResponseObject> updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentDTO appointmentDTO, BindingResult result) throws Exception {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(ResponseObject.builder()
                        .message(errorMessage.toString())
                        .status(HttpStatus.BAD_REQUEST)
                        .data(null)
                        .build());
            }
            AppointmentResponse appointment = appointmentService.updateAppointment(id, appointmentDTO);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Update appointment successfully")
                    .status(HttpStatus.OK)
                    .data(appointment)
                    .build());
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<ResponseObject> deleteAppointment(@PathVariable Long id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Delete appointment successfully")
                    .status(HttpStatus.OK)
                    .data(null)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .message(e.getMessage())
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .build());
        }
    }

    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ResponseObject> getMyAppointment(
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
        AppointmentListResponse.builder()
                .appointments(appointments)
                .totalPages(totalPage)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get my appointments successfully")
                .status(HttpStatus.OK)
                .data(appointments)
                .build());
    }

    @PostMapping("/customer-create")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ResponseObject> createAppointmentByCustomer(@Valid @RequestBody AppointmentDTO appointmentDTO, BindingResult result, HttpServletRequest req) throws Exception {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(ResponseObject.builder()
                        .message(errorMessage.toString())
                        .status(HttpStatus.BAD_REQUEST)
                        .data(null)
                        .build());
            }
            AppointmentResponse appointment = appointmentService.createAppointmentByCustomer(appointmentDTO, req.getRemoteUser());
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Create appointment successfully")
                    .status(HttpStatus.OK)
                    .data(appointment)
                    .build());
    }

    @GetMapping("sales-appointments")
    @PreAuthorize("hasRole('ROLE_SALES')")
    public ResponseEntity<ResponseObject> getAppointmentsBySales(
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
        AppointmentListResponse.builder()
                .appointments(appointments)
                .totalPages(totalPage)
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Get appointments successfully")
                .status(HttpStatus.OK)
                .data(appointments)
                .build());
    }

    @PutMapping("/assign/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> assignAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentDTO appointmentDTO, BindingResult result) throws Exception {
            if (result.hasErrors()) {
                List<String> errorMessage = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(ResponseObject.builder()
                        .message(errorMessage.toString())
                        .status(HttpStatus.BAD_REQUEST)
                        .data(null)
                        .build());
            }
            AppointmentResponse appointment = appointmentService.assignAppointment(id, appointmentDTO);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Assign appointment successfully")
                    .status(HttpStatus.OK)
                    .data(appointment)
                    .build());
    }
}
