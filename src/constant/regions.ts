export const REGIONS: Record<string, string[]> = {
  // 서울특별시 (25개 구)
  '서울특별시': [
    '강남구', '강동구', '강북구', '강서구', '관악구',
    '광진구', '구로구', '금천구', '노원구', '도봉구',
    '동대문구', '동작구', '마포구', '서대문구', '서초구',
    '성동구', '성북구', '송파구', '양천구', '영등포구',
    '용산구', '은평구', '종로구', '중구', '중랑구',
  ],

  // 부산광역시
  '부산광역시': [
    '부산 중구', '부산 서구', '부산 동구', '부산 영도구', '부산 부산진구',
    '부산 동래구', '부산 남구', '부산 북구', '부산 해운대구', '부산 사하구',
    '부산 금정구', '부산 강서구', '부산 연제구', '부산 수영구', '부산 사상구',
    '부산 기장군',
  ],

  // 대구광역시
  '대구광역시': [
    '대구 중구', '대구 동구', '대구 서구', '대구 남구', '대구 북구',
    '대구 수성구', '대구 달서구', '대구 달성군', '대구 군위군',
  ],

  // 인천광역시
  '인천광역시': [
    '인천 중구', '인천 동구', '인천 미추홀구', '인천 연수구', '인천 남동구',
    '인천 부평구', '인천 계양구', '인천 서구', '인천 강화군', '인천 옹진군',
  ],

  // 광주광역시
  '광주광역시': [
    '광주 동구', '광주 서구', '광주 남구', '광주 북구', '광주 광산구',
  ],

  // 대전광역시
  '대전광역시': [
    '대전 동구', '대전 중구', '대전 서구', '대전 유성구', '대전 대덕구',
  ],

  // 울산광역시
  '울산광역시': [
    '울산 중구', '울산 남구', '울산 동구', '울산 북구', '울산 울주군',
  ],

  // 세종특별자치시
  '세종특별자치시': ['세종특별자치시'],

  // 경기도 — 구가 있는 시
  '수원시': ['수원 장안구', '수원 권선구', '수원 팔달구', '수원 영통구'],
  '성남시': ['성남 수정구', '성남 중원구', '성남 분당구'],
  '고양시': ['고양 덕양구', '고양 일산동구', '고양 일산서구'],
  '용인시': ['용인 처인구', '용인 기흥구', '용인 수지구'],
  '부천시': ['부천 원미구', '부천 소사구', '부천 오정구'],
  '안산시': ['안산 상록구', '안산 단원구'],
  '안양시': ['안양 만안구', '안양 동안구'],
  '화성시': ['화성 만세구', '화성 효행구', '화성 병점구', '화성 동탄구'],

  // 경기도 — 구가 없는 시·군
  '경기도': [
    '남양주시', '평택시', '의정부시', '시흥시', '파주시',
    '김포시', '광명시', '광주시', '군포시', '하남시',
    '오산시', '이천시', '양주시', '안성시', '구리시',
    '포천시', '의왕시', '여주시', '동두천시',
    '가평군', '양평군', '연천군', '과천시',
  ],

  // 강원특별자치도
  '강원특별자치도': [
    '춘천시', '원주시', '강릉시', '동해시', '태백시',
    '속초시', '삼척시', '홍천군', '횡성군', '영월군',
    '평창군', '정선군', '철원군', '화천군', '양구군',
    '인제군', '강원 고성군', '양양군',
  ],

  // 충청북도
  '충청북도': [
    '청주시', '충주시', '제천시', '보은군', '옥천군',
    '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군',
  ],

  // 충청남도
  '충청남도': [
    '천안시', '공주시', '보령시', '아산시', '서산시',
    '논산시', '계룡시', '당진시', '금산군', '부여군',
    '서천군', '청양군', '홍성군', '예산군', '태안군',
  ],

  // 전북특별자치도
  '전북특별자치도': [
    '전주시', '군산시', '익산시', '정읍시', '남원시',
    '김제시', '완주군', '진안군', '무주군', '장수군',
    '임실군', '순창군', '고창군', '부안군',
  ],

  // 전라남도
  '전라남도': [
    '목포시', '여수시', '순천시', '나주시', '광양시',
    '담양군', '곡성군', '구례군', '고흥군', '보성군',
    '화순군', '장흥군', '강진군', '해남군', '영암군',
    '무안군', '함평군', '영광군', '장성군', '완도군',
    '진도군', '신안군',
  ],

  // 경상북도
  '경상북도': [
    '포항시', '경주시', '김천시', '안동시', '구미시',
    '영주시', '영천시', '상주시', '문경시', '경산시',
    '의성군', '청송군', '영양군', '영덕군', '청도군',
    '고령군', '성주군', '칠곡군', '예천군', '봉화군',
    '울진군', '울릉군',
  ],

  // 경상남도
  '경상남도': [
    '창원시', '진주시', '통영시', '사천시', '김해시',
    '밀양시', '거제시', '양산시', '의령군', '함안군',
    '창녕군', '경남 고성군', '남해군', '하동군', '산청군',
    '함양군', '거창군', '합천군',
  ],

  // 제주특별자치도
  '제주특별자치도': ['제주시', '서귀포시'],
}

