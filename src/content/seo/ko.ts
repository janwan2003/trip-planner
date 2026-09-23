import type { LocaleSeo } from './types';

/**
 * Korean. Koreans search the English brand ("when2meet", 4,400/month on Google) and
 * generic phrases (일정조율 사이트, 일정 조율, 약속 잡기); no Korean-made competitor
 * showed up, so the landing page answers When2meet directly.
 */
const ko: LocaleSeo = {
  locale: 'ko',
  contentUpdated: '2026-09-23',
  home: {
    title: '여행 날짜 정하기 · 무료 일정 조율 | WeGoWhen',
    description:
      '친구들과 여행 날짜, 링크 하나로 정해요. 가입 없이 각자 되는 날만 고르면 모두 갈 수 있는 연속된 날짜를 찾아 드려요. 무료예요.',
  },
  landing: {
    slug: 'when2meet-alternative',
    title: 'When2meet 대안 · 여행 날짜 정하는 일정조율 사이트',
    description:
      'When2meet은 몇 시에 만날지 정할 때 좋아요. 며칠 연속으로 다 같이 되는 여행 날짜는 날짜 단위로 찾아 주는 WeGoWhen으로 정해 보세요. 무료, 가입 없이.',
    linkLabel: 'When2meet 대안',
    heading: '여행 날짜를 정할 땐, 날짜 단위 When2meet 대안',
    standfirst:
      'When2meet은 몇 시에 만날지 정할 때 딱 좋아요. 그런데 친구들과 여행을 가려면 며칠 연속으로 모두 되는 날이 필요하죠. WeGoWhen은 바로 그 날짜를 찾아 줘요.',
    sections: [
      {
        heading: '여행용 When2meet 사용법을 찾고 있다면',
        paragraphs: [
          'When2meet은 만들 때 후보 날짜와 함께 "몇 시부터 몇 시까지"라는 시간 범위를 꼭 정해야 해요. 이 항목은 건너뛸 수 없어서, 여행 날짜를 정하려면 자정부터 자정까지로 설정하게 돼요.',
          '그다음엔 모두가 시간대 칸을 드래그해서 채우고, When2meet은 칸마다 되는 사람 수만큼 색을 칠해 줘요. 며칠 연속으로 다 같이 되는 구간은 그 표를 보고 직접 찾아야 해요.',
        ],
      },
      {
        heading: 'WeGoWhen은 날짜 단위로 고르는 When2meet이에요',
        paragraphs: [
          '한 명이 여행 이름과 전체 날짜 범위를 정해서 여행을 만들고, 링크 하나를 카카오톡 등으로 공유해요.',
          '받은 사람은 이름만 적고 되는 날을 탭하거나 드래그하면 끝이에요. 시간은 고를 필요가 없어요. 휴대폰에서도 PC에서도 똑같이 돼요.',
        ],
      },
      {
        heading: '표를 직접 읽지 않아도 돼요',
        paragraphs: [
          'WeGoWhen은 몇 명이든 모두 함께 갈 수 있는 연속된 날짜를 전부 계산해요. 더 긴 구간에 이미 포함된 짧은 구간은 빼고, 가능한 인원, 기간, 날짜 순으로 정리해 보여 줘요. 예를 들면 「6명 중 6명 가능 · 9월 12일(금) ~ 15일(월)」처럼요.',
          '히트맵으로 날짜마다 몇 명이 되는지 한눈에 볼 수 있고, 일부 사람만 골라서 그 사람들 기준으로 다시 볼 수도 있어요.',
        ],
      },
      {
        heading: '가입도, 설치도 필요 없어요',
        paragraphs: [
          '계정, 로그인, 이메일 없이 쓸 수 있어요. 완전히 무료이고 유료 요금제나 광고도 없어요.',
          '여행 하나에 최대 200명까지 참여할 수 있고, 날짜 범위는 최대 366일까지 정할 수 있어요. 웹에서 바로 열리니 앱을 설치할 필요도 없어요.',
        ],
      },
      {
        heading: '이럴 땐 When2meet을 계속 쓰세요',
        paragraphs: [
          '팀 회의나 조모임처럼 몇 시에 만날지를 정해야 한다면 When2meet이 맞는 도구예요.',
          'WeGoWhen은 시간대를 다루지 않고, 캘린더 연동이나 알림, 리마인더도 없어요. 며칠짜리 여행 날짜를 정하는 일에만 집중했어요.',
        ],
      },
    ],
    comparison: {
      competitor: 'When2meet',
      rows: [
        { aspect: '고르는 것', them: '시간대 칸', us: '날짜' },
        {
          aspect: '만들 때 입력하는 것',
          them: '후보 날짜 + 시간 범위(필수)',
          us: '여행 이름 + 날짜 범위',
        },
        {
          aspect: '결과',
          them: '시간대별 가능 인원을 색으로 칠한 표',
          us: '모두 되는 연속 날짜 목록 + 날짜별 히트맵',
        },
        {
          aspect: '누가 결과를 읽나',
          them: '직접 표를 보고 찾기',
          us: 'WeGoWhen이 계산해서 순위로 정리',
        },
        { aspect: '응답에 계정 필요', them: '필요 없음', us: '필요 없음' },
        { aspect: '가격', them: '무료', us: '무료, 광고 없음' },
        { aspect: '최대 인원', them: '공개되지 않음', us: '여행당 200명' },
      ],
      checked: 'When2meet 항목은 2026년 8월 28일 when2meet.com에서 확인했어요.',
    },
    questions: [
      {
        question: 'when2meet 대신 쓸 만한 사이트는?',
        answer:
          '여행처럼 며칠을 정해야 한다면 WeGoWhen이 있어요. 시간이 아니라 날짜를 고르고, 모두 되는 연속된 날짜를 자동으로 찾아 줘요. 무료이고 가입도 필요 없어요.',
      },
      {
        question: 'when2meet으로 여행 날짜도 정할 수 있나요?',
        answer:
          '할 수는 있어요. 다만 시간 범위를 자정부터 자정까지로 정해야 하고, 며칠 연속으로 모두 되는 구간은 표를 보고 직접 찾아야 해요.',
      },
      {
        question: '친구들과 여행 날짜 어떻게 정해요?',
        answer:
          'WeGoWhen에서 여행을 만들고 링크를 단톡방에 공유하세요. 각자 이름을 적고 되는 날을 고르면, 가장 많은 사람이 갈 수 있는 날짜가 순서대로 나와요.',
      },
      {
        question: '며칠 연속으로 다 같이 되는 날은 어떻게 찾아요?',
        answer:
          'WeGoWhen은 모두 되는 연속된 날짜를 계산해서 인원, 기간, 날짜 순으로 보여 줘요. 최소 일수를 정하면 그보다 짧은 구간은 빼고 볼 수 있어요.',
      },
      {
        question: '가입해야 하나요?',
        answer:
          '아니요. 만드는 사람도 참여하는 사람도 계정, 로그인, 이메일 없이 이름만 적으면 돼요.',
      },
      {
        question: 'WeGoWhen은 무료인가요?',
        answer: '네, 완전히 무료예요. 유료 요금제도 광고도 없고, 여행 하나에 최대 200명까지 참여할 수 있어요.',
      },
    ],
  },
};

export default ko;
