// Forest Encroachment Project
// NDVI Time Series and Vegetation Loss Analysis
// Study Area: Udham Singh Nagar, Uttarakhand
// Season used: January to May for each year


// --------------------------------------------------
// 1. Load Study Area Boundary
// --------------------------------------------------

var districts = ee.FeatureCollection("FAO/GAUL/2015/level2");

var studyArea = districts.filter(
  ee.Filter.eq("ADM2_NAME", "Udham Singh Nagar")
);

Map.centerObject(studyArea, 9);

Map.addLayer(
  studyArea,
  {color: "red"},
  "Udham Singh Nagar Boundary"
);

print("Study Area:", studyArea);


// --------------------------------------------------
// 2. Cloud Masking Function for Sentinel-2
// --------------------------------------------------

function maskS2Clouds(image) {
  var scl = image.select("SCL");

  // Remove cloud shadow, clouds, cirrus, and snow
  var mask = scl.neq(3)
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));

  return image.updateMask(mask)
    .divide(10000)
    .copyProperties(image, ["system:time_start"]);
}


// --------------------------------------------------
// 3. Function to Create Sentinel-2 Median Image
// --------------------------------------------------

function createSentinelImage(year) {
  var startDate = year + "-01-01";
  var endDate = year + "-06-01"; // includes Jan-May

  var collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(studyArea)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30))
    .map(maskS2Clouds);

  print("Number of Sentinel-2 images for " + year + ":", collection.size());

  var medianImage = collection.median().clip(studyArea);

  return medianImage;
}


// --------------------------------------------------
// 4. Function to Create NDVI for One Year
// --------------------------------------------------

function createNDVIForYear(year) {
  var image = createSentinelImage(year);

  var ndvi = image.normalizedDifference(["B8", "B4"])
    .rename("NDVI_" + year);

  return ndvi;
}


// --------------------------------------------------
// 5. Create Sentinel True-Colour Images
// --------------------------------------------------

var sentinel2019 = createSentinelImage("2019");
var sentinel2026 = createSentinelImage("2026");

Map.addLayer(
  sentinel2019,
  {
    bands: ["B4", "B3", "B2"],
    min: 0,
    max: 0.3
  },
  "Sentinel-2 True Colour Jan-May 2019"
);

Map.addLayer(
  sentinel2026,
  {
    bands: ["B4", "B3", "B2"],
    min: 0,
    max: 0.3
  },
  "Sentinel-2 True Colour Jan-May 2026"
);


// --------------------------------------------------
// 6. Create NDVI Maps from 2019 to 2026
// --------------------------------------------------

var ndvi2019 = createNDVIForYear("2019");
var ndvi2020 = createNDVIForYear("2020");
var ndvi2021 = createNDVIForYear("2021");
var ndvi2022 = createNDVIForYear("2022");
var ndvi2023 = createNDVIForYear("2023");
var ndvi2024 = createNDVIForYear("2024");
var ndvi2025 = createNDVIForYear("2025");
var ndvi2026 = createNDVIForYear("2026");

var ndviVis = {
  min: -0.2,
  max: 0.8,
  palette: ["brown", "yellow", "green"]
};

Map.addLayer(ndvi2019, ndviVis, "NDVI Jan-May 2019");
Map.addLayer(ndvi2020, ndviVis, "NDVI Jan-May 2020");
Map.addLayer(ndvi2021, ndviVis, "NDVI Jan-May 2021");
Map.addLayer(ndvi2022, ndviVis, "NDVI Jan-May 2022");
Map.addLayer(ndvi2023, ndviVis, "NDVI Jan-May 2023");
Map.addLayer(ndvi2024, ndviVis, "NDVI Jan-May 2024");
Map.addLayer(ndvi2025, ndviVis, "NDVI Jan-May 2025");
Map.addLayer(ndvi2026, ndviVis, "NDVI Jan-May 2026");


// --------------------------------------------------
// 7. Calculate NDVI Change from 2019 to 2026
// --------------------------------------------------

var ndviChange_2019_2026 = ndvi2026.subtract(ndvi2019)
  .rename("NDVI_Change_2019_2026");

var changeVis = {
  min: -0.5,
  max: 0.5,
  palette: ["red", "white", "green"]
};

Map.addLayer(
  ndviChange_2019_2026,
  changeVis,
  "NDVI Change 2019 to 2026"
);


// --------------------------------------------------
// 8. Create Possible Vegetation Loss Mask
// --------------------------------------------------

// If NDVI has decreased by more than 0.2, mark it as possible vegetation loss
var vegetationLoss = ndviChange_2019_2026.lt(-0.2)
  .rename("Possible_Vegetation_Loss");

Map.addLayer(
  vegetationLoss.selfMask(),
  {palette: ["red"]},
  "Possible Vegetation Loss Areas"
);


// --------------------------------------------------
// 9. Calculate Possible Vegetation Loss Area
// --------------------------------------------------

var pixelArea = ee.Image.pixelArea();

var vegetationLossArea = vegetationLoss
  .multiply(pixelArea)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: studyArea,
    scale: 10,
    maxPixels: 1e13
  });

var vegetationLossSqKm = ee.Number(
  vegetationLossArea.get("Possible_Vegetation_Loss")
).divide(1000000);

print(
  "Possible vegetation loss area from 2019 to 2026 in sq. km:",
  vegetationLossSqKm
);


// --------------------------------------------------
// 10. Print Final Layers for Checking
// --------------------------------------------------

print("NDVI 2019:", ndvi2019);
print("NDVI 2026:", ndvi2026);
print("NDVI Change 2019 to 2026:", ndviChange_2019_2026);
print("Possible Vegetation Loss Mask:", vegetationLoss);

