package com.ssafy.soltravel.v2.dto.exchange;

import com.ssafy.soltravel.v2.domain.Enum.CurrencyType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class ExchangeRateRegisterRequestDto {

  @Schema(description = "계좌번호", example = "002-45579486-209")
  private String accountNo;

  @Schema(description = "환전할 통화 코드", example = "USD")
  private CurrencyType currencyCode;

  @Schema(description = "환전할 금액", example = "130000")
  private Double transactionBalance;

  @Schema(description = "목표 환율", example = "1333.40")
  private float targetRate;
}
