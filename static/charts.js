const dynamicID = () => {
  d3.json("samples.json").then((data) => {
    let dataset = d3.selectAll("#selDataset");
    buildMetadata(data.metadata[0].id);
    buildCharts(data.samples[0].id);
    data.names.forEach((person) => {
      dataset.append("option").text(person).property("value", person);
    });
  });
};

dynamicID();

const optionChanged = (sample) => {
  buildMetadata(sample);
  buildCharts(sample);
};

const buildMetadata = (sample) => {
  d3.json("samples.json").then((data) => {
    let metadata = data.metadata;
    let resultArray = metadata.filter((sampleObj) => sampleObj.id == sample);
    let result = resultArray[0];
    let PANEL = d3.select("#sample-metadata");
    PANEL.html("");
    Object.entries(result).forEach(([key, value]) =>
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`)
    );
  });
};

const buildCharts = (sample) => {
  d3.json("samples.json").then((data) => {
    let sampleData = data.samples;
    let filteredData = sampleData.filter((person) => person.id == sample)[0];
    let otuIDS = filteredData.otu_ids;
    let sampleValues = filteredData.sample_values;
    let otuLabels = filteredData.otu_labels;
    let combinedObject = [];
    otuIDS.forEach((element, index) => {
      combinedObject.push([element, sampleValues[index], otuLabels[index]]);
    });
    let slicedArray = combinedObject.slice(0, 10).reverse();
    let trace = {
      x: slicedArray.map((obj) => obj[1]),
      y: slicedArray.map((otu) => "OTU " + otu[0].toString()),
      type: "bar",
      orientation: "h",
      text: slicedArray.map((label) => label[2].split(";").join(" -> ")),
    };
    let layout = {
      title: "Top 10 Bacteria Cultures Found",
    };
    Plotly.newPlot("bar", [trace], layout);

    // Build Bubble Chart
    let bubbleTrace = {
      x: combinedObject.map((element) => element[0]),
      y: combinedObject.map((element) => element[1]),
      type: "scatter",
      mode: "markers",
      marker: {
        size: combinedObject.map((element) => element[1]),
        color: combinedObject.map((element) => element[0]),
      },
      text: combinedObject.map((element) => element[2].split(";").join(" -> ")),
    };
    let bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: { title: "OTU ID" },
      height: 700,
    };
    Plotly.newPlot("bubble", [bubbleTrace], bubbleLayout);

    // Build Gauge Chart
    let washingFreq = data.metadata.filter((element) => element.id == sample)[0]
      .wfreq;
    let peopleMetadata = data.metadata;
    let wfreqArray = peopleMetadata.map((element) => element.wfreq);
    let washingAvg = wfreqArray.reduce((a, b) => a + b, 0) / wfreqArray.length;

    let gaugeData = {
      domain: { x: [0, 1], y: [0, 1] },
      value: washingFreq,
      title: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week",
      type: "indicator",
      mode: "gauge+number+delta",
      delta: { reference: washingAvg },
      gauge: {
        axis: { range: [0, 10] },
        bar: { color: "black" },
        steps: [
          { range: [0, 2], color: "red" },
          { range: [2, 4], color: "orange" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "green" },
          { range: [8, 10], color: "blue" },
        ],
      },
    };
    let gaugeLayout = {
      width: 500,
      height: 450,
    };
    Plotly.newPlot("gauge", [gaugeData], gaugeLayout);
  });
};
