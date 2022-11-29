/* eslint-disable max-len */

function getRandomInclusive(min, max) {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);
  return Math.floor(Math.random() * (newMax - newMin + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector('#crime_list');
  target.innerHTML = '';

  const listEl = document.createElement('ol');
  target.appendChild(listEl);

  list.forEach((item) => {
    const el = document.createElement('li');
    el.innerText = (item.clearance_code_inc_type + " " + item.incident_case_id);
    listEl.appendChild(el);
  });
}

function processCrimes(list) {
  console.log('fired crime list');
  const range = [...Array(15).keys()]; // Special notation to create an array of 15 elements
  const newArray = range.map((item) => {
    const index = getRandomInclusive(0, list.length);
    return list[index];
  });
  return newArray;
}

function initChart(chart, object) {
  const labels = Object.keys(object);
  const info = Object.keys(object).map((item) => object[item].length);

  const data = {
    labels: labels,
    datasets: [{
      label: 'Crimes By Category',
      backgroundColor: [
      'rgba(255, 99, 132)',
      'rgba(255, 159, 64)',
      'rgba(255, 205, 86)',
      'rgba(75, 192, 192)',
      'rgba(54, 162, 235)',
      'rgba(153, 102, 255)',
      'rgba(201, 203, 207)'
      ],
      borderColor: [
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(54, 162, 235)',
      'rgb(153, 102, 255)',
      'rgb(201, 203, 207)'
      ],
      data: info
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {}
  };

  return new Chart(
    chart,
    config
  );
}

function changeChart(chart, dataObject) {
  const labels = Object.keys(dataObject);
  const info = Object.keys(dataObject).map((item) => dataObject[item].length);
  
  chart.data.labels = labels;
  chart.data.datasets.forEach((set) => {
    set.data = info;
    return set;
  });

  chart.update();
}

function shapeDataForLineChart(array) {
  return array.reduce((collection, item) => {
    if (!collection[item.clearance_code_inc_type]) {
      collection[item.clearance_code_inc_type] = [item];
    } else {
      collection[item.clearance_code_inc_type].push(item);
    }
    return collection;
  }, {});
}

function filterList(list, filterInputValue) {
  return list.filter((item) => {
    if (!item.clearance_code_inc_type || !item.incident_case_id) { return; }
    const lowerCaseName = item.clearance_code_inc_type.toLowerCase();
    const lowerCaseQuery = filterInputValue.toLowerCase();
    return lowerCaseName.includes(lowerCaseQuery);
  });
}

function initMap() {
  const map = L.map('map').setView([38.9897, -76.9378], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  return map;
}

function markerPlace(array, map) {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });

  array.forEach((item, index) => {
    //const {coordinates} = item.geocoded_column_0;
    L.marker([item.latitude, item.longitude]).addTo(map);
    if (index === 0) {
      map.setView([item.latitude, item.longitude], 10);
    }
  });
}

async function getData() {
  const url = 'https://data.princegeorgescountymd.gov/resource/wb4e-w4nf.json'; // remote URL! you can test it in your browser
  const data = await fetch(url); // We're using a library that mimics a browser 'fetch' for simplicity
  const json = await data.json(); // the data isn't json until we access it using dot notation
  const reply = json.filter((item) => Boolean(item.clearance_code_inc_type)).filter((item) => Boolean(item.clearance_code_inc_type));
  return reply;
}

async function mainEvent() {

  const pageMap = initMap();

  const form = document.querySelector('.main_form'); // get your main form so you can do JS with it
  const submit = document.querySelector('#get-resto'); // get a reference to your submit button
  const loadAnimation = document.querySelector('.lds-ellipsis'); // get a reference to our loading animation
  const chartTarget = document.querySelector('#myChart'); 
  submit.style.display = 'none'; // let your submit button disappear

  const results = await getData();
  const shapedData = shapeDataForLineChart(results);
  const myChart = initChart(chartTarget, shapedData);

  // This IF statement ensures we can't do anything if we don't have information yet
  if (!results?.length > 0) { return; } // Return if we have no data!

  submit.style.display = 'block'; // let's turn the submit button back on by setting it to display as a block when we have data available

  // Let's hide the load button now that we have some data to manipulate
  loadAnimation.classList.remove('lds-ellipsis');
  loadAnimation.classList.add('lds-ellipsis_hidden');

  let currentList = [];

  form.addEventListener('input', (event) => {
    const filteredList = filterList(currentList, event.target.value);
    injectHTML(filteredList);
    markerPlace(filteredList, pageMap);
    const localData = shapeDataForLineChart(filterList(currentList, event.target.value));
    changeChart(myChart, localData);
  });

  // And here's an eventListener! It's listening for a "submit" button specifically being clicked
  // this is a synchronous event event, because we already did our async request above, and waited for it to resolve
  form.addEventListener('submit', (submitEvent) => {
    // This is needed to stop our page from changing to a new URL even though it heard a GET request
    submitEvent.preventDefault();

    // This constant will have the value of your 15-restaurant collection when it processes
    currentList = processCrimes(results);

    // And this function call will perform the "side effect" of injecting the HTML list for you
    injectHTML(currentList);
    markerPlace(currentList, pageMap);
    const localData = shapeDataForLineChart(currentList);
    changeChart(myChart, localData);
  });
}

/*
    This last line actually runs first!
    It's calling the 'mainEvent' function at line 57
    It runs first because the listener is set to when your HTML content has loaded
  */
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
