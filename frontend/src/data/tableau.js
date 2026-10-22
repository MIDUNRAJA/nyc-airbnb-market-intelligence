/**
 * Tableau Public embed configuration
 * ----------------------------------------------------------------------------
 * Paste the URL of your PUBLISHED Tableau Public workbook below and the
 * "Tableau Dashboard" tab will render the live interactive workbook.
 *
 * How to get the URL:
 *   1. Open the workbook in Tableau Public.
 *   2. File -> "Save to Tableau Public As..." and publish it.
 *   3. Copy the public share link, e.g.
 *        https://public.tableau.com/views/NYC_Airbnb_Market_Insights_2019/Dashboard1
 *   4. Paste it between the quotes below.
 *
 * Alternatively you can leave this empty and instead drop a file named
 * `tableau.config.json` (containing { "url": "..." }) into `frontend/public/`.
 * This module value takes priority when both are set.
 *
 * Leaving it empty is a supported state: the tab shows a clean
 * "awaiting public URL" panel with the dashboard specification, never a
 * broken iframe.
 */
export const TABLEAU_PUBLIC_URL =
  'https://public.tableau.com/views/NYC_Airbnb_Market_Insights_2019/NYCAirbnbMarketInsights';

/**
 * Normalise any pasted Tableau Public link into the direct `/views/` embed form.
 *
 * Tableau Public answers `/app/profile/...` pages with `X-Frame-Options: SAMEORIGIN`,
 * so those render as a blank white frame when embedded. The `/views/<Workbook>/<View>`
 * path is the URL Tableau exposes for embedding and carries no framing restriction.
 */
export function toEmbedUrl(raw) {
  if (!raw) return '';
  const value = String(raw).trim();

  const appLink = value.match(/\/app\/profile\/[^/]+\/viz\/([^/?#]+)(?:\/([^/?#]+))?/);
  let url = appLink
    ? `https://public.tableau.com/views/${appLink[1]}${appLink[2] ? `/${appLink[2]}` : ''}`
    : value.split('?')[0].split('#')[0];

  const params = ':embed=y&:showVizHome=no&:display_count=n&:origin=viz_share_link&:toolbar=bottom';
  return `${url}?${params}`;
}

/** Embeddable source consumed by the <iframe> in TableauDashboard.jsx. */
export const TABLEAU_URL = toEmbedUrl(TABLEAU_PUBLIC_URL);

/** Display name of the published workbook (used in the embed header). */
export const TABLEAU_DASHBOARD_NAME = 'NYC Airbnb Market Insights — 2019';
