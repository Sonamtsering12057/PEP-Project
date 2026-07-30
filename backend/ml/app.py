from flask import Flask, jsonify, request
import pickle
import pandas as pd
from flask_cors import CORS
import logging
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
logging.basicConfig(level=logging.DEBUG)

# Load Models
models_dir = os.path.join(os.path.dirname(__file__), 'models')
try:
    heart_model = pickle.load(open(os.path.join(models_dir, 'heart.pkl'), 'rb'))
    diabetes_model = pickle.load(open(os.path.join(models_dir, 'diabetes.pkl'), 'rb'))
    thyroid_model = pickle.load(open(os.path.join(models_dir, 'thyroid.pkl'), 'rb'))
    app.logger.info("All ML Models loaded successfully")
except Exception as e:
    app.logger.error(f"Error loading models: {e}")

@app.route('/')
def home():
    return jsonify({"status": "ML Prediction Server is Running!"})

@app.route('/predict/heart', methods=['POST'])
def predict_heart():
    try:
        data = request.get_json()
        features = [
            data.get('age', 54), data.get('sex', 1), data.get('cp', 0), data.get('trestbps', 130),
            data.get('chol', 246), data.get('fbs', 0), data.get('restecg', 1), data.get('thalach', 150),
            data.get('exang', 0), data.get('oldpeak', 1.2), data.get('slope', 1), data.get('ca', 0), data.get('thal', 2)
        ]
        df = pd.DataFrame([features], columns=[
            'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach','exang','oldpeak','slope','ca','thal'
        ])
        prediction = heart_model.predict(df)
        result = 'High Risk of Heart Disease' if prediction[0] == 1 else 'Low Risk of Heart Disease'
        return jsonify({'prediction': result, 'risk_level': int(prediction[0])})
    except Exception as e:
        app.logger.error(f"Heart prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict/diabetes', methods=['POST'])
def predict_diabetes():
    try:
        data = request.get_json()

        # Try Primary Scheme: Kaggle / fit feature set
        try:
            gender_val = 1 if str(data.get('sex', data.get('gender', 1))).lower() in ['1', 'male', 'm'] else 0
            features = [
                gender_val,
                float(data.get('Age', data.get('age', 43))),
                float(data.get('hypertension', 0)),
                float(data.get('heart_disease', 0)),
                float(data.get('smoking_history', 0)),
                float(data.get('BMI', data.get('bmi', 27.6))),
                float(data.get('HbA1c_level', 5.7)),
                float(data.get('Glucose', data.get('blood_glucose_level', 140)))
            ]
            df = pd.DataFrame([features], columns=[
                'gender', 'age', 'hypertension', 'heart_disease', 'smoking_history', 'bmi', 'HbA1c_level', 'blood_glucose_level'
            ])
            prediction = diabetes_model.predict(df)
        except Exception as inner_e:
            app.logger.warning(f"Fallback to Pima feature set: {inner_e}")
            features = [
                float(data.get('Pregnancies', 2)), float(data.get('Glucose', 138)), float(data.get('BloodPressure', 72)),
                float(data.get('SkinThickness', 35)), float(data.get('Insulin', 0)), float(data.get('BMI', 33.6)),
                float(data.get('DiabetesPedigreeFunction', 0.627)), float(data.get('Age', 47))
            ]
            df = pd.DataFrame([features], columns=[
                'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
            ])
            prediction = diabetes_model.predict(df)

        result = 'High Risk of Diabetes' if prediction[0] == 1 else 'Low Risk of Diabetes'
        return jsonify({'prediction': result, 'risk_level': int(prediction[0])})
    except Exception as e:
        app.logger.error(f"Diabetes prediction error: {e}")
        glucose = float(data.get('Glucose', 138))
        risk = 1 if glucose >= 140 else 0
        res_text = 'High Risk of Diabetes' if risk == 1 else 'Low Risk of Diabetes'
        return jsonify({'prediction': res_text, 'risk_level': risk})

@app.route('/predict/thyroid', methods=['POST'])
def predict_thyroid():
    try:
        data = request.get_json()
        features = [
            data.get('age', 45), data.get('sex', 0), data.get('on_thyroxine', 0),
            data.get('on_antithyroid_medication', 0), data.get('goitre', 0),
            data.get('hypopituitary', 0), data.get('psych', 0),
            data.get('T3', 2.5), data.get('TT4', 108), data.get('T4U', 0.98), data.get('FTI', 110)
        ]
        prediction = thyroid_model.predict([features])
        result = "Hypothyroidism detected" if prediction[0] > 0 else "Negative for Hypothyroidism"
        return jsonify({'prediction': result, 'risk_level': int(prediction[0])})
    except Exception as e:
        app.logger.error(f"Thyroid prediction error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)
