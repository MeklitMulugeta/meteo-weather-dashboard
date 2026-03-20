// OpenWeatherMap API configuration
const API_KEY = 'c01337c1d2560e2d06e0941d20e5054b';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Fallback weather data for common cities
const fallbackWeatherData = {
    'Addis Ababa': {
        temp: 22,
        humidity: 45,
        wind: 12,
        condition: 'Partly Cloudy',
        visibility: 10,
        icon: '⛅'
    },
    'London': {
        temp: 15,
        humidity: 78,
        wind: 18,
        condition: 'Cloudy',
        visibility: 8,
        icon: '☁️'
    },
    'Tokyo': {
        temp: 18,
        humidity: 65,
        wind: 14,
        condition: 'Clear Sky',
        visibility: 12,
        icon: '☀️'
    },
    'New York': {
        temp: 20,
        humidity: 55,
        wind: 16,
        condition: 'Sunny',
        visibility: 11,
        icon: '☀️'
    },
    'Paris': {
        temp: 17,
        humidity: 70,
        wind: 13,
        condition: 'Partly Cloudy',
        visibility: 9,
        icon: '⛅'
    },
    'Dubai': {
        temp: 35,
        humidity: 40,
        wind: 10,
        condition: 'Sunny',
        visibility: 15,
        icon: '☀️'
    },
    'Singapore': {
        temp: 28,
        humidity: 85,
        wind: 8,
        condition: 'Thunderstorm',
        visibility: 7,
        icon: '⛈️'
    },
    'Sydney': {
        temp: 24,
        humidity: 60,
        wind: 15,
        condition: 'Clear',
        visibility: 13,
        icon: '☀️'
    }
};

// DOM Elements
const cityTitle = document.querySelector('#left_side h1');
const temperature = document.querySelector('#left_bottom h2');
const weatherCondition = document.querySelector('#p1');
const dateTime = document.querySelector('#p2');
const weatherIcon = document.querySelector('#p1 img');

// Get all card value elements
const cardValues = document.querySelectorAll('#right_side .card-value');
const humidityValue = cardValues[0];
const windValue = cardValues[1];
const uvValue = cardValues[2];
const visibilityValue = cardValues[3];

// City navigation links
const cityLinks = document.querySelectorAll('.heads ul li a');
const searchInput = document.querySelector('.search input');

// Current active city
let currentCity = 'Addis Ababa';

