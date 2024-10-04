import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  TimeScale,
} from "chart.js";
import { ChevronLeft } from "lucide-react";
import { exchangeApi } from "../../api/exchange";
import { ExchangeRateInfo2, CurrencyPrediction, RecentRates } from "../../types/exchange";
import { setupChart } from "../../utils/chartSetup";
import { calculateDailyChange, formatExchangeRate } from "../../utils/currencyUtils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

// 국가 이름 매핑
// const getFlagImagePath = (currencyCode: string): string => {
//   const countryName = countryNameMapping[currencyCode] || currencyCode;
//   return `/assets/flag/flagOf${countryName}.png`;
// };

// Types
type PeriodKey = "1주" | "1달" | "3달" | "2주";
type TabType = "exchange" | "prediction";

// Utility functions
const isCurrencyPrediction = (data: any): data is CurrencyPrediction => {
  return data && "forecast" in data && "recent_rates" in data;
};

const isRecentRatesOnly = (data: any): data is { recent_rates: RecentRates } => {
  return data && "recent_rates" in data && !("forecast" in data);
};

// Custom hook for fetching data
const useExchangeData = (currencyCode: string) => {
  const [exchangeData, setExchangeData] = useState<ExchangeRateInfo2 | null>(null);
  const [historicalData, setHistoricalData] = useState<{ date: string; rate: number }[]>([]);
  const [predictionData, setPredictionData] = useState<{ date: string; rate: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await exchangeApi.getPrediction();
        const currencyData = response[currencyCode as keyof typeof response];

        if (isCurrencyPrediction(currencyData) || isRecentRatesOnly(currencyData)) {
          const rates = Object.entries(currencyData.recent_rates["3_months"]).sort(
            ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()
          );

          setExchangeData({
            currencyCode,
            exchangeRate: rates[0][1],
            lastUpdated: response.last_updated,
          });

          setHistoricalData(rates.map(([date, rate]) => ({ date, rate })));

          if (isCurrencyPrediction(currencyData)) {
            setPredictionData(Object.entries(currencyData.forecast).map(([date, rate]) => ({ date, rate })));
          }
        } else {
          throw new Error("Unexpected data structure for currency");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currencyCode]);

  return { exchangeData, historicalData, predictionData, isLoading, error };
};

