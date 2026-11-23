# RICH Team Dashboard

A password-protected Cloudflare Worker reads the configured ClickUp workspace and publishes a report snapshot in Workers KV. The Worker refreshes at 05:00 Asia/Dubai (01:00 UTC). The dashboard shows the current month plus the previous eleven months. Task counts group accessible, non-archived tasks and subtasks by their creation month and show their status at the latest refresh.

## Deployment

Connect the repository in Cloudflare Workers Builds. Set the build variable `REPORTS_KV_ID` to the dedicated namespace ID. Leave the build command empty and use `node configure.mjs && npx wrangler@4 deploy` as the deploy command.

Add the following runtime settings under the Worker’s Variables and Secrets.

| Setting | Value |
| --- | --- |
| `CLICKUP_WORKSPACE_ID` | ClickUp workspace ID |
| `CLICKUP_TOKEN` | Secret from a workspace owner or admin with access to the relevant client spaces and team time entries |
| `DASHBOARD_PASSWORD` | Strong ASCII password used with username `rich` |
| `REPORT_MONTHS` | Optional number of months to display, inclusive of the current month. Defaults to 12. |
| `ROLES_JSON` | Optional JSON object mapping ClickUp member IDs to job titles |
| `CAPACITY_JSON` | Optional JSON array of monthly allocations, each with `month` (YYYY-MM), `client` (exact reporting name), `memberId` (ClickUp ID) and `hours` (number) |
| `REFRESH_KEY` | Optional separate secret for one-off refresh requests |

The scheduled refresh starts automatically. To run an initial refresh before the next scheduled run, send a POST to `/api/refresh` using the dashboard’s HTTP Basic authentication and pass the separate refresh key in the `X-RICH-Refresh` header. A failed refresh preserves the previous successful snapshot. Verify the last sync timestamp and reconcile sample totals with ClickUp before sharing access.

## Reporting rules

Client names come from ClickUp spaces. The RICH and Templates spaces are excluded. Ad-hoc spaces use exact client tags when available and otherwise show a separate unassigned client bucket. Work type comes from a `work type:` time-entry tag, the equivalent task tag, or the task’s list. Unclassified work stays visible. Recorded time is attributed to the Dubai month in which the entry started. Running timers are excluded. Missing allocations display as Unset. For allocations larger than a runtime variable, store the same JSON array under the `capacity` key in the report namespace and leave `CAPACITY_JSON` unset.

The report contains internal staff and client data. Configure all private mappings and credentials through Cloudflare runtime settings. Keep them out of GitHub.
