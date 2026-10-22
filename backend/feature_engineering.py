"""
Feature engineering for the NYC Airbnb price model.

These functions build the numeric design matrix used by the supervised
regressors. They live in a standalone module (rather than inside the analysis
script) so that the pickled scikit-learn pipeline can be unpickled by the Flask
backend: a ``FunctionTransformer`` stores its callable by qualified name, so the
function must be importable from an installed module at load time.

Reference categories: Manhattan (borough) and Entire home/apt (room type).
"""
import numpy as np
import pandas as pd

# Distance to Midtown Manhattan (Times Square) — drives the spatial price-decay question
TIMES_SQUARE = (40.7580, -73.9855)

# Raw listing columns the model consumes (keeps the Flask /api/predict contract stable)
RAW_FEATURES = ['neighbourhood_group', 'room_type', 'latitude', 'longitude', 'minimum_nights',
                'number_of_reviews', 'reviews_per_month', 'calculated_host_listings_count',
                'availability_365']

_DESIGN_LABELS = {
    'room_private': 'Room: Private room',
    'room_shared': 'Room: Shared room',
    'boro_brooklyn': 'Borough: Brooklyn',
    'boro_queens': 'Borough: Queens',
    'boro_bronx': 'Borough: Bronx',
    'boro_staten_island': 'Borough: Staten Island',
    'dist_center_km': 'Distance to Midtown (km)',
    'log_min_nights': 'log(Minimum nights)',
    'log_reviews': 'log(Review count)',
    'reviews_per_month': 'Reviews per month',
    'log_host_listings': 'log(Host portfolio size)',
    'availability_365': 'Availability (365 d)',
    'latitude': 'Latitude',
    'longitude': 'Longitude',
}


def haversine_km(lat1, lon1, lat2, lon2):
    """Great-circle distance in kilometres between two points (vectorised)."""
    lat1, lon1, lat2, lon2 = map(np.radians, (lat1, lon1, lat2, lon2))
    a = np.sin((lat2 - lat1) / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin((lon2 - lon1) / 2) ** 2
    return 6371.0 * 2 * np.arcsin(np.sqrt(a))


def friendly_feature(name):
    """Human-readable label for a design-matrix column."""
    return _DESIGN_LABELS.get(name, name)


def build_design(d):
    """Numeric design matrix of pre-listing features (reference: Manhattan, Entire home/apt)."""
    Xd = pd.DataFrame(index=d.index)
    Xd['room_private'] = (d['room_type'] == 'Private room').astype(int)
    Xd['room_shared'] = (d['room_type'] == 'Shared room').astype(int)
    for _boro in ['brooklyn', 'queens', 'bronx', 'staten_island']:
        Xd['boro_' + _boro] = (d['neighbourhood_group'] == _boro.replace('_', ' ').title()).astype(int)
    Xd['dist_center_km'] = haversine_km(d['latitude'].values, d['longitude'].values,
                                        TIMES_SQUARE[0], TIMES_SQUARE[1])
    Xd['log_min_nights'] = np.log1p(d['minimum_nights'])
    Xd['log_reviews'] = np.log1p(d['number_of_reviews'])
    Xd['reviews_per_month'] = d['reviews_per_month']
    Xd['log_host_listings'] = np.log(d['calculated_host_listings_count'].clip(lower=1))
    Xd['availability_365'] = d['availability_365']
    return Xd


def build_design_tree(d):
    """Design matrix for the tree ensembles — adds raw coordinates for spatial splits."""
    Xd = build_design(d)
    Xd['latitude'] = d['latitude'].values
    Xd['longitude'] = d['longitude'].values
    return Xd
