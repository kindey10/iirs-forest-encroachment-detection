// Day 1: Load Udham Singh Nagar, Sentinel-2 Image, and NDVI Map

// 1. Load district boundary dataset
var districts = ee.FeatureCollection("FAO/GAUL/2015/level2");

// 2. Select Udham Singh Nagar district
var studyArea = districts.filter(
  ee.Filter.eq("ADM2_NAME", "Udham Singh Nagar")
);

// 3. Center map on study area
Map.centerObject(studyArea, 9);

// 4. Add district boundary
Map.addLayer(
  studyArea,
  {color: "red"},
  "Udham Singh Nagar Boundary"
);

// 5. Load Sentinel-2 satellite images
var sentinel2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(studyArea)
  .filterDate("2024-01-01", "2024-12-31")
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20));

// 6. Create one clean image using median
var image2024 = sentinel2.median().clip(studyArea);

// 7. Display true colour image
Map.addLayer(
  image2024,
  {
    bands: ["B4", "B3", "B2"],
    min: 0,
    max: 2500
  },
  "Sentinel-2 True Colour 2024"
);

// 8. Calculate NDVI
var ndvi2024 = image2024.normalizedDifference(["B8", "B4"]).rename("NDVI");

// 9. Display NDVI map
Map.addLayer(
  ndvi2024,
  {
    min: -0.2,
    max: 0.8,
    palette: ["brown", "yellow", "green"]
  },
  "NDVI 2024"
);

// 10. Print details
print("Sentinel-2 Image Collection:", sentinel2);
print("Number of images found:", sentinel2.size());
print("NDVI 2024:", ndvi2024);