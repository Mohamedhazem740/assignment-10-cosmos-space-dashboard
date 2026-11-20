var NASA_API_KEY = "DEMO_KEY";
var APOD_URL = "https://api.nasa.gov/planetary/apod";
var LAUNCHES_URL = "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=10";
var PLANETS_URL = "https://solar-system-opendata-proxy.vercel.app/api/planets";

var LAUNCH_PLACEHOLDER = "images/launch-placeholder.png";
var APOD_PLACEHOLDER = "images/placeholder.jpg"; 

var sidebar = document.getElementById("sidebar");
var sidebarToggle = document.getElementById("sidebar-toggle");
var navLinks = document.querySelectorAll(".nav-link");
var appSections = document.querySelectorAll(".app-section");
var launchesCount = document.getElementById("launches-count");
var launchesCountMobile = document.getElementById("launches-count-mobile");

var apodDate = document.getElementById("apod-date");
var apodDateInput = document.getElementById("apod-date-input");
var loadDateBtn = document.getElementById("load-date-btn");
var todayApodBtn = document.getElementById("today-apod-btn");
var apodImageContainer = document.getElementById("apod-image-container");
var apodLoading = document.getElementById("apod-loading");
var apodImage = document.getElementById("apod-image");
var apodTitle = document.getElementById("apod-title");
var apodDateDetail = document.getElementById("apod-date-detail");
var apodExplanation = document.getElementById("apod-explanation");
var apodCopyright = document.getElementById("apod-copyright");
var apodDateInfo = document.getElementById("apod-date-info");
var apodMediaType = document.getElementById("apod-media-type");

var featuredLaunch = document.getElementById("featured-launch");
var launchesGrid = document.getElementById("launches-grid");

var planetsGrid = document.getElementById("planets-grid");
var planetComparisonTbody = document.getElementById("planet-comparison-tbody");
var planetDetailImage = document.getElementById("planet-detail-image");
var planetDetailName = document.getElementById("planet-detail-name");
var planetDetailDescription = document.getElementById("planet-detail-description");
var planetDistance = document.getElementById("planet-distance");
var planetRadius = document.getElementById("planet-radius");
var planetMass = document.getElementById("planet-mass");
var planetDensity = document.getElementById("planet-density");
var planetOrbitalPeriod = document.getElementById("planet-orbital-period");
var planetRotation = document.getElementById("planet-rotation");
var planetMoons = document.getElementById("planet-moons");
var planetGravity = document.getElementById("planet-gravity");
var planetDiscoverer = document.getElementById("planet-discoverer");
var planetDiscoveryDate = document.getElementById("planet-discovery-date");
var planetBodyType = document.getElementById("planet-body-type");
var planetVolume = document.getElementById("planet-volume");
var planetFacts = document.getElementById("planet-facts");
var planetPerihelion = document.getElementById("planet-perihelion");
var planetAphelion = document.getElementById("planet-aphelion");
var planetEccentricity = document.getElementById("planet-eccentricity");
var planetInclination = document.getElementById("planet-inclination");
var planetAxialTilt = document.getElementById("planet-axial-tilt");
var planetTemp = document.getElementById("planet-temp");
var planetEscape = document.getElementById("planet-escape");

var planets = [];            
var selectedPlanetId = "";   
var currentHdUrl = "";       
var sidebarOverlay = null;

