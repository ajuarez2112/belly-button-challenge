// Use the D3 library to read in samples.json from the URL
//https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json.
// ----------------------------------------------------------------------------------------------------------------------------------
const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Define a variable to store the data
let jsonData;

// Promise Pending
const dataPromise = d3.json(url);
console.log("Data Promise: ", dataPromise);


// Fetch the JSON data, console log it and use it to define variables.
d3.json(url).then((data) => {
    console.log("Data: ", data) // Console log the data
    jsonData = data;  // Store data in the variable
    init(jsonData); // Initizalize dashboard with the data
});

// This function adds all of the "names" into the dropdown menu
function init(data) {
    // Use D3 to select the dropdown menu
    let dropdownMenu = d3.select("#selDataset");

    // Iterate through each object in the "names" array
    data.names.forEach(function (sample) {
        // For each sample create a new dropdown option 
        let option = dropdownMenu.append("option");
        // Set the text displayed in the dropdown menu to sample ID
        option.text(sample);
        // Set the value of option to sample ID
        option.property("value", sample);
    });

    // Use first sample from the "names" array and use as "initialSample"
    const initialSample = data.names[0];

    // Use the initial sample from the list to build the initial plots
    updatePlotly(initialSample, data);
}

// This function updates all of the plots and metadata when a new option is selected on the dropdown menu
function updatePlotly(sample, data) {
    // Find the data from the samples array for the current sample
    let currentSample = data.samples.filter(function (obj) {
        return obj.id === sample;
    })[0];

    // Find the data from the metadata array for the current sample
    let currentMetadata = data.metadata.filter(function (obj) {
        return obj.id === Number(sample)
    })[0];

    // Slice top 10 sample values, labels and OTU IDs for the selected sample
    let topValues = currentSample.sample_values.slice(0, 10).reverse();
    let topLabels = currentSample.otu_labels.slice(0, 10).reverse();
    let topIds = currentSample.otu_ids.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse();


    // ---------------------------------------------------------------------------------
    // Create a horizontal bar chart that displays the top 10 OTUs found in each sample
    // ---------------------------------------------------------------------------------

    // Create the trace for the bar chart
    var barData = [{
        x: topValues, // Use sample_values as the x values
        y: topIds, // Use otu_ids as the y values
        text: topLabels, // Use out_labels as the hovertext for the chart
        type: 'bar',
        orientation: 'h'
    }];

    // Create the layout for the bar chart
    var barLayout = {
        margin: {
            l: 100,
            r: 40,
            t: 20,
            b: 20
        }
    }

    // Render the plot to the div tag with id "bar"
    Plotly.newPlot('bar', barData, barLayout);


    // ------------------------------------------------
    // Create a bubble chart that displays each sample
    // ------------------------------------------------

    // Create the bubble trace
    var bubbleTrace = [{
        x: currentSample.otu_ids, // Use otu_ids as the x values
        y: currentSample.sample_values, // Use sample_values as the y values
        text: currentSample.otu_labels, // Use otu_labels for the text values.
        mode: 'markers',
        marker: {
            size: currentSample.sample_values,// Use sample_values for the marker size.
            color: currentSample.otu_ids, // Use otu_ids for the marker colors.
            colorscale: 'Electric'
        }
    }];

    // // Render the plot to the div tag with id "bubble"
    Plotly.newPlot('bubble', bubbleTrace);


    // ---------------------------
    // Create the Metadata panel
    // ---------------------------

    var demographicInfo = d3.select("#sample-metadata");
    // Clear any existing metadata using .html("")
    demographicInfo.html("");
    // Tags for each key-value in the metadata
    Object.entries(currentMetadata).forEach(([key, value]) => {
        demographicInfo.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });


    // -------------------------------------
    // Create a gauge chart for each sample
    // -------------------------------------

    // Create gauge trace for washing frequency
    var gaugeTrace = [{
        type: "indicator",
        mode: "gauge+number",
        value: currentMetadata.wfreq !== null ? currentMetadata.wfreq : 0, // Check if wfreq is null, if yes, use 0 instead
        title: "<b> Belly Button Washing Frequency</b> <br>Scrubs per Week",
        gauge: {
            axis: {
                range: [null, 9],
                tickmode: 'linear',
                tickvals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            },
            bar: { color: "purple" },
            steps: [
                { range: [0, 1], color: 'rgba(248, 243, 236, 1)' },
                { range: [1, 2], color: 'rgba(244, 241, 228, 1)' },
                { range: [2, 3], color: 'rgba(233, 230, 201, 1)' },
                { range: [3, 4], color: 'rgba(229, 232, 176, 1)' },
                { range: [4, 5], color: 'rgba(213, 229, 153, 1)' },
                { range: [5, 6], color: 'rgba(183, 205, 143, 1)' },
                { range: [6, 7], color: 'rgba(138, 192, 134, 1)' },
                { range: [7, 8], color: 'rgba(137, 188, 141, 1)' },
                { range: [8, 9], color: 'rgba(132, 181, 137, 1)' },
            ]
        }
    }];

    // Create gauge layout
    var gaugeLayout = {
        width: 500,
        height: 450,
    };

    // Render the plot to the div tag with id "gauge"
    Plotly.newPlot('gauge', gaugeTrace, gaugeLayout);

};

// Update all plots when a new sample is selected
d3.selectAll('#selDataset').on("change", optionChanged);
function optionChanged() {
    let newSample = d3.select(this).property("value")
    updatePlotly(newSample, jsonData)
};