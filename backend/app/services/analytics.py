import re
import pandas as pd


def normalize(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", str(name).lower())


def find_column(df: pd.DataFrame, candidates):
    normalized = {normalize(c): c for c in df.columns}

    for candidate in candidates:
        key = normalize(candidate)
        if key in normalized:
            return normalized[key]

    for col in df.columns:
        n = normalize(col)
        if any(normalize(candidate) in n for candidate in candidates):
            return col

    return None


def analyze_dataframe(df: pd.DataFrame):
    if df.empty:
        raise ValueError("The uploaded dataset is empty.")

    numeric = df.select_dtypes(include="number")

    missing = int(df.isna().sum().sum())
    duplicates = int(df.duplicated().sum())

    churn_col = find_column(
        df,
        ["churn", "churned", "ischurn", "customerchurn", "exited"]
    )

    spend_col = find_column(
        df,
        ["monthly_spend", "monthlycharges", "spend", "revenue", "total_spend"]
    )

    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": [str(c) for c in df.columns],
        "numeric_columns": [str(c) for c in numeric.columns],
        "missing_values": missing,
        "duplicate_rows": duplicates,
        "churn_column": str(churn_col) if churn_col else None,
        "spend_column": str(spend_col) if spend_col else None,
        "preview": df.head(8).fillna("").to_dict(orient="records"),
    }
