(async function () {
  const container = document.querySelector('.side_nav_container')
  const returnBtn = document.querySelector('.return_position')
  const searchInput = document.getElementById('searchInput')
  const searchBtn = document.getElementById('search')
  const options = [...document.querySelectorAll('.side_nav_option li')]
  const infiniteOptions = {
    root: null,
    rootMargin: '0px',
    threshold: [0]
  }

  const observerInfinite = new IntersectionObserver(infiniteData, infiniteOptions)
  let [latitude, longitude] = await getPosition()
  let infoData = await getUbInfo()
  const map = L.map('map').setView([latitude, longitude], 16).on('dragend', getAroundStore).on('zoomend', getAroundStore);
  const userIcon = L.icon({
    iconUrl: '../img/dot.svg',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
  })
  L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
  let markers = [], locationInfo = { data: [] }, sideInfo, range, UbType, markerCluster, dataCount = 0
  const locationInfoProxy = new Proxy(locationInfo, {
    get(target, key) {
      return target[key]
    },
    set(target, key, val) {
      getSildInfo(val)
      getMarkers(val)
      target[key] = val
      return true
    }
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  returnBtn.addEventListener('click', resetPosition)
  searchInput.addEventListener('keydown', searchCustomStore)
  searchBtn.addEventListener('click', searchCustomStore)
  const optionMap = {
    distance: optionDistance,
    UbType: optionUbType
  }
  const optionStatus = options.reduce((prev, dom) => {
    let type = dom.parentNode.dataset.type
    if (!prev[type]) prev[type] = []
    prev[type].push(false)
    dom.addEventListener('click', setOptions)
    return prev
  }, {})
  const optionProxyHandler = {
    get(target, key) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        return new Proxy(target[key], optionProxyHandler)
      } else {
        return target[key];
      }
    },
    set(target, key, { status, dom }) {
      target[key] = status
      if (status) {
        let type = dom.parentNode.dataset.type
        dom.classList.add('active')
        optionMap[type](dom.dataset.option)
        getAroundStore()
      } else {
        dom.classList.remove('active')
      }
    }
  }
  const optionProxy = new Proxy(optionStatus, optionProxyHandler)
  function setOptions() {
    let type = this.parentNode ? this.parentNode.dataset.type : 'distance'
    let dom = [...document.querySelectorAll(`[data-type='${type}'] > li`)]
    let index = dom.indexOf(this) === -1 ? 0 : dom.indexOf(this)
    for (let i in optionProxy[type]) optionProxy[type][i] = { status: false, dom: dom[i] }
    optionProxy[type][index] = { status: true, dom: dom[index] }
  }
  function optionDistance(info) { range = info }
  function optionUbType(info) { UbType = info }
  function getPosition() {
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(position => {
        resolve([position.coords.latitude, position.coords.longitude])
      });
    })
  }
  function getUbInfo() {
    return new Promise(resolve => {
      fetch('https://raw.githubusercontent.com/LuMark0932/UBike/main/ubTast.json')
        .then(res => res.json())
        .then(json => resolve(Object.freeze(json.features)))
        .catch(err => console.log(err))
    })
  }


  function getSildInfo(UbInfo) {
    dataCount = 0
    sideInfo = document.querySelectorAll('.side_nav_info')
    if (sideInfo.length) {
      sideInfo.forEach(child => container.removeChild(child))
      container.scrollTop = 0
    }
    let info = UbInfo.sort(({ geometry: { coordinates: a } }, { geometry: { coordinates: b } }) =>
      getDistance(latitude, longitude, a[1], a[0]) - getDistance(latitude, longitude, b[1], b[0])
    )
    addSlidInfo(info)
  }
  function addSlidInfo(UbInfo) {
    UbInfo.slice(dataCount, dataCount + 20).forEach(({ properties, geometry: { coordinates } }) => {
      let distance = getDistance(latitude, longitude, coordinates[1], coordinates[0])
      let div = document.createElement('div')
      div.className = 'side_nav_info'
      div.innerHTML = `
        <div class="info_title">
          <h2>${properties.sna}</h2>
          <p>約 ${distance >= 1 ? distance.toFixed(1) + 'km' : (distance * 1000 >> 0) + 'm'}</p>
        </div>
        <div class="info">
          <img src="./static/img/place-24px.svg" alt="place">
          <p>${properties.ar}</p>
        </div>
        <div class="Ub_status">
          <div class="adult ${properties.bemp ? '' : 'no_space'}">現在車位 : <span>${properties.bemp}</span></div>
          <div class="child ${properties.sbi ? '' : 'no_vehicles'}">現在車輛 : <span>${properties.sbi}</span></div>
        </div>
        <div class="info">
          <img src="./static/img/access_time-24px.svg" alt="place">
          <p>五分鐘後</p>
        </div>
        <div class="Ub_status">
          <div class="adult ${properties.bemp_2 ? '' : 'no_space'}">預測車位 : <span>${properties.bemp_2}</span></div>
          <div class="child ${properties.sbi_2 ? '' : 'no_vehicles'}">預測車輛 : <span>${properties.sbi_2}</span></div>
        </div>
        `
      container.appendChild(div)
    })
    sideInfo = [...document.querySelectorAll('.side_nav_info')]
    sideInfo.forEach(dom => dom.addEventListener('click', getStore))
    if (sideInfo.length) observerInfinite.observe(sideInfo[sideInfo.length - 1])
  }
  function infiniteData(e) {
    let entry = e[0]
    if (entry.isIntersecting) {
      dataCount += 20
      observerInfinite.unobserve(entry.target);
      addSlidInfo(locationInfoProxy.data)
    }
  }
  function getMarkers(UbInfo) {
    markers = []
    UbInfo.forEach(({ properties, geometry: { coordinates } }) => {
      markers.push(L.marker([coordinates[1], coordinates[0]])
        .bindPopup(`
          <h2>${properties.sna}</h2>
          <p>${properties.ar}</p>
          <div class='Ub_status'>
            <div class="adult ${properties.bemp ? '' : 'no_space'}">現在車位 : <span>${properties.bemp}</span></div>
            <div class="child ${properties.sbi ? '' : 'no_vehicles'}">現在車輛 : <span>${properties.sbi}</span></div>
          </div>
          <div class="info">
            <p>五分鐘後</p>
          </div>
          <div class="Ub_status">
            <div class="adult ${properties.bemp_2 ? '' : 'no_space'}">預測車位 : <span>${properties.bemp_2}</span></div>
            <div class="child ${properties.sbi_2 ? '' : 'no_vehicles'}">預測車輛 : <span>${properties.sbi_2}</span></div>
          </div>
        `, {
          className: 'marker',
          autoPan: false
        }))
    })
    if (markerCluster) markerCluster.clearLayers()
    markerCluster = L.markerClusterGroup({
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true
    })
    markerCluster.addLayer(L.layerGroup(markers))
    map.addLayer(markerCluster);
  }
  function getStore() {
    if (!markers[sideInfo.indexOf(this)].isPopupOpen()) {
      sideNav.classList.remove('active')
      let marker = markers[sideInfo.indexOf(this)]
      map.off('zoomend', getAroundStore);
      markerCluster.zoomToShowLayer(marker, () => {
        marker.openPopup()
        map.on('zoomend', getAroundStore);
      })
    }
  }
  function getDistance(lat1, lng1, lat2, lng2) {
    return 2 * 6378.137 * Math.asin(Math.sqrt(Math.pow(Math.sin(Math.PI * (lat1 - lat2) / 360), 2) + Math.cos(Math.PI * lat1 / 180) * Math.cos(Math.PI * lat2 / 180) * Math.pow(Math.sin(Math.PI * (lng1 - lng2) / 360), 2)))
  }
  function getAroundStore() {
    locationInfoProxy.data = filterUbType(filterRangeStore(infoData))
  }
  function searchCustomStore(e) {
    if (e.keyCode === 13 || e.type === "click") {
      let value = searchInput.value.trim()
      if (value) {
        setOptions()
        locationInfoProxy.data = filterUbType(infoData).filter(({ properties: { ar, sna } }) => {
          return ar.indexOf(value) !== -1 || sna.indexOf(value) !== -1
        })
        let location = locationInfoProxy.data[0].geometry.coordinates
        map.panTo([location[1], location[0]], 16)
      }
    }
  }
  function filterRangeStore(info) {
    return info.filter(({ geometry: { coordinates } }) => {
      if (range) {
        return getDistance(latitude, longitude, coordinates[1], coordinates[0]) < range
      } else {
        let bounds = {
          W: map.getBounds().getNorthWest().lng,
          E: map.getBounds().getNorthEast().lng,
          N: map.getBounds().getNorthWest().lat,
          S: map.getBounds().getSouthEast().lat
        }
        return (coordinates[0] < bounds.E && coordinates[0] > bounds.W)
          && (coordinates[1] < bounds.N && coordinates[1] > bounds.S)
      }
    })
  }
  function filterUbType(info) {
    return info.filter(info => UbType ? info.properties[UbType] !== 0 : info)
  }
  function resetPosition() {
    searchInput.value = ''
    map.panTo([latitude, longitude], 16)
    getAroundStore()
  }

  getAroundStore()
  getDateInfo()

})()