var planetInfo = {
    mercury: { color: "#eab308", type: "Terrestrial", description: "Mercury is the smallest planet in the Solar System and the closest to the Sun. Its orbit around the Sun takes 87.97 Earth days, the shortest of all the Sun's planets." },
    venus: { color: "#f97316", type: "Terrestrial", description: "Venus is the second planet from the Sun. It is named after the Roman goddess of love and beauty. As the second-brightest natural object in Earth's night sky after the Moon, Venus can cast shadows." },
    earth: { color: "#3b82f6", type: "Terrestrial", description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 29% of Earth's surface is land consisting of continents and islands." },
    mars: { color: "#ef4444", type: "Terrestrial", description: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. Often referred to as the 'Red Planet' due to its reddish appearance." },
    jupiter: { color: "#fb923c", type: "Gas Giant", description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all the other planets combined." },
    saturn: { color: "#facc15", type: "Gas Giant", description: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius of about nine and a half times that of Earth." },
    uranus: { color: "#06b6d4", type: "Ice Giant", description: "Uranus is the seventh planet from the Sun. Its name is a reference to the Greek god of the sky. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System." },
    neptune: { color: "#2563eb", type: "Ice Giant", description: "Neptune is the eighth and farthest-known Solar planet from the Sun. In the Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet." }
};

var typeBadgeStyles = {
    "Terrestrial": "background-color: rgba(249, 115, 22, 0.5); color: #fed7aa;",
    "Gas Giant": "background-color: rgba(168, 85, 247, 0.5); color: #e9d5ff;",
    "Ice Giant": "background-color: rgba(59, 130, 246, 0.5); color: #bfdbfe;"
};

function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function parseDateString(text) {
    if (!text) return new Date();
    var parts = text.split("-");
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function formatLongDate(text) {
    return parseDateString(text).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatShortDate(text) {
    return parseDateString(text).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function getTodayString() {
    var now = new Date();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    return now.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
}

function showSection(sectionId) {
    appSections.forEach(section => {
        section.classList.toggle("hidden", section.id !== sectionId);
    });
    navLinks.forEach(link => {
        var isActive = link.getAttribute("data-section") === sectionId;
        link.classList.toggle("bg-blue-500/10", isActive);
        link.classList.toggle("text-blue-400", isActive);
        link.classList.toggle("text-slate-300", !isActive);
        link.classList.toggle("hover:bg-slate-800", !isActive);
    });
    closeSidebar();
    window.scrollTo(0, 0);
}

navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();
        showSection(this.getAttribute("data-section"));
    });
});

function openSidebar() {
    sidebar.classList.add("sidebar-open");
    if (!sidebarOverlay) {
        sidebarOverlay = document.createElement("div");
        sidebarOverlay.className = "sidebar-overlay fixed inset-0 bg-black/50 z-40";
        sidebarOverlay.addEventListener("click", closeSidebar);
        document.body.appendChild(sidebarOverlay);
    }
}

function closeSidebar() {
    sidebar.classList.remove("sidebar-open");
    if (sidebarOverlay) {
        sidebarOverlay.remove();
        sidebarOverlay = null;
    }
}

sidebarToggle.addEventListener("click", function () {
    sidebar.classList.contains("sidebar-open") ? closeSidebar() : openSidebar();
});

document.addEventListener("click", function (e) {
    var heartBtn = e.target.closest("[data-heart]");
    if (!heartBtn) return;
    var isSaved = heartBtn.getAttribute("data-heart") === "saved";
    heartBtn.setAttribute("data-heart", isSaved ? "" : "saved");
    heartBtn.innerHTML = isSaved ? `<i class="far fa-heart"></i>` : `<i class="fas fa-heart text-red-400"></i>`;
});

function updateDateLabel() {
    var label = apodDateInput.nextElementSibling;
    if (label && apodDateInput.value) {
        label.textContent = formatShortDate(apodDateInput.value);
    }
}

function removeApodExtras() {
    var error = document.getElementById("apod-error");
    if (error) error.remove();
    var video = document.getElementById("apod-video");
    if (video) video.remove();
}

function showApodLoading() {
    removeApodExtras();
    apodLoading.classList.remove("hidden");
    apodImage.classList.add("hidden");
}

function showApodError() {
    removeApodExtras();
    apodLoading.classList.add("hidden");
    apodImage.classList.add("hidden");
    
    apodImageContainer.insertAdjacentHTML("beforeend", `
        <div id="apod-error" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50">
            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p class="text-slate-300 font-medium">Failed to load image</p>
        </div>
    `);
}

async function loadApod(date) {
    showApodLoading();
    apodImage.src = APOD_PLACEHOLDER;
    var url = `${APOD_URL}?api_key=${NASA_API_KEY}${date ? `&date=${date}` : ""}`;
    
    try {
        var response = await fetch(url);
        if (!response.ok) throw new Error("Failed");
        var data = await response.json();
        displayApod(data);
    } catch (error) {
        var shownDate = date || apodDateInput.value || getTodayString();
        apodDate.textContent = "Astronomy Picture of the Day - " + formatLongDate(shownDate);
        apodTitle.textContent = "Invalid Date or No Image Found";
        apodExplanation.textContent = "No data available for the selected date. Please choose a valid past date.";
        apodDateDetail.innerHTML = `<i class="far fa-calendar mr-1"></i>${formatLongDate(shownDate)}`;
        apodDateInfo.textContent = "Invalid Date";
        apodMediaType.textContent = "Video";
        apodCopyright.classList.add("hidden");
        showApodError();
    }
}

function displayApod(data) {
    apodLoading.classList.add("hidden");
    removeApodExtras();

    apodDate.textContent = "Astronomy Picture of the Day - " + formatLongDate(data.date);
    apodDateDetail.innerHTML = `<i class="far fa-calendar mr-1"></i>${formatLongDate(data.date)}`;
    apodDateInfo.textContent = formatLongDate(data.date);
    apodDateInput.value = data.date;
    updateDateLabel();

    apodTitle.textContent = data.title;
    apodExplanation.textContent = data.explanation;
    if (data.copyright) {
        apodCopyright.textContent = "© " + data.copyright.replace(/\n/g, " ").trim();
        apodCopyright.classList.remove("hidden");
    } else {
        apodCopyright.classList.add("hidden");
    }
    apodMediaType.textContent = data.media_type === "video" ? "Video" : "Image";
    currentHdUrl = data.hdurl || data.url;

    if (data.media_type === "video") {
        apodImage.classList.add("hidden");
        apodImageContainer.insertAdjacentHTML("beforeend",
            `<iframe id="apod-video" class="w-full h-full min-h-[400px]" src="${escapeHtml(data.url)}" title="${escapeHtml(data.title)}" allowfullscreen></iframe>`);
    } else {
        apodImage.classList.remove("hidden");
        apodImage.setAttribute("alt", data.title);
        apodImage.setAttribute("src", data.url);
    }
}

apodImageContainer.addEventListener("click", function (e) {
    if (e.target.closest("button") && currentHdUrl) {
        window.open(currentHdUrl, "_blank");
    }
});

loadDateBtn.addEventListener("click", function () {
    if (apodDateInput.value) loadApod(apodDateInput.value);
});

todayApodBtn.addEventListener("click", function () {
    apodDateInput.value = getTodayString();
    updateDateLabel();
    loadApod(getTodayString());
});

apodDateInput.addEventListener("change", updateDateLabel);

function getStatusStyle(abbrev) {
    if (abbrev === "Go") return "background-color: rgba(34, 197, 94, 0.9); color: #ffffff;";
    if (abbrev === "TBD" || abbrev === "TBC") return "background-color: rgba(245, 158, 11, 0.9); color: #ffffff;";
    return "background-color: rgba(239, 68, 68, 0.9); color: #ffffff;";
}

function getLaunchInfo(launch) {
    var rocketName = launch.rocket?.configuration?.name || launch.rocket?.configuration?.full_name || "Unknown rocket";
    var locationName = launch.pad?.location?.name || launch.pad?.name || "Unknown location";
    var country = launch.pad?.location?.country?.name || launch.pad?.location?.country_code || launch.pad?.country?.name || "Unknown";
    var provider = launch.launch_service_provider?.name || "Unknown provider";
    var statusAbbrev = launch.status?.abbrev || launch.status?.name || "TBD";
    var image = launch.image?.image_url || launch.image || LAUNCH_PLACEHOLDER;
    return {
        name: launch.name,
        provider: provider,
        rocket: rocketName,
        location: locationName,
        country: country,
        status: statusAbbrev,
        description: launch.mission?.description || "No description available for this mission yet.",
        image: image,
        net: launch.net
    };
}

function formatLaunchDateLong(net) {
    return new Date(net).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function formatLaunchDateShort(net) {
    return new Date(net).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

function formatLaunchTime(net) {
    return new Date(net).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" }) + " UTC";
}

function getDaysUntil(net) {
    var days = Math.ceil((new Date(net).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days < 0 ? 0 : days;
}

function displayFeaturedLaunch(launch) {
    var info = getLaunchInfo(launch);
    featuredLaunch.innerHTML = `
        <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
            <div class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
                <div class="flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                                <i class="fas fa-star"></i> Featured Launch
                            </span>
                            <span class="px-4 py-1.5 rounded-full text-sm font-semibold" style="${getStatusStyle(info.status)}">${escapeHtml(info.status)}</span>
                        </div>
                        <h3 class="text-3xl font-bold mb-3 leading-tight">${escapeHtml(info.name)}</h3>
                        <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
                            <div class="flex items-center gap-2"><i class="fas fa-building"></i> <span>${escapeHtml(info.provider)}</span></div>
                            <div class="flex items-center gap-2"><i class="fas fa-rocket"></i> <span>${escapeHtml(info.rocket)}</span></div>
                        </div>
                        <div class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
                            <i class="fas fa-clock text-2xl text-blue-400"></i>
                            <div>
                                <p class="text-2xl font-bold text-blue-400">${getDaysUntil(info.net)}</p>
                                <p class="text-xs text-slate-400">Days Until Launch</p>
                            </div>
                        </div>
                        <div class="grid xl:grid-cols-2 gap-4 mb-6">
                            <div class="bg-slate-900/50 rounded-xl p-4">
                                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-calendar"></i> Launch Date</p>
                                <p class="font-semibold">${formatLaunchDateLong(info.net)}</p>
                            </div>
                            <div class="bg-slate-900/50 rounded-xl p-4">
                                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-clock"></i> Launch Time</p>
                                <p class="font-semibold">${formatLaunchTime(info.net)}</p>
                            </div>
                            <div class="bg-slate-900/50 rounded-xl p-4">
                                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-map-marker-alt"></i> Location</p>
                                <p class="font-semibold text-sm line-clamp-1">${escapeHtml(info.location)}</p>
                            </div>
                            <div class="bg-slate-900/50 rounded-xl p-4">
                                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-globe"></i> Country</p>
                                <p class="font-semibold">${escapeHtml(info.country)}</p>
                            </div>
                        </div>
                        <p class="text-slate-300 leading-relaxed mb-6">${escapeHtml(info.description)}</p>
                    </div>
                    <div class="flex flex-col md:flex-row gap-3">
                        <button class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
                            <i class="fas fa-info-circle"></i> View Full Details
                        </button>
                        <div class="icons self-end md:self-center">
                            <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors" data-heart=""><i class="far fa-heart"></i></button>
                            <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"><i class="fas fa-bell"></i></button>
                        </div>
                    </div>
                </div>
                <div class="relative">
                    <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
                        <img src="${escapeHtml(info.image)}" alt="${escapeHtml(info.name)}" class="absolute inset-0 w-full h-full object-cover" onerror="this.onerror=null;this.src='${LAUNCH_PLACEHOLDER}'">
                        <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
                    </div>
                </div>
            </div>
        </div>`;
}

function displayLaunchesGrid(list) {
    launchesGrid.innerHTML = list.map(launch => {
        var info = getLaunchInfo(launch);
        return `
        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer">
            <div class="relative h-48 bg-slate-900/50 overflow-hidden">
                <img src="${escapeHtml(info.image)}" alt="${escapeHtml(info.name)}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='${LAUNCH_PLACEHOLDER}'">
                <div class="absolute top-3 right-3">
                    <span class="px-3 py-1 backdrop-blur-sm rounded-full text-xs font-semibold" style="${getStatusStyle(info.status)}">${escapeHtml(info.status)}</span>
                </div>
            </div>
            <div class="p-5">
                <div class="mb-3">
                    <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">${escapeHtml(info.name)}</h4>
                    <p class="text-sm text-slate-400 flex items-center gap-2"><i class="fas fa-building text-xs"></i> ${escapeHtml(info.provider)}</p>
                </div>
                <div class="space-y-2 mb-4">
                    <div class="flex items-center gap-2 text-sm"><i class="fas fa-calendar text-slate-500 w-4"></i> <span class="text-slate-300">${formatLaunchDateShort(info.net)}</span></div>
                    <div class="flex items-center gap-2 text-sm"><i class="fas fa-clock text-slate-500 w-4"></i> <span class="text-slate-300">${formatLaunchTime(info.net)}</span></div>
                    <div class="flex items-center gap-2 text-sm"><i class="fas fa-rocket text-slate-500 w-4"></i> <span class="text-slate-300">${escapeHtml(info.rocket)}</span></div>
                    <div class="flex items-center gap-2 text-sm"><i class="fas fa-map-marker-alt text-slate-500 w-4"></i> <span class="text-slate-300 line-clamp-1">${escapeHtml(info.location)}</span></div>
                </div>
                <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
                    <button class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">Details</button>
                    <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors" data-heart=""><i class="far fa-heart"></i></button>
                </div>
            </div>
        </div>`;
    }).join("");
}

async function loadLaunches() {
    featuredLaunch.innerHTML = "";
    launchesGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
            <p class="text-slate-400">Loading upcoming launches...</p>
        </div>`;
    try {
        var response = await fetch(LAUNCHES_URL);
        if (!response.ok) throw new Error("Failed");
        var data = await response.json();
        var list = data.results || [];
        
        if (list.length > 0) {
            displayFeaturedLaunch(list[0]);
            displayLaunchesGrid(list.slice(1));
            launchesCount.textContent = list.length + " Launches";
            launchesCountMobile.textContent = list.length;
        }
    } catch (error) {
        featuredLaunch.innerHTML = "";
        launchesGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
                <p class="text-slate-400">Failed to load launches.</p>
            </div>`;
    }
}

function getPlanetId(planet) {
    return (planet.englishName || planet.name).toLowerCase();
}
function getMassKg(planet) {
    return planet.mass ? planet.mass.massValue * Math.pow(10, planet.mass.massExponent) : 0;
}
function formatMillionKm(km) {
    return (km / 1000000).toFixed(1) + "M km";
}
function formatPower(value, exponent) {
    return value + " × 10^" + exponent;
}
function formatOrbitalPeriod(days) {
    return days < 365 ? Math.round(days) + " days" : (days / 365.25).toFixed(1) + " years";
}
function getAu(planet) {
    return planet.semimajorAxis / 149597870.7;
}

function displayPlanetsGrid() {
    planetsGrid.innerHTML = planets.map(planet => {
        var id = getPlanetId(planet);
        var info = planetInfo[id] || { color: "#94a3b8", type: "Terrestrial" };
        return `
        <div class="planet-card bg-slate-800/50 border border-slate-700 rounded-2xl p-4 transition-all cursor-pointer group" data-planet-id="${id}" style="--planet-color: ${info.color}">
            <div class="relative mb-3 h-24 flex items-center justify-center">
                <img class="w-20 h-20 object-contain group-hover:scale-110 transition-transform" src="images/${id}.png" alt="${escapeHtml(planet.englishName || planet.name)}">
            </div>
            <h4 class="font-semibold text-center text-sm">${escapeHtml(planet.englishName || planet.name)}</h4>
            <p class="text-xs text-slate-400 text-center">${getAu(planet).toFixed(2)} AU</p>
        </div>`;
    }).join("");

    planetsGrid.querySelectorAll(".planet-card").forEach(card => {
        card.addEventListener("click", () => selectPlanet(card.getAttribute("data-planet-id")));
        card.addEventListener("mouseover", function () {
            this.style.borderColor = getComputedStyle(this).getPropertyValue("--planet-color").trim() + "80";
        });
        card.addEventListener("mouseout", updateSelectedCard);
    });
}

function updateSelectedCard() {
    planetsGrid.querySelectorAll(".planet-card").forEach(card => {
        var isSelected = card.getAttribute("data-planet-id") === selectedPlanetId;
        var color = getComputedStyle(card).getPropertyValue("--planet-color").trim();
        card.classList.toggle("ring", isSelected);
        card.style.setProperty("--tw-ring-color", color);
        card.style.borderColor = isSelected ? color : "#334155";
    });
}

function displayPlanetsTable() {
    var earthMass = 5.97237e24; 
    
    planetComparisonTbody.innerHTML = planets.map(planet => {
        var info = planetInfo[getPlanetId(planet)] || { color: "#94a3b8", type: "Terrestrial" };
        return `
        <tr class="hover:bg-slate-800/30 transition-colors">
            <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
                <div class="flex items-center space-x-2 md:space-x-3">
                    <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color: ${info.color}"></div>
                    <span class="font-semibold text-sm md:text-base whitespace-nowrap">${escapeHtml(planet.englishName || planet.name)}</span>
                </div>
            </td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${getAu(planet).toFixed(2)}</td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${Math.round(planet.meanRadius * 2).toLocaleString("en-US")}</td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${(getMassKg(planet) / earthMass).toFixed(3)}</td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${formatOrbitalPeriod(planet.sideralOrbit)}</td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${planet.moons ? planet.moons.length : 0}</td>
            <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                <span class="px-2 py-1 rounded text-xs" style="${typeBadgeStyles[info.type]}">${info.type}</span>
            </td>
        </tr>`;
    }).join("");
}

function selectPlanet(id) {
    var planet = planets.find(p => getPlanetId(p) === id);
    if (!planet) return;

    selectedPlanetId = id;
    var info = planetInfo[id] || { description: "" };

    planetDetailImage.setAttribute("src", "images/" + id + ".png");
    planetDetailImage.setAttribute("alt", planet.englishName || planet.name);
    planetDetailName.textContent = planet.englishName || planet.name;
    planetDetailDescription.textContent = info.description;

    planetDistance.textContent = formatMillionKm(planet.semimajorAxis);
    planetRadius.textContent = planet.meanRadius + " km";
    planetMass.textContent = formatPower(planet.mass.massValue, planet.mass.massExponent) + " kg";
    planetDensity.textContent = planet.density.toFixed(2) + " g/cm³";
    planetOrbitalPeriod.textContent = planet.sideralOrbit.toFixed(2) + " days";
    planetRotation.textContent = planet.sideralRotation.toFixed(2) + " hours";
    planetMoons.textContent = planet.moons ? planet.moons.length : 0;
    planetGravity.textContent = planet.gravity + " m/s²";

    planetDiscoverer.textContent = planet.discoveredBy || "Known since antiquity";
    planetDiscoveryDate.textContent = planet.discoveryDate || "Ancient times";
    planetBodyType.textContent = planet.bodyType || "Planet";
    planetVolume.textContent = planet.vol ? formatPower(planet.vol.volValue, planet.vol.volExponent) + " km³" : "N/A";

    planetFacts.innerHTML = [
        `Mass: ${formatPower(planet.mass.massValue, planet.mass.massExponent)} kg`,
        `Surface gravity: ${planet.gravity} m/s²`,
        `Density: ${planet.density} g/cm³`,
        `Axial tilt: ${planet.axialTilt}°`
    ].map(fact => `
        <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
            <span class="text-slate-300">${fact}</span>
        </li>`
    ).join("");

    planetPerihelion.textContent = formatMillionKm(planet.perihelion);
    planetAphelion.textContent = formatMillionKm(planet.aphelion);
    planetEccentricity.textContent = planet.eccentricity.toFixed(5);
    planetInclination.textContent = planet.inclination.toFixed(2) + "°";
    planetAxialTilt.textContent = planet.axialTilt.toFixed(2) + "°";
    planetTemp.textContent = planet.avgTemp + "°C";
    planetEscape.textContent = (planet.escape / 1000).toFixed(2) + " km/s";

    var heartBtn = planetDetailName.nextElementSibling;
    if (heartBtn) {
        heartBtn.setAttribute("data-heart", "");
        heartBtn.innerHTML = `<i class="far fa-heart"></i>`;
    }

    updateSelectedCard();
}

async function loadPlanets() {
    try {
        var response = await fetch(PLANETS_URL);
        if (!response.ok) throw new Error("Failed");
        var data = await response.json();
        
        var bodies = Array.isArray(data) ? data : (data.bodies || []);
        planets = bodies.filter(b => b.isPlanet === true || b.bodyType === "Planet");
        
        planets.sort((a, b) => a.semimajorAxis - b.semimajorAxis);

        displayPlanetsGrid();
        displayPlanetsTable();
        
        var earth = planets.find(p => getPlanetId(p) === "earth");
        if(earth) selectPlanet("earth");
        else if (planets.length > 0) selectPlanet(getPlanetId(planets[0]));

    } catch (error) {
        planetsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
                <p class="text-slate-400">Failed to load planets.</p>
            </div>`;
    }
}

function init() {
    apodDateInput.setAttribute("max", getTodayString());
    apodDateInput.value = getTodayString();
    updateDateLabel();

    var heartBtn = planetDetailName.nextElementSibling;
    if (heartBtn) heartBtn.setAttribute("data-heart", "");

    planetsGrid.innerHTML = "";
    planetComparisonTbody.innerHTML = "";
    featuredLaunch.innerHTML = "";
    launchesGrid.innerHTML = "";

    showSection("today-in-space");
    
    loadApod(getTodayString());
    loadLaunches();
    loadPlanets();
}

init();