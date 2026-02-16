const stations = [
  { id:1, name:"Suzzallo Library", position:{top:"42%", left:"55%"}, available:8, total:12, emptySlots:4, address:"411 Library Way, Seattle, WA 98195", distance:"120m" },
  { id:2, name:"HUB", position:{top:"38%", left:"30%"}, available:2, total:10, emptySlots:8, address:"Some HUB Address, Seattle, WA", distance:"300m" },
  { id:3, name:"Drumheller Fountain", position:{top:"60%", left:"45%"}, available:5, total:15, emptySlots:10, address:"Drumheller Fountain, Seattle, WA", distance:"200m" },
];

const mapContainer = document.querySelector(".map-container");
const bottomSheet = document.getElementById("bottomSheet");
const bottomSheetContent = document.getElementById("bottomSheetContent");
const stationPanel = document.getElementById("stationPanel");
const stationPanelContent = document.getElementById("stationPanelContent");

// Add station pins
stations.forEach(station => {
  const pin = document.createElement("div");
  pin.className = "absolute cursor-pointer flex flex-col items-center";
  pin.style.top = station.position.top;
  pin.style.left = station.position.left;
  pin.innerHTML = `
    <div class="bg-white text-slate-900 font-bold text-xs px-2 py-1 rounded-lg shadow-lg mb-1 flex items-center gap-1">
      <span class="material-icons text-[14px] text-primary">umbrella</span>
      ${station.available}/${station.total}
    </div>
    <div class="w-3 h-3 bg-white border-2 border-slate-300 rounded-full shadow-md"></div>
  `;
  pin.addEventListener("click", (e) => {
    e.stopPropagation();
    if (window.innerWidth >= 768) {
      openStationPanel(station);
    } else {
      openBottomSheet(station);
    }
  });
  mapContainer.appendChild(pin);
});

// Open bottom sheet for mobile
function openBottomSheet(station) {
  bottomSheetContent.innerHTML = getStationHTML(station);
  bottomSheet.classList.remove("translate-y-full");
  bottomSheet.classList.add("translate-y-0");
}

// Open left panel for desktop
function openStationPanel(station) {
  stationPanelContent.innerHTML = getStationHTML(station);
  stationPanel.classList.add("open");
  stationPanel.classList.remove("hidden");
}

// Prevent clicks inside bottom sheet or panel from closing them
bottomSheet.addEventListener("click", (e) => {
  e.stopPropagation();
});

stationPanel.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Close bottom sheet or panel on outside click
mapContainer.addEventListener("click", () => {
  if (bottomSheet.classList.contains("translate-y-0")) {
    bottomSheet.classList.add("translate-y-full");
    bottomSheet.classList.remove("translate-y-0");
  }
  if (stationPanel.classList.contains("open")) {
    stationPanel.classList.remove("open");
    setTimeout(() => stationPanel.classList.add("hidden"), 300);
  }
});

// Get station info HTML
function getStationHTML(station) {
  return `
    <div class="flex justify-between items-start mb-2">
      <div>
        <h2 class="text-xl font-bold text-slate-900">${station.name} Station</h2>
        <p class="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
          <span class="material-icons text-xs">location_on</span>
          ${station.address}
        </p>
      </div>
      <div class="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
        ${station.distance} away
      </div>
    </div>
    <div class="flex items-center gap-4 my-6">
      <div class="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <span class="text-xs text-slate-500 uppercase font-semibold tracking-wider">Available</span>
        <div class="flex items-end gap-1 mt-1">
          <span class="text-2xl font-bold text-slate-900 leading-none">${station.available}</span>
          <span class="text-sm text-slate-400 font-medium mb-0.5">/ ${station.total} total</span>
        </div>
      </div>
      <div class="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <span class="text-xs text-slate-500 uppercase font-semibold tracking-wider">Empty Slots</span>
        <div class="flex items-end gap-1 mt-1">
          <span class="text-2xl font-bold text-slate-900 leading-none">${station.emptySlots}</span>
          <span class="text-sm text-slate-400 font-medium mb-0.5">for returns</span>
        </div>
      </div>
    </div>
    <div class="flex gap-3">
      <button class="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
        <span class="material-icons">qr_code_scanner</span>
        Rent Umbrella
      </button>
      <button class="flex-1 bg-white border-2 border-primary/20 hover:border-primary text-primary font-bold py-4 rounded-xl transition-all">
        Reserve
      </button>
    </div>
  `;
}

// ========================
// SEARCH FUNCTIONALITY
// ========================
const findStationBtnMobile = document.getElementById("findStationBtnMobile");
const findStationBtnDesktop = document.getElementById("findStationBtnDesktop");

findStationBtnMobile.addEventListener("click", (e) => {
  e.stopPropagation();
  openSearchTab();
});

findStationBtnDesktop.addEventListener("click", (e) => {
  e.stopPropagation();
  openSearchPanel();
});

function openSearchTab() {
  // Create search HTML for mobile
  let searchHTML = `
    <div class="mb-4">
      <input type="text" id="stationSearchInput" placeholder="Search station..." 
        class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"/>
    </div>
    <div id="stationSearchResults" class="flex flex-col gap-3 max-h-96 overflow-y-auto"></div>
  `;
  bottomSheetContent.innerHTML = searchHTML;
  bottomSheet.classList.remove("translate-y-full");
  bottomSheet.classList.add("translate-y-0");

  const input = document.getElementById("stationSearchInput");
  const resultsContainer = document.getElementById("stationSearchResults");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    resultsContainer.innerHTML = "";
    const filtered = stations.filter(station => station.name.toLowerCase().includes(query));
    if(filtered.length === 0){
      resultsContainer.innerHTML = `<p class="text-slate-500">No stations found</p>`;
    }
    filtered.forEach(station => {
      const div = document.createElement("div");
      div.className = "p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-primary/10";
      div.textContent = station.name;
      div.addEventListener("click", () => openBottomSheet(station));
      resultsContainer.appendChild(div);
    });
  });
}

function openSearchPanel() {
  // Create search HTML for desktop panel
  let searchHTML = `
    <div class="mb-4">
      <input type="text" id="stationSearchInputDesktop" placeholder="Search station..." 
        class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"/>
    </div>
    <div id="stationSearchResultsDesktop" class="flex flex-col gap-3 max-h-96 overflow-y-auto"></div>
  `;
  stationPanelContent.innerHTML = searchHTML;
  stationPanel.classList.add("open");
  stationPanel.classList.remove("hidden");

  const input = document.getElementById("stationSearchInputDesktop");
  const resultsContainer = document.getElementById("stationSearchResultsDesktop");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    resultsContainer.innerHTML = "";
    const filtered = stations.filter(station => station.name.toLowerCase().includes(query));
    if(filtered.length === 0){
      resultsContainer.innerHTML = `<p class="text-slate-500">No stations found</p>`;
    }
    filtered.forEach(station => {
      const div = document.createElement("div");
      div.className = "p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-primary/10";
      div.textContent = station.name;
      div.addEventListener("click", () => openStationPanel(station));
      resultsContainer.appendChild(div);
    });
  });
}