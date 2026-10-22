import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify, make_response

app = Flask(__name__)

# Base Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULTS_JSON = os.path.join(BASE_DIR, "backend", "analysis_results.json")
CLEAN_CSV = os.path.join(BASE_DIR, "data", "processed", "cleaned_airbnb.csv")
MODEL_PKL = os.path.join(BASE_DIR, "backend", "trained_model_pipeline.pkl")

# The pickled pipeline's FunctionTransformer stores the design-matrix builders by
# qualified name, so the module must be importable before unpickling.
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))
import feature_engineering  # noqa: F401,E402

# Load analytical data into memory once at startup
print("Loading precomputed analysis results...")
with open(RESULTS_JSON, 'r', encoding='utf-8') as f:
    master_results = json.load(f)

print("Loading cleaned dataset for filtering and search...")
df_clean = pd.read_csv(CLEAN_CSV)

print("Loading trained machine learning model...")
# Stored with joblib + zlib compression (the raw forest pickles to ~197 MB).
model_pipeline = joblib.load(MODEL_PKL)

print("Backend assets loaded successfully.")

# Native CORS handling
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    return jsonify({
        "status": "healthy",
        "service": "NYC Airbnb Market Intelligence API",
        "dataset_rows": len(df_clean),
        "model_loaded": True
    })

@app.route('/api/summary', methods=['GET', 'OPTIONS'])
def summary():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    return jsonify(master_results['project'])

@app.route('/api/filters', methods=['GET', 'OPTIONS'])
def filters():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    boroughs = sorted(df_clean['neighbourhood_group'].unique().tolist())
    room_types = sorted(df_clean['room_type'].unique().tolist())
    price_tiers = ['Budget (<$70)', 'Moderate ($70-$150)', 'Premium ($151-$300)', 'Luxury (>$300)']
    neighbourhoods_by_borough = {
        b: sorted(df_clean[df_clean['neighbourhood_group'] == b]['neighbourhood'].unique().tolist())
        for b in boroughs
    }
    return jsonify({
        "boroughs": boroughs,
        "room_types": room_types,
        "price_tiers": price_tiers,
        "neighbourhoods_by_borough": neighbourhoods_by_borough,
        "price_range": {
            "min": int(df_clean['price_capped'].min()),
            "max": int(df_clean['price_capped'].max()),
            "median": int(df_clean['price_capped'].median())
        }
    })

@app.route('/api/listings', methods=['GET', 'OPTIONS'])
def get_listings():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    
    # Query parameters
    borough = request.args.get('borough', '').strip()
    neighbourhood = request.args.get('neighbourhood', '').strip()
    room_type = request.args.get('room_type', '').strip()
    price_tier = request.args.get('price_tier', '').strip()
    search = request.args.get('search', '').strip().lower()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    page = max(1, request.args.get('page', default=1, type=int))
    limit = min(100, max(5, request.args.get('limit', default=15, type=int)))

    # Filtering
    sub = df_clean
    if borough and borough != 'All':
        sub = sub[sub['neighbourhood_group'] == borough]
    if neighbourhood and neighbourhood != 'All':
        sub = sub[sub['neighbourhood'] == neighbourhood]
    if room_type and room_type != 'All':
        sub = sub[sub['room_type'] == room_type]
    if price_tier and price_tier != 'All':
        sub = sub[sub['price_tier'] == price_tier]
    if min_price is not None:
        sub = sub[sub['price_capped'] >= min_price]
    if max_price is not None:
        sub = sub[sub['price_capped'] <= max_price]
    if search:
        sub = sub[sub['name'].str.lower().str.contains(search, na=False) |
                  sub['neighbourhood'].str.lower().str.contains(search, na=False)]

    total_matched = len(sub)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_records = sub.iloc[start_idx:end_idx]

    fields = [
        'id', 'name', 'host_name', 'neighbourhood_group', 'neighbourhood',
        'latitude', 'longitude', 'room_type', 'price_capped', 'minimum_nights',
        'number_of_reviews', 'reviews_per_month', 'availability_365', 'host_type', 'price_tier'
    ]
    records = page_records[fields].to_dict(orient='records')

    # Summary of filtered slice
    summary_stats = {
        "count": total_matched,
        "mean_price": round(float(sub['price_capped'].mean()), 2) if total_matched > 0 else 0,
        "median_price": round(float(sub['price_capped'].median()), 2) if total_matched > 0 else 0,
        "avg_reviews": round(float(sub['number_of_reviews'].mean()), 1) if total_matched > 0 else 0
    }

    return jsonify({
        "total": total_matched,
        "page": page,
        "limit": limit,
        "total_pages": (total_matched + limit - 1) // limit,
        "summary": summary_stats,
        "listings": records
    })

