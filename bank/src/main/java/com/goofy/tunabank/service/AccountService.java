package com.goofy.tunabank.service;

import com.goofy.tunabank.domain.Account;
import com.goofy.tunabank.domain.AccountId;
import com.goofy.tunabank.domain.Country;
import com.goofy.tunabank.domain.Currency;
import com.goofy.tunabank.domain.Enum.AccountType;
import com.goofy.tunabank.domain.Enum.CurrencyType;
import com.goofy.tunabank.dto.ResponseDto;
import com.goofy.tunabank.dto.account.request.CreateAccountRequestDto;
import com.goofy.tunabank.repository.AccountRepository;
import com.goofy.tunabank.repository.CurrencyRepository;
import com.goofy.tunabank.util.LogUtil;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final CurrencyRepository currencyRepository;

    // ==== 계좌 생성 관련 메서드 ====
    public ResponseDto crateNewAccount(CreateAccountRequestDto requestDto) {

        // 다음 id값 추출
        Long nextAccountId = accountRepository.findMaxAccountId();

        if(nextAccountId == null)
            nextAccountId = 0L;

        nextAccountId++;

        // 일반 계좌 생성
        Currency currency = currencyRepository.findByCurrencyCode(CurrencyType.KOR);
        Account generalAccount = createAccount(nextAccountId, currency, requestDto.getAccountType());

        // 계좌 save
        Account saved = accountRepository.save(generalAccount);

        // 만약 그룹 계좌인경우 외화 계좌도 자동 생성 (동일 accountId)
        if(requestDto.getAccountType().equals(AccountType.G)){
            Currency foreignCurrency = currencyRepository.findByCurrencyCode(requestDto.getCurrencyType());

            Account ForeignAccount = createAccount(nextAccountId, currency, AccountType.F);

            accountRepository.save(ForeignAccount);
        }

        return ResponseDto.success();
    }

    // 계좌 생성 공통 메서드
    private Account createAccount(Long nextId, Currency currency, AccountType accountType) {

        Country country = currency.getCountry();

        // Account 객체 생성
        Account account = Account.builder()
            .id(nextId)
            .accountType(accountType)
            .accountNo(createAccountNumber(accountType))  // 계좌 번호 생성
            .balance(0L)  // 기본 잔액 설정
            .currency(currency)
            .build();

        return account;
    }

    private String createAccountNumber(AccountType accountType){

        // 계좌 종류 고유값
        final String code = accountType.getCode();

        // 랜덤 7자리 숫자 생성 (검증 번호는 마지막에 추가)
        String randomPart = String.format("%07d", (int)(Math.random() * 10000000));

        // 검증 번호를 계산하기 위한 계좌 번호 생성
        String accountNumberWithoutCheckDigit = code + randomPart;

        // 검증 번호 계산
        int checkDigit = calculateLuhnCheckDigit(accountNumberWithoutCheckDigit);

        // 지점 번호 -> 209로 고정
        String branchNumber = "209";

        return String.format("%s-%s%d-%s", code, randomPart, checkDigit, branchNumber);
    }

    // Luhn 알고리즘을 사용한 검증 번호 계산
    private int calculateLuhnCheckDigit(String number) {
        int sum = 0;
        boolean alternate = false;

        // 오른쪽에서 왼쪽으로 숫자를 처리
        for (int i = number.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(number.substring(i, i + 1));
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n = (n % 10) + 1;
                }
            }
            sum += n;
            alternate = !alternate;
        }

        // 10으로 나누어 떨어지게 하는 숫자 반환
        return (10 - (sum % 10)) % 10;
    }


}