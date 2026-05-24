const colors = {
  // 배경
  background: {
    primary: "#FFFFFF", // 메인 배경
    nav: "#FFFFFF", // 네비게이션 바
  },

  // 브랜드 색상
  brand: {
    primary: "#1A3A6B", // 메인 오렌지 (활성 탭, 버튼)
  },

  // 텍스트
  text: {
    primary: "#FFFFFF", // 기본 텍스트
    secondary: "#8888AA", // 비활성 탭 레이블
    muted: "#666666", // 흐린 텍스트
  },

  // 탭바
  tab: {
    active: "#1A3A6B",
    inactive: "#666666",
  },
} as const;

export type Colors = typeof colors;
export default colors;
