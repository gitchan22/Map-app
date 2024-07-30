// 디테일 박스 숨김 및 보임 기능
const detailGuide = document.querySelector('.guide'); // 가이드 버튼
const guideIcon = document.querySelector('.guide i'); // 가이드 아이콘
const detailBox = document.querySelector('.detail-box'); // 디테일 박스
const detailHeight = detailBox.offsetHeight; // 디테일 박스의 높이

detailBox.style.bottom = -detailHeight + 'px'; // 디테일 박스를 처음에 숨김

detailGuide.addEventListener('click', function () {
  this.classList.toggle('active'); // 클릭할 때마다 active 클래스 토글

  if (this.classList.contains('active')) {
    guideIcon.setAttribute('class', 'ri-arrow-drop-down-line'); // active 클래스가 있으면 아이콘 변경
    detailBox.style.bottom = 0; // 디테일 박스를 보이게 함
  } else {
    guideIcon.setAttribute('class', 'ri-arrow-drop-up-line'); // active 클래스가 없으면 아이콘 변경
    detailBox.style.bottom = -detailHeight + 'px'; // 디테일 박스를 숨김
  }
});

// 데이터 필터링
const currentData = data.records.filter(
  (item) =>
    item.데이터기준일자.split('-')[0] >= '2023' &&
    item.데이터기준일자.split('-')[1] >= '10' &&
    item.위도 !== ''
);

//검색 버튼 기능
const searchBtn = document.querySelector('.search-engine button');
// 검색 버튼
const searchInput = document.querySelector('.search-engine input');
// 검색 입력창
const mapElmt = document.querySelector('#map');
// 네이버 맵 영역
const loding = document.querySelector('.loding');
// 로딩 이미지

// 검색 버튼 클릭 시 실행 함수
searchBtn.addEventListener('click', function () {
  const searchValue = searchInput.value;
  // 입력값 저장

  if (searchInput.value === '') {
    alert('검색어를 입력해 주세요');
    searchInput.focus(); // 커서 입력창에 포커스
    return;
  } // 검색어 없이 클릭할 경우 알림

  const searchResult = currentData.filter(
    (item) =>
      item.도서관명.includes(searchValue) || item.시군구명.includes(searchValue)
  );

  if (searchResult.length === 0) {
    alert('검색 결과가 없습니다');
    searchInput.value = ''; // 검색어 지움
    searchInput.focus(); // 커서 입력창에 포커스
    return;
  } else {
    mapElmt.innerHTML = ''; // 기존 맵 삭제
    startLenderMap(searchResult[0].위도, searchResult[0].경도);
    searchBtn.value = ''; //검색어 지움
  }

  // console.log(searchResult);
});

// 네이버 지도 초기화
navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude; // 사용자의 현재 위도
  const lng = position.coords.longitude; // 사용자의 현재 경도

  startLenderMap(lat, lng); // 지도를 초기화하고 현재 위치로 중심을 맞춤
});

function startLenderMap(lat, lng) {
  var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(lat, lng), // 지도의 중심을 사용자의 현재 위치로 설정
    zoom: 13, // 확대 수준 설정
  });

  var marker = new naver.maps.Marker({
    position: new naver.maps.LatLng(lat, lng),
    map: map,
  });

  currentData.forEach((item) => {
    let latlng = new naver.maps.LatLng(item.위도, item.경도);
    let bounds = map.getBounds();

    if (bounds.hasLatLng(latlng)) {
      // 지도 범위 안에 있는 도서관만 마커 추가
      var marker = new naver.maps.Marker({
        position: latlng,
        map: map,

        title: item.도서관명,
        itemCount: item['자료수(도서)'],
        serialItemCount: item['자료수(연속간행물)'],
        notBookItemCount: item['자료수(비도서)'],
        sitCount: item.열람좌석수,
        wdStart: item.평일운영시작시각,
        wdEnd: item.평일운영종료시각,
        wkStart: item.토요일운영시작시각,
        wkEnd: item.토요일운영종료시각,
        contact: item.도서관전화번호,
        address: item.소재지도로명주소,
        homePage: item.홈페이지주소,
      });

      let infoWindow = new naver.maps.InfoWindow({
        content: `
        <h4 style="padding: 0.25rem 0.5rem; font-size:12px; font-weight:500; color:#555;">${item.도서관명}</h4>
        `,
      });

      setTimeout(() => {
        loding.style.display = 'none';
      }, 500);

      naver.maps.Event.addListener(marker, 'click', function () {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }

        const markerInfoData = {
          title: marker.title,
          itemCount: marker.itemCount,
          serialItemCount: marker.serialItemCount,
          notBookItemCount: marker.notBookItemCount,
          sitCount: marker.sitCount,
          wdStart: marker.wdStart,
          wdEnd: marker.wdEnd,
          wkStart: marker.wkStart,
          wkEnd: marker.wkEnd,
          contact: marker.contact,
          address: marker.address,
          homePage: marker.homePage,
        };

        getInfoOnMarker(markerInfoData); // 마커 클릭 시, 디테일 박스에 정보 표시
      });
    }
  });

  function getInfoOnMarker(markerInfoData) {
    const infoWrapper = document.querySelector('.detail-wrapper');
    infoWrapper.innerHTML = ``;

    const {
      title,
      itemCount,
      serialItemCount,
      notBookItemCount,
      sitCount,
      wdStart,
      wdEnd,
      wkStart,
      wkEnd,
      contact,
      address,
      homePage,
    } = markerInfoData;

    const infoElmt = `
    <div class="detail-title">
            <h2>${title}</h2>
          </div>
          <div class="detail-info">
            <div class="info_1">
              <h3>도서</h3>
              <h3>${itemCount}</h3>
            </div>
            <div class="info_2">
              <h3>연속간행물</h3>
              <h3>${serialItemCount}</h3>
            </div>
            <div class="info_3">
              <h3>비도서</h3>
              <h3>${notBookItemCount}</h3>
            </div>
            <div class="info_4">
              <h3>열람좌석수</h3>
              <h3>${sitCount}</h3>
            </div>
          </div>
          <div class="detail-text">
              <div class="time">
                <div class="time-title">운영시간</div>
                <div class="time-contents">
                  <p class="week-day"> ${wdStart} ~ ${wdEnd} (평일)</p>
                  <p class="week-end"> ${wkStart} ~ ${wkEnd} (주말)</p>
                  <p class="holi-day">공휴일 휴관</p>
                </div>
              </div>
              <div class="tell">
                <div class="tell-title">연락처</div>
                <div class="tell-contents">
                  <p>${contact}</p>
                </div>
              </div>
              <div class="addr">
                <div class="addr-title">주소</div>
                <div class="addr-contents">
                  <p>${address}</p>
                </div>
              </div>
              <div class="homepage">
                <div class="homepage-title">홈페이지</div>
                <div class="homepage-contents">
                  <p><a href="${homePage}">홈페이지 가기</a></p>
                </div>
              </div>
            </div>
      `;
    infoWrapper.insertAdjacentHTML('beforeend', infoElmt); // 디테일 박스에 도서관 정보 추가
  }
}
