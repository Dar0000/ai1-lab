
// API ключ
const API_KEY = "2925b687588be844e7540c98a6627b66";

const cityInput = document.getElementById("city");
const btn = document.getElementById("btn");
const currentDiv = document.getElementById("current");
const forecastDiv = document.getElementById("forecast");

btn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return;

  currentDiv.innerHTML = "";
  forecastDiv.innerHTML = "";

  getCurrentWeather(city);
  getForecast(city);
});

/* ---- CURRENT WEATHER (XHR) ---- */
function getCurrentWeather(q) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${API_KEY}&units=metric&lang=en`;


  const xhr = new XMLHttpRequest();
  xhr.open("GET", url);

  xhr.onload = function () {
    if (xhr.status === 200) {
      const d = JSON.parse(xhr.responseText);
      console.log(d);
      currentDiv.innerHTML = `
    <h3>Current Weather</h3>
    <p><strong>${d.name}</strong></p>
    <p>Temperature: ${d.main.temp}°C</p>
    <p>Feels like: ${d.main.feels_like}°C</p>
  `;

    } else {
      currentDiv.textContent = "Error loading current weather";
    }
  };

  xhr.onerror = () => currentDiv.textContent = "Network error (XHR)";
  xhr.send();
}

/* ---- FORECAST (FETCH) ---- */
function getForecast(q) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${q}&appid=${API_KEY}&units=metric&lang=en`;

  fetch(url)
    .then(r => r.json())
    .then(data => displayForecast(data));
}

/* ---- DISPLAY 5-DAY FORECAST ---- */
function displayForecast(data) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const daily = data.list.filter(x => x.dt_txt.includes("12:00:00")).slice(0,5);

  let html = `<h3>5-Day Forecast</h3>`;

  daily.forEach(item => {
    const date = new Date(item.dt_txt);
    const weekday = days[date.getDay()];
    const ds = item.dt_txt.split(" ")[0];

    html += `
      <div class="forecast-card">
        <div class="forecast-left">
          <h4>${weekday}</h4>
          <div class="forecast-date">${ds}</div>
          <div class="forecast-temp">${item.main.temp}°C</div>
          <div class="forecast-feels">Feels like: ${item.main.feels_like}°C</div>
        </div>

        <div class="forecast-middle">
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png">
          <div class="forecast-desc">${item.weather[0].description}</div>
        </div>

        <div class="forecast-right">
          <div>Min: ${item.main.temp_min}°C</div>
          <div>Max: ${item.main.temp_max}°C</div>
          <div>Humidity: ${item.main.humidity}%</div>
        </div>
      </div>
    `;
  });

  forecastDiv.innerHTML = html;
}