export const DISTRICT_CATEGORY_MAP: Record<string, string> = {
  // 서울특별시
  '종로구': 'JONGNO',
  '중구': 'JUNG',
  '용산구': 'YONGSAN',
  '성동구': 'SEONGDONG',
  '광진구': 'GWANGJIN',
  '동대문구': 'DONGDAEMUN',
  '중랑구': 'JUNGNANG',
  '성북구': 'SEONGBUK',
  '강북구': 'GANGBUK',
  '도봉구': 'DOBONG',
  '노원구': 'NOWON',
  '은평구': 'EUNPYEONG',
  '서대문구': 'SEODAEMUN',
  '마포구': 'MAPO',
  '양천구': 'YANGCHEON',
  '강서구': 'GANGSEO',
  '구로구': 'GURO',
  '금천구': 'GEUMCHEON',
  '영등포구': 'YEONGDEUNGPO',
  '동작구': 'DONGJAK',
  '관악구': 'GWANAK',
  '서초구': 'SEOCHO',
  '강남구': 'GANGNAM',
  '송파구': 'SONGPA',
  '강동구': 'GANGDONG',

  // 부산광역시
  '부산 중구': 'BUSAN_JUNG',
  '부산 서구': 'BUSAN_SEO',
  '부산 동구': 'BUSAN_DONG',
  '부산 영도구': 'BUSAN_YEONGDO',
  '부산 부산진구': 'BUSAN_BUSANJIN',
  '부산 동래구': 'BUSAN_DONGNAE',
  '부산 남구': 'BUSAN_NAM',
  '부산 북구': 'BUSAN_BUK',
  '부산 해운대구': 'BUSAN_HAEUNDAE',
  '부산 사하구': 'BUSAN_SAHA',
  '부산 금정구': 'BUSAN_GEUMJEONG',
  '부산 강서구': 'BUSAN_GANGSEO',
  '부산 연제구': 'BUSAN_YEONJE',
  '부산 수영구': 'BUSAN_SUYEONG',
  '부산 사상구': 'BUSAN_SASANG',
  '부산 기장군': 'BUSAN_GIJANG',

  // 대구광역시
  '대구 중구': 'DAEGU_JUNG',
  '대구 동구': 'DAEGU_DONG',
  '대구 서구': 'DAEGU_SEO',
  '대구 남구': 'DAEGU_NAM',
  '대구 북구': 'DAEGU_BUK',
  '대구 수성구': 'DAEGU_SUSEONG',
  '대구 달서구': 'DAEGU_DALSEO',
  '대구 달성군': 'DAEGU_DALSEONG',
  '대구 군위군': 'DAEGU_GUNWI',

  // 인천광역시
  '인천 중구': 'INCHEON_JUNG',
  '인천 동구': 'INCHEON_DONG',
  '인천 미추홀구': 'INCHEON_MICHUHOL',
  '인천 연수구': 'INCHEON_YEONSU',
  '인천 남동구': 'INCHEON_NAMDONG',
  '인천 부평구': 'INCHEON_BUPYEONG',
  '인천 계양구': 'INCHEON_GYEYANG',
  '인천 서구': 'INCHEON_SEO',
  '인천 강화군': 'INCHEON_GANGHWA',
  '인천 옹진군': 'INCHEON_ONGJIN',

  // 광주광역시
  '광주 동구': 'GWANGJU_DONG',
  '광주 서구': 'GWANGJU_SEO',
  '광주 남구': 'GWANGJU_NAM',
  '광주 북구': 'GWANGJU_BUK',
  '광주 광산구': 'GWANGJU_GWANGSAN',

  // 대전광역시
  '대전 동구': 'DAEJEON_DONG',
  '대전 중구': 'DAEJEON_JUNG',
  '대전 서구': 'DAEJEON_SEO',
  '대전 유성구': 'DAEJEON_YUSEONG',
  '대전 대덕구': 'DAEJEON_DAEDEOK',

  // 울산광역시
  '울산 중구': 'ULSAN_JUNG',
  '울산 남구': 'ULSAN_NAM',
  '울산 동구': 'ULSAN_DONG',
  '울산 북구': 'ULSAN_BUK',
  '울산 울주군': 'ULSAN_ULJU',

  // 세종
  '세종특별자치시': 'SEJONG',

  // 경기도 — 구가 있는 시
  '수원 장안구': 'SUWON_JANGAN',
  '수원 권선구': 'SUWON_GWONSEON',
  '수원 팔달구': 'SUWON_PALDAL',
  '수원 영통구': 'SUWON_YEONGTONG',
  '성남 수정구': 'SEONGNAM_SUJEONG',
  '성남 중원구': 'SEONGNAM_JUNGWON',
  '성남 분당구': 'SEONGNAM_BUNDANG',
  '고양 덕양구': 'GOYANG_DEOKYANG',
  '고양 일산동구': 'GOYANG_ILSANDONG',
  '고양 일산서구': 'GOYANG_ILSANSEO',
  '용인 처인구': 'YONGIN_CHEOIN',
  '용인 기흥구': 'YONGIN_GIHEUNG',
  '용인 수지구': 'YONGIN_SUJI',
  '부천 원미구': 'BUCHEON_WONMI',
  '부천 소사구': 'BUCHEON_SOSA',
  '부천 오정구': 'BUCHEON_OJEONG',
  '안산 상록구': 'ANSAN_SANGNOK',
  '안산 단원구': 'ANSAN_DANWON',
  '안양 만안구': 'ANYANG_MANAN',
  '안양 동안구': 'ANYANG_DONGAN',
  '화성 만세구': 'HWASEONG_MANSE',
  '화성 효행구': 'HWASEONG_HYOHAENG',
  '화성 병점구': 'HWASEONG_BYEONGJEOM',
  '화성 동탄구': 'HWASEONG_DONGTAN',

  // 경기도 — 구가 없는 시·군
  '남양주시': 'NAMYANGJU',
  '평택시': 'PYEONGTAEK',
  '의정부시': 'UIJEONGBU',
  '시흥시': 'SIHEUNG',
  '파주시': 'PAJU',
  '김포시': 'GIMPO',
  '광명시': 'GWANGMYEONG',
  '광주시': 'GWANGJU_GG',
  '군포시': 'GUNPO',
  '하남시': 'HANAM',
  '오산시': 'OSAN',
  '이천시': 'ICHEON',
  '양주시': 'YANGJU',
  '안성시': 'ANSEONG',
  '구리시': 'GURI',
  '포천시': 'POCHEON',
  '의왕시': 'UIWANG',
  '여주시': 'YEOJU',
  '동두천시': 'DONGDUCHEON',
  '가평군': 'GAPYEONG',
  '양평군': 'YANGPYEONG',
  '연천군': 'YEONCHEON',
  '과천시': 'GWACHEON',

  // 강원특별자치도
  '춘천시': 'CHUNCHEON',
  '원주시': 'WONJU',
  '강릉시': 'GANGNEUNG',
  '동해시': 'DONGHAE',
  '태백시': 'TAEBAEK',
  '속초시': 'SOKCHO',
  '삼척시': 'SAMCHEOK',
  '홍천군': 'HONGCHEON',
  '횡성군': 'HOENGSEONG',
  '영월군': 'YEONGWOL',
  '평창군': 'PYEONGCHANG',
  '정선군': 'JEONGSEON',
  '철원군': 'CHEORWON',
  '화천군': 'HWACHEON',
  '양구군': 'YANGGU',
  '인제군': 'INJE',
  '강원 고성군': 'GOSEONG_GW',
  '양양군': 'YANGYANG',

  // 충청북도
  '청주시': 'CHEONGJU',
  '충주시': 'CHUNGJU',
  '제천시': 'JECHEON',
  '보은군': 'BOEUN',
  '옥천군': 'OKCHEON',
  '영동군': 'YEONGDONG',
  '증평군': 'JEUNGPYEONG',
  '진천군': 'JINCHEON',
  '괴산군': 'GOESAN',
  '음성군': 'EUMSEONG',
  '단양군': 'DANYANG',

  // 충청남도
  '천안시': 'CHEONAN',
  '공주시': 'GONGJU',
  '보령시': 'BORYEONG',
  '아산시': 'ASAN',
  '서산시': 'SEOSAN',
  '논산시': 'NONSAN',
  '계룡시': 'GYERYONG',
  '당진시': 'DANGJIN',
  '금산군': 'GEUMSAN',
  '부여군': 'BUYEO',
  '서천군': 'SEOCHEON',
  '청양군': 'CHEONGYANG',
  '홍성군': 'HONGSEONG',
  '예산군': 'YESAN',
  '태안군': 'TAEAN',

  // 전북특별자치도
  '전주시': 'JEONJU',
  '군산시': 'GUNSAN',
  '익산시': 'IKSAN',
  '정읍시': 'JEONGEUP',
  '남원시': 'NAMWON',
  '김제시': 'GIMJE',
  '완주군': 'WANJU',
  '진안군': 'JINAN',
  '무주군': 'MUJU',
  '장수군': 'JANGSU',
  '임실군': 'IMSIL',
  '순창군': 'SUNCHANG',
  '고창군': 'GOCHANG',
  '부안군': 'BUAN',

  // 전라남도
  '목포시': 'MOKPO',
  '여수시': 'YEOSU',
  '순천시': 'SUNCHEON',
  '나주시': 'NAJU',
  '광양시': 'GWANGYANG',
  '담양군': 'DAMYANG',
  '곡성군': 'GOKSEONG',
  '구례군': 'GURYE',
  '고흥군': 'GOHEUNG',
  '보성군': 'BOSEONG',
  '화순군': 'HWASUN',
  '장흥군': 'JANGHEUNG',
  '강진군': 'GANGJIN',
  '해남군': 'HAENAM',
  '영암군': 'YEONGAM',
  '무안군': 'MUAN',
  '함평군': 'HAMPYEONG',
  '영광군': 'YEONGGWANG',
  '장성군': 'JANGSEONG',
  '완도군': 'WANDO',
  '진도군': 'JINDO',
  '신안군': 'SINAN',

  // 경상북도
  '포항시': 'POHANG',
  '경주시': 'GYEONGJU',
  '김천시': 'GIMCHEON',
  '안동시': 'ANDONG',
  '구미시': 'GUMI',
  '영주시': 'YEONGJU',
  '영천시': 'YEONGCHEON',
  '상주시': 'SANGJU',
  '문경시': 'MUNGYEONG',
  '경산시': 'GYEONGSAN',
  '의성군': 'UISEONG',
  '청송군': 'CHEONGSONG',
  '영양군': 'YEONGYANG',
  '영덕군': 'YEONGDEOK',
  '청도군': 'CHEONGDO',
  '고령군': 'GORYEONG',
  '성주군': 'SEONGJU',
  '칠곡군': 'CHILGOK',
  '예천군': 'YECHEON',
  '봉화군': 'BONGHWA',
  '울진군': 'ULJIN',
  '울릉군': 'ULLEUNG',

  // 경상남도
  '창원시': 'CHANGWON',
  '진주시': 'JINJU',
  '통영시': 'TONGYEONG',
  '사천시': 'SACHEON',
  '김해시': 'GIMHAE',
  '밀양시': 'MIRYANG',
  '거제시': 'GEOJE',
  '양산시': 'YANGSAN',
  '의령군': 'UIRYEONG',
  '함안군': 'HAMAN',
  '창녕군': 'CHANGNYEONG',
  '경남 고성군': 'GOSEONG_GN',
  '남해군': 'NAMHAE',
  '하동군': 'HADONG',
  '산청군': 'SANCHEONG',
  '함양군': 'HAMYANG',
  '거창군': 'GEOCHANG',
  '합천군': 'HAPCHEON',

  // 제주특별자치도
  '제주시': 'JEJU',
  '서귀포시': 'SEOGWIPO',
}

/**
 * 주소 문자열에서 REGIONS displayName을 찾아 반환한다.
 * 카카오 주소("부산광역시 중구 ...") 및 역지오코딩 결과 모두 처리.
 *
 * - 먼저 REGIONS 키(시/도)를 주소에서 찾는다.
 * - 구/군/시 displayName에 "부산 중구" 같은 도시 접두사가 있으면
 *   접두사를 뗀 이름("중구")으로도 비교한다.
 */
export function matchDistrictFromAddress(address: string): string | undefined {
  const matchedCity = Object.keys(REGIONS).find(city => {
    const abbrev = city
      .replace('특별시', '').replace('광역시', '').replace('특별자치시', '')
      .replace('특별자치도', '')
    return address.includes(city) || address.includes(abbrev)
  })
  if (!matchedCity) return undefined

  return REGIONS[matchedCity].find(d => {
    // "부산 중구" → raw = "중구", "수원 장안구" → raw = "장안구"
    const raw = d.includes(' ') ? d.split(' ').slice(1).join(' ') : d
    return address.includes(d) || address.includes(raw)
  })
}
