const apiKey = "f267736c362475ed7e9897c3834f56ad";
var DateTime = luxon.DateTime;

function getWeather(city) {
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
        method: 'GET'
    }).then(function (result) {
        var date = DateTime.fromSeconds(result.dt).toLocaleString();
        var temp = result.main.temp.toFixed(1) + ' °C';
        var humidity = result.main.humidity + '%';
        var wind = (result.wind.speed * 1.60934).toFixed(1) + ' km/h';

        // Get UV index
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${result.coord.lat}&lon=${result.coord.lon}`,
            method: 'GET'
        }).then(function (result) {
            $("#lblUVIndex").text(result.value);
            $("#lblUVIndex").removeClass("badge-success badge-warning badge-danger");
            if(result.value < 6)
                $("#lblUVIndex").addClass("badge-success");
            else if(result.value >= 6 && result.value < 8)
                $("#lblUVIndex").addClass("badge-warning");
            else if(result.value >= 8)
                $("#lblUVIndex").addClass("badge-danger");
        });

        $("#city").text(`${result.name} (${date})`).append(getIcon(result.weather[0].main));
        $("#lblTemp").text(temp);
        $("#lblHumidity").text(humidity);
        $("#lblWindSpeed").text(wind);

    getForecast(result.coord.lat, result.coord.lon);

    $("#forecast").css("display", "block");
    });
}

function getForecast(lat,lon) {
    $(".forecast-item").remove();
    $.ajax({ 
        url: `https://api.openweathermap.org/data/2.5/onecall?units=metric&lat=${lat}&lon=${lon}&exclude=current,hourly,minutely&appid=${apiKey}`,
        method: 'GET'
    }).then(function (result) {
        for(var i = 1; i < 6; i++) {
            var dateReturned = DateTime.fromSeconds(result.daily[i].dt).toLocaleString();
            var weather = result.daily[i].weather[0].main;
            var tempReturned = result.daily[i].temp.day + ' °C';
            var humidityReturned = result.daily[i].humidity + '%';

            var card = $("<div>").addClass("card").addClass("forecast-item").width("12rem").css("float", "left");
            var cardBody = $("<div>").addClass("card-body");
            var date = $("<h4>").addClass("card-text").text(dateReturned);
            var icon = $("<h4>").append(getIcon(weather));
            var temp = $("<span>").addClass("card-text").text("Temp: ");
            var tempValue = $("<span>").addClass("card-text").text(tempReturned);
            var humidity = $("<span>").addClass("card-text").text("Humidity: ");
            var humidityValue = $("<span>").addClass("card-text").text(humidityReturned);
            cardBody.append(date, icon, temp, tempValue, $("<br>"), humidity, humidityValue);
            card.append(cardBody);
            $("#forecast").append(card);
        }
    })
}

function getIcon(weather) {
    var icon = $("<i>").addClass("fas");
    if(weather == 'Clouds')
        icon.addClass("fa-cloud");
    else if(weather == 'Clear')
        icon.addClass("fa-sun");
    else if(weather == 'Rain')
        icon.addClass("fa-cloud-rain");
    else if(weather == "Haze")
        icon.addClass("fa-smog");
    else if(weather == "Snow")
        icon.addClass("fa-snowflake");
    else
        console.log(weather)

    return icon;
}

function getCities() {
    $("#cityList").empty();
    if(localStorage.getItem("cities") != null) {
        var arrCities = JSON.parse(localStorage.getItem("cities"));
        arrCities.forEach(city => {
            $("#cityList").append($("<li>").addClass("list-group-item").text(city).on("click", function() {getWeather($(this).text())}));
        });
        getWeather(arrCities[0]); // Get latest city requested on page load (if exists)
    }
}

function saveCity(city) {
    arrCities = null;
    if(localStorage.getItem("cities") != null) {
        arrCities = JSON.parse(localStorage.getItem("cities"));
    }
    if (arrCities == null)
        arrCities = [];
    if(arrCities.includes(city)) {
        arrCities.splice(arrCities.indexOf(city), 1);
    }
    else {
        $("#cityList").prepend($("<li>").addClass("list-group-item").text(city).on("click", function() {getWeather($(this).text())}));
    }
    arrCities.unshift(city);
    localStorage.setItem("cities", JSON.stringify(arrCities));
    getCities();
}

$("form").on("submit", function(e) {
    e.preventDefault();
    saveCity($("#txtCity").val());
    getWeather($("#txtCity").val());
    getForecast($("#txtCity").val());
})

$(document).ready(function () {
    getCities();
});