// Function to fetch weather data from API
async function fetchWeatherFromAPI(cityName) {
    try {
        const url = `${BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
        console.log('Fetching from API:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok && data.cod === 200) {
            console.log('API Success:', data);
            return {
                success: true,
                data: {
                    temp: Math.round(data.main.temp),
                    humidity: data.main.humidity,
                    wind: Math.round(data.wind.speed * 3.6),
                    condition: data.weather[0].description,
                    visibility: (data.visibility / 1000).toFixed(1),
                    icon: data.weather[0].icon,
                    name: data.name
                }
            };
        } else {
            console.log('API Error:', data.message);
            return {
                success: false,
                message: data.message
            };
        }
    } catch (error) {
        console.error('Network Error:', error);
        return {
            success: false,
            message: 'Network error'
        };
    }
}

// Get fallback data
function getFallbackData(cityName) {
    // Normalize city name (capitalize first letter)
    const normalizedCity = cityName.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    
    console.log('Looking for fallback data for:', normalizedCity);
    
    // Find matching city in fallback data
    const matchedCity = Object.keys(fallbackWeatherData).find(
        city => city.toLowerCase() === normalizedCity.toLowerCase()
    );
    
    if (matchedCity) {
        console.log('Found fallback data for:', matchedCity);
        return {
            success: true,
            data: {
                ...fallbackWeatherData[matchedCity],
                name: matchedCity
            }
        };
    }
    
    console.log('No fallback data found for:', cityName);
    return {
        success: false,
        message: `City "${cityName}" not found`
    };
}

// Main function to get weather data
async function getWeatherData(cityName) {
    console.log('Getting weather for:', cityName);
    
    // First try API
    const apiResult = await fetchWeatherFromAPI(cityName);
    
    if (apiResult.success) {
        console.log('Using API data for:', cityName);
        return apiResult;
    }
    
    // If API fails, try fallback data
    console.log('API failed, trying fallback data');
    const fallbackResult = getFallbackData(cityName);
    
    if (fallbackResult.success) {
        console.log('Using fallback data for:', cityName);
        return fallbackResult;
    }
    
    // If all fails
    return {
        success: false,
        message: `City "${cityName}" not found. Try Addis Ababa, London, Tokyo, or New York.`
    };
}

// Update UI with weather data
function updateUI(weatherData, cityName) {
    console.log('Updating UI for:', cityName);
    
    // Update city name
    cityTitle.textContent = weatherData.name.toUpperCase();
    
    // Update temperature
    temperature.innerHTML = `${weatherData.temp}<sup>o</sup>`;
    
    // Update weather condition with icon
    let iconEmoji = '🌡️';
    const condition = weatherData.condition.toLowerCase();
    
    if (condition.includes('cloud')) iconEmoji = '☁️';
    else if (condition.includes('rain')) iconEmoji = '🌧️';
    else if (condition.includes('clear') || condition.includes('sun')) iconEmoji = '☀️';
    else if (condition.includes('partly')) iconEmoji = '⛅';
    else if (condition.includes('thunder')) iconEmoji = '⛈️';
    else if (condition.includes('snow')) iconEmoji = '❄️';
    else if (condition.includes('mist') || condition.includes('fog')) iconEmoji = '🌫️';
    
    const conditionText = weatherData.condition.charAt(0).toUpperCase() + 
                         weatherData.condition.slice(1);
    
    weatherCondition.innerHTML = `${iconEmoji} ${conditionText}`;
    
    // Update date and time
    const now = new Date();
    const options = { 
        weekday: 'long', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    };
    dateTime.textContent = now.toLocaleDateString('en-US', options);
    
    // Update weather details cards
    humidityValue.textContent = `${weatherData.humidity}%`;
    windValue.textContent = `${weatherData.wind} km/h`;
    
    // Calculate UV Index based on time and weather
    const hour = now.getHours();
    let uvText = 'Low 2';
    if (weatherData.condition.toLowerCase().includes('clear') || 
        weatherData.condition.toLowerCase().includes('sun')) {
        if (hour >= 10 && hour <= 15) uvText = 'High 8';
        else if (hour >= 8 && hour <= 17) uvText = 'Moderate 5';
    }
    uvValue.textContent = uvText;
    
    visibilityValue.textContent = `${weatherData.visibility} km`;
    
    // Update active class on city links
    cityLinks.forEach(link => {
        if (link.textContent.toLowerCase() === weatherData.name.toLowerCase()) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update current city
    currentCity = weatherData.name;
}

// Show loading state
function showLoading() {
    temperature.innerHTML = '--<sup>o</sup>';
    weatherCondition.innerHTML = 'Loading...';
    humidityValue.textContent = '---%';
    windValue.textContent = '--- km/h';
    uvValue.textContent = '---';
    visibilityValue.textContent = '--- km';
}

// Show error message
function showError(message) {
    console.error('Error:', message);
    weatherCondition.innerHTML = '⚠️ Error loading data';
    temperature.innerHTML = '--<sup>o</sup>';
    humidityValue.textContent = '---%';
    windValue.textContent = '--- km/h';
    uvValue.textContent = '---';
    visibilityValue.textContent = '--- km';
}

// Change city
async function changeCity(cityName) {
    console.log(`Changing to city: ${cityName}`);
    showLoading();
    
    const result = await getWeatherData(cityName);
    
    if (result.success) {
        updateUI(result.data, cityName);
    } else {
        showError(result.message);
        alert(result.message);
        
        // Reload current city data
        const currentResult = await getWeatherData(currentCity);
        if (currentResult.success) {
            updateUI(currentResult.data, currentCity);
        }
    }
}

// Search for city
async function searchCity(searchTerm) {
    if (!searchTerm || !searchTerm.trim()) {
        alert('Please enter a city name');
        return;
    }
    
    const cityName = searchTerm.trim();
    console.log(`Searching for: ${cityName}`);
    await changeCity(cityName);
    searchInput.value = ''; // Clear search input
}

// Test API connection
async function testAPIConnection() {
    console.log('Testing API connection...');
    const result = await fetchWeatherFromAPI('London');
    
    if (result.success) {
        console.log('✅ API is working!');
        return true;
    } else {
        console.log('❌ API failed, using fallback data mode');
        console.log('Reason:', result.message);
        return false;
    }
}

// Initialize event listeners
function initEventListeners() {
    // City navigation links
    cityLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const cityName = link.textContent;
            await changeCity(cityName);
        });
    });
    
    // Search input - Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCity(searchInput.value);
        }
    });
    
    // Add search button
    const searchContainer = document.querySelector('.search');
    const existingButton = searchContainer.querySelector('button');
    
    if (!existingButton) {
        const searchButton = document.createElement('button');
        searchButton.textContent = 'Search';
        searchButton.style.cssText = `
            margin-left: 10px;
            padding: 8px 15px;
            border: none;
            border-radius: 15px;
            background-color: #0066cc;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s ease;
            font-size: 14px;
        `;
        searchButton.addEventListener('click', () => {
            searchCity(searchInput.value);
        });
        searchContainer.appendChild(searchButton);
    }
}

// Add active link styles
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .heads ul li a.active {
            color: #0066cc !important;
            font-weight: bold !important;
            text-decoration: underline !important;
        }
        
        #right_side ul li {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        #right_side ul li:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        .search button:hover {
            background-color: #0052a3 !important;
        }
    `;
    document.head.appendChild(style);
}

// Initialize the app
async function init() {
    console.log('Initializing Weather App...');
    addStyles();
    initEventListeners();
    await testAPIConnection();
    await changeCity('Addis Ababa');
}

// Start the app
init();

// Auto-refresh weather data every 10 minutes
setInterval(async () => {
    console.log('Auto-refreshing weather data...');
    if (currentCity) {
        await changeCity(currentCity);
    }
}, 600000);