// --------------------------------------------------
// 11. Year-wise Vegetation Loss Area Compared to 2019
// --------------------------------------------------

// Function to calculate vegetation loss area compared to 2019
function calculateLossArea(targetNDVI, year) {
  
  // NDVI change = target year NDVI - 2019 NDVI
  var change = targetNDVI.subtract(ndvi2019);
  
  // Possible vegetation loss where NDVI decrease is more than 0.2
  var loss = change.lt(-0.2).rename("loss");
  
  // Calculate area in square kilometers
  var area = loss
    .multiply(ee.Image.pixelArea())
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: studyArea,
      scale: 10,
      maxPixels: 1e13
    });
  
  var areaSqKm = ee.Number(area.get("loss")).divide(1000000);
  
  return ee.Feature(null, {
    "Year": year,
    "Vegetation_Loss_sq_km": areaSqKm
  });
}

// Create table for each year compared to 2019
var lossTable = ee.FeatureCollection([
  calculateLossArea(ndvi2020, "2020"),
  calculateLossArea(ndvi2021, "2021"),
  calculateLossArea(ndvi2022, "2022"),
  calculateLossArea(ndvi2023, "2023"),
  calculateLossArea(ndvi2024, "2024"),
  calculateLossArea(ndvi2025, "2025"),
  calculateLossArea(ndvi2026, "2026")
]);

// Print table
print("Year-wise possible vegetation loss area compared to 2019:", lossTable);

// Create graph
var lossChart = ui.Chart.feature.byFeature({
  features: lossTable,
  xProperty: "Year",
  yProperties: ["Vegetation_Loss_sq_km"]
})
.setChartType("ColumnChart")
.setOptions({
  title: "Possible Vegetation Loss Area Compared to 2019",
  hAxis: {
    title: "Year"
  },
  vAxis: {
    title: "Area in sq. km."
  },
  legend: {
    position: "none"
  }
});

// Print graph
print(lossChart);

// --------------------------------------------------
// 12. Print Table Values in Simple Form
// --------------------------------------------------

print(
  "Years:",
  lossTable.aggregate_array("Year")
);

print(
  "Vegetation loss area values in sq. km:",
  lossTable.aggregate_array("Vegetation_Loss_sq_km")
);

// --------------------------------------------------
// 13. Export Year-wise Vegetation Loss Table to Google Drive
// --------------------------------------------------

Export.table.toDrive({
  collection: lossTable,
  description: "Vegetation_Loss_Area_2019_2026",
  folder: "IIRS_Forest_Encroachment",
  fileNamePrefix: "vegetation_loss_area_2019_2026",
  fileFormat: "CSV"
});

// --------------------------------------------------
// 14. Export NDVI Change Map to Google Drive
// --------------------------------------------------

Export.image.toDrive({
  image: ndviChange_2019_2026,
  description: "NDVI_Change_Map_2019_2026",
  folder: "IIRS_Forest_Encroachment",
  fileNamePrefix: "ndvi_change_2019_2026",
  region: studyArea.geometry(),
  scale: 10,
  maxPixels: 1e13,
  fileFormat: "GeoTIFF"
});


// --------------------------------------------------
// 15. Export Possible Vegetation Loss Map to Google Drive
// --------------------------------------------------

Export.image.toDrive({
  image: vegetationLoss.selfMask(),
  description: "Possible_Vegetation_Loss_Map_2019_2026",
  folder: "IIRS_Forest_Encroachment",
  fileNamePrefix: "possible_vegetation_loss_2019_2026",
  region: studyArea.geometry(),
  scale: 10,
  maxPixels: 1e13,
  fileFormat: "GeoTIFF"
});

// --------------------------------------------------
// 16. Possible Forest-to-Non-Forest Transition Mask
// --------------------------------------------------

// Condition 1: Area had high vegetation in 2019
// NDVI greater than 0.5 means strong vegetation
var highVegetation2019 = ndvi2019.gt(0.5);

// Condition 2: Area has lower vegetation in 2026
// NDVI less than 0.35 means reduced vegetation / possible non-forest
var lowVegetation2026 = ndvi2026.lt(0.35);

// Condition 3: NDVI decreased strongly from 2019 to 2026
var strongNDVIDrop = ndviChange_2019_2026.lt(-0.2);

// Combine all conditions
var possibleForestToNonForest = highVegetation2019
  .and(lowVegetation2026)
  .and(strongNDVIDrop)
  .rename("Possible_Forest_to_NonForest_Transition");

// Display possible forest-to-non-forest transition areas
Map.addLayer(
  possibleForestToNonForest.selfMask(),
  {palette: ["purple"]},
  "Possible Forest-to-Non-Forest Transition"
);


// --------------------------------------------------
// 17. Calculate Area of Possible Forest-to-Non-Forest Transition
// --------------------------------------------------

var transitionArea = possibleForestToNonForest
  .multiply(ee.Image.pixelArea())
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: studyArea,
    scale: 10,
    maxPixels: 1e13
  });

var transitionAreaSqKm = ee.Number(
  transitionArea.get("Possible_Forest_to_NonForest_Transition")
).divide(1000000);

print(
  "Possible forest-to-non-forest transition area from 2019 to 2026 in sq. km:",
  transitionAreaSqKm
);


// --------------------------------------------------
// 18. Export Possible Forest-to-Non-Forest Transition Map
// --------------------------------------------------

Export.image.toDrive({
  image: possibleForestToNonForest.selfMask(),
  description: "Possible_Forest_to_NonForest_Transition_2019_2026",
  folder: "IIRS_Forest_Encroachment",
  fileNamePrefix: "possible_forest_to_nonforest_transition_2019_2026",
  region: studyArea.geometry(),
  scale: 10,
  maxPixels: 1e13,
  fileFormat: "GeoTIFF"
});