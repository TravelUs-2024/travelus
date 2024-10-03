import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosArrowDown } from "react-icons/io";
import { LuDot } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { accountApi } from "../../../api/account";
import { GroupInfo } from "../../../types/meetingAccount";
import { AccountHistoryResponse } from "../../../types/accountHistory";
import { currencyTypeList } from "../../../types/exchange";

const ExpenditureTransactionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectAmmount, setSelectAmmount] = useState(0); // 체크된 총액
  const [checkedNum, setCheckedNum] = useState(0); // 하나라도 체크 돼있는지 확인
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null); // 모임정보
  const [transactions, setTransactions] = useState<{ [date: string]: AccountHistoryResponse[] }>({}); // 거래내역 배열
  const [dateList, setDateList] = useState<string[]>([]); // 날짜 리스트

  // 무한 스크롤 관련 상태변수
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pageEnd = useRef<HTMLDivElement | null>(null); // Intersection Observer가 관찰할 요소

  // 금액을 한국 통화 형식으로 포맷(콤마가 포함된 형태)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
  };

  const handleChecked = (state: boolean, amount: number) => {
    if (state) {
      setCheckedNum((prev) => prev + 1);
      setSelectAmmount((prev) => prev + amount);
    } else {
      setCheckedNum((prev) => prev - 1);
      setSelectAmmount((prev) => prev - amount);
    }
  };

  const handleNext = () => {
    navigate("/settlement/expenditure/info", { state: { selectAmmount } });
  };

  // 무한스크롤 데이터 요청을 위해 page를 증가시키는 함수
  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  // 특정 모임 조회 API 호출
  const fetchSpecificMeetingAccount = async () => {
    try {
      const response = await accountApi.fetchSpecificMeetingAccount(Number(id));
      if (response.status === 200) {
        setGroupInfo(response.data);
      }
    } catch (error) {
      console.error("accountApi의 fetchSpecificMeetingAccount : ", error);
    }
  };

  // 거래 내역 조회
  const fetchTransactionHistory = async () => {
    try {
      if (groupInfo?.groupAccountNo) {
        const data = {
          accountNo: groupInfo?.groupAccountNo,
          transactionType: "CD",
          orderByType: "DESC",
          page: page,
          size: 10,
        };
        const response = await accountApi.fetchTracsactionHistory(data);
        const newTransactions = response.data.content;

        // 거래내역을 날짜별로 그룹화하여 병합
        const newGroupedTransactions = newTransactions.reduce(
          (acc: { [date: string]: AccountHistoryResponse[] }, cur: AccountHistoryResponse) => {
            const dateKey = formatDate(cur.transactionDate);
            if (acc[dateKey]) {
              acc[dateKey].push(cur);
            } else {
              acc[dateKey] = [cur];
            }
            return acc;
          },
          {} as { [date: string]: AccountHistoryResponse[] }
        );

        // 기존 그룹과 새로 불러온 그룹을 병합
        setTransactions((prev) => {
          // 날짜가 중복되면 합치고, 새 날짜면 새롭게 추가
          Object.keys(newGroupedTransactions).forEach((date) => {
            if (prev[date]) {
              prev[date] = [...prev[date], ...newGroupedTransactions[date]];
            } else {
              prev[date] = newGroupedTransactions[date];
            }
          });
          return { ...prev };
        });

        // 새로운 날짜들을 기존 dateList에 추가
        setDateList((prev) => {
          const newDates = Object.keys(newGroupedTransactions);
          const uniqueDates = newDates.filter((date) => !prev.includes(date));
          return [...prev, ...uniqueDates];
        });

        setIsLoading(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSpecificMeetingAccount();
  }, []);

  useEffect(() => {
    fetchTransactionHistory();
  }, [page, groupInfo]);

  useEffect(() => {
    if (isLoading && pageEnd.current) {
      // 로딩되었을 때만 실행
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { threshold: 1 }
      );
      // 옵저버 탐색 시작
      observer.observe(pageEnd.current);
    }
  }, [isLoading]);

  return (
    <div className="h-full pb-8">
      <div className="flex flex-col">
        <div className="p-5 bg-white grid grid-cols-[1fr_3fr_1fr] items-center sticky top-0">
          <IoIosArrowBack
            onClick={() => {
              navigate("/meetingaccount/1");
            }}
            className="text-2xl"
          />
          <p className="text-lg text-center">개별지출 정산하기</p>
        </div>

        <div className="p-5 flex items-center space-x-3">
          <p className="text-3xl font-bold">9월</p>
          <IoIosArrowDown className="text-xl text-[#555555]" />
        </div>

        <div className="w-full h-5 bg-[#F6F6F8]"></div>

        <div className="p-5 overflow-y-auto">
          {dateList.map((date) => (
            <div className="grid gap-5" key={date}>
              <p className="text-[#565656] font-semibold">{date}</p>

              {transactions[date].map((transaction, index) => (
                <label key={index} className="flex justify-between items-center">
                  <div className="flex flex-col justify-between">
                    <div className="flex items-center">
                      <p className="text-lg font-bold tracking-wider">
                        - {formatCurrency(Number(transaction.transactionAmount))}
                        {transaction.currencyCode === "KRW"
                          ? "원"
                          : currencyTypeList
                              .find((item) => item.value === transaction.currencyCode)
                              ?.text.slice(-2, -1)}
                      </p>
                      {transaction.currencyCode === "KRW" ? (
                        <></>
                      ) : (
                        <p className="text-sm text-[#565656] tracking-wider">
                          &nbsp;=&nbsp;
                          {formatCurrency(
                            Number(
                              (
                                Number(transaction.transactionAmount) * Number(transaction.transactionSummary.slice(-7))
                              ).toFixed(0)
                            )
                          )}
                          원 / 환율&nbsp;
                          {Number(transaction.transactionSummary.slice(-7))}원
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-[#565656] tracking-wider">{transaction.payeeName}</p>
                  </div>

                  <input
                    type="checkbox"
                    className="w-6 h-6 appearance-none bg-[url('./assets/check/nochecked.png')] checked:bg-[url('./assets/check/checked.png')] bg-cover rounded-full"
                    onChange={(e) =>
                      handleChecked(
                        e.target.checked,
                        Number(transaction.transactionSummary.slice(-7)) === 0
                          ? Number(transaction.transactionAmount)
                          : Number(
                              (
                                Number(transaction.transactionAmount) * Number(transaction.transactionSummary.slice(-7))
                              ).toFixed(0)
                            )
                      )
                    }
                  />
                </label>
              ))}

              <hr className="mb-5" />
            </div>
          ))}

          {/* 무한스크롤에서 인식할 마지막 타겟 */}
          <div ref={pageEnd} className="h-14 bg-transparent"></div>
        </div>

        <div className="w-full p-5 pb-8 bg-white fixed bottom-0 z-50">
          <button
            className={`w-full h-14 text-lg rounded-xl tracking-wide ${
              checkedNum === 0 ? "text-[#565656] bg-[#E3E4E4]" : "text-white bg-[#1429A0]"
            }`}
            disabled={checkedNum === 0}
            onClick={() => handleNext()}>
            {checkedNum === 0 ? "정산금을 선택해주세요" : "정산하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenditureTransactionDetail;
