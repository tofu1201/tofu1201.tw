// 網站內容集中在這裡；照片和 Logo 放在 public/images/，再填入對應路徑。
export const profile = {
  name: 'Tofu Chen',
  nickname: 'Tofu',
  greeting: '哈囉！我是',
  labels: ['學生開發者', '新竹縣兒少代表'],
  // 搜尋與社群分享摘要。
  summary: 'Tofu Chen（Tofu），來自台灣的學生開發者與新竹縣兒少諮詢代表。使用 Python、HTML、CSS，熱衷軟體開發、伺服器架設與開源專案，也關注公共事務、教育議題及兒少權益。',
  // 自介支援以空白行分段；開場招呼由 greeting 設定。
  introduction: `一個喜歡寫程式、研究各種技術的學生開發者，同時也是明明應該準備 116 會考，卻想挑戰竹北實中特殊選才的國三生 🥲

平常喜歡研究資訊技術，會使用 Python、HTML、CSS 等程式語言與網頁技術，也熱衷於軟體開發、伺服器架設及開源專案。

除此之外，我也是新竹縣的兒少諮詢代表，對公共事務、教育議題及兒少權益也很有興趣！:）`,
  portrait: {
    src: '/images/avatar.webp', // 本機圖片路徑；留白時顯示姓名縮寫。
    alt: 'Tofu Chen 於 COSCUP 2026 活動現場的形象照',
    position: '50% 50%',
    credit: {
      title: '_KA98892',
      name: 'COSCUP',
      creatorUrl: 'https://www.flickr.com/photos/coscup/',
      url: 'https://www.flickr.com/photos/coscup/55451327852/in/album-72177720335045157',
      licenseName: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  },
  email: 'tofu@tofu1201.tw',
  contact: { website: 'https://tofu1201.tw', email: 'tofu@tofu1201.tw' },
  skills: {
    programming_languages: ['Python'],
    web_development: ['HTML', 'CSS'],
    technical_interests: ['Software Development', 'Web Development', 'Information Security', 'Networking', 'Cloud Computing', 'Open Source'],
  },
  interestTags: ['資訊安全', '網路技術', '開源社群'],
  teams: [
    { name: 'Hyper Group Network Ltd.', role: '客戶服務團隊', logo: '/images/teams/hyper-group.png', logoTheme: 'light', initials: 'HG', url: 'https://hn.hypernology.com/' },
    { name: '班利小舖', role: '客服', logo: '/images/teams/banli.webp', logoTheme: 'light', initials: '班', url: 'https://discord.gg/wVnt4FMThn' },
  ],
  socials: [
    { name: 'Discord', icon: 'discord', url: 'https://discord.gg/PCDEd5VuxV' },
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com/tofu1201_tw' },
    { name: 'Mail', icon: 'mail', url: 'mailto:tofu@tofu1201.tw' },
    { name: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/in/tofu1201' },
  ],
  activities: [
    { id: 'sitcon-2026', name: 'SITCON 2026', role: 'Attendee', roleLabel: '會眾', logo: '/images/activities/sitcon-2026.png', logoTheme: 'dark', initials: 'ST', url: 'https://sitcon.org/2026/' },
    { id: 'cybersec-2026', name: 'CYBERSEC 2026', role: 'Attendee', roleLabel: '會眾', logo: '/images/activities/cybersec-2026.png', logoTheme: 'dark', initials: 'CS', url: 'https://cybersec.ithome.com.tw/2026/' },
    { id: 'internet-week-2026', name: 'Internet Week 2026', role: 'Attendee', roleLabel: '會眾', logo: '/images/activities/internet-week-2026.svg', logoTheme: 'dark', initials: 'IW', url: 'https://internetweek.tw/2026/' },
    { id: 'twnog-7', name: 'TWNOG 7', role: 'Attendee', roleLabel: '會眾', logo: '/images/activities/twnog-7.png', logoTheme: 'light', initials: 'TW', url: 'https://2026.twnog.net/' },
    { id: 'ipv6-workshop-2026', name: 'IPv6 Workshop 2026', role: 'Participant', roleLabel: '學員', logo: '/images/activities/ipv6-workshop-2026.svg', logoTheme: 'dark', initials: 'v6', url: 'https://workshop.twnog.net/' },
    { id: 'g0v-summit-2026', name: 'g0v summit 2026', role: 'Attendee', roleLabel: '會眾', logo: '/images/activities/g0v-summit-2026.svg', logoTheme: 'dark', initials: 'g0v', url: 'https://summit.g0v.tw/2026/' },
    { id: 'computex-2026', name: 'COMPUTEX 2026', role: 'Professional Visitor', roleLabel: '國內專業人士', logo: '/images/activities/computex.png', logoTheme: 'light', initials: 'CX', url: 'https://www.computextaipei.com.tw/' },
    { id: 'sitcon-camp-2026', name: 'SITCON CAMP 2026', role: 'Camper', roleLabel: '學員', logo: '/images/activities/sitcon-camp-2026.svg', logoTheme: 'dark', initials: 'SC', url: 'https://sitcon.camp/2026/' },
    { id: 'coscup-2026', name: 'COSCUP 2026', role: 'Attendee', roleLabel: '會眾', logo: '/images/activities/coscup-2026.svg', logoTheme: 'dark', initials: 'CO', url: 'https://coscup.org/2026/' },
    { id: 'futuremode-2026', name: 'FUTUREMODE 2026', role: 'Developer', roleLabel: '開發者', logo: '/images/activities/futuremode-2026.png', logoTheme: 'dark', initials: 'FM', url: 'https://www.futuremode.xyz/' },
    { id: 'pycon-2026', name: 'PyCon 2026', role: 'Event Staff', roleLabel: '場務組', logo: '/images/activities/pycon-2026.svg', logoTheme: 'dark', initials: 'Py', url: 'https://tw.pycon.org/2026/' },
  ],
};

export const site = {
  get title() { return `${profile.name}｜${profile.labels.join('・')}`; },
  get description() { return profile.summary; },
  language: 'zh-Hant-TW',
  locale: 'zh_TW',
  color: '#0a0a0a',
};
