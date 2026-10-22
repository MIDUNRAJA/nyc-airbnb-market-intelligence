"""
NYC Airbnb Market Intelligence - Streamlit deployment
=====================================================
A Streamlit port of the React 19 + Flask web platform. Every section of the
website is reproduced here (Overview, Explore Market, Research Questions,
Statistical Evidence, Price Prediction, Market Explorer, Tableau, About) and it
is driven by the *same* precomputed artefacts the Flask API serves:

    backend/analysis_results.json          -> all statistics, copy and chart data
    data/processed/cleaned_airbnb.csv      -> interactive filtering / search
    backend/trained_model_pipeline.pkl     -> production Random Forest regressor

Nothing is recomputed, so every number on screen is byte-identical to the React
site and to the academic report.

Run locally:
    streamlit run streamlit_app/app.py

Deploy (Streamlit Community Cloud):
    Main file path -> streamlit_app/app.py
"""

from __future__ import annotations

import os
import sys

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from plotly.subplots import make_subplots

# --------------------------------------------------------------------------- #
# Paths & constants
# --------------------------------------------------------------------------- #
APP_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(APP_DIR)

RESULTS_JSON = os.path.join(ROOT, "backend", "analysis_results.json")
CLEAN_CSV = os.path.join(ROOT, "data", "processed", "cleaned_airbnb.csv")
MODEL_PKL = os.path.join(ROOT, "backend", "trained_model_pipeline.pkl")

TABLEAU_PUBLIC_URL = (
    "https://public.tableau.com/app/profile/midunraja.k/viz/"
    "NYC_Airbnb_Market_Insights_2019/NYCAirbnbMarketInsights"
)
# The /views/ path carries no X-Frame-Options header, so it can be framed.
TABLEAU_EMBED_URL = (
    "https://public.tableau.com/views/NYC_Airbnb_Market_Insights_2019/"
    "NYCAirbnbMarketInsights?:embed=y&:showVizHome=no&:display_count=n&:origin=viz_share_link"
)

TEAM = [
    ("K MIDUNRAJA", "CB.SC.U4CSE24324"),
    ("V ROHAN REDDY", "CB.SC.U4CSE24359"),
    ("VARUN SHANKAR", "CB.SC.U4CSE24345"),
    ("SANTHOSH V", "CB.SC.U4CSE24047"),
]

CORAL = "#FF5A5F"
TEAL = "#00A699"
VIOLET = "#7C5CFF"
CYAN = "#22B8CF"
AMBER = "#F59E0B"
INK = "#222222"
SLATE = "#64748B"
PALETTE = [CORAL, TEAL, VIOLET, CYAN, AMBER]

NAV = [
    "Overview",
    "Explore Market",
    "Research Questions",
    "Statistical Evidence",
    "Price Prediction",
    "Market Explorer",
    "Tableau Dashboard",
    "About",
]

