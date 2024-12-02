## 

# 고도화 작업

### 환율 예측을 더 정확히 하기 위해서는?

- 경제 지표:
  - GDP 성장률
  - 인플레이션율
  - 실업률
  - 이자율
- 정치적 요인:
  - 정부 정책 변화
  - 선거 결과
  - 국제 관계
- 시장 데이터:
  - 주식 시장 지수
  - 원자재 가격 (특히 석유)
  - 국채 수익률
- 기술적 지표:
  - 이동평균
  - 상대강도지수(RSI)
  - 볼린저 밴드
- 뉴스 감성 분석:
  - 주요 경제 뉴스의 감성 점수
- 계절성 요인:
  - 월별, 분기별 패턴

→ 이렇게 많은 요인이 다 연관이 있기 때문에 사실상 완전히 정확한 예측을 하는 것은 불가능

---

그래서 우선 yfinance에서 제공하는 **S&P 500 지수 데이터, 원유 가격 데이터**를 병합해서 예측하는 모델을 사용해보려고 함(클로드가 일단 이렇게 해보라고 함)

---

### 토스 피셜 환율 예측을 하기 위해서 필요한 데이터는?

관련글 : [토스뱅크 | 환테크 전 필독! 그래프로 보는 2024년 달러 환율 전망](https://www.tossbank.com/articles/usd-fx)

- 미국의 기준금리
- 미국의 물가
- 하지만 환율은 수많은 요인에 의해서 변동

---

## 논문 내용 참고

##### 서강대학교 - 시계열 모형 및 기계학습 LSTM 모형과의 비교연구

코로나 기간에는 환율의 변동성이 컸기 때문에, 예측 구간을 두가지로 나눠서 해야한다.

> **코로나 이후 엔데믹이 2022년 5월 쯤이라 2023년까지의 데이터를 학습시키기에는 부족한 양이라 판단, 그냥 신경쓰지 말고 19년 ~ 23년도의 데이터를 사용하기로 함**

![image__7_](/uploads/42ee2554b27d3b17daebd724311aa8aa/image__7_.png)

- LSTM보다 ARIMA가 더 좋은 성능을 보여줬다고 함 -> ARIMA 모델 활용

![image__8_](/uploads/eb6b4bc7b76b63cc6125c2abf5076b21/image__8_.png)

- 이 논문에서 사용한 방식

ARIMA 모형과 LSTM 모형의 예측기간이 겹치는 19년 1월 22일부터 20년 3월 31일
까지 총 290개의 기간을 예측력 분석을 위한 예측기간으로 설정하였고 기간에 따
른 예측력을 분석하기 위해 비교적 환율의 변동성이 크지 않은 예측기간Ⅰ(19년 1
월 22일부터 19년 4월 4일, 49개)과 COVID-19의 영향으로 비교적 환율의 변동성이
큰 예측기간Ⅱ(20년 1월 21일부터 20년 3월31일, 49개)로 나누어 기간별로 각 모
형별 예측력의 차이가 있는지도 살펴보았다. 마지막으로 시계열 예측자료의 정확
성 평가에 많이 사용되는 RMSE를 이용하여, 각 모형을 20일 단위로 구간 추정
(rolling estimation)하여 어떤 모형이 기간별로 더 우수한 예측력을 나타내는지에
대한 빈도와 강도를 분석하였다.

- ARIMA 모델의 (0,1,2)가 가장 우수한 결과를 보여준다고 함

![image__9_](/uploads/73741d4f1f5788042250150f54e31034/image__9_.png)

- ARIMA 모델의 rolling forecast 함수를 사용하면 더 좋은 결과를 보여줄 수 있다고 함

![image](/uploads/ee612376568b0d1be7362809c12452e1/image.png)

- 09.12 예측 결과(LSTM 사용)

![image__10_](/uploads/008465571937dd3341e4aad9d5fd2e6f/image__10_.png)

- 결론은...?

![image__11_](/uploads/609b3fa233c2745ae1f03f08f8b36fe7/image__11_.png)

---

### 실제로 잘 나오는지 test-data를 통해 확인할때는 오차범위가 -+10원 정도 나오는 것 같은데, 예측을 할 때 큰 변동의 폭이 안나와서 정확하게 예측이 되고 있는지를 모르겠음.



---

# 09.19 SARIMA(w.High + Low)를 이용한 모델로 확정

### ARIMA 사용 시 예측 결과의 변동 폭이 지나치게 좁은 것은 실제 환율 시장의 변동성을 제대로 반영하지 못하고 있었음



- **해결방안?**
  
  - 로그 변환 적용 : 환율 데이터에 로그 변환을 적용하여, 변동성을 안정화시키고 예측의 정확도를 높임
  
  - SARIMA 모델 사용 : 단순 ARIMA 대신 계절성을 고려하는 SARIMA(Seasonal ARIMA) 모델을 사용함으로써 주간 패턴 등을 잘 포착하게 함
  
  - 자동 파라미터 튜닝: auto_arima 함수를 사용하여 최적의 SARIMA 모델 파라미터를 자동으로 찾도록 함. 이는 모델의 성능을 크게 향상시킴
  
  - 예측 후 역변환 : 로그 변환된 데이터로 예측한 후, 결과를 다시 원래 스케일로 변환. 이 과정에서 자연스럽게 변동성을 증가시킴
  
  - 일일 변동폭 계산 : 예측된 환율의 일일 변동폭을 계산하여 출력.



- 결과

```
Performing stepwise search to minimize aic
 ARIMA(0,1,0)(0,1,0)[5]             : AIC=-10640.231, Time=0.23 sec
 ARIMA(1,1,0)(1,1,0)[5]             : AIC=-11051.254, Time=0.97 sec
 ARIMA(0,1,1)(0,1,1)[5]             : AIC=-11501.007, Time=1.14 sec
 ARIMA(0,1,1)(0,1,0)[5]             : AIC=-10647.796, Time=0.49 sec
 ARIMA(0,1,1)(1,1,1)[5]             : AIC=-11515.484, Time=1.46 sec
 ARIMA(0,1,1)(1,1,0)[5]             : AIC=-11050.988, Time=0.60 sec
 ARIMA(0,1,1)(2,1,1)[5]             : AIC=-11493.724, Time=2.68 sec
 ARIMA(0,1,1)(1,1,2)[5]             : AIC=-11580.161, Time=4.39 sec
 ARIMA(0,1,1)(0,1,2)[5]             : AIC=-11595.737, Time=3.02 sec
 ARIMA(0,1,0)(0,1,2)[5]             : AIC=inf, Time=3.80 sec
 ARIMA(1,1,1)(0,1,2)[5]             : AIC=-11594.288, Time=1.95 sec
 ARIMA(0,1,2)(0,1,2)[5]             : AIC=-11594.999, Time=5.83 sec
 ARIMA(1,1,0)(0,1,2)[5]             : AIC=-11596.199, Time=1.67 sec
 ARIMA(1,1,0)(0,1,1)[5]             : AIC=-11501.460, Time=1.79 sec
 ARIMA(1,1,0)(1,1,2)[5]             : AIC=-11580.683, Time=2.37 sec
 ARIMA(1,1,0)(1,1,1)[5]             : AIC=-11515.973, Time=2.32 sec
 ARIMA(2,1,0)(0,1,2)[5]             : AIC=-11594.822, Time=4.67 sec
 ARIMA(2,1,1)(0,1,2)[5]             : AIC=-11577.493, Time=2.57 sec
 ARIMA(1,1,0)(0,1,2)[5] intercept   : AIC=-11587.520, Time=5.71 sec

Best model:  ARIMA(1,1,0)(0,1,2)[5]          
Total fit time: 47.677 seconds
Best SARIMA order: (1, 1, 0)
Best seasonal order: (0, 1, 2, 5)
```

-> SARIMA로 가장 적합한 모델을 찾아 학습 진행



**결과 표**

![image](/uploads/dea17e6bf76bbbdc4043d6d46a06fdb3/image.png)



**예측 결과 수치표**

```예측 결과
향후 2주 예측 결과 (시작일: 2024-09-19):
2024-09-19 00:00:00+01:00    1323.151599
2024-09-20 00:00:00+01:00    1321.433556
2024-09-23 00:00:00+01:00    1321.547116
2024-09-24 00:00:00+01:00    1321.683461
2024-09-25 00:00:00+01:00    1320.928878
2024-09-26 00:00:00+01:00    1319.979674
2024-09-27 00:00:00+01:00    1318.003607
2024-09-30 00:00:00+01:00    1317.895071
2024-10-01 00:00:00+01:00    1317.936012
2024-10-02 00:00:00+01:00    1317.333735
Freq: B, dtype: float64

향후 2주 평균 예측 환율: 1319.99
95% 신뢰구간: 1315.97 - 1324.01

일일 변동폭 (%):
2024-09-20 00:00:00+01:00   -0.129845
2024-09-23 00:00:00+01:00    0.008594
2024-09-24 00:00:00+01:00    0.010317
2024-09-25 00:00:00+01:00   -0.057093
2024-09-26 00:00:00+01:00   -0.071859
2024-09-27 00:00:00+01:00   -0.149704
2024-09-30 00:00:00+01:00   -0.008235
2024-10-01 00:00:00+01:00    0.003106
2024-10-02 00:00:00+01:00   -0.045699
Freq: B, dtype: float64

평균 일일 변동폭: -0.05%
최대 일일 변동폭: 0.01%
```

---



GPU 서버에 코드 업로드 후, ANACONDA를 이용해 가상환경을 이용해 정상 실행됨을 확인

![image](/uploads/51c2004c37ec92efeac1cc64392abf1c/image.png)



FastAPI를 이용해 백서버에 주는 방법 학습 예정