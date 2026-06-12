// NDVI Time Series for Udham Singh Nagar from 2019 to 2026
// Season used: January to May for each year

// 1. Load district boundary dataset
var districts = ee.FeatureCollection("FAO/GAUL/2015/level2");

// 2. Select Udham Singh Nagar district
var studyArea = districts.filter(
  ee.Filter.eq("ADM2_NAME", "Udham Singh Nagar")
);

// 3. Center map on study area
Map.centerObject(studyArea, 9);

// 4. Add study area boundary
Map.addLayer(
  studyArea,
  {color: "red"},
  "Udham Singh Nagar Boundary"
);

// 5. Function to mask clouds using Sentinel-2 Scene Classification Layer
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

// 6. Function to create NDVI image for one year
function createNDVIForYear(year) {
  var startDate = year + "-01-01";
  var endDate = year + "-05-31";

  var collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(studyArea)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30))
    .map(maskS2Clouds);

  var medianImage = collection.median().clip(studyArea);

  var ndvi = medianImage.normalizedDifference(["B8", "B4"])
    .rename("NDVI_" + year);

  print("Number of Sentinel-2 images for " + year + ":", collection.size());

  return ndvi;
}

// 7. Create NDVI maps for 2019 to 2026
var ndvi2019 = createNDVIForYear("2019");
var ndvi2020 = createNDVIForYear("2020");
var ndvi2021 = createNDVIForYear("2021");
var ndvi2022 = createNDVIForYear("2022");
var ndvi2023 = createNDVIForYear("2023");
var ndvi2024 = createNDVIForYear("2024");
var ndvi2025 = createNDVIForYear("2025");
var ndvi2026 = createNDVIForYear("2026");

// 8. NDVI visualization style
var ndviVis = {
  min: -0.2,
  max: 0.8,
  palette: ["brown", "yellow", "green"]
};

// 9. Add NDVI layers to map
Map.addLayer(ndvi2019, ndviVis, "NDVI Jan-May 2019");
Map.addLayer(ndvi2020, ndviVis, "NDVI Jan-May 2020");
Map.addLayer(ndvi2021, ndviVis, "NDVI Jan-May 2021");
Map.addLayer(ndvi2022, ndviVis, "NDVI Jan-May 2022");
Map.addLayer(ndvi2023, ndviVis, "NDVI Jan-May 2023");
Map.addLayer(ndvi2024, ndviVis, "NDVI Jan-May 2024");
Map.addLayer(ndvi2025, ndviVis, "NDVI Jan-May 2025");
Map.addLayer(ndvi2026, ndviVis, "NDVI Jan-May 2026");