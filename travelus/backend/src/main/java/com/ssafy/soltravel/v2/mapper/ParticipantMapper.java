package com.ssafy.soltravel.v2.mapper;

import com.ssafy.soltravel.v2.domain.Participant;
import com.ssafy.soltravel.v2.dto.participants.ParticipantDto;
import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
public class ParticipantMapper {

    public static ParticipantDto toDto(Participant participant) {

        ParticipantDto participantDto = ParticipantDto.builder()
            .participantId(participant.getId())
            .userInfo(UserMapper.convertUserToProfileResponseDto(participant.getUser()))
            .isMaster(participant.isMaster())
            .createdAt(participant.getCreatedAt())
            .updatedAt(participant.getUpdatedAt())
            .build();

        return participantDto;
    }
}