@app.route('/api/price-distribution', methods=['GET', 'OPTIONS'])
def price_distribution():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    # Histogram bins for Recharts
    counts, bin_edges = np.histogram(df_clean['price_capped'], bins=24)
    bins_data = []
    for i in range(len(counts)):
        low = int(bin_edges[i])
        high = int(bin_edges[i+1])
        bins_data.append({
            "range": f"${low}-${high}",
            "bin_start": low,
            "bin_end": high,
            "count": int(counts[i])
        })
    return jsonify({
        "histogram": bins_data,
        "raw_skewness": master_results['questions'][0]['metrics']['raw_skewness'],
        "capped_skewness": master_results['questions'][0]['metrics']['capped_skewness'],
        "log_skewness": master_results['questions'][0]['metrics']['log_skewness'],
        "mean": master_results['project']['kpis']['mean_price'],
        "median": master_results['project']['kpis']['median_price']
    })

@app.route('/api/borough-analysis', methods=['GET', 'OPTIONS'])
def borough_analysis():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    q2_metrics = master_results['questions'][1]['metrics']['borough_table']
    return jsonify(q2_metrics)

@app.route('/api/room-type-analysis', methods=['GET', 'OPTIONS'])
def room_type_analysis():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    q3_metrics = master_results['questions'][2]['metrics']['room_type_table']
    return jsonify(q3_metrics)

@app.route('/api/neighbourhood-analysis', methods=['GET', 'OPTIONS'])
def neighbourhood_analysis():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    q5 = master_results['questions'][4]
    top_neigh = q5.get('chart_data') or q5.get('metrics', {}).get('top_neighbourhoods') or q5.get('metrics', {}).get('top_10', [])
    return jsonify(top_neigh)

@app.route('/api/availability-analysis', methods=['GET', 'OPTIONS'])
def availability_analysis():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    q14 = master_results['questions'][13]
    segments = q14.get('chart_data') or q14.get('metrics', {}).get('segments', [])
    return jsonify(segments)

@app.route('/api/questions', methods=['GET', 'OPTIONS'])
def questions():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    return jsonify(master_results['questions'])

@app.route('/api/questions/<int:qid>', methods=['GET', 'OPTIONS'])
def single_question(qid):
    if request.method == 'OPTIONS':
        return make_response('', 204)
    for q in master_results['questions']:
        if q['id'] == qid:
            return jsonify(q)
    return jsonify({"error": "Question not found"}), 404

@app.route('/api/hypothesis-tests', methods=['GET', 'OPTIONS'])
def hypothesis_tests():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    return jsonify(master_results['hypothesis_tests'])

@app.route('/api/model-metrics', methods=['GET', 'OPTIONS'])
def model_metrics():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    return jsonify(master_results['ml_results'])

