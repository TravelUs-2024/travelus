package com.ssafy.soltravel.v2.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResponseDto {

    @Schema(description = "사용자 ID", example = "1")
    private Long userId;

    @Schema(description = "사용자 이름", example = "홍길동")
    private String name;

    @Schema(description = "사용자 로그인 아이디", example = "hdw")
    private String id;

    @Schema(description = "사용자 전화번호", example = "010-1234-5678")
    private String phone;

    @Schema(description = "사용자 주소", example = "서울특별시 강남구 테헤란로 123")
    private String address;

    @Schema(description = "사용자 생년월일", example = "1990-01-01")
    private LocalDate birth;

    @Schema(description = "사용자 등록 날짜 및 시간", example = "2024-08-23T14:30:00")
    private LocalDateTime registerAt;

    @Schema(description = "사용자 탈퇴 여부", example = "false")
    private Boolean isExit;

    @Schema(description = "유저 프로필 이미지입니다.", example = "https://my-s3-mingyu.s3.ap-southeast-2.amazonaws.com/profile/%EC%99%95%EA%B4%80%EC%95%B5%EB%AC%B4%EC%83%88.png")
    private String profileImg;

    @Schema(description = "성별", example = "MALE")
    private String gender;
}