// Component
const ExchangeDetail: React.FC = () => {
  const { currencyCode = "" } = useParams<{ currencyCode: string }>();
  const flagImagePath = `/assets/flag/flagOf${currencyCode}.png`;
  const navigate = useNavigate();
  // const chartRef = useRef<ChartJS<"line">>(null);

  const { exchangeData, historicalData, predictionData, isLoading, error } = useExchangeData(currencyCode);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("1주");
  const [activeTab, setActiveTab] = useState<TabType>("exchange");

  const getFilteredData = (data: typeof historicalData) => {
    const now = new Date();
    let startDate: Date;
    switch (selectedPeriod) {
      case "1주":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "1달":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "3달":
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }
    return data.filter((item) => new Date(item.date) >= startDate);
  };

  const filteredHistoricalData = getFilteredData(historicalData);
  const filteredPredictionData = getFilteredData(predictionData);

  // 어제의 환율과 일일 변화량 계산
  const yesterdayRate = filteredHistoricalData[1]?.rate;
  const dailyChange =
    exchangeData && yesterdayRate ? calculateDailyChange(exchangeData.exchangeRate, yesterdayRate) : 0;

  // const handlePeriodChange = (newPeriod: PeriodKey) => setSelectedPeriod(newPeriod);

  const chartData: ChartData<"line"> = {
    labels: (activeTab === "exchange" ? filteredHistoricalData : filteredPredictionData).map((data) => data.date),
    datasets: [
      {
        label: activeTab === "exchange" ? "실제 환율" : "예측 환율",
        data: (activeTab === "exchange" ? filteredHistoricalData : filteredPredictionData).map((data) => data.rate),
        borderColor: dailyChange >= 0 ? "rgb(221, 82, 87)" : "rgb(72, 128, 238)",
        tension: 0.1,
      },
    ],
  };

  // 차트 옵션 설정
  const isIncreasing = dailyChange >= 0;
  const chartOptions: ChartOptions<"line"> = setupChart(currencyCode, formatExchangeRate, isIncreasing);

  // Render functions
  const renderExchangeTab = () => (
    <>
      <div className="bg-gray-100 rounded-md p-4 mb-6">
        <h2 className="mb-1">실시간 환율</h2>
        <div className="flex justify-between">
          <span className="font-semibold">
            {exchangeData && formatExchangeRate(exchangeData.exchangeRate, currencyCode)}
          </span>
          <span className={`${isIncreasing ? "text-[#DD5257]" : "text-[#4880EE]"}`}>
            전일대비 {formatExchangeRate(Math.abs(dailyChange), currencyCode)}
            {isIncreasing ? "▲" : "▼"}
          </span>
        </div>
      </div>
      {renderChart()}
      {renderPeriodButtons()}
    </>
  );

  const renderPredictionTab = () => (
    <>
      {["EUR", "TWD"].includes(currencyCode) ? (
        <div className="text-center py-8">
          <p>이 통화는 환율 예측을 지원하지 않습니다.</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-100 rounded-md p-4 mb-6">
            <h2 className="mb-1">환율 예측</h2>
            <div className="flex justify-between">
              <span className="font-semibold">
                {formatExchangeRate(
                  filteredPredictionData.reduce((sum, data) => sum + data.rate, 0) / filteredPredictionData.length,
                  currencyCode
                )}
              </span>
              <span
                className={`${
                  filteredPredictionData[0]?.rate < filteredPredictionData[filteredPredictionData.length - 1]?.rate
                    ? "text-red-500"
                    : "text-blue-500"
                }`}>
                예측 변화{" "}
                {formatExchangeRate(
                  Math.abs(
                    filteredPredictionData[filteredPredictionData.length - 1]?.rate - filteredPredictionData[0]?.rate
                  ),
                  currencyCode
                )}
                {filteredPredictionData[0]?.rate < filteredPredictionData[filteredPredictionData.length - 1]?.rate
                  ? "▲"
                  : "▼"}
              </span>
            </div>
          </div>
          {renderChart()}
          {renderPeriodButtons()}
        </>
      )}
    </>
  );

  const renderChart = () => (
    <div className="mb-6 h-64">
      <Line data={chartData} options={chartOptions} />
    </div>
  );

  const renderPeriodButtons = () => {
    if (activeTab === "exchange") {
      return (
        <div className="flex justify-center items-center bg-gray-200 rounded-full p-1">
          {(["1주", "1달", "3달"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-full text-center w-full transition-colors duration-300 ${
                selectedPeriod === period ? "bg-white text-[#353535] font-bold shadow-sm" : "text-gray-600"
              }`}>
              {period}
            </button>
          ))}
        </div>
      );
    } else {
      return (
        <div className="flex justify-center items-center bg-gray-200 rounded-full p-1">
          <button
            onClick={() => setSelectedPeriod("2주")}
            className="px-3 py-1 rounded-full text-center w-full bg-white text-[#353535] font-bold shadow-sm">
            금일로부터 2주 예상
          </button>
        </div>
      );
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto max-w-md h-full p-5 pb-8 flex flex-col">
      <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 mb-6">
        <ChevronLeft className="w-5 h-5 mr-1" />
      </button>
      <div className="flex items-center mb-4">
        <img src={flagImagePath} alt={`${currencyCode} Flag`} className="w-8 h-6 mr-2" />
        <h1 className="text-2xl font-bold">{currencyCode}</h1>
      </div>
      <hr className="mb-4" />
      <div className="mb-3 flex justify-center items-center bg-gray-200 rounded-full p-1">
        {(["exchange", "prediction"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-center ${
              activeTab === tab ? "bg-white text-[#353535] font-bold shadow-sm rounded-full" : "text-gray-600"
            }`}>
            {tab === "exchange" ? "환율" : "환율 예측"}
          </button>
        ))}
      </div>
      {activeTab === "exchange" ? renderExchangeTab() : renderPredictionTab()}

      {/* 채우기 버튼은 아래에 고정 */}
      <div className="flex justify-between mt-auto bottom-0 w-full fixed left-0 px-5 pb-8 bg-white">
        <button
          onClick={() => navigate("/exchange/korean-currency")}
          className="w-[10.5rem] h-11 rounded-lg bg-[#D8E3FF] text-[#026CE1] font-semibold">
          원화 채우기
        </button>
        <button
          onClick={() => navigate("/exchange/foreign-currency")}
          className="w-[10.5rem] h-11 rounded-lg bg-[#1429A0] text-white font-semibold">
          외화 채우기
        </button>
      </div>
    </div>
  );
};

export default ExchangeDetail;
