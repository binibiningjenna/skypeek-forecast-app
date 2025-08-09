const info = [
    { icon: "thermometer-low", category: "Feels like", id: "feelsLike"},
    { icon: "moisture", category: "Humidity", id: "humidity"},
    { icon: "wind", category: "Wind", id: "wind"},
    { icon: "eye", category: "Visibility", id: "visibility"},
];

let html = '';
let weatherInfo = document.getElementById('weatherData');
info.forEach((weather) => {
    html += `
     <div class="col-6 text-start">
       <div class="small-card py-2 ps-3">
        <div><i class="bi bi-${weather.icon} fs-5 me-2"></i></div>
        <small>${weather.category}</small>
        <div class="h5 pt-3" id="${weather.id}"></div>
       </div>
    </div>
    `;
});
weatherInfo.innerHTML = html;

function showLoader() {
    document.getElementById('loader').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

const API_KEY = '605b6fec2bba31d4f989397d440c8274';

window.onload = function () {
    useMyLocation();
};

function useMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
        },
            (error) => {
                console.warn("Geolocation failed or denied. Loading default city.");
                getWeatherByCity('Manila');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        console.warn("Geolocation not supported. Loading default city.");
        getWeatherByCity("Manila");
    }
}

async function getWeatherByCity(cityName = null) {
    try {
        showLoader();
        const city = cityName || document.getElementById('searchInput').value;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        displayWeather(data);
        getFiveDaysForecast(city);
        getHourlyForecast(city);
    } catch (error) {
        console.log(error);
        showAlert();
    } finally {
        hideLoader();
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        showLoader();
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        displayWeather(data);
        getFiveDaysForecast(data.name);
        getHourlyForecast(data.name);
    } catch (error) {
        console.log(error);
        showAlert();
    } finally {
        hideLoader();
    }
}

async function getFiveDaysForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        const daily = {};
        data.list.forEach(entry => {
            const date = entry.dt_txt.split(' ')[0];
            const hour = entry.dt_txt.split(' ')[1];
            if (hour === "12:00:00") {
                daily[date] = entry;
            }
        });
        displayFiveDaysForecast(daily);

    } catch (error) {
        console.log(error);
    }
}

async function displayFiveDaysForecast(dailyData) {
    let content = '';
    let firstDay = true;

    for (let date in dailyData) {
        let dayName;

        if (firstDay) {
            dayName = "Today";
            firstDay = false;
        } else {
            dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        }
        content += `
        <div class="text-center small-card py-3 px-4 mx-1">
            <small>${dayName}</small>
            <div class="h5 py-1 ">${Math.round(dailyData[date].main.temp)}°C</div>
            <img src="https://openweathermap.org/img/wn/${dailyData[date].weather[0].icon}.png" />
        </div>
          `;
    }
    document.getElementById('forecast').innerHTML = content;
}

async function getHourlyForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        const chartData = data.list.slice(0, 8).map(entry => {
            const date = new Date(entry.dt_txt);
            const options = { hour: 'numeric', hour12: true };
            return {
                hour: date.toLocaleString('en-US', options),
                temp: Math.round(entry.main.temp)
            }
        });

        displayHourlyForecast(chartData);
    } catch (error) {
        console.log(error);
    }
}

function displayHourlyForecast(chartData) {
    am5.ready(function () {
        // Create root
        var root = am5.Root.new("hourlyForecastChart");

        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        // Create chart
        var chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: true,
                panY: false,
                wheelX: "panX",
                wheelY: "zoomX",
                layout: root.verticalLayout
            })
        );

        // Create X Axis (Category)
        var xAxis = chart.xAxes.push(
            am5xy.CategoryAxis.new(root, {
                categoryField: "hour",
                renderer: am5xy.AxisRendererX.new(root, {
                    minGridDistance: 40,
                    strokeOpacity: 0.2
                }),
                tooltip: am5.Tooltip.new(root, {})
            })
        );

        xAxis.get("renderer").labels.template.setAll({
            fill: am5.color(0xf2efeb)
        });

        xAxis.data.setAll(chartData);

        // Create Y Axis (Value)
        var yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, {
                    strokeOpacity: 0.2
                })
            })
        );

        yAxis.get("renderer").labels.template.setAll({
            fill: am5.color(0xf2efeb)
        });

        // Create series (Smoothed Line)
        var series = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
                name: "Temperature",
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "temp",
                categoryXField: "hour",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "{valueY} °C"
                }),
                stroke: am5.color(0x00ffff)
            })
        );

        series.strokes.template.setAll({
            strokeWidth: 3
        });

        series.data.setAll(chartData);

        // Add cursor
        chart.set("cursor", am5xy.XYCursor.new(root, {
            behavior: "none",
            xAxis: xAxis
        }));

        // Animate
        series.appear(1000);
        chart.appear(1000, 100);
    });
}

function displayWeather(data) {
    document.getElementById('city').textContent = ` ${data.name}, ${data.sys.country}`;
    document.getElementById('temp').textContent = `${Math.round(data.main.temp)} °C`;
    let rawDescription = data.weather[0].description;
    let capitalizedDescription = rawDescription.charAt(0).toUpperCase() + rawDescription.slice(1);
    document.getElementById('description').textContent = capitalizedDescription;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)} °C`;
    document.getElementById('wind').textContent = `${Math.round(data.wind.speed)} m/s`;
    document.getElementById('humidity').textContent = `${Math.round(data.main.humidity)} °C`;
    let visibilityKm = Math.round(data.visibility / 1000);
    document.getElementById('visibility').textContent = `${visibilityKm} km`;
}

function showAlert() {
    const alert = document.getElementById('alert');
    const cityName = null || document.getElementById('searchInput').value.trim();
    document.getElementById('searched-city').textContent = cityName;
    if (alert) {
        alert.style.display = 'block';

        setTimeout(() => {
            alert.style.display = 'none';
        }, 8000);
    }
}

document.getElementById('searchInput').addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        getWeatherByCity();
    }
})

