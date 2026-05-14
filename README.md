# Roost Store

A Google Apps Script–powered school store system for DECA, built on Google Sites, Google Forms, Google Sheets, and Square payments.

## Features

- **Shopping Cart** — public storefront page embeds a cart that reads live product inventory from Google Sheets and supports checkout via Square
- **Custom Orders** — Google Form for engraving, embroidery, heat press, and custom item orders with file upload support
- **Order Status Tracker** — customers look up their order using an order number and receipt code
- **Ops Dashboard** — role-based dashboard for officers and sponsors to manage the full order queue
- **Square Integration** — supports static Square Payment Links (default) or dynamic Square API checkout links per cart

## Order Lifecycle

| Status | Description |
|---|---|
| Submitted | New order received |
| Under Review | Officer reviewing the order |
| Quote Provided | Quote sent to customer |
| Quote Accepted | Customer accepted the quote |
| In Production | Order being fulfilled |
| Ready for Pickup | Order complete, awaiting pickup |
| Picked Up | Order collected (requires payment) |
| Cancelled | Order cancelled |

## Dashboard Queues

| Queue | Statuses shown |
|---|---|
| Needs Review | Submitted |
| Under Review | Under Review |
| Awaiting Response | Quote Provided |
| Pending Production | Quote Accepted |
| In Production | In Production |
| Ready for Pickup | Ready for Pickup |

Officers and sponsors can advance order status, mark orders as paid, and cancel orders. Members can view queues but cannot take actions. Orders cannot be moved to **Picked Up** until marked as paid.

## Repository Structure

```
integration/
  apps-script/        # Google Apps Script source files
    Config.gs         # App-wide configuration and constants
    WebApp.gs         # doGet handler and callable functions
    OrderWorkflow.gs  # Form submission, status transitions, email notifications
    OrderDataService.gs # Data access for orders, products, and dashboard
    SquareClient.gs   # Square API HTTP client
    Dashboard.html    # Ops dashboard UI
    Cart.html         # Public shopping cart UI
    StatusChecker.html# Customer order status lookup UI
  config/
    sheet-schema.md   # Google Sheet tab and column definitions
  docs/
    SETUP.md                   # Deployment and configuration guide
    GOOGLE_SITES_BUILD.md      # Google Sites page-by-page build guide
    GOOGLE_FORMS_SETUP_TEXT.md # Exact Google Form field text
```

## Setup

See [integration/docs/SETUP.md](integration/docs/SETUP.md) for the full deployment guide including:

- Google Sheets schema and tab setup
- Apps Script deployment steps
- Script Properties (API keys, integration mode)
- Square API configuration (sandbox and production)
- Google Sites embed instructions

See [integration/docs/GOOGLE_SITES_BUILD.md](integration/docs/GOOGLE_SITES_BUILD.md) for the page-by-page Google Sites build guide.

## Integration Modes

| Mode | Behavior |
|---|---|
| `PAYMENT_LINKS` (default) | Cart checkout shows per-item static Square payment links from the Products sheet |
| `SQUARE_API` | Cart checkout generates a single dynamic Square Checkout link for the entire cart and redirects automatically |

Switch modes via Script Properties: set `INTEGRATION_MODE` to `PAYMENT_LINKS` or `SQUARE_API`.

## Required Script Properties

| Property | Required | Description |
|---|---|---|
| `STATUS_CHECKER_URL` | Yes | Web app URL with `?action=checker` |
| `SQUARE_PERSONAL_ACCESS_TOKEN` | For Square API mode | Square access token |
| `SQUARE_LOCATION_ID` | For Square API mode | Square location ID |
| `SQUARE_ENVIRONMENT` | For Square API mode | `sandbox` or `production` |
| `INTEGRATION_MODE` | No | `PAYMENT_LINKS` (default) or `SQUARE_API` |
