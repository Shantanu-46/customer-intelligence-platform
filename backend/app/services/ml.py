import re
from typing import Any

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split

from app.services.analytics import find_column


def clean_json(value: Any):
    if isinstance(value, dict):
        return {str(k): clean_json(v) for k, v in value.items()}
    if isinstance(value, list):
        return [clean_json(v) for v in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return float(value)
    if pd.isna(value):
        return None
    return value


def churn_values_to_binary(series: pd.Series):
    if pd.api.types.is_numeric_dtype(series):
        unique = sorted(series.dropna().unique().tolist())
        if set(unique).issubset({0, 1}):
            return series.astype(float)
        if len(unique) == 2:
            return series.map({unique[0]: 0, unique[1]: 1}).astype(float)

    mapping = {
        "yes": 1, "y": 1, "true": 1, "1": 1, "churn": 1,
        "churned": 1, "left": 1, "exited": 1,
        "no": 0, "n": 0, "false": 0, "0": 0, "active": 0,
        "retained": 0,
    }

    normalized = series.astype(str).str.strip().str.lower()
    mapped = normalized.map(mapping)

    if mapped.notna().sum() == 0:
        return None

    return mapped


def train_churn(df: pd.DataFrame, churn_col: str):
    target = churn_values_to_binary(df[churn_col])

    if target is None:
        return {
            "available": False,
            "reason": "Churn values could not be interpreted as binary.",
        }

    valid = target.notna()
    work = df.loc[valid].copy()
    y = target.loc[valid].astype(int)

    if y.nunique() < 2 or len(work) < 20:
        return {
            "available": False,
            "reason": "At least 20 rows and two churn classes are needed for training.",
        }

    # Avoid ID-like columns and the target itself.
    X = work.drop(columns=[churn_col])
    id_cols = [
        c for c in X.columns
        if "id" in str(c).lower() or X[c].nunique(dropna=False) >= 0.98 * len(X)
    ]
    X = X.drop(columns=id_cols, errors="ignore")

    numeric_cols = X.select_dtypes(include=["number", "bool"]).columns.tolist()
    categorical_cols = X.select_dtypes(exclude=["number", "bool"]).columns.tolist()

    if not numeric_cols and not categorical_cols:
        return {"available": False, "reason": "No usable predictor columns found."}

    transformers = []

    if numeric_cols:
        transformers.append(
            (
                "numeric",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="median")),
                ]),
                numeric_cols,
            )
        )

    if categorical_cols:
        transformers.append(
            (
                "categorical",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("onehot", OneHotEncoder(handle_unknown="ignore")),
                ]),
                categorical_cols,
            )
        )

    preprocessor = ColumnTransformer(transformers)

    model = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=250,
            random_state=42,
            class_weight="balanced",
        )),
    ])

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=0.2,
            random_state=42,
            stratify=y,
        )
    except ValueError:
        return {
            "available": False,
            "reason": "The dataset is too small or imbalanced for a stratified train/test split.",
        }

    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, pred)

    probabilities = model.predict_proba(X)
    class_list = list(model.classes_)
    positive_index = class_list.index(1) if 1 in class_list else 0
    risk = probabilities[:, positive_index]

    result = df.copy()
    result["risk_probability"] = risk
    result["risk_level"] = pd.cut(
        risk,
        bins=[-0.01, 0.30, 0.60, 1.01],
        labels=["LOW", "MEDIUM", "HIGH"],
    ).astype(str)

    top_customers = result.sort_values(
        "risk_probability", ascending=False
    ).head(10)

    return {
        "available": True,
        "accuracy": round(float(accuracy), 4),
        "churn_rate": round(float(y.mean() * 100), 2),
        "high_risk": int((risk >= 0.60).sum()),
        "medium_risk": int(((risk >= 0.30) & (risk < 0.60)).sum()),
        "low_risk": int((risk < 0.30).sum()),
        "risk_customers": clean_json(
            top_customers.to_dict(orient="records")
        ),
        "risk_distribution": [
            {"name": "High", "value": int((risk >= 0.60).sum())},
            {"name": "Medium", "value": int(((risk >= 0.30) & (risk < 0.60)).sum())},
            {"name": "Low", "value": int((risk < 0.30).sum())},
        ],
    }


def segment_customers(df: pd.DataFrame):
    numeric = df.select_dtypes(include="number").copy()

    if len(numeric.columns) < 2 or len(df) < 10:
        return {
            "available": False,
            "reason": "At least 10 rows and two numeric columns are needed for segmentation.",
        }

    # Ignore likely target / ID columns.
    usable = []
    for col in numeric.columns:
        n = str(col).lower()
        if "id" not in n and "churn" not in n and numeric[col].nunique() > 1:
            usable.append(col)

    if len(usable) < 2:
        return {
            "available": False,
            "reason": "Not enough usable numeric features for segmentation.",
        }

    features = numeric[usable].replace([np.inf, -np.inf], np.nan)
    features = features.fillna(features.median(numeric_only=True))

    k = min(5, max(2, len(df) // 20))
    k = min(k, len(features))

    model = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = model.fit_predict(features)

    segmented = df.copy()
    segmented["segment"] = labels

    summary = []
    for segment_id in sorted(np.unique(labels)):
        group = features[labels == segment_id]
        summary.append({
            "segment": f"Segment {int(segment_id) + 1}",
            "customers": int(len(group)),
            "profile": {
                str(col): round(float(group[col].mean()), 2)
                for col in usable[:5]
            },
        })

    return {
        "available": True,
        "segments": summary,
        "count": int(k),
    }


def build_customer_intelligence(df: pd.DataFrame):
    if df.empty:
        raise ValueError("Dataset is empty.")

    churn_col = find_column(
        df,
        ["churn", "churned", "ischurn", "customerchurn", "exited"]
    )

    spend_col = find_column(
        df,
        ["monthly_spend", "monthlycharges", "spend", "revenue", "total_spend"]
    )

    analytics = {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "missing_values": int(df.isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
    }

    churn_result = (
        train_churn(df, churn_col)
        if churn_col
        else {
            "available": False,
            "reason": "No churn label was detected.",
        }
    )

    segmentation = segment_customers(df)

    total_value = None
    if spend_col:
        numeric_spend = pd.to_numeric(df[spend_col], errors="coerce")
        total_value = float(numeric_spend.sum())

    kpis = {
        "total_customers": int(len(df)),
        "high_risk_customers": churn_result.get("high_risk", 0),
        "medium_risk_customers": churn_result.get("medium_risk", 0),
        "low_risk_customers": churn_result.get("low_risk", 0),
        "churn_rate": churn_result.get("churn_rate"),
        "total_spend": total_value,
    }

    return clean_json({
        "kpis": kpis,
        "analytics": analytics,
        "churn": churn_result,
        "segmentation": segmentation,
        "columns": [str(c) for c in df.columns],
    })
