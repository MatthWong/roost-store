function squareRequest_(path, method, payload, queryParams) {
  if (!isSquareApiEnabled()) {
    throw new Error('Square API mode is not enabled. Set INTEGRATION_MODE=SQUARE_API and configure script properties.');
  }

  var url = AppConfig.square.baseUrl + path;
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
