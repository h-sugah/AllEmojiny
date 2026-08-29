export interface PresetExample {
  title: string;
  category: 'daily' | 'business' | 'tech' | 'humor' | 'literature';
  text: string;
  recommendedMode: 'exact' | 'forced' | 'chaos';
}

export const PRESET_EXAMPLES: PresetExample[] = [
  {
    title: '会社帰りのビール',
    category: 'daily',
    text: '私は今日、会社でとても忙しく仕事をしましたが、帰宅後にビールを飲んで幸せな気分になりました。',
    recommendedMode: 'exact',
  },
  {
    title: '緊張の重要会議',
    category: 'business',
    text: '明日は朝から役員が集まる重要な会議があるので、非常に緊張してドキドキしています。',
    recommendedMode: 'forced',
  },
  {
    title: 'セキュリティ脆弱性分析',
    category: 'tech',
    text: '人工知能の急速な進化に伴い、クラウドサーバーのセキュリティ脆弱性を徹底的に分析して修正する。',
    recommendedMode: 'forced',
  },
  {
    title: '絶体絶命の締切直前',
    category: 'humor',
    text: '締切が明日なのに、まだ資料を何も作っておらず、パニックになりながら現実逃避して二度寝してしまった。',
    recommendedMode: 'chaos',
  },
  {
    title: '雨の日のカフェ',
    category: 'daily',
    text: '激しい雨が降っていたので傘をさして歩き、近くのカフェで温かいコーヒーを飲んでホッと一息ついた。',
    recommendedMode: 'exact',
  },
  {
    title: 'ラーメンで元気復活',
    category: 'daily',
    text: '今日は朝から会議ばかりで疲れたけれど、仕事が終わった後に濃厚なラーメンを食べたら元気がみなぎってきた！',
    recommendedMode: 'forced',
  },
  {
    title: 'プレゼン資料作成の焦り',
    category: 'business',
    text: '来週、大規模なプレゼンテーションがあるので、今から急いで資料を作らなければならない。',
    recommendedMode: 'forced',
  },
  {
    title: '走れメロス冒頭',
    category: 'literature',
    text: 'メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。メロスには政治がわからぬ。',
    recommendedMode: 'chaos',
  }
];

export const DECODE_PRESETS = [
  {
    title: '仕事とビール',
    emojis: '🙋‍♂️📅🏢😵‍💫💻📄⏰➡️🏠🚪🍺😋😊✨',
  },
  {
    title: '重要会議と緊張',
    emojis: '📅➡️🔜❗👥🗣️📊😰💓💦',
  },
  {
    title: 'セキュリティ脆弱性',
    emojis: '🔐🕳️🔍🧠🤖🚀',
  },
  {
    title: '雨の日のカフェ',
    emojis: '🌧️☂️🚶➡️🏪☕😊',
  },
  {
    title: '締切パニック',
    emojis: '⏰🚨📅🔜😱💦📄❌🙋‍♂️🛌😴💤',
  },
  {
    title: 'ラーメンで復活',
    emojis: '🌅➡️👥🗣️📊🔄🔄🔄😵‍💫⬇️💼🏁➡️🍜😋⬇️💪😆✨',
  }
];
