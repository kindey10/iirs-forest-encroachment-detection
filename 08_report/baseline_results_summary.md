# Baseline NDVI-Based Analysis Summary

The initial baseline analysis was performed using Sentinel-2 satellite imagery in Google Earth Engine for Udham Singh Nagar district, Uttarakhand. The January-May season was selected for each year from 2019 to 2026 to maintain seasonal consistency.

Normalized Difference Vegetation Index (NDVI) layers were generated for each year using the red and near-infrared bands of Sentinel-2 imagery. A change map was created by subtracting NDVI 2019 from NDVI 2026 to identify areas where vegetation increased, decreased, or remained stable.

A threshold-based vegetation loss mask was created to highlight areas where NDVI decreased strongly over time. To make the result more relevant to forest encroachment analysis, a stricter forest-to-non-forest transition layer was also generated using three conditions: high vegetation in 2019, low vegetation in 2026, and strong NDVI decrease between 2019 and 2026.

The output shows scattered candidate areas of possible forest-to-non-forest transition. These results are not treated as confirmed encroachment, but as baseline indicators for further analysis. The NDVI-based result will later be compared with machine learning and hybrid ViT-LSTM model outputs.