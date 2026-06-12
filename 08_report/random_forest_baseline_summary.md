# Random Forest NDVI Baseline Summary

A Random Forest classifier was trained using NDVI time-series features generated from Sentinel-2 imagery for Udham Singh Nagar from 2019 to 2026. The dataset contained two classes: stable/no major change areas and possible forest-to-non-forest transition areas.

In the first experiment, all NDVI years from 2019 to 2026 were used as input features. This model achieved perfect performance; however, this result was considered too direct because the labels were created using NDVI-based rules involving 2019 and 2026 values.

To reduce this issue, a leakage-check experiment was performed by removing NDVI_2019 and NDVI_2026 from the input features. The model was trained only on intermediate years from 2020 to 2025. This model achieved 77.5% accuracy, 75.7% precision, 81% recall, and 0.78 F1-score.

The result shows that intermediate NDVI patterns contain useful temporal information for separating stable and changed areas. However, since the labels are weak labels generated from NDVI thresholds, this result is treated as a baseline AI experiment and not as field-validated encroachment detection.