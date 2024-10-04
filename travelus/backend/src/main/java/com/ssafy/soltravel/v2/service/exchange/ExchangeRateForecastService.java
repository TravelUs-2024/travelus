package com.ssafy.soltravel.v2.service.exchange;

import com.ssafy.soltravel.v2.domain.Enum.CurrencyType;
import com.ssafy.soltravel.v2.domain.ExchangeRateForecast;
import com.ssafy.soltravel.v2.dto.exchange.forecast.ExchangeRateForecastResponseDto;
import com.ssafy.soltravel.v2.dto.exchange.forecast.ExchangeRateForecastResponseDto.ExchangeRateData;
import com.ssafy.soltravel.v2.dto.exchange.forecast.ExchangeRateSaveRequestDto;
import com.ssafy.soltravel.v2.exception.exchange.CurrencyCodeInvalidException;
import com.ssafy.soltravel.v2.repository.ExchangeRateForecastRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class ExchangeRateForecastService {

  private final ExchangeService exchangeService;
  private final ExchangeRateForecastRepository exchangeRateForecastRepository;

  //-----------------------------전체 저장-----------------------------
  public int parseExchangeRates(ExchangeRateSaveRequestDto request) {
    int length = 0;

    for (String currency : request.getCurrencies().keySet()) {

      // 통화코드 조회
      CurrencyType currencyType = exchangeService.getCurrencyType(currency);
      ExchangeRateSaveRequestDto.ExchangeRateData data = request.getCurrencies().get(currency);

      // 과거 저장
      Map<String, Double> recentRates = (Map<String, Double>) data.getRecentRates().get("3_months");
      length += saveExchangeRate(recentRates, currencyType);

      // 예측값 저장
      Map<String, Double> forecast = data.getForecast();
      length += saveExchangeRate(forecast, currencyType);

    }

    return length;
  }

  // -----------------------------예측값 수정/ 전날 환율 저장-----------------------------
  public int parsePredExchangeRates(ExchangeRateSaveRequestDto request) {
    int length = 0;

    for (String currency : request.getCurrencies().keySet()) {
      CurrencyType currencyType = exchangeService.getCurrencyType(currency);
      Map<String, Double> forecast = request.getCurrencies().get(currency).getForecast();

      // 어제 환율 데이터 파싱
      String yesterday = LocalDate.now().minusDays(1).toString();
      Double rate = getYesterdayRate(request, currency, yesterday);

      Map<String, Double> yesterdayRate = new LinkedHashMap<>();
      yesterdayRate.put(yesterday, rate);

      // 예측값이 없으면 어제 환율 데이터만 저장
      if (forecast == null) {
        length += saveExchangeRate(yesterdayRate, currencyType);
      }
      // 예측값이 있으면 어제 환율 데이터 수정/ 예측 환율 수정 및 저장
      else {
        length += updateExchangeRate(yesterdayRate, currencyType);
        length += updateExchangeRate(forecast, currencyType);
      }
    }
    return length;
  }

  // 전날 환율 데이터를 조회하는 메서드
  private Double getYesterdayRate(ExchangeRateSaveRequestDto request, String currency, String yesterday) {
    Map<String, Object> recentRates = request.getCurrencies().get(currency).getRecentRates();
    Map<String, Double> recentRates_3 = (Map<String, Double>) recentRates.get("3_months");
    return recentRates_3.get(yesterday);
  }


  //-----------------------------환율 저장-----------------------------
  private int saveExchangeRate(Map<String, Double> data, CurrencyType currencyType) {
    if(data == null) return 0;
    List<ExchangeRateForecast> list = new ArrayList<>();

    //date별 rate 저장
    data.forEach((date, rate) -> {
      ExchangeRateForecast pred = ExchangeRateForecast.create(
          LocalDate.parse(date),
          currencyType,
          Double.valueOf(rate)
      );
      list.add(pred);
    });
    exchangeRateForecastRepository.save(list);
    return list.size();
  }

  //-----------------------------환율 수정-----------------------------
  private int updateExchangeRate(Map<String, Double> newValues, CurrencyType currencyType) {
    AtomicInteger length = new AtomicInteger();
    newValues.forEach((dateString, rate) -> {
      LocalDate date = LocalDate.parse(dateString);

      ExchangeRateForecast forecast = exchangeRateForecastRepository.findByDateAndCurrency(
          date,
          currencyType
      ).orElse(null);

      if(forecast != null) {
        forecast.updateRate(rate);
      }
      else{
        ExchangeRateForecast pred = ExchangeRateForecast.create(
            date,
            currencyType,
            rate
        );
        exchangeRateForecastRepository.save(pred);
      }

      length.getAndIncrement();
    });

    return length.get();
  }


  // -----------------------------환율 기간 조회-----------------------------
  public Map<String, ExchangeRateData> findRatesByCurrencyCode(String currencyCode) {
    CurrencyType cType = exchangeService.getCurrencyType(currencyCode);

    // 최근 3개월치 환율 데이터 조회
    List<ExchangeRateForecast> recentRates_3 = exchangeRateForecastRepository.findByPeriodAndCurrency(
        LocalDate.now().minusMonths(3),
        LocalDate.now(),
        cType
    ).orElseThrow(
        () -> new CurrencyCodeInvalidException(currencyCode)
    );

    // 2주치 예측 환율 데이터 조회
    List<ExchangeRateForecast> forecast = exchangeRateForecastRepository.findByPeriodAndCurrency(
        LocalDate.now(),
        LocalDate.now().plusWeeks(2),
        cType
    ).orElseThrow(
        () -> new CurrencyCodeInvalidException(currencyCode)
    );

    return toDto(
        forecast,
        recentRates_3,
        currencyCode
    );
  }

  //데이터(도메인) -> DTO
  private Map<String, ExchangeRateData> toDto(
      List<ExchangeRateForecast> forecast,
      List<ExchangeRateForecast> recent,
      String currencyCode
  ){

    // 초기화
    ExchangeRateForecastResponseDto responseDto = new ExchangeRateForecastResponseDto();
    ExchangeRateForecastResponseDto.ExchangeRateData exchangeRateData = new ExchangeRateForecastResponseDto.ExchangeRateData();

    // 예측 데이터를 Map으로 변환
    Map<String, Double> forecastMap = new LinkedHashMap<>();
    for (ExchangeRateForecast rate : forecast) {
      forecastMap.put(rate.getDate().toString(), rate.getRate());
    }

    // 최근 3개월치 데이터를 Map으로 변환
    Map<String, Map<String, Double>> recentRatesMap = new HashMap<>();
    Map<String, Double> recentRatesValues = new LinkedHashMap<>();
    for (ExchangeRateForecast rate : recent) {
      recentRatesValues.put(rate.getDate().toString(), rate.getRate());
    }
    recentRatesMap.put("3_months", recentRatesValues);

    // DTO에 추가
    exchangeRateData.setForecast(forecastMap);
    exchangeRateData.setRecentRates(recentRatesMap);
    responseDto.getCurrencies().put(currencyCode, exchangeRateData);
    return responseDto.getCurrencies();
  }

}
