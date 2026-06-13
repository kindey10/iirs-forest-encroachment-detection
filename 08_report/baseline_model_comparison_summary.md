# Baseline Model Comparison Summary

Two baseline machine learning experiments were performed using NDVI time-series features generated from Sentinel-2 imagery for Udham Singh Nagar from 2019 to 2026.

The first baseline model was a Random Forest classifier. To avoid direct label leakage, NDVI_2019 and NDVI_2026 were removed from the input features because these years were directly involved in creating the weak labels. The Random Forest leakage-check model achieved 77.5% accuracy, 75.7% precision, 81.0% recall, and 0.78 F1-score.

The second baseline model was an LSTM temporal model. The LSTM was trained using intermediate NDVI values from 2020 to 2025 to learn temporal vegetation-change patterns. It achieved 75.0% accuracy, 75.5% precision, 74.0% recall, and 0.75 F1-score.

The comparison shows that the Random Forest model performed slightly better than the LSTM model on the current NDVI-based weak-label dataset. However, both models achieved comparable performance, indicating that the intermediate NDVI time-series contains useful temporal information for separating stable areas from possible forest-to-non-forest transition areas.

These models are treated as baseline experiments, not final encroachment detection models, because the labels were generated using NDVI threshold rules and were not verified through field-survey data. The baseline results will be used for comparison with the future ViT-LSTM model.