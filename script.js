async function getData() {
    const url = 'https://data.princegeorgescountymd.gov/resource/wb4e-w4nf.json'; // remote URL! you can test it in your browser
    const data = await fetch(url, options); // We're using a library that mimics a browser 'fetch' for simplicity
    const json = await data.json(); // the data isn't json until we access it using dot notation
    const reply = json.filter((item) => Boolean(item.geocoded_column_1)).filter((item) => Boolean(item.name));
    return reply;