package com.wrm.application.controller;

import com.wrm.application.dto.LotDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.response.lot.LotListResponse;
import com.wrm.application.response.lot.LotResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.wrm.application.service.ILotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lots")
@RequiredArgsConstructor
public class LotController {
    private final ILotService lotService;

    @GetMapping("")
    public ResponseEntity<LotListResponse> getAllLots(
            @RequestParam("page") int page,
            @RequestParam("limit") int limit) {
        PageRequest pageRequest = PageRequest.of
                (page,limit, Sort.by("createdDate").descending());
        Page<LotResponse> lotsPage;
        lotsPage = lotService.getAllLots(pageRequest);
        int totalPages = lotsPage.getTotalPages();
        List<LotResponse> lots = lotsPage.getContent();
        return ResponseEntity.ok(LotListResponse.builder()
                .lots(lots)
                .totalPages(totalPages)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LotResponse> getLotById(@PathVariable Long id) throws DataNotFoundException {
        return ResponseEntity.ok(lotService.getLotById(id));
    }

//    @PutMapping("/updateStatus/{lotId}")
//    @PreAuthorize("hasRole('ROLE_MANAGER')")
//    public ResponseEntity<LotResponse> updateLotStatus(@PathVariable Long lotId, @Valid @RequestBody LotDTO lotDTO, BindingResult result, HttpServletRequest req) {
//        if (result.hasErrors()) {
//            List<String> errorMessage = result.getFieldErrors()
//                    .stream()
//                    .map(FieldError::getDefaultMessage)
//                    .collect(Collectors.toList());
//            return ResponseEntity.badRequest().body("Invalid data: " + errorMessage);
//        }
//        try {
//            Lot updatedLot = lotService.updateLotStatus(lotId, lotDTO, req.getRemoteUser());
//            return ResponseEntity.ok(updatedLot);
//        } catch (DataNotFoundException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//        } catch (PermissionDenyException e) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }


}





