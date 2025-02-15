package com.ssafy.soltravel.v2.dto.exchange;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import lombok.Data;

@Data
public class TargetRateUpdateRequestDto {

  @Schema(description = "모임 id", example = "1")
  private Long groupId;

  @Schema(description = "계좌 비밀번호", example = "1234")
  private String accountPassword;

  @Schema(description = "환전할 통화 코드", example = "USD")
  private String currencyCode;

  @Schema(description = "환전할 금액", example = "1700000")
  private Double transactionBalance;

  @Schema(description = "목표 환율", example = "1500.11")
  private float targetRate;

  @Schema(description = "만료일", example = "2024-10-10")
  private LocalDate dueDate;
}
