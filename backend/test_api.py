import json
from app import app

client = app.test_client()

endpoints = [
    '/api/health', '/api/summary', '/api/filters', '/api/price-distribution',
    '/api/borough-analysis', '/api/room-type-analysis', '/api/neighbourhood-analysis',
    '/api/availability-analysis', '/api/questions', '/api/hypothesis-tests', '/api/model-metrics'
]

print("=== TESTING GET ENDPOINTS ===")
for ep in endpoints:
    res = client.get(ep)
    print(f"{ep:<30} Status: {res.status_code} | Bytes: {len(res.data)}")
    assert res.status_code == 200, f"Failed: {ep}"

print("\n=== TESTING LISTINGS SEARCH & FILTER ===")
res_list = client.get('/api/listings?borough=Manhattan&room_type=Entire+home%2Fapt&limit=5')
data_list = json.loads(res_list.data)
print(f"Listings matched: {data_list['total']} | Returned: {len(data_list['listings'])}")
assert data_list['total'] > 0

print("\n=== TESTING PREDICTION ENDPOINT ===")
payload = {
    "neighbourhood_group": "Manhattan",
    "room_type": "Entire home/apt",
    "minimum_nights": 3,
    "number_of_reviews": 25,
    "reviews_per_month": 2.0,
    "calculated_host_listings_count": 1,
    "availability_365": 180
}
res_pred = client.post('/api/predict', json=payload)
data_pred = json.loads(res_pred.data)
print(f"Prediction Status: {res_pred.status_code}")
print(f"Predicted Price: ${data_pred['predicted_price']} | CI: ${data_pred['confidence_interval'][0]} - ${data_pred['confidence_interval'][1]}")
print(f"Borough Median: ${data_pred['borough_median']} | Delta: {data_pred['delta_vs_borough_pct']}%")
assert res_pred.status_code == 200

print("\n=== TESTING COMPARISON ENDPOINT ===")
res_comp = client.get('/api/compare?type=borough&a=Manhattan&b=Brooklyn')
data_comp = json.loads(res_comp.data)
print(f"Compare Status: {res_comp.status_code}")
print(f"Manhattan Median: ${data_comp['item_a']['median_price']} vs Brooklyn Median: ${data_comp['item_b']['median_price']}")
print(f"Median Delta: {data_comp['median_delta_pct']}%")
assert res_comp.status_code == 200

print("\nALL API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!")
