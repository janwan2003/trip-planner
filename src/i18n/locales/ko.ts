import { ko as dateLocale } from 'date-fns/locale/ko';

import type { LocaleBundle } from '../types';

/** Korean. Friendly 해요체 for prose, short noun labels for buttons; no particle right after a raw {{name}}. */
export default {
  dateLocale,
  messages: {
    common: {
      loading: '불러오는 중...',
      logoAlt: 'WeGoWhen 로고',
      genericError: '문제가 생겼어요. 다시 시도해 주세요.',
      editDates: '{{name}} 님 일정 수정',
      language: '언어',
    },

    home: {
      title: '우리 모두 갈 수 있는 날, 여기서 찾아요',
      subtitle: '친구들이 언제 되는지 한눈에 보고 여행 날짜를 정해요',
      freeNote: '무료예요. 가입도 필요 없고, 친구들도 따로 가입할 필요 없어요.',
      footer: {
        tagline: '친구들과 여행 날짜 정하기. 가입 없이 링크 하나로.',
        project: '프로젝트',
        about: '소개',
        contact: '문의',
        learn: '더 알아보기',
        faq: '자주 묻는 질문',
        when2meet: 'When2meet 대안',
        doodle: 'Doodle 대안',
        legal: '약관 및 정책',
        terms: '이용약관',
        privacy: '개인정보처리방침',
        closing: '링크를 공유하고, 날짜를 고르고, 떠나요.',
        languages: '언어',
      },
    },

    landing: {
      home: '홈',
      ctaTitle: '우리 모두 갈 수 있는 날, 여기서 찾아요',
      ctaBody: '무료예요. 가입도, 설치도 필요 없어요.',
      ctaButton: '여행 만들기',
    },

    createTrip: {
      title: '여행 만들기',
      description: '여행을 만들고 친구들에게 링크를 보내면 가장 좋은 날짜를 찾을 수 있어요',
      nameLabel: '여행 이름',
      namePlaceholder: '2026 여름 여행',
      startLabel: '시작일',
      startPlaceholder: '시작일',
      endLabel: '종료일',
      endPlaceholder: '종료일',
      submit: '여행 만들기',
      submitting: '만드는 중...',
      invalidDatesTitle: '날짜를 확인해 주세요',
      invalidDatesBody: '종료일은 시작일보다 뒤여야 해요.',
      errorTitle: '여행을 만들지 못했어요',
      tooLongTitle: '기간이 너무 길어요',
      tooLongBody_one: '여행 기간은 최대 {{count}}일까지 설정할 수 있어요.',
      tooLongBody_other: '여행 기간은 최대 {{count}}일까지 설정할 수 있어요.',
    },

    dateInput: {
      placeholder: '날짜 선택',
    },

    recentTrips: {
      title: '내 여행',
      description:
        '이 브라우저에서 열어 본 여행이에요. 이 기기에만 저장되고, 서버나 다른 기기에는 저장되지 않아요.',
      untitled: '이름 없는 여행',
      yours: '내가 만든 여행',
      open: '{{name}} 열기',
      openWithRange: '{{name}}, {{range}} 열기',
      remove: '목록에서 {{name}} 지우기',
    },

    notFound: {
      message: '페이지를 찾을 수 없어요',
      home: '홈으로 돌아가기',
    },
    errorBoundary: {
      title: '문제가 생겼어요',
      body: '페이지에 오류가 났어요. 저장한 날짜는 서버에 안전하게 남아 있어요. 새로고침하면 대부분 해결돼요.',
      reload: '새로고침',
    },

    trip: {
      loading: '여행 불러오는 중...',
      loadErrorTitle: '여행을 불러오지 못했어요',
      loadErrorBody:
        '여행에는 문제가 없을 가능성이 커요. 연결이 잠시 안 됐을 뿐이에요. 인터넷 연결을 확인하고 다시 시도해 주세요.',
      tryAgain: '다시 시도',
      createNew: '새 여행 만들기',
      startOwn: {
        title: '다른 계획도 있나요?',
        body: '내 여행을 만들고 그룹에 링크를 보내 보세요. 1분이면 되고, 아무도 가입할 필요가 없어요.',
        link: '내 여행 만들기',
      },
      notFoundTitle: '여행을 찾을 수 없어요',
      notFoundBody: '없는 여행이거나 삭제된 여행이에요.',
      share: '공유',
      shareLink: '링크 공유',
      copied: '복사됐어요!',
      back: '여행으로 돌아가기',
      participantCount_one: '{{count}}명 참여',
      participantCount_other: '{{count}}명 참여',

      join: {
        title: '이 여행에 참여하기',
        body: '이름을 적으면 내가 고른 날짜에 표시돼서, 누가 언제 되는지 모두가 볼 수 있어요. 가입도 이메일도 필요 없어요.',
        nameLabel: '이름',
        namePlaceholder: '이름을 입력해 주세요',
        submit: '내 날짜 고르기',
      },

      mark: {
        title: '가능한 날짜 고르기',
        greeting: '<name>{{name}}</name> 님, 안녕하세요! 되는 날을 탭하거나 드래그해서 골라 주세요.',
        selectAll: '전체 선택',
        clearAll: '전체 해제',
        legendAvailable: '가능',
        legendNotSelected: '선택 안 함',
        save: '저장하기',
        saving: '저장하는 중...',
        noChanges: '바뀐 내용이 없어요',
      },

      withdraw: {
        label: '여행에서 빠지기',
        confirmTitle: '이 여행에서 빠질까요?',
        confirmBody:
          '{{trip}}에서 내가 고른 날짜가 삭제되고, 다른 사람들에게도 참여하지 않는 것으로 보여요. 나중에 같은 이름으로 다시 참여할 수 있지만, 고른 날짜는 다시 골라야 해요.',
        cancel: '계속 참여하기',
        confirm: '빠지기',
      },

      group: {
        title: '모두의 일정',
        showingAll: '전체 참여자 보는 중',
        filteredTo: '필터: {{names}}',
        noOne: '선택 없음',
        everyone: '전체',
      },

      participants: {
        title: '참여자',
        hint: '이름을 누르면 일부만 골라 볼 수 있고, 연필을 누르면 그 사람의 날짜를 수정할 수 있어요',
      },

      leaveEditor: {
        title: '저장하지 않은 날짜를 버릴까요?',
        switchBody:
          '{{current}} 님으로 고른 날짜 중 아직 저장하지 않은 게 있어요. {{other}} 님의 일정을 수정하면 그분의 응답을 불러오고, 저장하지 않은 날짜는 사라져요.',
        backBody: '{{current}} 님으로 고른 날짜 중 아직 저장하지 않은 게 있어요. 여행 화면으로 돌아가면 사라져요.',
        keep: '{{name}} 님으로 계속 수정하기',
        discardBack: '버리고 돌아가기',
      },

      toast: {
        linkCopiedTitle: '링크를 복사했어요!',
        linkCopiedBody: '친구들에게 이 링크를 보내 주세요.',
        copyFailedTitle: '링크를 복사하지 못했어요',
        copyFailedBody: '브라우저 주소창에서 직접 복사해 주세요.',
        savedTitle: '저장했어요!',
        savedBody: '내 날짜가 업데이트됐어요.',
        saveErrorTitle: '저장하지 못했어요',
        conflictTitle: '그사이 날짜가 바뀌었어요',
        conflictBody:
          '{{name}} 님의 응답이 다른 기기에서 수정됐어요. 고른 날짜는 그대로 있으니, 다시 저장해서 덮어쓰거나 먼저 모두의 일정을 확인해 보세요.',
        nameTakenTitle: '이미 있는 이름이에요',
        nameTakenBody: '다른 사람이 이 이름을 쓰고 있어요.',
        renamedTitle: '이름을 바꿨어요!',
        renamedBody: '이제 {{name}} 님으로 표시돼요.',
        renameErrorTitle: '이름을 바꾸지 못했어요',
        withdrawnTitle: '여행에서 빠졌어요',
        withdrawnBody: '내가 고른 날짜를 삭제했어요.',
        withdrawErrorTitle: '여행에서 빠지지 못했어요',
      },
    },

    calendar: {
      dayWithCount_one: '{{date}}, {{count}}명 가능',
      dayWithCount_other: '{{date}}, {{count}}명 가능',
      nobodyFree: '가능한 사람이 없어요',
      tapHint: '날짜를 누르면 누가 되는지 볼 수 있어요',
    },

    bestDates: {
      title: '추천 날짜',
      forNames: '{{names}} 기준',
      minHelp: '여행 기간의 최소 일수예요.',
      minLabel: '최소',
      minTitle: '최소 일수',
      days_one: '{{count}}일',
      days_other: '{{count}}일',
      // Read after the bare count: "3명 가능, 전체 5명".
      ofPeopleFree_one: '명 가능, 전체 {{count}}명',
      ofPeopleFree_other: '명 가능, 전체 {{count}}명',
      empty: {
        noParticipantsTitle: '여기에 추천 날짜가 나와요',
        noParticipantsBody: '모두에게 링크를 보내면 각자 되는 날이 여기에 모여요',
        filteredTitle: '{{names}} 모두 되는 날이 없어요',
        filteredBody: '사람을 더 넣어서 다시 찾아보세요',
        nobodyMarkedTitle_one: '참여한 사람은 있지만, 아직 아무도 날짜를 고르지 않았어요',
        nobodyMarkedTitle_other: '참여한 사람은 있지만, 아직 아무도 날짜를 고르지 않았어요',
        nobodyMarkedBody: '누구든 날짜를 고르면 바로 추천 날짜가 나와요',
        noOverlapTitle: '아직 겹치는 날이 없어요',
        noOverlapBody: '지금까지는 같은 날 되는 사람이 없어요',
      },
    },

    participantsList: {
      emptyTitle: '아직 아무도 응답하지 않았어요',
      emptyBody: '가장 먼저 되는 날을 골라 보세요!',
      daysAvailable_one: '{{count}}일 가능',
      daysAvailable_other: '{{count}}일 가능',
    },

    tutorial: {
      show: '사용법 보기',
      hide: '사용법 닫기',
      organiserHeading: '이렇게 써요',
      participantHeading: '이렇게 하면 돼요',
      organiser: {
        createTitle: '여행 만들기',
        createBody: '여행 이름과 날짜 범위를 정해요',
        shareTitle: '링크 공유하기',
        shareBody: '카카오톡 등으로 모두에게 여행 링크를 보내요',
        markTitle: '날짜 고르고 저장하기',
        markBody: '각자 되는 날짜를 골라요',
        pickTitle: '추천 날짜 확인하기',
        pickBody: '가장 많은 사람이 되는 날을 확인해요',
      },
      participant: {
        markTitle: '갈 수 있는 날 고르기',
        markBody: '날짜를 탭하거나, 여러 날을 드래그해요',
        saveTitle: '저장하기',
        saveBody: '저장하면 바로 모두에게 보여요',
        watchTitle: '결과가 바뀌는 걸 확인하기',
        watchBody: '응답이 늘어날수록 추천 날짜가 업데이트돼요',
      },
    },

    feedback: {
      bug: {
        label: '버그 신고',
        intro:
          '안녕하세요, WeGoWhen을 만든 Janek이에요. 뭔가 안 되거나 이상했다면 알려 주시면 정말 고맙겠어요. 신고 하나하나가 큰 도움이 돼요.',
        placeholder: '어떤 일이 있었고, 원래는 어떻게 될 줄 알았나요?',
      },
      feature: {
        label: '기능 제안',
        intro:
          '안녕하세요, WeGoWhen을 만든 Janek이에요. 아쉬운 기능이 있나요? 보내 주신 제안은 하나하나 꼼꼼히 읽고, 대부분은 실제로 앱에 반영돼요.',
        placeholder: '어떤 기능이 있으면 일정 정하기가 더 편할까요?',
      },
      emailLabel: '이메일 (선택)',
      emailPlaceholder: '답장 받을 이메일 (선택)',
      send: '보내기',
      thanks: '고마워요! 저한테 잘 전달됐어요.',
      failed: '보내지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.',
    },
  },
} satisfies LocaleBundle;