@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No input JSON provided"}), 400

        # Validate required inputs with defaults
        borough = data.get('neighbourhood_group', 'Manhattan')
        room_type = data.get('room_type', 'Entire home/apt')
        min_nights = max(1, min(365, int(data.get('minimum_nights', 2))))
        num_reviews = max(0, int(data.get('number_of_reviews', 10)))
        reviews_per_month = max(0.0, float(data.get('reviews_per_month', 1.2)))
        host_count = max(1, int(data.get('calculated_host_listings_count', 1)))
        availability_365 = max(0, min(365, int(data.get('availability_365', 180))))

        # Borough default coordinates if not provided
        borough_coords = {
            'Manhattan': (40.7831, -73.9712),
            'Brooklyn': (40.6782, -73.9442),
            'Queens': (40.7282, -73.7949),
            'Bronx': (40.8448, -73.8648),
            'Staten Island': (40.5795, -74.1502)
        }
        default_lat, default_lon = borough_coords.get(borough, (40.7831, -73.9712))
        latitude = float(data.get('latitude', default_lat))
        longitude = float(data.get('longitude', default_lon))

        input_df = pd.DataFrame([{
            'neighbourhood_group': borough,
            'room_type': room_type,
            'latitude': latitude,
            'longitude': longitude,
            'minimum_nights': min_nights,
            'number_of_reviews': num_reviews,
            'reviews_per_month': reviews_per_month,
            'calculated_host_listings_count': host_count,
            'availability_365': availability_365
        }])

        pred_log = float(model_pipeline.predict(input_df)[0])
        pred_dollar = float(np.expm1(pred_log))

        # 90% confidence / prediction interval approximation based on RF RMSE
        rmse_log = master_results['ml_results']['model_comparison'][2]['log_rmse']
        low_dollar = float(np.expm1(pred_log - 1.645 * rmse_log))
        high_dollar = float(np.expm1(pred_log + 1.645 * rmse_log))

        # Borough median benchmark
        borough_median = float(df_clean[df_clean['neighbourhood_group'] == borough]['price_capped'].median())

        return jsonify({
            "predicted_price": round(pred_dollar, 2),
            "predicted_log_price": round(pred_log, 4),
            "confidence_interval": [round(max(10.0, low_dollar), 2), round(high_dollar, 2)],
            "borough_median": borough_median,
            "delta_vs_borough_pct": round(((pred_dollar - borough_median) / borough_median) * 100, 1),
            "model_used": "Random Forest Regressor (n_estimators=200, min_samples_leaf=3)",
            "inputs_evaluated": {
                "neighbourhood_group": borough,
                "room_type": room_type,
                "minimum_nights": min_nights,
                "number_of_reviews": num_reviews,
                "reviews_per_month": reviews_per_month,
                "calculated_host_listings_count": host_count,
                "availability_365": availability_365,
                "latitude": latitude,
                "longitude": longitude
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/compare', methods=['GET', 'OPTIONS'])
def compare_entities():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    
    comp_type = request.args.get('type', 'borough')
    item_a = request.args.get('a', 'Manhattan')
    item_b = request.args.get('b', 'Brooklyn')

    if comp_type == 'borough':
        sub_a = df_clean[df_clean['neighbourhood_group'] == item_a]
        sub_b = df_clean[df_clean['neighbourhood_group'] == item_b]
        test_context = "Hypothesis Test 2 (ANOVA & Kruskal-Wallis) confirms highly significant price disparity across NYC boroughs (p < 1e-300)."
    else:
        sub_a = df_clean[df_clean['room_type'] == item_a]
        sub_b = df_clean[df_clean['room_type'] == item_b]
        test_context = "Hypothesis Test 1 (Welch's t-test) confirms significant structural price divergence between room exclusivity tiers (Cohen's d = 1.61)."

    def compute_stats(df_slice, name):
        if len(df_slice) == 0:
            return {"name": name, "count": 0}
        return {
            "name": name,
            "count": len(df_slice),
            "mean_price": round(float(df_slice['price_capped'].mean()), 2),
            "median_price": round(float(df_slice['price_capped'].median()), 2),
            "std_price": round(float(df_slice['price_capped'].std()), 2),
            "avg_availability": round(float(df_slice['availability_365'].mean()), 1),
            "avg_reviews": round(float(df_slice['number_of_reviews'].mean()), 1),
            "avg_min_nights": round(float(df_slice['minimum_nights'].mean()), 1)
        }

    stats_a = compute_stats(sub_a, item_a)
    stats_b = compute_stats(sub_b, item_b)

    delta_pct = 0
    if stats_b['median_price'] > 0:
        delta_pct = round(((stats_a['median_price'] - stats_b['median_price']) / stats_b['median_price']) * 100, 1)

    return jsonify({
        "comparison_type": comp_type,
        "item_a": stats_a,
        "item_b": stats_b,
        "median_delta_pct": delta_pct,
        "statistical_test_context": test_context
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting NYC Airbnb Intelligence API server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
