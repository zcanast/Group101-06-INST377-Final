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
    el.innerText = (item.clearance_code_inc_type + " (" + item.incident_case_id + ")");
    listEl.appendChild(el);
  });
}

function processCrimes(list) {
  console.log('fired crime list');
  const range = [...Array(10).keys()];
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
      data: info,
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
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
      borderWidth: 1
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

async function getData() {
  const url = 'https://data.princegeorgescountymd.gov/resource/wb4e-w4nf.json'; // remote URL! you can test it in your browser
  const data = await fetch(url); // We're using a library that mimics a browser 'fetch' for simplicity
  const json = await data.json(); // the data isn't json until we access it using dot notation
  const reply = json.filter((item) => Boolean(item.clearance_code_inc_type)).filter((item) => Boolean(item.clearance_code_inc_type));
  return reply;
}

async function mainEvent() {

  const form = document.querySelector('.main_form');
  const submit = document.querySelector('#get-resto');
  const loadAnimation = document.querySelector('.lds-ellipsis');
  const chartTarget = document.querySelector('#myChart'); 
  submit.style.display = 'none';

  const results = await getData();
  const shapedData = shapeDataForLineChart(results);
  const myChart = initChart(chartTarget, shapedData);

  if (!results?.length > 0) { return; }

  submit.style.display = 'block'; 

  loadAnimation.classList.remove('lds-ellipsis');
  loadAnimation.classList.add('lds-ellipsis_hidden');

  let currentList = [];

  form.addEventListener('input', (event) => {
    const filteredList = filterList(currentList, event.target.value);
    injectHTML(filteredList);
    const localData = shapeDataForLineChart(filterList(currentList, event.target.value));
    changeChart(myChart, localData);
  });

  form.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();

    currentList = processCrimes(results);

    injectHTML(currentList);
    const localData = shapeDataForLineChart(currentList);
    changeChart(myChart, localData);
  });
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());
