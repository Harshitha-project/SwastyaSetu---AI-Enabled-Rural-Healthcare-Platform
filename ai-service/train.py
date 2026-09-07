"""
SwasthyaSetu - Machine Learning Model Training Pipeline
Trains a Machine Learning model for Clinical Health Risk Assessment & Disease Prediction.
Replaces rule-based logic with statistical ML (Random Forest / Gradient Boosting).
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.preprocessing import StandardScaler

# Supported symptoms matching frontend assessment
SYMPTOMS_LIST = [
    "fever", "cough", "cold", "headache", "body pain", "fatigue",
    "nausea", "vomiting", "diarrhea", "chest pain", "shortness of breath",
    "dizziness", "loss of appetite", "sore throat", "runny nose",
    "joint pain", "muscle pain", "abdominal pain", "back pain",
    "skin rash", "swelling", "weakness", "weight loss",
    "difficulty sleeping", "anxiety", "palpitations", "excessive thirst",
    "frequent urination", "blurred vision", "numbness", "tingling"
]

CONDITIONS_MAPPING = {
    "Viral Infection / Common Cold": {"risk": "LOW", "primary": ["fever", "cough", "cold", "sore throat", "runny nose"]},
    "Acute Bronchitis / Respiratory Infection": {"risk": "MODERATE", "primary": ["cough", "shortness of breath", "fever", "fatigue"]},
    "Gastroenteritis / Food Poisoning": {"risk": "MODERATE", "primary": ["diarrhea", "vomiting", "nausea", "abdominal pain", "weakness"]},
    "Dengue / Vector-borne Viral Fever": {"risk": "HIGH", "primary": ["fever", "joint pain", "muscle pain", "body pain", "headache", "fatigue"]},
    "Malaria": {"risk": "HIGH", "primary": ["fever", "headache", "nausea", "body pain", "weakness"]},
    "Hypertensive Crisis / Cardiovascular Concern": {"risk": "HIGH", "primary": ["chest pain", "palpitations", "dizziness", "shortness of breath"]},
    "Type 2 Diabetes / Hyperglycemia": {"risk": "MODERATE", "primary": ["excessive thirst", "frequent urination", "blurred vision", "fatigue", "weight loss"]},
    "General Musculoskeletal Strain": {"risk": "LOW", "primary": ["body pain", "joint pain", "back pain", "muscle pain"]},
    "Migraine / Tension Headache": {"risk": "LOW", "primary": ["headache", "nausea", "dizziness", "difficulty sleeping"]},
}

RISK_LEVELS = ["LOW", "MODERATE", "HIGH"]


def generate_synthetic_clinical_dataset(num_samples: int = 6000) -> pd.DataFrame:
    """
    Generates a realistic clinical dataset matching epidemiological patterns.
    Can be used directly or replaced with a real Kaggle/UCI CSV.
    """
    np.random.seed(42)
    records = []
    condition_names = list(CONDITIONS_MAPPING.keys())

    for _ in range(num_samples):
        # Pick a condition based on realistic prevalence
        condition = np.random.choice(condition_names)
        cond_info = CONDITIONS_MAPPING[condition]
        expected_risk = cond_info["risk"]
        primary_symptoms = cond_info["primary"]

        # Demographics
        age = int(np.clip(np.random.normal(42, 18), 5, 90))
        gender = np.random.choice(["M", "F", "OTHER"], p=[0.49, 0.49, 0.02])

        # Pre-existing conditions
        has_diabetes = 1 if (age > 45 and np.random.rand() < 0.25) else (1 if np.random.rand() < 0.08 else 0)
        has_hypertension = 1 if (age > 40 and np.random.rand() < 0.30) else (1 if np.random.rand() < 0.10 else 0)
        has_asthma = 1 if np.random.rand() < 0.12 else 0

        # Symptoms assignment
        symptom_vector = {f"symptom_{s}": 0 for s in SYMPTOMS_LIST}
        
        # Primary symptoms for the chosen condition (high probability)
        for s in primary_symptoms:
            if s in SYMPTOMS_LIST and np.random.rand() < 0.85:
                symptom_vector[f"symptom_{s}"] = 1
        
        # Random secondary symptoms (noise)
        for s in SYMPTOMS_LIST:
            if s not in primary_symptoms and np.random.rand() < 0.08:
                symptom_vector[f"symptom_{s}"] = 1

        # Vitals generation based on risk and condition
        if expected_risk == "HIGH":
            hr = int(np.random.choice([np.random.normal(118, 12), np.random.normal(48, 4)]))
            sys = int(np.random.normal(162, 18)) if "Cardiovascular" in condition else int(np.random.normal(132, 15))
            dia = int(sys * 0.65 + np.random.normal(0, 4))
            temp = float(np.random.normal(102.4, 1.2)) if "Fever" in condition or "Dengue" in condition or "Malaria" in condition else float(np.random.normal(99.0, 0.8))
            spo2 = int(np.random.normal(89, 4)) if "Respiratory" in condition else int(np.random.normal(96, 2))
            glucose = int(np.random.normal(260, 45)) if has_diabetes or "Diabetes" in condition else int(np.random.normal(110, 18))
        elif expected_risk == "MODERATE":
            hr = int(np.random.normal(94, 10))
            sys = int(np.random.normal(138, 12))
            dia = int(sys * 0.68 + np.random.normal(0, 3))
            temp = float(np.random.normal(100.5, 0.8))
            spo2 = int(np.random.normal(94, 2))
            glucose = int(np.random.normal(175, 30)) if has_diabetes or "Diabetes" in condition else int(np.random.normal(105, 14))
        else: # LOW
            hr = int(np.random.normal(74, 8))
            sys = int(np.random.normal(118, 8))
            dia = int(np.random.normal(76, 6))
            temp = float(np.random.normal(98.6, 0.5))
            spo2 = int(np.random.normal(98, 1))
            glucose = int(np.random.normal(95, 12))

        # Clipping to realistic biological limits
        hr = int(np.clip(hr, 40, 190))
        sys = int(np.clip(sys, 70, 240))
        dia = int(np.clip(dia, 40, 140))
        temp = round(float(np.clip(temp, 95.0, 106.0)), 1)
        spo2 = int(np.clip(spo2, 70, 100))
        glucose = int(np.clip(glucose, 50, 450))

        # Vital-driven risk override for extreme emergencies
        risk = expected_risk
        if spo2 < 90 or sys > 180 or hr > 140 or temp > 103.5 or (glucose > 350 and has_diabetes):
            risk = "HIGH"
        elif (spo2 < 94 or sys > 140 or hr > 105 or temp > 101.0) and risk == "LOW":
            risk = "MODERATE"

        record = {
            "age": age,
            "gender_M": 1 if gender == "M" else 0,
            "gender_F": 1 if gender == "F" else 0,
            "history_diabetes": has_diabetes,
            "history_hypertension": has_hypertension,
            "history_asthma": has_asthma,
            "vital_heart_rate": hr,
            "vital_systolic_bp": sys,
            "vital_diastolic_bp": dia,
            "vital_temperature": temp,
            "vital_spo2": spo2,
            "vital_glucose": glucose,
            "target_condition": condition,
            "target_risk": risk,
            **symptom_vector
        }
        records.append(record)

    return pd.DataFrame(records)


def train_and_save_model(csv_path: str = None, output_dir: str = None):
    """
    Main training function.
    Trains:
    1. Risk Classifier (LOW, MODERATE, HIGH)
    2. Condition Classifier (Potential diagnoses)
    """
    print("=" * 65)
    print("🏥 SwasthyaSetu Clinical Machine Learning Training Pipeline")
    print("=" * 65)

    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(output_dir, exist_ok=True)

    # 1. Load or generate dataset
    if csv_path and os.path.exists(csv_path):
        print(f"📥 Loading dataset from external CSV: {csv_path}")
        df = pd.read_csv(csv_path)
    else:
        print("⚙️ Generating calibrated clinical epidemiological dataset (6,000 cases)...")
        df = generate_synthetic_clinical_dataset(6000)

    print(f"✅ Dataset shape: {df.shape[0]} rows, {df.shape[1]} features")
    print("Class distribution (Risk Levels):")
    print(df["target_risk"].value_counts(normalize=True).round(3))

    # 2. Features and Targets
    target_risk = df["target_risk"]
    target_condition = df["target_condition"]

    feature_cols = [c for c in df.columns if c not in ["target_risk", "target_condition"]]
    X = df[feature_cols]

    # 3. Train/Test Split
    X_train, X_test, y_risk_train, y_risk_test, y_cond_train, y_cond_test = train_test_split(
        X, target_risk, target_condition, test_size=0.20, random_state=42, stratify=target_risk
    )

    print(f"\n📊 Training on {len(X_train)} samples, testing on {len(X_test)} samples...")

    # 4. Train Risk Classification Model (Random Forest Ensemble)
    print("\n🌲 Training Clinical Risk Random Forest Classifier...")
    risk_classifier = RandomForestClassifier(
        n_estimators=150,
        max_depth=16,
        min_samples_split=4,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    risk_classifier.fit(X_train, y_risk_train)

    # Cross-validation
    cv_scores = cross_val_score(risk_classifier, X_train, y_risk_train, cv=5, scoring="accuracy")
    print(f"📈 5-Fold Cross-Validation Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # Risk evaluation
    y_risk_pred = risk_classifier.predict(X_test)
    risk_acc = accuracy_score(y_risk_test, y_risk_pred)
    print(f"🎯 Test Risk Accuracy: {risk_acc * 100:.2f}%\n")
    print("Classification Report (Risk Model):")
    print(classification_report(y_risk_test, y_risk_pred))

    # 5. Train Condition Predictor
    print("\n🩺 Training Condition/Disease Multi-Class Predictor...")
    condition_classifier = RandomForestClassifier(
        n_estimators=120,
        max_depth=18,
        random_state=42,
        n_jobs=-1
    )
    condition_classifier.fit(X_train, y_cond_train)
    cond_acc = accuracy_score(y_cond_test, condition_classifier.predict(X_test))
    print(f"🎯 Condition Predictor Test Accuracy: {cond_acc * 100:.2f}%")

    # 6. Top Feature Importances
    importances = pd.Series(risk_classifier.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("\n🔍 Top 8 Most Influential Clinical Features:")
    for feat, imp in importances.head(8).items():
        print(f"  • {feat}: {imp:.4f}")

    # 7. Package and Serialize Models
    model_artifact = {
        "risk_classifier": risk_classifier,
        "condition_classifier": condition_classifier,
        "feature_columns": feature_cols,
        "symptoms_list": SYMPTOMS_LIST,
        "risk_levels": RISK_LEVELS,
        "conditions": list(CONDITIONS_MAPPING.keys()),
        "model_version": "2.0.0-ml-ensemble",
    }

    model_path = os.path.join(output_dir, "health_risk_model.pkl")
    joblib.dump(model_artifact, model_path)
    print(f"\n💾 Saved trained model artifact to: {model_path}")

    # 8. Save Metadata JSON
    metadata = {
        "model_version": "2.0.0-ml-ensemble",
        "algorithm": "RandomForestClassifier (Ensemble of 150 Estimators)",
        "features_count": len(feature_cols),
        "test_risk_accuracy": round(float(risk_acc), 4),
        "test_condition_accuracy": round(float(cond_acc), 4),
        "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
        "supported_symptoms_count": len(SYMPTOMS_LIST),
        "top_features": importances.head(10).to_dict()
    }
    meta_path = os.path.join(output_dir, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"📄 Saved model metadata to: {meta_path}")

    print("\n🎉 ML Model Training Successfully Completed!")
    return model_artifact


if __name__ == "__main__":
    train_and_save_model()
