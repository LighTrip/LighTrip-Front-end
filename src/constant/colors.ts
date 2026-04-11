const colors = {
  // 배경
  background: {
    primary: "#090D57", // 메인 배경
    nav: "#060830", // 네비게이션 바
  },

  // 브랜드 색상
  brand: {
    primary: "#FDA162", // 메인 오렌지 (활성 탭, 버튼)
  },

  // 텍스트
  text: {
    primary: "#FFFFFF", // 기본 텍스트
    secondary: "#8888AA", // 비활성 탭 레이블
    muted: "#666666", // 흐린 텍스트
  },

  // 탭바
  tab: {
    active: "#FDA162",
    inactive: "#666666",
  },
} as const;

export type Colors = typeof colors;
export default colors;