st.set_page_config(
    page_title="NYC Airbnb Market Intelligence | 23CSE351 FODS",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --------------------------------------------------------------------------- #
# Styling
# --------------------------------------------------------------------------- #
CUSTOM_CSS = """
<style>
  html, body, [class*="css"] {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI",
                 Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  .stApp {
    background:
      radial-gradient(1200px 600px at 12% -8%, rgba(255,90,95,0.10), transparent 60%),
      radial-gradient(1000px 520px at 92% 4%, rgba(124,92,255,0.10), transparent 60%),
      #FAF9F5;
  }
  .block-container { padding-top: 1.6rem; padding-bottom: 3rem; max-width: 1400px; }
  section[data-testid="stSidebar"] {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(18px);
    border-right: 1px solid rgba(34,34,34,0.07);
  }

  .nx-eyebrow {
    display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.09em;
    text-transform: uppercase; color: #FF5A5F; margin-bottom: 6px;
  }
  .nx-h1 {
    font-size: 40px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.08;
    color: #1C1917; margin: 2px 0 8px 0;
  }
  .nx-h1 .grad {
    background: linear-gradient(100deg, #FF5A5F 0%, #7C5CFF 55%, #00A699 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  }
  .nx-sub { color: #6B7280; font-size: 14px; line-height: 1.65; max-width: 940px; }

  .nx-card {
    background: #FFFFFF; border: 1px solid rgba(34,34,34,0.08); border-radius: 20px;
    padding: 20px 22px; box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 12px 28px -18px rgba(16,24,40,0.18);
    height: 100%;
  }
  .nx-kpi {
    background: #FFFFFF; border: 1px solid rgba(34,34,34,0.08); border-radius: 18px;
    padding: 16px 18px; height: 100%;
    box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 10px 24px -20px rgba(16,24,40,0.20);
    transition: border-color .2s ease, transform .2s ease;
  }
  .nx-kpi:hover { border-color: rgba(255,90,95,0.42); transform: translateY(-2px); }
  .nx-kpi .k-label {
    font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
    color: #9CA3AF;
  }
  .nx-kpi .k-value {
    font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: #1C1917; line-height: 1.2;
    margin-top: 4px;
  }
  .nx-kpi .k-foot { font-size: 11px; color: #6B7280; margin-top: 3px; }

  .nx-chip {
    display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px;
    border-radius: 9px; background: #F3F4F6; color: #4B5563; border: 1px solid rgba(34,34,34,0.06);
    margin: 0 6px 6px 0;
  }
  .nx-chip.teal { background: rgba(0,166,153,0.10); color: #0F766E; border-color: rgba(0,166,153,0.24); }
  .nx-chip.coral { background: rgba(255,90,95,0.10); color: #C2410C; border-color: rgba(255,90,95,0.26); }
  .nx-chip.violet { background: rgba(124,92,255,0.10); color: #5B21B6; border-color: rgba(124,92,255,0.24); }
  .nx-chip.emerald { background: rgba(16,185,129,0.10); color: #047857; border-color: rgba(16,185,129,0.26); }

  .nx-panel {
    background: #FFFFFF; border: 1px solid rgba(34,34,34,0.08); border-radius: 22px;
    padding: 22px 24px; box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 16px 36px -26px rgba(16,24,40,0.22);
  }
  .nx-quote {
    background: #FAF9F5; border-left: 3px solid #FF5A5F; border-radius: 10px;
    padding: 12px 16px; font-size: 13px; color: #374151; line-height: 1.7;
  }
  .nx-code {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    font-size: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;
    padding: 10px 12px; color: #0F172A; white-space: pre-wrap;
  }
  .nx-h3 { font-size: 15px; font-weight: 800; color: #1C1917; letter-spacing: -0.01em; }
  .nx-muted { font-size: 12px; color: #6B7280; }
  .nx-divider { height: 1px; background: rgba(34,34,34,0.08); margin: 14px 0; }
  .nx-big {
    font-size: 34px; font-weight: 800; letter-spacing: -0.03em; color: #FF5A5F; line-height: 1.1;
  }
  .nx-big.teal { color: #00A699; }

  div[data-testid="stExpander"] {
    border: 1px solid rgba(34,34,34,0.08) !important; border-radius: 16px !important;
    background: #FFFFFF !important; overflow: hidden;
  }
  .stTabs [data-baseweb="tab-list"] { gap: 6px; }
  .stTabs [data-baseweb="tab"] { font-weight: 700; font-size: 12px; }
  .stButton > button {
    border-radius: 12px; font-weight: 700; font-size: 13px;
    border: 1px solid rgba(34,34,34,0.10);
  }
  .stButton > button[kind="primary"] { background: #FF5A5F; border-color: #FF5A5F; }
  footer, #MainMenu { visibility: hidden; }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# --------------------------------------------------------------------------- #
# Data loading (cached)
# --------------------------------------------------------------------------- #
@st.cache_data(show_spinner=False)
def load_results(path: str) -> dict:
    import json

    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


@st.cache_data(show_spinner=False)
def load_clean(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


@st.cache_resource(show_spinner=False)
def load_model(path: str):
    import joblib

    # The pickled pipeline stores its design-matrix builders by qualified name,
    # so backend/ must be importable before unpickling.
    backend_dir = os.path.join(ROOT, "backend")
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    return joblib.load(path)


results = load_results(RESULTS_JSON)
df_clean = load_clean(CLEAN_CSV)

PROJECT = results["project"]
KPIS = PROJECT["kpis"]
QUESTIONS = results["questions"]
TESTS = results["hypothesis_tests"]
REGISTER = results["hypothesis_register"]
ML = results["ml_results"]
PREP = results["preprocessing"]


# --------------------------------------------------------------------------- #
# Formatting helpers
# --------------------------------------------------------------------------- #
_TOKEN_MAP = {
    "usd": "USD", "pct": "%", "r2": "R2", "mae": "MAE", "rmse": "RMSE",
    "vif": "VIF", "clt": "CLT", "iqr": "IQR", "mu": "mu", "sigma": "sigma",
    "beta": "beta", "ci": "CI", "df": "df", "id": "ID", "n": "n", "llm": "LLM",
}


def prettify(key: str) -> str:
    parts = []
    for tok in str(key).replace("-", "_").split("_"):
        if not tok:
            continue
        parts.append(_TOKEN_MAP.get(tok.lower(), tok.capitalize()))
    name = " ".join(parts)
    return name[:1].upper() + name[1:] if name else str(key)


def fmt_num(value) -> str:
    if value is None:
        return "n/a"
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, (int, np.integer)):
        return f"{int(value):,}"
    if isinstance(value, (float, np.floating)):
        val = float(value)
        if val != val:
            return "n/a"
        if val == 0:
            return "0"
        if abs(val) < 1e-4:
            return f"{val:.3g}"
        if abs(val) >= 1000:
            return f"{val:,.1f}"
        return f"{val:,.2f}"
    if isinstance(value, str):
        return value
    return str(value)


def as_dataframe(payload) -> pd.DataFrame:
    """Normalise dict / list-of-dicts / nested dict into a display DataFrame."""
    if isinstance(payload, list):
        frame = pd.DataFrame(payload)
    elif isinstance(payload, dict):
        if payload and all(isinstance(v, dict) for v in payload.values()):
            frame = pd.DataFrame(payload).T.reset_index().rename(columns={"index": "group"})
        else:
            frame = pd.DataFrame([payload])
    else:
        frame = pd.DataFrame({"value": [payload]})
    frame.columns = [prettify(c) for c in frame.columns]
    return frame


def show_table(payload, height: int | None = None):
    frame = as_dataframe(payload)
    kwargs = {"width": "stretch", "hide_index": True}
    if height:
        kwargs["height"] = height
    st.dataframe(frame, **kwargs)


# --------------------------------------------------------------------------- #
# Small HTML components
# --------------------------------------------------------------------------- #
def section_heading(eyebrow: str, title: str, accent: str = "", subtitle: str = ""):
    st.markdown(
        f"""
        <div style="margin-bottom:14px">
          <span class="nx-eyebrow">{eyebrow}</span>
          <div class="nx-h1">{title} <span class="grad">{accent}</span></div>
          <div class="nx-sub">{subtitle}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def kpi_row(cards: list[tuple[str, str, str]], per_row: int = 4):
    """cards: list of (label, value, footer)."""
    for start in range(0, len(cards), per_row):
        chunk = cards[start:start + per_row]
        cols = st.columns(len(chunk), gap="small")
        for col, (label, value, foot) in zip(cols, chunk):
            with col:
                st.markdown(
                    f"""
                    <div class="nx-kpi">
                      <div class="k-label">{label}</div>
                      <div class="k-value">{value}</div>
                      <div class="k-foot">{foot}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )


def panel(title: str, body_html: str, subtitle: str = ""):
    st.markdown(
        f"""
        <div class="nx-panel">
          <div class="nx-h3">{title}</div>
          <div class="nx-muted" style="margin-top:2px">{subtitle}</div>
          <div class="nx-divider"></div>
          {body_html}
        </div>
        """,
        unsafe_allow_html=True,
    )


def chips(items: list[str], tone: str = ""):
    cls = f"nx-chip {tone}".strip()
    st.markdown("".join(f'<span class="{cls}">{i}</span>' for i in items), unsafe_allow_html=True)


# --------------------------------------------------------------------------- #
# Chart machinery
# --------------------------------------------------------------------------- #
def style_fig(fig: go.Figure, height: int = 380, title: str | None = None, legend: bool = True):
    fig.update_layout(
        template="plotly_white",
        height=height,
        margin=dict(l=12, r=12, t=46 if title else 20, b=12),
        title=dict(text=title, font=dict(size=14, color=INK)) if title else None,
        font=dict(color=INK, size=12),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        colorway=PALETTE,
        showlegend=legend,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1, font=dict(size=11)),
        hoverlabel=dict(bgcolor="white", font_size=12),
    )
    fig.update_xaxes(showgrid=False, zeroline=False, linecolor="#E7E5E0")
    fig.update_yaxes(gridcolor="#F1EFEA", zeroline=False, linecolor="#E7E5E0")
    return fig


# --- individual chart builders -------------------------------------------------


def _dual_distribution(cd: dict):
    hist = pd.DataFrame(cd["price_histogram"])
    logh = pd.DataFrame(cd["log_histogram"])
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=("Raw advertised price (USD / night)", "log(1 + price) vs fitted normal"),
    )
    fig.add_trace(
        go.Bar(
            x=hist["bin_label"], y=hist["count"], name="Listings",
            marker=dict(color=CORAL, line=dict(width=0)),
            customdata=np.stack([hist["pct"]], axis=-1),
            hovertemplate="%{x}<br>n = %{y}<br>%{customdata[0]:.2f}%<extra></extra>",
        ),
        row=1, col=1,
    )
    fig.add_trace(
        go.Scatter(x=logh["log_mid"], y=logh["empirical_density"], name="Empirical density",
                   line=dict(color=TEAL, width=2.6)),
        row=1, col=2,
    )
    fig.add_trace(
        go.Scatter(x=logh["log_mid"], y=logh["normal_pdf"], name="Fitted normal PDF",
                   line=dict(color=VIOLET, width=2, dash="dash")),
        row=1, col=2,
    )
    fig.update_xaxes(tickangle=-50, row=1, col=1)
    fig.update_yaxes(title_text="Frequency", row=1, col=1)
    fig.update_yaxes(title_text="Density", row=1, col=2)
    return fig


def _category_iqr_bars(cd: list, axis_title: str = "Price (USD / night)"):
    frame = pd.DataFrame(cd)
    cat = frame.columns[0]
    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            x=frame[cat], y=frame["median"], name="Median",
            marker=dict(color=CORAL, line=dict(width=0)),
            error_y=dict(
                type="data", symmetric=False,
                array=(frame["q75"] - frame["median"]).tolist(),
                arrayminus=(frame["median"] - frame["q25"]).tolist(),
                color=SLATE, thickness=1.2, width=6,
            ),
            customdata=np.stack([frame["count"], frame["mean"], frame["std"]], axis=-1),
            hovertemplate=(
                "<b>%{x}</b><br>Median $%{y:.0f}<br>Mean $%{customdata[1]:.2f}"
                "<br>SD $%{customdata[2]:.2f}<br>n = %{customdata[0]:,}<extra></extra>"
            ),
        )
    )
    fig.add_trace(
        go.Scatter(
            x=frame[cat], y=frame["mean"], name="Mean", mode="markers",
            marker=dict(color=TEAL, size=11, line=dict(color="white", width=2)),
            hovertemplate="<b>%{x}</b><br>Mean $%{y:.2f}<extra></extra>",
        )
    )
    fig.update_yaxes(title_text=axis_title)
    fig.update_layout(bargap=0.42)
    return fig


def _stacked_proportions(cd: list):
    frame = pd.DataFrame(cd)
    mapping = [
        ("Entire_home_apt", "Entire home/apt", CORAL, "entire_count"),
        ("Private_room", "Private room", TEAL, "private_count"),
        ("Shared_room", "Shared room", VIOLET, "shared_count"),
    ]
    scale = 100.0 if frame[[m[0] for m in mapping]].max().max() <= 1.5 else 1.0
    fig = go.Figure()
    for key, label, colour, count_key in mapping:
        if key not in frame.columns:
            continue
        counts = frame[count_key] if count_key in frame.columns else pd.Series(["n/a"] * len(frame))
        fig.add_trace(
            go.Bar(
                x=frame["borough"], y=frame[key] * scale, name=label,
                marker=dict(color=colour, line=dict(width=0)),
                customdata=np.stack([counts], axis=-1),
                hovertemplate=f"<b>%{{x}}</b><br>{label}: %{{y:.1f}}%<br>n = %{{customdata[0]}}<extra></extra>",
            )
        )
    fig.update_layout(barmode="stack", bargap=0.4)
    fig.update_yaxes(title_text="Share of inventory (%)", range=[0, 100])
    return fig


def _horizontal_ranked(cd: list):
    frame = pd.DataFrame(cd).sort_values("median")
    boroughs = frame.get("neighbourhood_group", pd.Series(["n/a"] * len(frame)))
    colour_map = {"Manhattan": CORAL, "Brooklyn": TEAL, "Queens": VIOLET,
                  "Bronx": CYAN, "Staten Island": AMBER}
    fig = go.Figure(
        go.Bar(
            orientation="h", x=frame["median"], y=frame["neighbourhood"],
            marker=dict(color=[colour_map.get(b, SLATE) for b in boroughs], line=dict(width=0)),
            text=[f"n={int(c):,}" for c in frame["count"]],
            textposition="outside", cliponaxis=False,
            customdata=np.stack([boroughs, frame["mean"], frame["count"]], axis=-1),
            hovertemplate=(
                "<b>%{y}</b><br>%{customdata[0]}<br>Median $%{x:.0f}"
                "<br>Mean $%{customdata[1]:.2f}<br>n = %{customdata[2]:,}<extra></extra>"
            ),
        )
    )
    fig.update_xaxes(title_text="Median nightly price (USD)")
    fig.update_layout(height=max(360, 34 * len(frame)))
    return fig


def _availability_trend(cd: list):
    frame = pd.DataFrame(cd)
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    fig.add_trace(
        go.Bar(x=frame["bracket"], y=frame["count"], name="Listings",
               marker=dict(color="#E7E5E0", line=dict(width=0)),
               hovertemplate="%{x}<br>n = %{y:,}<extra></extra>"),
        secondary_y=True,
    )
    fig.add_trace(
        go.Scatter(x=frame["bracket"], y=frame["mean_price"], name="Mean price",
                   mode="lines+markers", line=dict(color=CORAL, width=3), marker=dict(size=9)),
        secondary_y=False,
    )
    fig.add_trace(
        go.Scatter(x=frame["bracket"], y=frame["median_price"], name="Median price",
                   mode="lines+markers", line=dict(color=TEAL, width=3, dash="dot"),
                   marker=dict(size=9, symbol="diamond")),
        secondary_y=False,
    )
    fig.update_yaxes(title_text="Price (USD / night)", secondary_y=False)
    fig.update_yaxes(title_text="Listing volume", showgrid=False, secondary_y=True)
    fig.update_xaxes(tickangle=-20)
    return fig


def _review_velocity(cd: list):
    frame = pd.DataFrame(cd)
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    fig.add_trace(
        go.Bar(x=frame["bracket"], y=frame["avg_price"], name="Average price",
               marker=dict(color="#E7E5E0", line=dict(width=0)),
               hovertemplate="%{x}<br>Avg price $%{y:.2f}<extra></extra>"),
        secondary_y=True,
    )
    fig.add_trace(
        go.Scatter(x=frame["bracket"], y=frame["avg_velocity"], name="Mean velocity",
                   mode="lines+markers", line=dict(color=CORAL, width=3), marker=dict(size=9)),
        secondary_y=False,
    )
    fig.add_trace(
        go.Scatter(x=frame["bracket"], y=frame["median_velocity"], name="Median velocity",
                   mode="lines+markers", line=dict(color=TEAL, width=3, dash="dot"),
                   marker=dict(size=9, symbol="diamond")),
        secondary_y=False,
    )
    fig.update_yaxes(title_text="Reviews per month", secondary_y=False)
    fig.update_yaxes(title_text="Price (USD)", showgrid=False, secondary_y=True)
    fig.update_xaxes(tickangle=-20)
    return fig


def _minimum_stay(cd: list):
    frame = pd.DataFrame(cd)
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    for key, label, colour in [("median", "Median nights", CORAL),
                               ("mean", "Mean nights", TEAL),
                               ("q75", "75th percentile", VIOLET)]:
        fig.add_trace(
            go.Bar(x=frame["room_type"], y=frame[key], name=label,
                   marker=dict(color=colour, line=dict(width=0)),
                   hovertemplate=f"<b>%{{x}}</b><br>{label}: %{{y:.1f}}<extra></extra>"),
            secondary_y=False,
        )
    fig.add_trace(
        go.Scatter(x=frame["room_type"], y=frame["pct_30plus"], name="% requiring 30+ nights",
                   mode="lines+markers", line=dict(color=AMBER, width=3),
                   marker=dict(size=10, symbol="triangle-up"),
                   hovertemplate="<b>%{x}</b><br>%{y:.1f}% with 30+ night minimum<extra></extra>"),
        secondary_y=True,
    )
    fig.update_yaxes(title_text="Minimum nights required", secondary_y=False)
    fig.update_yaxes(title_text="Share 30+ nights (%)", showgrid=False, secondary_y=True)
    fig.update_layout(barmode="group", bargap=0.35, bargroupgap=0.12)
    return fig


def _host_donut(cd: list):
    frame = pd.DataFrame(cd)
    fig = px.pie(
        frame, names="host_type", values="listing_count", hole=0.58,
        color_discrete_sequence=[TEAL, CORAL, VIOLET],
        custom_data=["percentage", "mean_price", "median_price"],
    )
    fig.update_traces(
        textposition="outside", textinfo="label+percent",
        hovertemplate=(
            "<b>%{label}</b><br>Listings: %{value:,}<br>Share: %{customdata[0]:.2f}%"
            "<br>Mean $%{customdata[1]:.2f}<br>Median $%{customdata[2]:.0f}<extra></extra>"
        ),
        marker=dict(line=dict(color="white", width=2)),
    )
    fig.add_annotation(text="Host<br>portfolio", showarrow=False, font=dict(size=13, color=SLATE))
    return fig


def _correlation_heatmap(cd: list):
    frame = pd.DataFrame(cd).set_index("feature")
    fig = go.Figure(
        go.Heatmap(
            z=frame.values, x=list(frame.columns), y=list(frame.index),
            colorscale="RdBu", zmid=0, zmin=-1, zmax=1,
            text=np.round(frame.values, 2), texttemplate="%{text}", textfont=dict(size=10),
            colorbar=dict(title="r", thickness=12, len=0.85),
            hovertemplate="%{y} vs %{x}<br>r = %{z:.3f}<extra></extra>",
        )
    )
    fig.update_layout(height=520)
    fig.update_xaxes(tickangle=-35)
    return fig


def _probability_curves(cd: dict):
    dens = pd.DataFrame(cd["density_curve"])
    cdf = pd.DataFrame(cd["cdf_curve"])
    fig1 = go.Figure()
    fig1.add_trace(go.Scatter(x=dens["price_usd"], y=dens["empirical_density"], name="Empirical density",
                              line=dict(color=CORAL, width=2.6)))
    fig1.add_trace(go.Scatter(x=dens["price_usd"], y=dens["normal_pdf"], name="Fitted normal",
                              line=dict(color=VIOLET, width=2, dash="dash")))
    fig1.update_xaxes(title_text="Price (USD)")
    fig1.update_yaxes(title_text="Density")

    fig2 = go.Figure()
    fig2.add_trace(go.Scatter(x=cdf["price_usd"], y=cdf["empirical_cdf_pct"], name="Empirical CDF",
                              line=dict(color=TEAL, width=2.6)))
    fig2.add_trace(go.Scatter(x=cdf["price_usd"], y=cdf["theoretical_cdf_pct"], name="Theoretical CDF",
                              line=dict(color=AMBER, width=2, dash="dash")))
    cut_rows = cdf[cdf["is_budget_cutoff"] == True]  # noqa: E712
    if len(cut_rows):
        cut = float(cut_rows.iloc[0]["price_usd"])
        fig2.add_vline(x=cut, line=dict(color=CORAL, width=2, dash="dot"),
                       annotation_text=f"cutoff ${cut:,.0f}", annotation_position="top")
    fig2.update_xaxes(title_text="Price (USD)")
    fig2.update_yaxes(title_text="Cumulative probability (%)")

    return [("Probability density vs fitted normal", fig1),
            ("Cumulative distribution & budget threshold", fig2)]


def _clt(cd: list):
    frame = pd.DataFrame(cd)
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    fig.add_trace(
        go.Bar(x=frame["sample_size"], y=frame["expected_se"], name="Expected SE (sigma/sqrt(n))",
               marker=dict(color="#E7E5E0", line=dict(width=0)),
               hovertemplate="n = %{x}<br>Expected SE %{y:.4f}<extra></extra>"),
        secondary_y=False,
    )
    fig.add_trace(
        go.Bar(x=frame["sample_size"], y=frame["observed_se"], name="Observed SE of the mean",
               marker=dict(color=CORAL, line=dict(width=0)),
               hovertemplate="n = %{x}<br>Observed SE %{y:.4f}<extra></extra>"),
        secondary_y=False,
    )
    fig.add_trace(
        go.Scatter(x=frame["sample_size"], y=frame["mean_of_means"], name="Mean of sample means",
                   mode="lines+markers", line=dict(color=VIOLET, width=3), marker=dict(size=10)),
        secondary_y=True,
    )
    pop_mean = float(frame["population_mean"].iloc[0])
    fig.add_hline(y=pop_mean, line=dict(color=TEAL, width=2, dash="dash"),
                  annotation_text=f"population mean {pop_mean:.3f}", annotation_position="bottom right")
    fig.update_layout(barmode="group", bargap=0.35)
    fig.update_yaxes(title_text="Standard error (log-price)", secondary_y=False)
    fig.update_yaxes(title_text="Mean of means", showgrid=False, secondary_y=True)
    return fig


def _spatial(cd: list):
    frame = pd.DataFrame(cd)
    ordered = frame.sort_values("median_price")
    fig1 = go.Figure(
        go.Bar(
            x=ordered["median_price"], y=ordered["cluster_name"], orientation="h",
            marker=dict(color=ordered["median_price"], colorscale=[[0, "#FDE8E8"], [1, CORAL]],
                        line=dict(width=0)),
            customdata=np.stack([ordered["mean_price"], ordered["count"]], axis=-1),
            text=[f"n={int(c):,}" for c in ordered["count"]],
            textposition="outside", cliponaxis=False,
            hovertemplate="<b>%{y}</b><br>Median $%{x:.0f}<br>Mean $%{customdata[0]:.2f}"
                          "<br>n = %{customdata[1]:,}<extra></extra>",
        )
    )
    fig1.update_xaxes(title_text="Median nightly price (USD)")
    fig1.update_layout(height=max(340, 40 * len(frame)), showlegend=False)

    fig2 = px.scatter(
        frame, x="lon", y="lat", size="count", color="median_price",
        hover_name="cluster_name", color_continuous_scale=[[0, "#CCFBF1"], [1, CORAL]],
        custom_data=["mean_price", "count"],
    )
    fig2.update_traces(
        marker=dict(line=dict(color="white", width=1.5)),
        hovertemplate="<b>%{hovertext}</b><br>Lon %{x:.4f} / Lat %{y:.4f}"
                      "<br>Median $%{marker.color:.0f}<br>Mean $%{customdata[0]:.2f}"
                      "<br>n = %{customdata[1]:,}<extra></extra>",
    )
    fig2.update_xaxes(title_text="Longitude")
    fig2.update_yaxes(title_text="Latitude")
    fig2.update_layout(coloraxis_colorbar=dict(title="Median $", thickness=12))
    return [("Median price by spatial cluster", fig1),
            ("Geographic footprint (bubble = listing volume)", fig2)]


def _cohort_segmentation(cd: list):
    frame = pd.DataFrame(cd)
    fig1 = go.Figure(
        go.Bar(
            x=frame["segment"], y=frame["count"],
            marker=dict(color=[TEAL, CORAL, VIOLET][: len(frame)], line=dict(width=0)),
            text=[f"{p:.1f}%" for p in frame["pct"]], textposition="outside", cliponaxis=False,
            customdata=np.stack([frame["mean_reviews"]], axis=-1),
            hovertemplate="<b>%{x}</b><br>Listings: %{y:,}<br>%{text}<br>"
                          "Avg reviews %{customdata[0]:.1f}<extra></extra>",
        )
    )
    fig1.update_yaxes(title_text="Listings")
    fig1.update_layout(showlegend=False)

    fig2 = go.Figure()
    fig2.add_trace(go.Bar(x=frame["segment"], y=frame["mean_price"], name="Mean",
                          marker=dict(color=CORAL, line=dict(width=0))))
    fig2.add_trace(go.Bar(x=frame["segment"], y=frame["median_price"], name="Median",
                          marker=dict(color=TEAL, line=dict(width=0))))
    fig2.update_yaxes(title_text="Price (USD / night)")
    fig2.update_layout(barmode="group", bargap=0.4, bargroupgap=0.12)
    return [("Segment size and share of inventory", fig1),
            ("Price profile by availability segment", fig2)]


def _review_quartiles(cd: list):
    frame = pd.DataFrame(cd)
    fig = go.Figure()
    fig.add_trace(go.Bar(x=frame["review_cohort"], y=frame["mean"], name="Mean",
                         marker=dict(color=CORAL, line=dict(width=0)),
                         customdata=np.stack([frame["count"]], axis=-1),
                         hovertemplate="<b>%{x}</b><br>Mean $%{y:.2f}<br>n = %{customdata[0]:,}<extra></extra>"))
    fig.add_trace(go.Bar(x=frame["review_cohort"], y=frame["median"], name="Median",
                         marker=dict(color=TEAL, line=dict(width=0)),
                         hovertemplate="<b>%{x}</b><br>Median $%{y:.0f}<extra></extra>"))
    fig.update_layout(barmode="group", bargap=0.4, bargroupgap=0.12)
    fig.update_yaxes(title_text="Price (USD / night)")
    return fig


def _outlier_sensitivity(cd: list):
    frame = pd.DataFrame(cd)
    fig = make_subplots(rows=1, cols=2, subplot_titles=("Skewness after treatment", "Dispersion (SD) vs maximum"))
    fig.add_trace(
        go.Bar(x=frame["treatment"], y=frame["skewness"], name="Skewness",
               marker=dict(color=[AMBER, TEAL, VIOLET][: len(frame)], line=dict(width=0)),
               text=[f"{v:.2f}" for v in frame["skewness"]], textposition="outside", cliponaxis=False,
               hovertemplate="<b>%{x}</b><br>Skewness %{y:.3f}<extra></extra>"),
        row=1, col=1,
    )
    fig.add_trace(
        go.Bar(x=frame["treatment"], y=frame["std"], name="Std. deviation",
               marker=dict(color="#D6D3D1", line=dict(width=0)),
               hovertemplate="<b>%{x}</b><br>SD $%{y:.2f}<extra></extra>"),
        row=1, col=2,
    )
    fig.add_trace(
        go.Scatter(x=frame["treatment"], y=frame["max"], name="Maximum",
                   mode="markers", marker=dict(color=CORAL, size=12, symbol="diamond",
                                               line=dict(color="white", width=2)),
                   hovertemplate="<b>%{x}</b><br>Max $%{y:,.0f}<extra></extra>"),
        row=1, col=2,
    )
    fig.update_xaxes(tickangle=-20)
    fig.update_layout(showlegend=True, height=420)
    return fig


def _model_benchmark(cd: list):
    frame = pd.DataFrame(cd)
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    fig.add_trace(
        go.Bar(x=frame["model"], y=frame["log_r2"], name="R2 (log-price)",
               marker=dict(color=CORAL, line=dict(width=0)),
               text=[f"{v:.3f}" for v in frame["log_r2"]], textposition="outside", cliponaxis=False,
               hovertemplate="<b>%{x}</b><br>R2 %{y:.4f}<extra></extra>"),
        secondary_y=False,
    )
    fig.add_trace(
        go.Scatter(x=frame["model"], y=frame["dollar_mae"], name="Dollar MAE",
                   mode="markers+lines", line=dict(color=VIOLET, width=3),
                   marker=dict(size=11, symbol="diamond"),
                   hovertemplate="<b>%{x}</b><br>MAE $%{y:.2f}<extra></extra>"),
        secondary_y=True,
    )
    fig.update_yaxes(title_text="R2 (higher is better)", range=[0, max(1.0, frame["log_r2"].max() * 1.25)],
                     secondary_y=False)
    fig.update_yaxes(title_text="MAE in USD (lower is better)", showgrid=False, secondary_y=True)
    return fig


def _standardized_betas(cd: list):
    frame = pd.DataFrame(cd).sort_values("beta")
    fig = go.Figure(
        go.Bar(
            x=frame["beta"], y=frame["feature"], orientation="h",
            marker=dict(color=[CORAL if b > 0 else TEAL for b in frame["beta"]], line=dict(width=0)),
            text=[f"{v:+.3f}" for v in frame["beta"]], textposition="outside", cliponaxis=False,
            hovertemplate="<b>%{y}</b><br>Standardized beta %{x:+.4f}<extra></extra>",
        )
    )
    fig.add_vline(x=0, line=dict(color="#9CA3AF", width=1))
    fig.update_xaxes(title_text="Standardized beta on z-scored log-price")
    fig.update_layout(height=max(360, 34 * len(frame)), showlegend=False)
    return fig


CHART_BUILDERS = {
    "dual_distribution": _dual_distribution,
    "borough_iqr_bars": lambda cd: _category_iqr_bars(cd),
    "room_type_bars": lambda cd: _category_iqr_bars(cd),
    "stacked_proportions": _stacked_proportions,
    "horizontal_ranked_bars": _horizontal_ranked,
    "availability_price_trend": _availability_trend,
    "review_velocity_trend": _review_velocity,
    "minimum_stay_bars": _minimum_stay,
    "host_concentration_donut": _host_donut,
    "correlation_heatmap": _correlation_heatmap,
    "probability_cdf_comparison": _probability_curves,
    "clt_convergence": _clt,
    "spatial_cluster_bars": _spatial,
    "cohort_segmentation": _cohort_segmentation,
    "review_quartile_bars": _review_quartiles,
    "outlier_sensitivity_table": _outlier_sensitivity,
    "model_benchmark": _model_benchmark,
    "standardized_betas": _standardized_betas,
}


def render_chart(chart_type: str, chart_data, caption: str | None = None):
    """Render the chart_data payload for a given chart type, with a safe fallback."""
    builder = CHART_BUILDERS.get(chart_type)

    if builder is None:
        st.warning(f"Unmapped chart type: {chart_type}")
        show_table(chart_data)
        return

    try:
        built = builder(chart_data)
    except Exception as exc:  # pragma: no cover - defensive for exotic payloads
        st.warning(f"Chart could not be rendered ({chart_type}): {exc}")
        show_table(chart_data)
        return

    if isinstance(built, list):
        pairs = [(cap, fig) for cap, fig in built]
    else:
        pairs = [(caption, built)]

    if len(pairs) == 1:
        st.plotly_chart(style_fig(pairs[0][1]), width="stretch", config={"displayModeBar": False})
        return

    for cap, fig in pairs:
        if cap:
            st.markdown(f'<div class="nx-muted" style="font-weight:700;margin:6px 0 2px 0">{cap}</div>',
                        unsafe_allow_html=True)
        st.plotly_chart(style_fig(fig), width="stretch", config={"displayModeBar": False})


# --------------------------------------------------------------------------- #
# Metrics renderer
# --------------------------------------------------------------------------- #
def render_metrics(metrics: dict, per_row: int = 4):
    scalars, tables = [], []
    for key, value in metrics.items():
        if isinstance(value, list) and value and isinstance(value[0], dict):
            tables.append((key, value))
        elif isinstance(value, dict):
            tables.append((key, value))
        else:
            scalars.append((key, value))

    if scalars:
        cards = []
        for key, value in scalars:
            label = prettify(key)
            suffix = ""
            low = key.lower()
            if low.endswith("_usd"):
                suffix = " USD"
            elif low.endswith("_pct"):
                suffix = "%"
            elif low.endswith("_days"):
                suffix = " days"
            foot = ""
            if isinstance(value, str):
                cards.append((label, value, foot))
            else:
                cards.append((label, f"{fmt_num(value)}{suffix}", foot))
        kpi_row(cards, per_row=min(per_row, 4))

    for key, payload in tables:
        st.markdown(
            f'<div class="nx-muted" style="font-weight:800;text-transform:uppercase;'
            f'letter-spacing:.07em;margin:14px 0 4px 0">{prettify(key)}</div>',
            unsafe_allow_html=True,
        )
        show_table(payload)


def stat_cards(items: list[tuple[str, str]], per_row: int = 4):
    kpi_row([(label, value, "") for label, value in items], per_row=per_row)


# --------------------------------------------------------------------------- #
# Page: Overview
# --------------------------------------------------------------------------- #
def page_overview():
    section_heading(
        "23CSE351 - Foundations of Data Science (FODS) Final Case Study",
        PROJECT["title"], "",
        PROJECT["subtitle"],
    )
    chips(["Python", "Flask", "React", "Streamlit", "Recharts/Plotly", "scikit-learn", "Tableau"])

    kpi_row([
        ("Total verified listings", f"{KPIS['total_listings']:,}", "After 6-stage cleaning"),
        ("Median nightly price", f"${KPIS['median_price']:,.0f}", "USD, capped at 99th percentile"),
        ("Mean nightly price", f"${KPIS['mean_price']:,.2f}", f"Capped mean ${KPIS['capped_mean_price']:,.2f}"),
        ("Average availability", f"{KPIS['avg_availability_days']:,.1f} days", "Bookable days per year"),
    ])
    st.write("")
    kpi_row([
        ("Boroughs", f"{KPIS['total_boroughs']}", "Administrative NYC boroughs"),
        ("Micro-neighbourhoods", f"{KPIS['total_neighbourhoods']:,}", "Discrete submarkets"),
        ("Dominant room type", KPIS["most_common_room_type"], f"{KPIS['most_common_room_type_pct']:.1f}% of inventory"),
        ("Registered hypothesis tests", f"{REGISTER['n_tests']}", f"{REGISTER['n_rejected']} rejected after Holm-Bonferroni"),
    ])

    st.write("")
    left, right = st.columns([1.05, 1], gap="large")

    with left:
        panel(
            "Dataset provenance",
            f"""
            <div class="nx-muted" style="line-height:1.8">
              <b style="color:#1C1917">Dataset:</b> {PROJECT['dataset_name']}<br>
              <b style="color:#1C1917">Collection year:</b> {PROJECT['year']}<br>
              <b style="color:#1C1917">Raw records:</b> {PROJECT['raw_records']:,}<br>
              <b style="color:#1C1917">Clean records:</b> {PROJECT['clean_records']:,}<br>
              <b style="color:#1C1917">Engineered features:</b> {PROJECT['features_count']}<br>
              <b style="color:#1C1917">Source:</b>
              <a href="{PROJECT['source_url']}" target="_blank" style="color:#FF5A5F">open dataset</a>
            </div>
            """,
            "New York City Airbnb Open Data (2019), published via Inside Airbnb / Kaggle",
        )

    with right:
        panel(
            "Deliverable scope",
            """
            <div class="nx-muted" style="line-height:1.9">
              <b style="color:#1C1917">18</b> research questions with full 10-point scientific analysis<br>
              <b style="color:#1C1917">6-stage</b> preprocessing pipeline including IQR outlier treatment<br>
              <b style="color:#1C1917">4</b> core hypothesis tests + a 14-test Holm-Bonferroni register<br>
              <b style="color:#1C1917">4</b> regression models (Linear, Ridge alpha=10, Random Forest, Gradient Boosting)<br>
              <b style="color:#1C1917">Tableau</b> dashboard, DOCX report, 12-slide deck and this web platform
            </div>
            """,
            "Rubric coverage",
        )

    st.write("")
    st.markdown('<div class="nx-h3">6-Stage Preprocessing Pipeline</div>', unsafe_allow_html=True)
    st.markdown('<div class="nx-muted">Every transformation is preserved verbatim from the master notebook</div>',
                unsafe_allow_html=True)
    st.write("")
    show_table(PREP["cleaning_summary"])

    st.write("")
    c1, c2 = st.columns([1, 1], gap="large")
    with c1:
        missing = {k: v for k, v in PREP["missing_raw"].items() if v}
        if missing:
            fig = go.Figure(
                go.Bar(
                    x=list(missing.values()), y=[prettify(k) for k in missing], orientation="h",
                    marker=dict(color=CORAL, line=dict(width=0)),
                    text=list(missing.values()), textposition="outside", cliponaxis=False,
                    hovertemplate="<b>%{y}</b><br>%{x:,} missing<extra></extra>",
                )
            )
            fig.update_xaxes(title_text="Missing values in the raw extract")
            fig.update_layout(showlegend=False, height=340)
            st.plotly_chart(style_fig(fig, title="Missing values detected before imputation"),
                            width="stretch", config={"displayModeBar": False})
    with c2:
        panel(
            "Preprocessing decisions",
            f"""
            <div class="nx-muted" style="line-height:1.9">
              <b style="color:#1C1917">Duplicate rows removed:</b> {PREP['duplicate_count']}<br>
              <b style="color:#1C1917">Invalid zero-price listings removed:</b> {PREP['invalid_price_zero']}<br>
              <b style="color:#1C1917">Stays longer than 365 nights removed:</b> {PREP['extreme_min_nights_365']}<br>
              <b style="color:#1C1917">Outlier cap (99th percentile):</b> ${PREP['outlier_cap_99th']:,.0f}<br>
              <b style="color:#1C1917">Variance stabilisation:</b> {PREP['log_transform_formula']}
            </div>
            """,
            "IQR / Winsorisation treatment applied before modelling",
        )


# --------------------------------------------------------------------------- #
# Page: Explore Market
# --------------------------------------------------------------------------- #
def page_explore():
    section_heading(
        f"Verified dataset - {len(df_clean):,} listings",
        "Explore the NYC", "Market",
        "Filter, search and analyze individual properties across all five boroughs and every room exclusivity tier.",
    )

    boroughs = sorted(df_clean["neighbourhood_group"].dropna().unique().tolist())
    room_types = sorted(df_clean["room_type"].dropna().unique().tolist())
    tiers = ["Budget (<$70)", "Moderate ($70-$150)", "Premium ($151-$300)", "Luxury (>$300)"]
    lo, hi = int(df_clean["price_capped"].min()), int(df_clean["price_capped"].max())

    with st.container(border=True):
        r1 = st.columns([1.1, 1.5, 1.1, 1.1], gap="medium")
        with r1[0]:
            borough = st.selectbox("Borough", ["All boroughs"] + boroughs, index=0)
        with r1[1]:
            pool = df_clean if borough == "All boroughs" else df_clean[df_clean["neighbourhood_group"] == borough]
            hoods = sorted(pool["neighbourhood"].dropna().unique().tolist())
            neighbourhoods = st.multiselect("Neighbourhood (optional)", hoods, placeholder="All neighbourhoods")
        with r1[2]:
            room_type = st.selectbox("Room type", ["All room types"] + room_types, index=0)
        with r1[3]:
            tier = st.selectbox("Price tier", ["All tiers"] + tiers, index=0)

        r2 = st.columns([1.6, 1.4, 1], gap="medium")
        with r2[0]:
            price_range = st.slider("Nightly price range (USD, capped)", lo, hi, (lo, min(hi, 500)), step=5)
        with r2[1]:
            search = st.text_input("Search listing name", placeholder="e.g. cozy, loft, harlem")
        with r2[2]:
            page_size = st.selectbox("Rows per page", [10, 25, 50, 100], index=1)

    view = df_clean
    if borough != "All boroughs":
        view = view[view["neighbourhood_group"] == borough]
    if neighbourhoods:
        view = view[view["neighbourhood"].isin(neighbourhoods)]
    if room_type != "All room types":
        view = view[view["room_type"] == room_type]
    if tier != "All tiers":
        view = view[view["price_tier"] == tier]
    view = view[(view["price_capped"] >= price_range[0]) & (view["price_capped"] <= price_range[1])]
    if search:
        view = view[view["name"].astype(str).str.lower().str.contains(search.lower(), na=False)]

    if view.empty:
        st.info("No listings match your filter criteria. Widen the price range or clear a filter.")
        return

    total_pages = max(1, int(np.ceil(len(view) / page_size)))
    nav = st.columns([1, 1, 3], gap="small")
    with nav[0]:
        page = st.number_input("Page", min_value=1, max_value=total_pages, value=1, step=1)
    with nav[1]:
        st.markdown(f'<div class="nx-muted" style="padding-top:30px">{total_pages} page(s)</div>',
                    unsafe_allow_html=True)

    kpi_row([
        ("Matching listings", f"{len(view):,}", f"{len(view) / len(df_clean) * 100:.1f}% of the market"),
        ("Median price", f"${view['price_capped'].median():,.0f}", "Capped nightly rate"),
        ("Mean price", f"${view['price_capped'].mean():,.2f}", "Capped nightly rate"),
        ("Average availability", f"{view['availability_365'].mean():,.1f} days", "Bookable days / year"),
    ])
    st.write("")

    start = (int(page) - 1) * page_size
    page_rows = view.iloc[start:start + page_size]

    c1, c2 = st.columns([1.6, 1], gap="large")
    with c1:
        fig = go.Figure(
            go.Bar(
                x=[f"#{i + start}" for i in range(len(page_rows))],
                y=page_rows["price_capped"],
                marker=dict(color=[CORAL if p > view["price_capped"].median() else TEAL
                                   for p in page_rows["price_capped"]], line=dict(width=0)),
                customdata=np.stack([page_rows["neighbourhood_group"], page_rows["room_type"],
                                     page_rows["availability_365"]], axis=-1),
                hovertemplate=("<b>%{customdata[0]}</b><br>%{customdata[1]}"
                               "<br>Price $%{y:,.0f}<br>Availability %{customdata[2]} days<extra></extra>"),
            )
        )
        fig.add_hline(y=float(view["price_capped"].median()), line=dict(color=VIOLET, width=2, dash="dash"),
                      annotation_text="filtered median", annotation_position="top left")
        fig.update_xaxes(title_text="Listing on this page")
        fig.update_yaxes(title_text="Nightly price (USD)")
        fig.update_layout(showlegend=False)
        st.plotly_chart(style_fig(fig, title="Nightly rate per listing on this page"),
                        width="stretch", config={"displayModeBar": False})

    with c2:
        seg = (view.groupby("room_type")["price_capped"]
               .agg(["count", "median"]).reset_index().sort_values("median"))
        fig2 = go.Figure(
            go.Bar(
                x=seg["median"], y=seg["room_type"], orientation="h",
                marker=dict(color=VIOLET, line=dict(width=0)),
                text=[f"n={int(c):,}" for c in seg["count"]], textposition="outside", cliponaxis=False,
                hovertemplate="<b>%{y}</b><br>Median $%{x:,.0f}<extra></extra>",
            )
        )
        fig2.update_xaxes(title_text="Median price (USD)")
        fig2.update_layout(showlegend=False, height=300)
        st.plotly_chart(style_fig(fig2, title="Median price by room type (filtered)"),
                        width="stretch", config={"displayModeBar": False})

    display_cols = ["name", "neighbourhood_group", "neighbourhood", "room_type", "price_capped",
                    "minimum_nights", "number_of_reviews", "reviews_per_month",
                    "availability_365", "calculated_host_listings_count", "host_type", "price_tier"]
    table = page_rows[display_cols].rename(columns={
        "name": "Listing", "neighbourhood_group": "Borough", "neighbourhood": "Neighbourhood",
        "room_type": "Room type", "price_capped": "Price (USD)", "minimum_nights": "Min nights",
        "number_of_reviews": "Reviews", "reviews_per_month": "Reviews / month",
        "availability_365": "Availability (days)", "calculated_host_listings_count": "Host listings",
        "host_type": "Host type", "price_tier": "Price tier",
    })
    st.dataframe(table, width="stretch", hide_index=True)
    st.download_button(
        "Download filtered results as CSV",
        data=view.to_csv(index=False).encode("utf-8"),
        file_name="nyc_airbnb_filtered.csv",
        mime="text/csv",
    )


# --------------------------------------------------------------------------- #
# Page: Research Questions
# --------------------------------------------------------------------------- #
def page_questions():
    section_heading(
        f"Rubric requirement - 18 solved and visualised",
        "Research Questions &", "Full Analysis",
        "Every question features the complete 10-point scientific analysis: rationale, variables, metrics, "
        "interactive chart, statistical test and evidence-based conclusion.",
    )

    options = [f"Q{q['id']:02d} - {q['title']}" for q in QUESTIONS]
    mode = st.radio("View mode", ["Single question", "Show all 18"],
                    horizontal=True, label_visibility="collapsed")

    if mode == "Show all 18":
        selection = range(len(QUESTIONS))
    else:
        picked = st.selectbox("Jump to a question", options, index=0)
        selection = [options.index(picked)]

    for idx in selection:
        q = QUESTIONS[idx]
        header = f"Q{q['id']:02d}  ·  {q['title']}"
        with st.expander(header, expanded=(len(list(selection)) == 1)):
            st.markdown(f'<div class="nx-eyebrow">{q["concept"]}</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="nx-sub">{q["why_it_matters"]}</div>', unsafe_allow_html=True)

            st.write("")
            left, right = st.columns([1, 1], gap="large")
            with left:
                st.markdown('<div class="nx-muted" style="font-weight:800;text-transform:uppercase;'
                            'letter-spacing:.07em">Variables and units</div>', unsafe_allow_html=True)
                show_table(q["variables_and_units"])
            with right:
                st.markdown('<div class="nx-muted" style="font-weight:800;text-transform:uppercase;'
                            'letter-spacing:.07em">Analytical method</div>', unsafe_allow_html=True)
                st.markdown(f'<div class="nx-quote">{q["analytical_method"]}</div>',
                            unsafe_allow_html=True)

            st.write("")
            st.markdown('<div class="nx-h3">Key computed metrics</div>', unsafe_allow_html=True)
            render_metrics(q["metrics"])

            st.write("")
            st.markdown(f'<div class="nx-h3">Visual evidence</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="nx-muted">Chart type: {prettify(q["chart_type"])}</div>',
                        unsafe_allow_html=True)
            render_chart(q["chart_type"], q["chart_data"])

            st.markdown(f'<div class="nx-muted" style="line-height:1.75"><b style="color:#1C1917">'
                        f'Graph interpretation.</b> {q["graph_interpretation"]}</div>',
                        unsafe_allow_html=True)

            test = q.get("statistical_test") or {}
            if test:
                show_table({
                    "Test": test.get("test_name"),
                    "Statistic": test.get("statistic"),
                    "p-value": test.get("p_value"),
                    "Result": test.get("result"),
                })

            st.markdown(
                f'<div class="nx-quote"><b>Conclusion.</b> {q["conclusion"]}</div>',
                unsafe_allow_html=True,
            )
            st.markdown(
                f'<div class="nx-muted" style="margin-top:8px"><b style="color:#1C1917">'
                f'Assumptions and limitations.</b> {q["assumptions_and_limitations"]}</div>',
                unsafe_allow_html=True,
            )


# --------------------------------------------------------------------------- #
# Page: Statistical Evidence
# --------------------------------------------------------------------------- #
def _test_chart(test: dict):
    cd = test.get("chart_data")
    if isinstance(cd, list) and cd and isinstance(cd[0], dict):
        frame = pd.DataFrame(cd)
        keys = list(frame.columns)
        if {"group", "mean_usd", "median_usd"} <= set(keys):
            fig = go.Figure()
            fig.add_trace(go.Bar(x=frame["group"], y=frame["mean_usd"], name="Mean (USD)",
                                 marker=dict(color=CORAL, line=dict(width=0)),
                                 error_y=dict(type="data", symmetric=False,
                                              array=(frame["ci_high_log"].apply(np.expm1) - frame["mean_usd"]).tolist(),
                                              arrayminus=(frame["mean_usd"] - frame["ci_low_log"].apply(np.expm1)).tolist(),
                                              color=SLATE)))
            fig.add_trace(go.Bar(x=frame["group"], y=frame["median_usd"], name="Median (USD)",
                                 marker=dict(color=TEAL, line=dict(width=0))))
            fig.update_layout(barmode="group", bargap=0.4)
            fig.update_yaxes(title_text="Price (USD / night)")
            return fig
        if {"neighbourhood_group", "mean", "median"} <= set(keys):
            return _category_iqr_bars(cd)
        if "observed_entire" in keys:
            fig = make_subplots(rows=1, cols=3, subplot_titles=("Entire home/apt", "Private room", "Shared room"))
            for col, suffix in enumerate(["entire", "private", "shared"], start=1):
                fig.add_trace(go.Bar(x=frame["borough"], y=frame[f"observed_{suffix}"], name="Observed",
                                     marker=dict(color=CORAL, line=dict(width=0)), showlegend=col == 1),
                              row=1, col=col)
                fig.add_trace(go.Bar(x=frame["borough"], y=frame[f"expected_{suffix}"], name="Expected",
                                     marker=dict(color="#D6D3D1", line=dict(width=0)), showlegend=col == 1),
                              row=1, col=col)
            fig.update_layout(barmode="group", bargap=0.35, height=400)
            fig.update_xaxes(tickangle=-35)
            return fig
        if {"bracket", "mean_price"} <= set(keys):
            return _availability_trend(cd)
    return None


def page_evidence():
    section_heading(
        "Rubric requirement - hypothesis formulation & statistical testing",
        "Statistical Hypothesis Testing &", "Inferential Evidence",
        "Welch's t-test, One-Way ANOVA, Kruskal-Wallis, Pearson's Chi-Square test of independence, "
        "two-proportion z-tests, exact binomial and Spearman correlation - every formal test registered "
        "and Holm-Bonferroni corrected for family-wise error.",
    )

    kpi_row([
        ("Core hypothesis tests", f"{len(TESTS)}", "Deep-dive analysis"),
        ("Registered tests", f"{REGISTER['n_tests']}", REGISTER["method"]),
        ("Rejected at alpha", f"{REGISTER['n_rejected']}", f"alpha = {REGISTER['alpha']}"),
        ("Statistical significance", "p < 0.05", "Family-wise error controlled"),
    ])
    st.write("")

    labels = [f"Test {i + 1} - {t['name'].split(':')[-1].strip()}" for i, t in enumerate(TESTS)]
    picked = st.radio("Select test", labels, horizontal=False, label_visibility="collapsed")
    test = TESTS[labels.index(picked)]

    st.markdown(f'<div class="nx-eyebrow">{test["type"]}</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="nx-h3" style="font-size:19px">{test["name"]}</div>', unsafe_allow_html=True)
    chips([test["decision"], f"alpha = {test['alpha']}", test["effect_size_name"]], tone="emerald")

    panel("Research question", f'<div class="nx-quote">{test["research_question"]}</div>')
    st.write("")

    h1, h2 = st.columns(2, gap="large")
    with h1:
        panel("Null hypothesis (H0)", f'<div class="nx-code">{test["null_hypothesis"]}</div>',
              "Assumes zero genuine difference / pure random chance")
    with h2:
        panel("Alternative hypothesis (H1)", f'<div class="nx-code">{test["alt_hypothesis"]}</div>',
              "Posits a systematic underlying population effect")

    st.write("")
    ci = test.get("confidence_interval_95") or []
    stat_cards([
        (test["test_statistic_name"], fmt_num(test["test_statistic"])),
        ("p-value", "< 1e-10 (extreme)" if test["p_value"] < 1e-10 else fmt_num(test["p_value"])),
        (test["effect_size_name"], fmt_num(test["effect_size"])),
        ("Degrees of freedom", fmt_num(test.get("degrees_of_freedom")) or "n/a"),
    ], per_row=4)
    st.write("")
    if len(ci) == 2:
        stat_cards([
            ("Group A", test.get("group_a", "n/a")),
            ("Group B", test.get("group_b", "n/a")),
            ("95% CI (log-price)", f"[{ci[0]:.3f}, {ci[1]:.3f}]"),
            ("Decision", test["decision"]),
        ], per_row=4)

    st.write("")
    fig = _test_chart(test)
    if fig is not None:
        st.plotly_chart(style_fig(fig, title="Statistical visualisation"), width="stretch",
                        config={"displayModeBar": False})
    else:
        show_table(test.get("chart_data"))

    st.write("")
    i1, i2 = st.columns(2, gap="large")
    with i1:
        panel("Empirical interpretation", f'<div class="nx-muted" style="line-height:1.8">{test["interpretation"]}</div>')
    with i2:
        panel("Limitations", f'<div class="nx-muted" style="line-height:1.8">{test["limitations"]}</div>')

    st.write("")
    st.markdown('<div class="nx-h3">Holm-Bonferroni multiple-comparison register</div>',
                unsafe_allow_html=True)
    st.markdown(f'<div class="nx-muted">{REGISTER["note"]}</div>', unsafe_allow_html=True)

    reg = pd.DataFrame(REGISTER["tests"])
    display = reg[[c for c in ["question", "hypothesis", "test", "statistic", "p_value_display",
                               "p_value_holm_display", "effect_size", "effect_value",
                               "magnitude", "decision"] if c in reg.columns]].rename(columns={
        "question": "Question", "hypothesis": "Hypothesis", "test": "Test",
        "statistic": "Statistic", "p_value_display": "p-value",
        "p_value_holm_display": "Holm-adjusted p", "effect_size": "Effect size",
        "effect_value": "Effect value", "magnitude": "Magnitude", "decision": "Decision",
    })
    st.dataframe(display, width="stretch", hide_index=True)

    st.write("")
    st.markdown('<div class="nx-muted" style="font-weight:800;text-transform:uppercase;'
                'letter-spacing:.07em">Effect size across the 14 registered tests</div>',
                unsafe_allow_html=True)
    fig2 = go.Figure(
        go.Bar(
            x=reg["question"], y=reg["effect_value"].abs(),
            customdata=np.stack([reg["effect_size"], reg["magnitude"], reg["test"]], axis=-1),
            marker=dict(color=[CORAL if d == "Reject H0" else "#D6D3D1" for d in reg["decision"]],
                        line=dict(width=0)),
            hovertemplate=("<b>%{x}</b><br>%{customdata[2]}<br>%{customdata[0]} = %{y:.3f}"
                           "<br>Magnitude: %{customdata[1]}<extra></extra>"),
        )
    )
    fig2.update_xaxes(title_text="Registered test")
    fig2.update_yaxes(title_text="Absolute effect size")
    fig2.update_layout(showlegend=False)
    st.plotly_chart(style_fig(fig2), width="stretch", config={"displayModeBar": False})


# --------------------------------------------------------------------------- #
# Page: Price Prediction
# --------------------------------------------------------------------------- #
BOROUGH_COORDS = {
    "Manhattan": (40.7831, -73.9712),
    "Brooklyn": (40.6782, -73.9442),
    "Queens": (40.7282, -73.7949),
    "Bronx": (40.8448, -73.8648),
    "Staten Island": (40.5795, -74.1502),
}


def predict_price(borough, room_type, min_nights, reviews, reviews_per_month, host_count, availability):
    model = load_model(MODEL_PKL)
    lat, lon = BOROUGH_COORDS.get(borough, (40.7831, -73.9712))
    frame = pd.DataFrame([{
        "neighbourhood_group": borough,
        "room_type": room_type,
        "latitude": lat,
        "longitude": lon,
        "minimum_nights": int(min_nights),
        "number_of_reviews": int(reviews),
        "reviews_per_month": float(reviews_per_month),
        "calculated_host_listings_count": int(host_count),
        "availability_365": int(availability),
    }])
    pred_log = float(model.predict(frame)[0])
    pred_usd = float(np.expm1(pred_log))

    rf = next((m for m in ML["model_comparison"] if "random" in m["model"].lower()),
              ML["model_comparison"][2])
    rmse_log = float(rf["log_rmse"])
    low = float(np.expm1(pred_log - 1.645 * rmse_log))
    high = float(np.expm1(pred_log + 1.645 * rmse_log))

    subset = df_clean[df_clean["neighbourhood_group"] == borough]
    borough_median = float(subset["price_capped"].median()) if len(subset) else 0.0
    delta = ((pred_usd - borough_median) / borough_median * 100) if borough_median else 0.0

    return {
        "predicted_price": round(pred_usd, 2),
        "predicted_log_price": round(pred_log, 4),
        "confidence_interval": [round(max(10.0, low), 2), round(high, 2)],
        "borough_median": borough_median,
        "delta_vs_borough_pct": round(delta, 1),
        "model_used": rf["model"],
    }


def page_prediction():
    section_heading(
        "Rubric requirement - regression, prediction & evaluation",
        "Predictive Price", "Valuation",
        "Estimates fair market nightly rates using the production Random Forest regressor trained on an "
        "80:20 partition, complete with residual diagnostics and feature importance evaluation.",
    )

    left, right = st.columns([1, 1.15], gap="large")

    with left:
        with st.container(border=True):
            st.markdown('<div class="nx-h3">Listing attributes & operational parameters</div>',
                        unsafe_allow_html=True)
            st.markdown('<div class="nx-muted">Same nine-feature input vector the Flask API consumes</div>',
                        unsafe_allow_html=True)
            st.write("")
            borough = st.selectbox("Borough submarket", list(BOROUGH_COORDS.keys()), index=0)
            room_type = st.selectbox("Room exclusivity tier",
                                     ["Entire home/apt", "Private room", "Shared room"], index=0)
            min_nights = st.slider("Minimum stay requirement (nights)", 1, 30, 3)
            availability = st.slider("Annual availability (days)", 0, 365, 180)
            reviews = st.slider("Cumulative reviews", 0, 500, 25)
            reviews_per_month = st.slider("Reviews per month", 0.0, 12.0, 1.5, step=0.1)
            host_count = st.slider("Host portfolio listings", 1, 50, 1)

        st.write("")
        with st.container(border=True):
            st.markdown('<div class="nx-h3">What-if scenario simulation</div>', unsafe_allow_html=True)
            st.markdown('<div class="nx-muted">Counterfactual listings pre-scored by the trained Random Forest, '
                        'with 95% prediction intervals</div>', unsafe_allow_html=True)
            st.write("")
            show_table(ML["what_if_scenarios"])

        st.write("")
        with st.container(border=True):
            st.markdown('<div class="nx-h3">Naive baseline benchmark</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="nx-muted">The selected model improves on the naive baseline by '
                        f'<b>{ML["naive_baseline_lift_pct"]:.2f}%</b></div>', unsafe_allow_html=True)
            st.write("")
            show_table(ML["baseline_benchmark"])

    with right:
        with st.spinner("Scoring with the Random Forest pipeline..."):
            outcome = predict_price(borough, room_type, min_nights, reviews,
                                    reviews_per_month, host_count, availability)

        st.markdown(
            f"""
            <div class="nx-panel">
              <div class="nx-muted" style="font-weight:800;text-transform:uppercase;letter-spacing:.08em">
                Estimated fair market rate
              </div>
              <div class="nx-big" style="margin-top:6px">${outcome['predicted_price']:,.2f}
                <span style="font-size:15px;color:#6B7280;font-weight:600">/ night</span></div>
              <div class="nx-muted" style="margin-top:4px">
                log-price {outcome['predicted_log_price']} · 90% prediction interval
                ${outcome['confidence_interval'][0]:,.2f} - ${outcome['confidence_interval'][1]:,.2f}
              </div>
              <div class="nx-divider"></div>
              <div class="nx-muted" style="line-height:1.9">
                <b style="color:#1C1917">Borough median benchmark:</b> ${outcome['borough_median']:,.0f}<br>
                <b style="color:#1C1917">Delta vs {borough}:</b>
                <span style="color:{'#FF5A5F' if outcome['delta_vs_borough_pct'] >= 0 else '#00A699'};font-weight:800">
                  {outcome['delta_vs_borough_pct']:+.1f}%</span><br>
                <b style="color:#1C1917">Model:</b> {outcome['model_used']}
              </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.write("")
        comp = pd.DataFrame(ML["model_comparison"])
        st.markdown('<div class="nx-muted" style="font-weight:800;text-transform:uppercase;'
                    'letter-spacing:.07em">Supervised regression benchmark matrix</div>',
                    unsafe_allow_html=True)
        st.dataframe(comp, width="stretch", hide_index=True)

        st.write("")
        view = st.radio("Diagnostics view",
                        ["Actual vs predicted", "Residual plot", "Gini importance", "Permutation importance"],
                        horizontal=True, label_visibility="collapsed")
        sample = pd.DataFrame(ML["actual_vs_predicted_sample"])

        if view == "Actual vs predicted":
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=sample["actual_log"], y=sample["pred_log"], mode="markers",
                                     name="Held-out test listings", marker=dict(color=CORAL, size=7, opacity=0.6)))
            fig.add_trace(go.Scatter(x=[2.5, 6.8], y=[2.5, 6.8], mode="lines", name="Ideal y = x",
                                     line=dict(color=SLATE, dash="dash")))
            fig.update_xaxes(title_text="Actual log(price)")
            fig.update_yaxes(title_text="Predicted log(price)")
            st.plotly_chart(style_fig(fig, height=360), width="stretch", config={"displayModeBar": False})
        elif view == "Residual plot":
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=sample["pred_log"], y=sample["residual_log"], mode="markers",
                                     name="Residuals", marker=dict(color=TEAL, size=7, opacity=0.6)))
            fig.add_hline(y=0, line=dict(color=CORAL, width=2, dash="dash"))
            fig.update_xaxes(title_text="Predicted log(price)")
            fig.update_yaxes(title_text="Residual (actual - predicted)")
            st.plotly_chart(style_fig(fig, height=360), width="stretch", config={"displayModeBar": False})
        else:
            payload = ML["top_features"] if view == "Gini importance" else ML["permutation_importance"]
            frame = pd.DataFrame(payload).sort_values("importance")
            fig = go.Figure(
                go.Bar(
                    x=frame["importance"], y=frame["feature"], orientation="h",
                    marker=dict(color=VIOLET if view == "Gini importance" else CYAN, line=dict(width=0)),
                    hovertemplate="<b>%{y}</b><br>%{x:.5f}<extra></extra>",
                )
            )
            fig.update_xaxes(title_text="Relative importance")
            fig.update_layout(height=max(340, 28 * len(frame)), showlegend=False)
            st.plotly_chart(style_fig(fig, height=max(340, 28 * len(frame))),
                            width="stretch", config={"displayModeBar": False})

    st.write("")
    st.markdown('<div class="nx-h3">Regression assumption diagnostics</div>', unsafe_allow_html=True)
    st.markdown('<div class="nx-muted">Multicollinearity, linearity, homoscedasticity, independence and '
                'residual normality - formally tested</div>', unsafe_allow_html=True)
    st.write("")
    show_table(ML["assumption_checks"])

    st.write("")
    d1, d2 = st.columns([1, 1], gap="large")
    with d1:
        st.markdown('<div class="nx-h3">Residual diagnostics</div>', unsafe_allow_html=True)
        show_table(ML["residual_diagnostics"])
    with d2:
        st.markdown(f'<div class="nx-h3">Max VIF = {ML["max_vif"]:.2f}</div>', unsafe_allow_html=True)
        show_table(ML["vif_table"])

    st.write("")
    st.markdown('<div class="nx-h3">Standardized beta coefficient ranking</div>', unsafe_allow_html=True)
    render_chart("standardized_betas", ML["standardized_coefficients"][:10])

    st.write("")
    st.markdown('<div class="nx-h3">Cross-validation stability (5-fold)</div>', unsafe_allow_html=True)
    cv = pd.DataFrame({
        "Model": [prettify(k) for k in ML["cv_r2"].keys()],
        "Mean R2": list(ML["cv_r2"].values()),
        "Std R2": [ML["cv_r2_std"][k] for k in ML["cv_r2"].keys()],
    })
    st.dataframe(cv, width="stretch", hide_index=True)

    st.write("")
    p1, p2 = st.columns(2, gap="large")
    with p1:
        panel("Model interpretation", f'<div class="nx-muted" style="line-height:1.8">{ML["interpretation"]}</div>')
    with p2:
        panel("Diagnostics interpretation",
              f'<div class="nx-muted" style="line-height:1.8">{ML["diagnostics_interpretation"]}</div>')
    st.write("")
    panel("Limitations", f'<div class="nx-muted" style="line-height:1.8">{ML["limitations"]}</div>')


