package com.wrm.application.dto.contract;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContractUpdateDTO {

    private LocalDateTime signedDate;

    private LocalDateTime expiryDate;

    @Size(max = 10, message = "Tối đa chỉ cho phép 10 hình ảnh")
    private List<@Size(max = 500, message = "Hình ảnh phải là chuỗi base64 hợp lệ và không vượt quá 500 ký tự") String> images;
}
