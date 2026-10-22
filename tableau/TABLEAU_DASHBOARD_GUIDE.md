# Tableau Dashboard Authoring & Construction Guide
## NYC Airbnb Market Insights — 2019
**Foundations of Data Science (23CSE351) Case Study Visual Analytics**

---

### Executive Overview
This guide documents the official visual analytics deliverable for the NYC Airbnb 2019 case study.

- **Curated Dataset (primary input):** [`tableau/NYC_Airbnb_Tableau_Data.csv`](file:///Users/kmidunraja/Downloads/FODS_Final_Submission/tableau/NYC_Airbnb_Tableau_Data.csv)  
  *Properties:* 48,870 rows, 18 attributes, zero null values, pre-calculated 99th-percentile capped price ($799), log price, host categories, and price tiers.
- **Generated Workbook:** [`tableau/NYC_Airbnb_Market_Insights_2019.twb`](file:///Users/kmidunraja/Downloads/FODS_Final_Submission/tableau/NYC_Airbnb_Market_Insights_2019.twb)  
  *Contents:* one dashboard plus six worksheets — `KPI_Summary`, `Borough_Price_Comparison`, `Room_Type_Pricing`, `Room_Type_Distribution`, `Availability_vs_Price`, and `Neighbourhood_Rankings` — all placed on the dashboard. It reads the adjacent CSV by relative path, so keep both files in the same folder.

> **Recommended path:** connect Tableau Public directly to the CSV (see Step 1) and build the worksheets using the click-by-click steps below. A workbook saved by Tableau itself is always valid and publishable.

---

### Step-by-Step Instructions: Building the Dashboard in Tableau Public

Construct the workbook from scratch in Tableau Public using the exact click-by-click steps below.

---

### Step 1: Connect the Data Source
1. Launch **Tableau Public 2024.3**.
2. Under the left **Connect** sidebar, click **Text file**.
3. Browse to and select `NYC_Airbnb_Tableau_Data.csv`.
4. In the Data Source preview table, confirm all 18 fields:
   - Dimensions: `neighbourhood_group`, `neighbourhood`, `room_type`, `host_type`, `price_tier`.
   - Measures: `price`, `price_capped`, `log_price`, `minimum_nights`, `number_of_reviews`, `reviews_per_month`, `calculated_host_listings_count`, `availability_365`.
   - Coordinates: `latitude`, `longitude`.
5. Format the `price_capped` field:
   - In the Data pane, right-click `[price_capped]` -> **Default Properties** -> **Number Format...**
   - Select **Currency (Custom)**: Decimal places = `0`, Prefix = `$`, Display units = `None`. Click **OK**.

---

### Step 2: Worksheet 1 — Executive KPI Cards (`KPI_Summary`)
1. Click the **New Worksheet** tab at the bottom. Name it `KPI_Summary`.
2. Drag `[id]` to **Text** on the Marks card. Right-click the pill -> change measure to **Measure (Count)**.
3. Drag `[price_capped]` to **Text** on the Marks card. Right-click -> **Measure (Median)**.
4. Drag `[price_capped]` to **Text** on the Marks card. Right-click -> **Measure (Average)**.
5. Drag `[neighbourhood_group]` to **Text** on the Marks card. Right-click -> **Measure (Count Distinct)**.
6. Click **Text** on the Marks card -> click the **...** button to format the label:
   ```
   Valid Listings: <CNT(id)>  |  Median Nightly Rate: <MEDIAN(price_capped)>  |  Average Rate: <AVG(price_capped)>  |  Boroughs: <CNTD(neighbourhood_group)>
   ```
7. Set font to 14pt Bold, color `#222222`.

---

### Step 3: Worksheet 2 — Borough Price Comparison (`Borough_Price_Comparison`)
1. Click **New Worksheet**. Name it `Borough_Price_Comparison`.
2. Drag `[neighbourhood_group]` to the **Rows** shelf.
3. Drag `[price_capped]` to the **Columns** shelf. Right-click the pill -> change aggregation to **Measure (Median)**.
4. Click the descending sort icon on the toolbar to sort boroughs from highest to lowest:
   - Manhattan: `$150`
   - Brooklyn: `$90`
   - Queens: `$75`
   - Staten Island: `$75`
   - Bronx: `$65`
5. Drag `[neighbourhood_group]` to **Color** on the Marks card.
6. On the Marks card, click **Label** -> check **Show mark labels**.
7. Set Title: *Median Nightly Listing Price Across NYC Boroughs*.

---

### Step 4: Worksheet 3 — Room Type Price Comparison (`Room_Type_Pricing`)
1. Click **New Worksheet**. Name it `Room_Type_Pricing`.
2. Drag `[room_type]` to the **Rows** shelf.
3. Drag `[price_capped]` to the **Columns** shelf. Right-click -> change aggregation to **Measure (Average)**.
4. Click descending sort on the toolbar:
   - Entire home/apt: `$198.35`
   - Private room: `$86.03`
   - Shared room: `$68.61`
5. Drag `[room_type]` to **Color** on the Marks card.
6. Click **Label** -> check **Show mark labels**.
7. Set Title: *Average Nightly Price by Room Exclusivity Tier*.

---

### Step 5: Worksheet 4 — Neighbourhood Price Comparison (`Neighbourhood_Rankings`)
1. Click **New Worksheet**. Name it `Neighbourhood_Rankings`.
2. Drag `[neighbourhood]` to the **Rows** shelf.
3. Drag `[price_capped]` to the **Columns** shelf. Right-click -> change to **Measure (Median)**.
4. Filter by sample size threshold ($n \ge 25$):
   - Drag `[id]` to the **Filters** shelf -> select **Count** -> set minimum to `25`. Click **OK**.
5. Filter to Top 10:
   - Drag `[neighbourhood]` to the **Filters** shelf -> select the **Top** tab -> select **By field: Top 10 by price_capped Median**.
6. Sort descending. Top neighbourhoods will display:
   - Tribeca ($250), Flatiron District ($225), NoHo ($225), Midtown ($200), Greenwich Village ($199).
7. Set Title: *Top 10 Most Expensive NYC Neighbourhoods (n >= 25 listings)*.

---

### Step 6: Worksheet 5 — Annual Availability vs. Price (`Availability_vs_Price`)
1. Click **New Worksheet**. Name it `Availability_vs_Price`.
2. Drag `[availability_365]` to the **Columns** shelf. Right-click -> select **Dimension**.
3. Drag `[price_capped]` to the **Rows** shelf. Right-click -> select **Dimension**.
4. On the Marks card:
   - Change mark type from *Automatic* to **Circle**.
   - Click **Color** -> set color to teal (`#00A699`), set Opacity to `30%`.
   - Click **Size** -> reduce circle diameter to minimum for readable density.
5. Add Linear Trend Line:
   - Right-click in the chart area -> **Trend Lines** -> check **Show Trend Lines**.
   - Hover over the trend line to observe the weak positive slope ($r = 0.1232, p < 10^{-160}$).
6. Set Title: *Annual Availability (Days/Year) vs. Listing Price*.

---

### Step 7: Worksheet 6 — Room Type Distribution Across Boroughs (`Room_Type_Distribution`)
1. Click **New Worksheet**. Name it `Room_Type_Distribution`.
2. Drag `[neighbourhood_group]` to the **Rows** shelf.
3. Drag `[id]` to the **Columns** shelf. Right-click -> **Measure (Count)**.
4. Drag `[room_type]` to **Color** on the Marks card.
5. On the Marks card, change mark type to **Bar**.
6. Convert to 100% Stacked Proportions (Optional):
   - Right-click `[CNT(id)]` on Columns -> **Quick Table Calculation** -> **Percent of Total** -> Compute Using **Table (across)**.
7. Set Title: *Room Type Inventory Composition by NYC Borough*.

---

### Step 8: Assembling the Interactive Dashboard
1. Click the **New Dashboard** icon at the bottom.
2. Name the dashboard: `NYC Airbnb Market Insights — 2019`.
3. In the left Dashboard pane:
   - Under **Size**, choose **Fixed size** -> **Generic Desktop (1366 x 768)** or **Automatic**.
4. Drag a **Vertical Layout Container** into the dashboard canvas.
5. Add the Dashboard Header:
   - Drag a **Text** object to the top of the container.
   - Enter:
     ```
     NYC Airbnb Market Insights — 2019
     Foundations of Data Science (23CSE351) Final Case Study — Statistical Analysis & Submarket Patterns
     ```
   - Format Title: 18pt Bold, `#222222`. Subtitle: 11pt, `#64748B`.
6. Add the Worksheets into the layout (four stacked rows):
   - Drag `KPI_Summary` directly below the title header.
   - Drag a **Horizontal Layout Container** below `KPI_Summary`.
   - Place `Borough_Price_Comparison` on the left and `Room_Type_Pricing` on the right.
   - Drag a second **Horizontal Layout Container** below the first.
   - Place `Room_Type_Distribution` on the left and `Availability_vs_Price` on the right.
   - Drag `Neighbourhood_Rankings` full width into the bottom row.
7. Configure Global Interactive Filters:
   - Click on the `Borough_Price_Comparison` sheet inside the dashboard.
   - Click its context menu arrow (top right) -> **Filters** -> select `Neighbourhood Group`.
   - On the newly added filter card, click its dropdown menu -> **Apply to Worksheets** -> select **All Using This Data Source**.
   - Click on `Room_Type_Pricing` -> **Filters** -> select `Room Type`.
   - On the filter card -> **Apply to Worksheets** -> **All Using This Data Source**.
   - Now, selecting any borough (e.g. *Manhattan*) or room type (e.g. *Entire home/apt*) will instantly filter and recompute all sheets across the dashboard!

---

### Step 9: Saving the Final Deliverable in Tableau Public
1. In Tableau Public, click **File -> Save to Tableau Public As...**
2. Name the workbook: `NYC_Airbnb_Market_Insights_2019`.
3. Click **Save**. Tableau Public will upload the packaged workbook (`.twbx`) with all data extracted and provide a public portfolio URL suitable for evaluation submission.