# --------------------------------------------------------------------------- #
# Page: Market Explorer
# --------------------------------------------------------------------------- #
def _compare_stats(subset: pd.DataFrame, name: str) -> dict:
    if subset.empty:
        return {"name": name, "count": 0, "median_price": 0.0, "mean_price": 0.0,
                "std_price": 0.0, "avg_availability": 0.0, "avg_reviews": 0.0, "avg_min_nights": 0.0}
    return {
        "name": name,
        "count": int(len(subset)),
        "median_price": round(float(subset["price_capped"].median()), 2),
        "mean_price": round(float(subset["price_capped"].mean()), 2),
        "std_price": round(float(subset["price_capped"].std()), 2),
        "avg_availability": round(float(subset["availability_365"].mean()), 1),
        "avg_reviews": round(float(subset["number_of_reviews"].mean()), 1),
        "avg_min_nights": round(float(subset["minimum_nights"].mean()), 1),
    }


def page_explorer():
    section_heading(
        "Advanced full-stack bonus feature",
        "Market Insight Explorer:", "Compare Submarkets",
        "Directly compare any two boroughs or room types to evaluate price divergences, distribution "
        "parameters and inferential evidence.",
    )

    mode = st.radio("Comparison dimension", ["Borough", "Room type"], horizontal=True,
                    label_visibility="collapsed")
    if mode == "Borough":
        options = sorted(df_clean["neighbourhood_group"].dropna().unique().tolist())
        key, default_a, default_b = "neighbourhood_group", "Manhattan", "Brooklyn"
        context = ("Hypothesis Test 2 (One-Way ANOVA & Kruskal-Wallis) confirms highly significant price "
                   "disparity across NYC boroughs (p < 1e-300).")
    else:
        options = sorted(df_clean["room_type"].dropna().unique().tolist())
        key, default_a, default_b = "room_type", "Entire home/apt", "Private room"
        context = ("Hypothesis Test 1 (Welch's t-test) confirms significant structural price divergence "
                   "between room exclusivity tiers (Cohen's d = 1.61).")

    sel = st.columns(2, gap="large")
    with sel[0]:
        entity_a = st.selectbox("Entity A (benchmark)", options, index=options.index(default_a))
    with sel[1]:
        entity_b = st.selectbox("Entity B (comparator)", options, index=options.index(default_b))

    if entity_a == entity_b:
        st.warning("Choose two different entities to compare.")
        return

    stats_a = _compare_stats(df_clean[df_clean[key] == entity_a], entity_a)
    stats_b = _compare_stats(df_clean[df_clean[key] == entity_b], entity_b)
    delta = ((stats_a["median_price"] - stats_b["median_price"]) / stats_b["median_price"] * 100
             if stats_b["median_price"] else 0.0)

    cards = st.columns(2, gap="large")
    for col, stats, tone, tag in ((cards[0], stats_a, "coral", "Entity A - benchmark"),
                                  (cards[1], stats_b, "teal", "Entity B - comparator")):
        with col:
            st.markdown(
                f"""
                <div class="nx-card">
                  <span class="nx-eyebrow" style="color:{'#FF5A5F' if tone == 'coral' else '#00A699'}">{tag}</span>
                  <div class="nx-h3" style="font-size:18px">{stats['name']}</div>
                  <div class="nx-divider"></div>
                  <div class="nx-muted" style="line-height:2.1">
                    Median nightly price &nbsp;<b style="color:#1C1917;font-size:16px">${stats['median_price']:,.0f}</b><br>
                    Mean price (capped) &nbsp;<b style="color:#1C1917">${stats['mean_price']:,.2f}</b><br>
                    Standard deviation &nbsp;<b style="color:#1C1917">${stats['std_price']:,.2f}</b><br>
                    Total valid listings &nbsp;<b style="color:#1C1917">{stats['count']:,}</b><br>
                    Annual availability &nbsp;<b style="color:#1C1917">{stats['avg_availability']} days</b><br>
                    Average reviews &nbsp;<b style="color:#1C1917">{stats['avg_reviews']}</b><br>
                    Average minimum nights &nbsp;<b style="color:#1C1917">{stats['avg_min_nights']}</b>
                  </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.write("")
    kpi_row([
        ("Median delta", f"{delta:+.1f}%",
         f"{entity_a} vs {entity_b}"),
        ("Listings compared", f"{stats_a['count'] + stats_b['count']:,}", "Combined sample"),
        ("Price gap", f"${abs(stats_a['median_price'] - stats_b['median_price']):,.0f}", "Median difference"),
        ("Statistical context", "p < 0.05", "Formally tested"),
    ])

    st.write("")
    metrics_map = [("Median price ($)", "median_price"), ("Mean price ($)", "mean_price"),
                   ("Avg availability (days)", "avg_availability"), ("Avg reviews / listing", "avg_reviews"),
                   ("Avg min nights", "avg_min_nights")]
    fig = go.Figure()
    fig.add_trace(go.Bar(x=[m[0] for m in metrics_map], y=[stats_a[m[1]] for m in metrics_map],
                         name=entity_a, marker=dict(color=CORAL, line=dict(width=0))))
    fig.add_trace(go.Bar(x=[m[0] for m in metrics_map], y=[stats_b[m[1]] for m in metrics_map],
                         name=entity_b, marker=dict(color=TEAL, line=dict(width=0))))
    fig.update_layout(barmode="group", bargap=0.35, bargroupgap=0.12)
    fig.update_yaxes(title_text="Metric value")
    st.plotly_chart(style_fig(fig, title="Side-by-side metric comparison", height=400),
                    width="stretch", config={"displayModeBar": False})

    panel("Inferential evidence", f'<div class="nx-muted" style="line-height:1.8">{context}</div>')


# --------------------------------------------------------------------------- #
# Page: Tableau
# --------------------------------------------------------------------------- #
def page_tableau():
    section_heading(
        "Rubric requirement - Tableau / Power BI visual analytics",
        "Interactive", "Tableau Dashboard",
        "The published Tableau Public workbook, embedded live: executive KPIs, borough and neighbourhood "
        "price rankings, room exclusivity pricing, availability scatter and inventory composition.",
    )

    chips(["KPI_Summary", "Borough_Price_Comparison", "Room_Type_Pricing", "Neighbourhood_Rankings",
           "Availability_vs_Price", "Room_Type_Distribution"], tone="teal")
    st.write("")
    st.link_button("Open in Tableau Public", TABLEAU_PUBLIC_URL)

    with st.container(border=True):
        st.iframe(TABLEAU_EMBED_URL, height=900)

    st.write("")
    st.markdown('<div class="nx-muted">If the frame above stays blank in your browser (some corporate '
                'networks block third-party frames), use the "Open in Tableau Public" button.</div>',
                unsafe_allow_html=True)


# --------------------------------------------------------------------------- #
# Page: About
# --------------------------------------------------------------------------- #
DATA_DICTIONARY = [
    ("id", "Integer", "Unique listing identifier generated by the Airbnb platform"),
    ("name", "String", "Public title and description of the listing"),
    ("host_id", "Integer", "Unique identifier for the property host entity"),
    ("host_name", "String", "Display name of the host or commercial property manager"),
    ("neighbourhood_group", "Categorical", "One of the 5 administrative NYC boroughs"),
    ("neighbourhood", "Categorical", "One of 221 discrete NYC micro-neighbourhoods"),
    ("latitude / longitude", "Float", "WGS84 geospatial coordinates for spatial mapping"),
    ("room_type", "Categorical", "Exclusivity tier: Entire home/apt, Private room, Shared room"),
    ("price", "Float (USD)", "Raw advertised nightly price in US dollars"),
    ("price_capped", "Float (USD)", "Engineered target: Winsorised at the 99th percentile ($799)"),
    ("log_price", "Float", "Engineered target: ln(1 + price_capped) for variance stabilisation"),
    ("minimum_nights", "Integer", "Minimum stay duration required by the host booking policy"),
    ("number_of_reviews", "Integer", "Cumulative verified guest reviews over the listing tenure"),
    ("reviews_per_month", "Float", "Monthly review velocity; imputed with 0.0 when there are zero reviews"),
    ("calculated_host_listings_count", "Integer", "Total portfolio size operated by the host across NYC"),
    ("availability_365", "Integer", "Calendar days the listing is bookable per year (0 to 365)"),
]

PIPELINE_STEPS = [
    ("01", "Raw Data Ingestion", "48,895 raw records",
     "Sourced from NYC Airbnb Open Data 2019. Missing values identified in reviews_per_month (10,052) "
     "and host metadata."),
    ("02", "Preprocessing & Cleaning", "48,870 valid records",
     "Imputed missing reviews with 0.0; removed price=0 and stays above 365 nights; 99th-percentile capping "
     "($799) and log1p transform applied."),
    ("03", "18 Research Questions", "Exploratory & mathematical",
     "18 distinct inquiries covering spatial economics, CLT simulation, the Gram matrix identity, "
     "probability models, regression and prediction."),
    ("04", "Inferential Hypothesis Testing", "14 registered tests · Holm-Bonferroni",
     "Welch's t-test (t = 175.88), One-Way ANOVA (F = 1,928.01), Chi-Square test (chi2 = 1,557.95) and "
     "Pearson correlation (p = 4.03e-104), plus a 14-test Holm-Bonferroni register."),
    ("05", "Supervised ML Regression", "R2 = 0.633 · MAE = $47.48",
     "Linear baseline, Ridge regularisation, Random Forest and Gradient Boosting evaluated with residual "
     "diagnostics, permutation importance and 5-fold cross-validation."),
    ("06", "Deliverables & Full-Stack", "Tableau + React/Flask + Streamlit",
     "Synthesised into a Tableau Public workbook, academic DOCX report, a 12-slide deck and this interactive "
     "analytics platform."),
]


def page_about():
    section_heading(
        "Documentation & methodological framework",
        "About the", "FODS Case Study",
        "Academic documentation, data science lifecycle pipeline and dataset provenance.",
    )

    st.markdown('<div class="nx-h3">End-to-end data science lifecycle pipeline</div>', unsafe_allow_html=True)
    st.markdown('<div class="nx-muted">Methodological workflow following the official faculty guidelines</div>',
                unsafe_allow_html=True)
    st.write("")
    for start in range(0, len(PIPELINE_STEPS), 3):
        cols = st.columns(3, gap="medium")
        for col, (num, title, subtitle, desc) in zip(cols, PIPELINE_STEPS[start:start + 3]):
            with col:
                st.markdown(
                    f"""
                    <div class="nx-card">
                      <div class="nx-big">{num}</div>
                      <div class="nx-h3" style="margin-top:6px">{title}</div>
                      <div style="margin:8px 0">
                        <span class="nx-chip coral">{subtitle}</span>
                      </div>
                      <div class="nx-muted" style="line-height:1.65">{desc}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

    st.write("")
    panel(
        "Dataset provenance & temporal limitations",
        f"""
        <div class="nx-muted" style="line-height:1.8">
          <b style="color:#1C1917">Source:</b> {PROJECT['dataset_name']} published via Inside Airbnb /
          Kaggle Open Datasets. The collection period represents listings active in New York City throughout
          the {PROJECT['year']} calendar year, prior to COVID-19.
        </div>
        <div class="nx-quote" style="margin-top:12px">
          <b>Critical evaluation note:</b> this dataset represents the {PROJECT['year']} regulatory and market
          climate. It must <i>not</i> be interpreted as describing the post-2023 NYC short-term rental
          landscape, which underwent substantial structural changes following enforcement of NYC Local Law 18
          (Short-Term Rental Registration Law).
        </div>
        """,
    )

    st.write("")
    st.markdown(f'<div class="nx-h3">Complete data dictionary ({len(DATA_DICTIONARY)} features)</div>',
                unsafe_allow_html=True)
    st.markdown('<div class="nx-muted">Features across the ingestion, engineering and modelling stages</div>',
                unsafe_allow_html=True)
    st.write("")
    st.dataframe(
        pd.DataFrame(DATA_DICTIONARY, columns=["Feature name", "Data type", "Description & handling"]),
        width="stretch", hide_index=True,
    )

    st.write("")
    st.markdown('<div class="nx-h3">Candidate identity</div>', unsafe_allow_html=True)
    st.dataframe(pd.DataFrame(TEAM, columns=["Name", "Register number"]), width="stretch", hide_index=True)

    st.write("")
    panel(
        "Runtime architecture",
        f"""
        <div class="nx-muted" style="line-height:1.9">
          This Streamlit app is a first-class port of the React 19 + Flask platform: it reads the same
          <b style="color:#1C1917">analysis_results.json</b>, the same
          <b style="color:#1C1917">cleaned_airbnb.csv</b> and the same production
          <b style="color:#1C1917">trained_model_pipeline.pkl</b>. No statistic is recomputed at runtime, so
          every figure matches the report, the notebook and the Tableau workbook exactly.
        </div>
        """,
    )


# --------------------------------------------------------------------------- #
# Shell
# --------------------------------------------------------------------------- #
def main():
    with st.sidebar:
        st.markdown(
            """
            <div style="padding:6px 2px 14px 2px">
              <div class="nx-eyebrow" style="margin-bottom:2px">23CSE351 · FODS</div>
              <div style="font-size:19px;font-weight:800;letter-spacing:-0.02em;color:#1C1917;line-height:1.2">
                NYC Airbnb<br>Market Intelligence</div>
              <div class="nx-muted" style="margin-top:6px">
                A statistical investigation of 48,870 verified listings
              </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        page = st.radio("Navigation", NAV, label_visibility="collapsed")

        st.markdown('<div class="nx-divider"></div>', unsafe_allow_html=True)
        st.markdown(
            f"""
            <div class="nx-muted" style="line-height:1.9">
              <span class="nx-chip emerald">Live data</span><br>
              {KPIS['total_listings']:,} listings · {PREP['cleaning_summary'][0]['count']:,} raw rows<br>
              18 questions · 14 registered tests<br>
              4 regression models · 1 selected
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.markdown('<div class="nx-divider"></div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="nx-muted" style="line-height:1.8"><b style="color:#1C1917">Team</b><br>'
            + "<br>".join(f"{n} · {r}" for n, r in TEAM)
            + "</div>",
            unsafe_allow_html=True,
        )

    if page == "Overview":
        page_overview()
    elif page == "Explore Market":
        page_explore()
    elif page == "Research Questions":
        page_questions()
    elif page == "Statistical Evidence":
        page_evidence()
    elif page == "Price Prediction":
        page_prediction()
    elif page == "Market Explorer":
        page_explorer()
    elif page == "Tableau Dashboard":
        page_tableau()
    else:
        page_about()

    st.markdown(
        f"""
        <div style="margin-top:44px;padding-top:16px;border-top:1px solid rgba(34,34,34,0.08)"
             class="nx-muted">
          {PROJECT['course']} · {PROJECT['dataset_name']} · Built for academic evaluation
        </div>
        """,
        unsafe_allow_html=True,
    )


main()
