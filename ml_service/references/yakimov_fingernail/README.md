# AnemiaScan - Yakimov Nail Hb Regression Model

## Model
- Architecture: ResNet18
- Ensemble: 5 patient-grouped cross-validation fold models
- Input: RGB fingernail image
- Image size: Stored individually in each checkpoint
- Output: Predicted Hb in g/dL

## Inference
Instantiate HbEnsemble once and reuse it:

    from predict import HbEnsemble

    predictor = HbEnsemble()

    result = predictor.predict_patient([
        "nail_image_1.jpg",
        "nail_image_2.jpg"
    ])

    print(result["hb_g_dl"])

## Important
- Use the same image preprocessing as training.
- The model predicts Hb; it does not directly establish a clinical diagnosis.
- The 12 g/dL and explored 13 g/dL decision cutoffs are not
  clinically validated universal anemia thresholds.
- This model requires further independent clinical validation.
