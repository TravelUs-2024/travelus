package com.goofy.tunabank.v1.controller;

import com.goofy.tunabank.v1.common.RecWrapper;
import com.goofy.tunabank.v1.dto.card.CardIssueRequestDto;
import com.goofy.tunabank.v1.dto.card.CardIssueResponseDto;
import com.goofy.tunabank.v1.dto.card.CardListRequestDto;
import com.goofy.tunabank.v1.dto.card.CardListResponseDto;
import com.goofy.tunabank.v1.dto.card.CardPaymentRequestDto;
import com.goofy.tunabank.v1.dto.card.CardPaymentResponseDto;
import com.goofy.tunabank.v1.service.CardService;
import com.goofy.tunabank.v1.util.LogUtil;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/card")
@RequiredArgsConstructor
public class CardController {

  private final CardService cardService;

  @PostMapping("/issue")
  public ResponseEntity issueNewCard(@RequestBody CardIssueRequestDto request){
    LogUtil.info("카드 발급 요청", request);
    CardIssueResponseDto response = cardService.createNewCard(request);
    return new ResponseEntity(response, HttpStatus.CREATED);
  }

  @PostMapping("/list")
  public ResponseEntity getCardList(@RequestBody CardListRequestDto request){
    LogUtil.info("카드 조회 요청", request.getHeader());
    List<CardListResponseDto> response = cardService.findAllCards(request);
    return new ResponseEntity(new RecWrapper<>(response), HttpStatus.OK);
  }

  @PostMapping("/payment")
  public ResponseEntity makeCardPayment(@RequestBody CardPaymentRequestDto request){
    LogUtil.info("카드 결제", request);
    CardPaymentResponseDto response = cardService.makeCardPayment(request);
    return new ResponseEntity(new RecWrapper<>(response), HttpStatus.CREATED);
  }
}
