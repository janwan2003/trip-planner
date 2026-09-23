import { ja as dateLocale } from 'date-fns/locale/ja';

import type { LocaleBundle } from '../types';

/** Japanese. Polite-but-friendly です・ます for prose, short labels for buttons; no plural forms, so `_one` equals `_other`. */
export default {
  dateLocale,
  messages: {
    common: {
      loading: '読み込み中…',
      logoAlt: 'WeGoWhenのロゴ',
      genericError: 'エラーが発生しました。もう一度お試しください。',
      editDates: '{{name}}さんの日程を編集',
      language: '言語',
    },

    home: {
      title: 'みんなで行ける日を見つけよう',
      subtitle: '全員の空いている日から、友だちとの旅行の日程を決められます',
      freeNote: '無料・登録不要。参加する友だちもアカウントはいりません。',
      footer: {
        tagline: '友だちと旅行の日程を決めよう。アカウント不要、リンクひとつで。',
        project: 'プロジェクト',
        about: 'WeGoWhenについて',
        contact: 'お問い合わせ',
        learn: '詳しく知る',
        faq: 'よくある質問',
        when2meet: 'When2meetの代わりに',
        doodle: 'Doodleの代わりに',
        legal: '規約・ポリシー',
        terms: '利用規約',
        privacy: 'プライバシーポリシー',
        closing: 'リンクを送って、空いている日を選んで、旅に出よう。',
        languages: '言語',
      },
    },

    landing: {
      home: 'ホーム',
      ctaTitle: 'みんなで行ける日を見つけよう',
      ctaBody: '無料・登録不要。アプリのインストールもいりません。',
      ctaButton: '旅行を作成',
    },

    createTrip: {
      title: '旅行を計画する',
      description: '旅行を作成してリンクを友だちに送るだけで、みんなの都合がいい日程が見つかります',
      nameLabel: '旅行の名前',
      namePlaceholder: '2026年 夏旅行',
      startLabel: '開始日',
      startPlaceholder: '開始日',
      endLabel: '終了日',
      endPlaceholder: '終了日',
      submit: '旅行を作成',
      submitting: '作成中…',
      invalidDatesTitle: '日付が正しくありません',
      invalidDatesBody: '終了日は開始日より後の日付にしてください。',
      errorTitle: '旅行を作成できませんでした',
      tooLongTitle: '期間が長すぎます',
      tooLongBody_one: '設定できる期間は最長{{count}}日です。',
      tooLongBody_other: '設定できる期間は最長{{count}}日です。',
    },

    dateInput: {
      placeholder: '日付を選択',
    },

    recentTrips: {
      title: 'あなたの旅行',
      description:
        'このブラウザで開いた旅行です。この一覧はこのブラウザにだけ保存され、サーバーやほかの端末には保存されません。',
      untitled: '名前のない旅行',
      yours: '作成者',
      open: '{{name}}を開く',
      openWithRange: '{{name}}（{{range}}）を開く',
      remove: '{{name}}を一覧から削除',
    },

    notFound: {
      message: 'ページが見つかりません',
      home: 'ホームに戻る',
    },
    errorBoundary: {
      title: 'エラーが発生しました',
      body: 'このページでエラーが発生しました。保存済みの日程はサーバーに残っているのでご安心ください。再読み込みするとたいてい直ります。',
      reload: '再読み込み',
    },

    trip: {
      loading: '旅行を読み込み中…',
      loadErrorTitle: '旅行を読み込めませんでした',
      loadErrorBody:
        '旅行のデータは無事なはずですが、接続できませんでした。通信環境を確認して、もう一度お試しください。',
      tryAgain: '再試行',
      createNew: '新しい旅行を作成',
      startOwn: {
        title: 'ほかにも計画中の予定はありますか？',
        body: '自分の旅行を作って、グループにリンクを送りましょう。1分ほどで作れて、誰もアカウントは必要ありません。',
        link: '自分の旅行を作成',
      },
      notFoundTitle: '旅行が見つかりません',
      notFoundBody: 'この旅行は存在しないか、削除されています。',
      share: '共有',
      shareLink: 'リンクを共有',
      copied: 'コピーしました！',
      back: '旅行の画面に戻る',
      participantCount_one: '{{count}}人が参加',
      participantCount_other: '{{count}}人が参加',

      join: {
        title: 'この旅行に参加する',
        body: '選んだ日にはあなたの名前が表示され、誰がいつ空いているかがみんなに見えます。アカウントもメールアドレスも不要です。',
        nameLabel: 'あなたの名前',
        namePlaceholder: '名前を入力',
        submit: '空いている日を選ぶ',
      },

      mark: {
        title: '空いている日を選ぶ',
        // <name> wraps the button that edits the name; see the Trans in TripPage.
        greeting: 'こんにちは、<name>{{name}}さん</name>！空いている日をタップするか、なぞって選んでください。',
        selectAll: 'すべて選択',
        clearAll: 'すべて解除',
        legendAvailable: '空いている',
        legendNotSelected: '未選択',
        save: '保存する',
        saving: '保存中…',
        noChanges: '変更はありません',
      },

      withdraw: {
        label: '参加をやめる',
        confirmTitle: 'この旅行への参加をやめますか？',
        confirmBody:
          '選んだ日は{{trip}}から削除され、あなたは参加者として表示されなくなります。あとから同じ名前で参加し直すこともできますが、日程は最初から選び直しになります。',
        cancel: '参加を続ける',
        confirm: '参加をやめる',
      },

      group: {
        title: 'みんなの空き状況',
        showingAll: '参加者全員を表示中',
        filteredTo: '表示中：{{names}}',
        noOne: 'なし',
        everyone: '全員',
      },

      participants: {
        title: '参加者',
        hint: '名前をタップすると絞り込み、鉛筆アイコンでその人の日程を編集できます',
      },

      leaveEditor: {
        title: '保存していない日程を破棄しますか？',
        switchBody: '{{current}}さんとして選んだ日がまだ保存されていません。{{other}}さんの日程を編集すると、その人の回答が読み込まれ、保存していない選択は失われます。',
        backBody: '{{current}}さんとして選んだ日がまだ保存されていません。旅行の画面に戻ると、選択は失われます。',
        keep: '{{name}}さんとして編集を続ける',
        discardBack: '破棄して戻る',
      },

      toast: {
        linkCopiedTitle: 'リンクをコピーしました！',
        linkCopiedBody: 'LINEなどで友だちに送りましょう。',
        copyFailedTitle: 'リンクをコピーできませんでした',
        copyFailedBody: 'ブラウザのアドレスバーからコピーしてください。',
        savedTitle: '保存しました！',
        savedBody: 'あなたの日程を更新しました。',
        saveErrorTitle: '保存できませんでした',
        conflictTitle: 'この日程はほかの端末で更新されています',
        conflictBody: '{{name}}さんの回答が別の端末から更新されました。あなたの選択はそのまま残っています。もう一度保存すると上書きされます。先にみんなの空き状況を確認することもできます。',
        nameTakenTitle: 'この名前はすでに使われています',
        nameTakenBody: 'ほかの参加者が同じ名前を使っています。',
        renamedTitle: '名前を変更しました！',
        renamedBody: '{{name}}さんとして表示されます。',
        renameErrorTitle: '名前を変更できませんでした',
        withdrawnTitle: '参加をやめました',
        withdrawnBody: 'あなたの日程を削除しました。',
        withdrawErrorTitle: '参加をやめられませんでした',
      },
    },

    calendar: {
      dayWithCount_one: '{{date}}、{{count}}人が空いています',
      dayWithCount_other: '{{date}}、{{count}}人が空いています',
      nobodyFree: '空いている人はいません',
      tapHint: '日付をタップすると、空いている人が表示されます',
    },

    bestDates: {
      title: 'おすすめの日程',
      forNames: '対象：{{names}}',
      minHelp: '旅行に必要な最短の日数です。',
      minLabel: '最短：',
      minTitle: '最短日数',
      days_one: '{{count}}日間',
      days_other: '{{count}}日間',
      // Screen-reader completion of "3/5": "3人が参加可能（全5人中）".
      ofPeopleFree_one: '人が参加可能（全{{count}}人中）',
      ofPeopleFree_other: '人が参加可能（全{{count}}人中）',
      empty: {
        noParticipantsTitle: 'ここにおすすめの日程が表示されます',
        noParticipantsBody: 'みんなにリンクを送ると、空いている日がここに集まります',
        filteredTitle: '{{names}}が全員空いている日はありません',
        filteredBody: '対象の人数を増やしてみてください',
        nobodyMarkedTitle_one: '参加者はいますが、まだ誰も日程を選んでいません',
        nobodyMarkedTitle_other: '参加者はいますが、まだ誰も日程を選んでいません',
        nobodyMarkedBody: '誰かが日程を選ぶと、すぐにここに表示されます',
        noOverlapTitle: 'まだ重なる日はありません',
        noOverlapBody: '今のところ、同じ日に空いている人はいません',
      },
    },

    participantsList: {
      emptyTitle: 'まだ誰も回答していません',
      emptyBody: '最初に空いている日を選んでみましょう！',
      daysAvailable_one: '{{count}}日空いている',
      daysAvailable_other: '{{count}}日空いている',
    },

    tutorial: {
      show: '使い方を見る',
      hide: '使い方を閉じる',
      organiserHeading: '使い方',
      participantHeading: 'やること',
      organiser: {
        createTitle: '旅行を作成',
        createBody: '旅行の名前と期間を決めます',
        shareTitle: 'リンクを共有',
        shareBody: '参加するみんなにリンクを送ります',
        markTitle: '空いている日を選んで保存',
        markBody: 'それぞれが空いている日を選びます',
        pickTitle: 'おすすめの日程を確認',
        pickBody: 'いちばん多くの人が行ける日がわかります',
      },
      participant: {
        markTitle: '行ける日を選ぶ',
        markBody: '日付をタップ、またはなぞって複数選択',
        saveTitle: '保存する',
        saveBody: '保存するとすぐにみんなに共有されます',
        watchTitle: '結果の変化を見る',
        watchBody: '回答が増えるたびに「おすすめの日程」が更新されます',
      },
    },

    feedback: {
      bug: {
        label: '不具合を報告',
        intro:
          'こんにちは、WeGoWhenを作ったJanekです。動かないところや使いにくいところがあれば、ぜひ教えてください。いただいた報告はすべて改善に役立てます。',
        placeholder: '何が起きましたか？本来はどうなるはずでしたか？',
      },
      feature: {
        label: '機能をリクエスト',
        intro:
          'こんにちは、WeGoWhenを作ったJanekです。ほしい機能はありますか？リクエストはすべて目を通していて、その多くを実際にアプリに取り入れています。',
        placeholder: 'どんな機能があれば、日程を決めやすくなりますか？',
      },
      emailLabel: 'メールアドレス（任意）',
      emailPlaceholder: '返信用のメールアドレス（任意）',
      send: '送信',
      thanks: 'ありがとうございます！メッセージを送信しました。',
      failed: '送信できませんでした。通信環境を確認して、もう一度お試しください。',
    },
  },
} satisfies LocaleBundle;
