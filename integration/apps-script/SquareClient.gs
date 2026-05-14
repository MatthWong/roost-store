function squareRequest_(path, method, payload, queryParams) {
  if (!isSquareApiEnabled()) {
    throw new Error('Square API mode is not enabled. Set INTEGRATION_MODE=SQUARE_API and configure script properties.');
  }

  var url = getSquareBaseUrl_() + path;
  if (queryParams) {
    var query = Object.keys(queryParams)
      .filter(function(key) { return queryParams[key] !== undefined && queryParams[key] !== null; })
      .map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(String(queryParams[key]));
      })
      .join('&');
    if (query) {
      url += '?' + query;
    }
  }

  var options = {
    method: method,
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + getSquareAccessToken_(),
      'Square-Version': '2025-01-23'
    }
  };

  if (payload) {
    options.payload = JSON.stringify(payload);
  }

  var response = UrlFetchApp.fetch(url, options);
  var status = response.getResponseCode();
  var bodyText = response.getContentText() || '{}';
  var body = JSON.parse(bodyText);

  if (status < 200 || status >= 300) {
    throw new Error('Square API call failed (' + status + '): ' + bodyText);
  }

  return body;
}

function listSquareCatalogItems() {
  return squareRequest_('/catalog/list', 'get', null, {
    types: 'ITEM',
    cursor: null
  });
}

function listSquareInventoryCounts() {
  return squareRequest_('/inventory/counts/batch-retrieve', 'post', {
    location_ids: [getSquareLocationId_()]
  });
}

function createSquarePaymentLink(name, amountCents, orderReference) {
  var payload = {
    idempotency_key: Utilities.getUuid(),
    quick_pay: {
      name: name,
      price_money: {
        amount: amountCents,
        currency: 'USD'
      },
      location_id: getSquareLocationId_()
    },
    checkout_options: {
      redirect_url: '',
      ask_for_shipping_address: false
    },
    pre_populated_data: {
      reference_id: orderReference
    }
  };

  return squareRequest_('/online-checkout/payment-links', 'post', payload);
}

// Creates a single Square Checkout payment link for an entire cart order.
// items: [{ name, quantity, priceCents }]
// redirectUrl (optional): Square redirects here after the customer pays.
// Returns the Square-hosted checkout URL string, or throws on failure.
function createCartPaymentLink_(orderNumber, customerName, customerEmail, items, redirectUrl) {
  for (var v = 0; v < items.length; v += 1) {
    if (!items[v].priceCents || items[v].priceCents <= 0) {
      throw new Error('Product "' + (items[v].name || '') + '" has no price set. Cannot create Square payment.');
    }
  }

  // Split name into first / last (last word = last name; remainder = first name)
  var nameParts = String(customerName || '').trim().split(/\s+/);
  var lastName  = nameParts.length > 1 ? nameParts.pop() : '';
  var firstName = nameParts.join(' ');

  var lineItems = items.map(function(item) {
    return {
      name:            String(item.name),
      quantity:        String(item.quantity),
      base_price_money: {
        amount:   item.priceCents,
        currency: 'USD'
      }
    };
  });

  var payload = {
    idempotency_key: Utilities.getUuid(),
    order: {
      location_id:   getSquareLocationId_(),
      reference_id:  orderNumber,
      customer_note: orderNumber,
      line_items:    lineItems
    },
    checkout_options: {
      ask_for_shipping_address: false,
      redirect_url: redirectUrl || ''
    },
    pre_populated_data: {
      buyer_email: customerEmail,
      buyer_address: {
        first_name: firstName,
        last_name:  lastName
      }
    }
  };

  var body = squareRequest_('/online-checkout/payment-links', 'post', payload);
  var url = body && body.payment_link && body.payment_link.url;
  if (!url) {
    throw new Error('Square API did not return a payment link URL.');
  }
  return url;
}
