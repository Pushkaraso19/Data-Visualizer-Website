// Global variables.

let uploadedData = null;

const navLinks = document.querySelectorAll('.nav-link');

const currentURL = window.location.href;

navLinks.forEach(link => {
    if (link.href === currentURL) {
        link.classList.add('active'); 
    }
});
    
    
// Function to handle file upload
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            processData(contents, file.name);
        };
        reader.readAsText(file);
    } else {
        alert('Please select a file to upload.');
    }
}

document.getElementById('fileInput').addEventListener('change', function() {
    const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
    document.getElementById('fileName').textContent = fileName;
});

// Function to process uploaded data
function processData(contents, fileName) {
    if (fileName.endsWith('.csv')) {
        uploadedData = d3.csvParse(contents);
    } else if (fileName.endsWith('.json')) {
        uploadedData = JSON.parse(contents);
    } else {
        alert('Unsupported file format. Please upload a CSV or JSON file.');
        return;
    }
    
    console.log('Data processed:', uploadedData);
    displayDataPreview(uploadedData);
    alert('Data uploaded successfully!');
    
    // Enable the generate chart button
    document.querySelector('button[onclick="generateChart()"]').disabled = false;
}

// Function to display data preview
function displayDataPreview(data) {
    const previewContainer = document.getElementById('previewTable'); // Update this to the correct container
    previewContainer.innerHTML = ''; // Clear previous content

    // Create table element
    const table = document.createElement('table');
    table.className = 'preview-table';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    data.forEach(row => { // Loop through all rows instead of slicing
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Add table to preview container
    previewContainer.appendChild(table);
}




// Function to generate chart
function generateChart() {
    if (!uploadedData) {
        alert('Please upload data first.');
        return;
    }
    
    const chartType = document.getElementById('chartType').value;
    const chartContainer = document.getElementById('chartArea'); // Target the chart area specifically

    // Clear previous chart content but keep the preview
    chartContainer.innerHTML = '';

    // Set up chart dimensions
    const margin = {top: 40, right: 40, bottom: 60, left: 60};
    const width = chartContainer.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select('#chartArea') // Append to chartArea directly
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate chart based on type
    // Generate chart based on type
    switch(chartType) {
        case 'bar':
            generateBarChart(svg, width, height);
            break;
        case 'line':
            generateLineChart(svg, width, height);
            break;
        case 'pie':
            generatePieChart(svg, width, height);
            break;
        case 'scatter':
            generateScatterPlot(svg, width, height);
            break;
        default:
            alert('Unsupported chart type.');
    }

}


// Function to generate bar chart
function generateBarChart(svg, width, height) {
    const xKey = Object.keys(uploadedData[0])[0];
    const yKey = Object.keys(uploadedData[0])[1];
    
    const xValues = uploadedData.map(d => d[xKey]);
    const yValues = uploadedData.map(d => +d[yKey]);
    
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(xValues)
        .range([0, width])
        .padding(0.2);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(yValues)])
        .range([height, 0]);
    
    // Create bars
    svg.selectAll('rect')
        .data(uploadedData)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d[xKey]))
        .attr('y', d => yScale(+d[yKey]))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - yScale(+d[yKey]))
        .attr('fill', 'steelblue');
    
    // Add x-axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end');
    
    // Add y-axis
    svg.append('g')
        .call(d3.axisLeft(yScale));
}

// Function to generate line chart
function generateLineChart(svg, width, height) {
    const xKey = Object.keys(uploadedData[0])[0];
    const yKey = Object.keys(uploadedData[0])[1];
    
    const xValues = uploadedData.map(d => d[xKey]);
    const yValues = uploadedData.map(d => +d[yKey]);
    
    // Set up scales
    const xScale = d3.scalePoint()
        .domain(xValues)
        .range([0, width]);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(yValues)])
        .range([height, 0]);
    
    // Create line
    svg.append('path')
        .datum(uploadedData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
            .x(d => xScale(d[xKey]))
            .y(d => yScale(+d[yKey]))
        );
    
    // Add x-axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end');
    
    // Add y-axis
    svg.append('g')
        .call(d3.axisLeft(yScale));
}

// Function to generate pie chart
function generatePieChart(svg, width, height) {
    const data = uploadedData.map(d => +d['Value']); // Assuming you have a 'Value' column for pie chart
    const labels = uploadedData.map(d => d['Category']); // Assuming a 'Category' column for labels

    const radius = Math.min(width, height) / 2;
    
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    const pie = d3.pie().value(d => d)(data);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    
    // Append group to hold pie chart
    const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    g.selectAll('path')
        .data(pie)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i));

    // Add labels
    g.selectAll('text')
        .data(pie)
        .enter()
        .append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '0.35em')
        .text((d, i) => labels[i]);
}

// Function to generate scatter plot
function generateScatterPlot(svg, width, height) {
    const xKey = Object.keys(uploadedData[0])[0]; // e.g., 'Height (cm)'
    const yKey = Object.keys(uploadedData[0])[1]; // e.g., 'Weight (kg)'

    const xValues = uploadedData.map(d => +d[xKey]);
    const yValues = uploadedData.map(d => +d[yKey]);

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([d3.min(xValues), d3.max(xValues)])
        .range([0, width]);
    const yScale = d3.scaleLinear()
        .domain([d3.min(yValues), d3.max(yValues)])
        .range([height, 0]);

    // Create scatter points
    svg.selectAll('circle')
        .data(uploadedData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(+d[xKey]))
        .attr('cy', d => yScale(+d[yKey]))
        .attr('r', 5)
        .attr('fill', 'steelblue');

    // Add x-axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append('g')
        .call(d3.axisLeft(yScale));
}

// Disable the generate chart button initially
document.querySelector('button[onclick="generateChart()"]').disabled = true;

function uploadFile() {
    console.log("Upload button clicked"); // Log when button is clicked
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        console.log("File selected:", file.name); // Log the selected file
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            processData(contents, file.name);
        };
        reader.readAsText(file);
    } else {
        alert('Please select a file to upload.');
    }
}

function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Log the values to the console
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);

    // Show success modal
    $('#successModal').modal('show');

    // Reset the form
    document.getElementById('contactForm').reset();
}

