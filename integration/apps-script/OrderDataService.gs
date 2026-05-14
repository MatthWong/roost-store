function getSheetByNameOrThrow_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw new Error('Missing required sheet: ' + name);
  }
  return sheet;
}

var DASHBOARD_STATUSES = ['Submitted', 'Quote Provided', 'In Production', 'Ready for Pickup'];

function getDashboardOrders() {
  var sheet = getSheetByNameOrThrow_(AppConfig.sheets.orders);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return { needsReview: [], awaitingResponse: [], inProduction: [], readyForPickup: [] };
  }

  var index = getHeaderIndexMap_(values[0]);

  var queues = { needsReview: [], awaitingResponse: [], inProduction: [], readyForPickup: [] };

  // Resolve column indices that may appear under different header names
  var orderTypeIdx    = firstDefinedIndex_(index, ['OrderType', 'Order Type']);
  var customerNameIdx = firstDefinedIndex_(index, ['CustomerName', 'Customer Name', 'Full Name', 'Name']);

  for (var i = 1; i < values.length; i += 1) {
    var row = values[i];
    var status = String(row[index.Status] || '').trim();
    if (DASHBOARD_STATUSES.indexOf(status) === -1) {
      continue;
    }

    var order = {
      orderNumber:      index.OrderNumber      !== undefined ? String(row[index.OrderNumber]      || '') : '',
      orderType:        orderTypeIdx           !== undefined ? String(row[orderTypeIdx]           || '') : '',
      customerName:     customerNameIdx        !== undefined ? String(row[customerNameIdx]        || '') : '',
      status:           status,
      updatedAt:        index.UpdatedAt        !== undefined ? row[index.UpdatedAt]               : '',
      itemSummary:      index.ItemSummary      !== undefined ? String(row[index.ItemSummary]      || '') : '',
      pickupWindow:     index.PickupWindow     !== undefined ? String(row[index.PickupWindow]     || '') : '',
      duplicateWarning: index.DuplicateWarning !== undefined ? String(row[index.DuplicateWarning] || '') === 'true' : false
    };

    if (status === 'Submitted')           { queues.needsReview.push(order); }
    else if (status === 'Quote Provided') { queues.awaitingResponse.push(order); }
    else if (status === 'In Production')  { queues.inProduction.push(order); }
    else if (status === 'Ready for Pickup') { queues.readyForPickup.push(order); }
  }

  return queues;
}

function getHeaderIndexMap_(headers) {
  var map = {};
  for (var i = 0; i < headers.length; i += 1) {
    map[String(headers[i]).trim()] = i;
  }
  return map;
}

// Returns the index of the first key in `candidates` that exists in `indexMap`,
// or undefined if none match.
function firstDefinedIndex_(indexMap, candidates) {
  for (var i = 0; i < candidates.length; i += 1) {
    if (indexMap[candidates[i]] !== undefined) {
      return indexMap[candidates[i]];
    }
  }
  return undefined;
}

function getAllRowsAsObjects_(sheetName) {
  var sheet = getSheetByNameOrThrow_(sheetName);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return [];
  }

  var headers = values[0];
  var rows = [];
  for (var rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    var rowValues = values[rowIndex];
    var rowObj = {};
    for (var colIndex = 0; colIndex < headers.length; colIndex += 1) {
      rowObj[String(headers[colIndex]).trim()] = rowValues[colIndex];
    }
    rows.push(rowObj);
  }
  return rows;
}

function getFallbackPaymentLinkMap() {
  var rows = getAllRowsAsObjects_(AppConfig.sheets.paymentLinks);
  return rows.reduce(function(acc, row) {
    var sku = String(row.SKU || '').trim();
    var link = String(row.PaymentLink || '').trim();
    if (sku && link) {
      acc[sku] = link;
    }
    return acc;
  }, {});
}

function getStorefrontProducts() {
  if (isSquareApiEnabled()) {
    var catalog = listSquareCatalogItems();
    var objects = catalog.objects || [];
    return objects
      .filter(function(obj) { return obj.type === 'ITEM'; })
      .map(function(item) {
        var data = item.item_data || {};
        return {
          productId: item.id,
          name: data.name || '',
          description: data.description || '',
          sku: '',
          priceCents: null,
          source: 'square-api'
        };
      });
  }

  return getAllRowsAsObjects_(AppConfig.sheets.products).map(function(row) {
    return {
      productId: String(row.ProductID || ''),
      name: String(row.Name || ''),
      description: String(row.Description || ''),
      sku: String(row.SKU || ''),
      priceCents: Number(row.PriceCents || 0),
      paymentLink: String(row.PaymentLink || ''),
      source: 'payment-links'
    };
  });
}

function getCustomerOrderStatus(orderNumber, receiptCode) {
  var sheet = getSheetByNameOrThrow_(AppConfig.sheets.orders);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return null;
  }

  var headers = values[0];
  var index = getHeaderIndexMap_(headers);
  var orderNumberCol = index.OrderNumber;
  var receiptCodeCol = index.ReceiptCode;
  var statusCol = index.Status;
  var pickupWindowCol = index.PickupWindow;
  var updatedAtCol = index.UpdatedAt;
  var orderTypeCol = index.OrderType;
  var quoteRequiredCol = index.QuoteRequired;
  var permanentOrderNumberCol = index.PermanentOrderNumber;
  var temporaryOrderIdCol = index.TemporaryOrderID;
  var paymentLinkCol = index.PaymentLink;
  var lookupValue = normalizeOrderNumberToken_(orderNumber);
  var lookupReceiptCode = normalizeReceiptCodeToken_(receiptCode);

  if (
    orderNumberCol === undefined ||
    receiptCodeCol === undefined ||
    statusCol === undefined ||
    pickupWindowCol === undefined
  ) {
    throw new Error('Orders sheet is missing required headers.');
  }

  for (var i = 1; i < values.length; i += 1) {
    var row = values[i];
    var rowOrderNumber = normalizeOrderNumberToken_(row[orderNumberCol]);
    var rowTemporaryOrderId = temporaryOrderIdCol !== undefined ? normalizeOrderNumberToken_(row[temporaryOrderIdCol]) : '';
    var rowPermanentOrderNumber = permanentOrderNumberCol !== undefined ? normalizeOrderNumberToken_(row[permanentOrderNumberCol]) : '';
    var rowReceiptCode = normalizeReceiptCodeToken_(row[receiptCodeCol]);
    var orderMatches =
      rowOrderNumber === lookupValue ||
      rowTemporaryOrderId === lookupValue ||
      rowPermanentOrderNumber === lookupValue;

    if (orderMatches && rowReceiptCode === lookupReceiptCode) {
      var lineItems = getOrderItemsByKnownNumbers_(rowOrderNumber, rowTemporaryOrderId, rowPermanentOrderNumber);
      return {
        orderNumber: rowOrderNumber,
        temporaryOrderId: rowTemporaryOrderId,
        permanentOrderNumber: rowPermanentOrderNumber,
        orderType: orderTypeCol !== undefined ? String(row[orderTypeCol] || '') : '',
        quoteRequired: quoteRequiredCol !== undefined ? String(row[quoteRequiredCol] || '').toLowerCase() === 'true' : false,
        status: String(row[statusCol] || ''),
        pickupWindow: String(row[pickupWindowCol] || ''),
        paymentLink: paymentLinkCol !== undefined ? String(row[paymentLinkCol] || '') : '',
        lineItems: lineItems,
        updatedAt: updatedAtCol !== undefined ? row[updatedAtCol] : null
      };
    }
  }

  return null;
}

function normalizeLookupToken_(value) {
  return String(value || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toUpperCase();
}

function normalizeOrderNumberToken_(value) {
  return normalizeLookupToken_(value).replace(/[^A-Z0-9-]/g, '');
}

function normalizeReceiptCodeToken_(value) {
  return normalizeLookupToken_(value).replace(/[^A-Z0-9]/g, '');
}

function getOrderStatusDebugSnapshot(receiptCode, orderNumber, limit) {
  var sheet = getSheetByNameOrThrow_(AppConfig.sheets.orders);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return {
      input: {
        orderNumber: String(orderNumber || ''),
        receiptCode: String(receiptCode || ''),
        normalizedOrderNumber: normalizeOrderNumberToken_(orderNumber),
        normalizedReceiptCode: normalizeReceiptCodeToken_(receiptCode)
      },
      totalRows: 0,
      candidates: []
    };
  }

  var headers = values[0];
  var index = getHeaderIndexMap_(headers);
  var orderNumberCol = index.OrderNumber;
  var temporaryOrderIdCol = index.TemporaryOrderID;
  var permanentOrderNumberCol = index.PermanentOrderNumber;
  var receiptCodeCol = index.ReceiptCode;
  var statusCol = index.Status;

  var lookupOrder = normalizeOrderNumberToken_(orderNumber);
  var lookupReceipt = normalizeReceiptCodeToken_(receiptCode);
  var maxResults = Number(limit || 25);
  var candidates = [];

  for (var rowIdx = 1; rowIdx < values.length; rowIdx += 1) {
    var row = values[rowIdx];
    var rowOrder = orderNumberCol !== undefined ? normalizeOrderNumberToken_(row[orderNumberCol]) : '';
    var rowTemp = temporaryOrderIdCol !== undefined ? normalizeOrderNumberToken_(row[temporaryOrderIdCol]) : '';
    var rowPerm = permanentOrderNumberCol !== undefined ? normalizeOrderNumberToken_(row[permanentOrderNumberCol]) : '';
    var rowReceipt = receiptCodeCol !== undefined ? normalizeReceiptCodeToken_(row[receiptCodeCol]) : '';

    var orderMatch = lookupOrder && (rowOrder === lookupOrder || rowTemp === lookupOrder || rowPerm === lookupOrder);
    var receiptMatch = lookupReceipt && rowReceipt === lookupReceipt;
    var include = orderMatch || receiptMatch;

    if (!include) {
      continue;
    }

    candidates.push({
      rowNumber: rowIdx + 1,
      match: {
        orderMatch: Boolean(orderMatch),
        receiptMatch: Boolean(receiptMatch),
        pairMatch: Boolean(orderMatch && receiptMatch)
      },
      values: {
        orderNumber: orderNumberCol !== undefined ? String(row[orderNumberCol] || '') : '',
        temporaryOrderId: temporaryOrderIdCol !== undefined ? String(row[temporaryOrderIdCol] || '') : '',
        permanentOrderNumber: permanentOrderNumberCol !== undefined ? String(row[permanentOrderNumberCol] || '') : '',
        receiptCode: receiptCodeCol !== undefined ? String(row[receiptCodeCol] || '') : '',
        status: statusCol !== undefined ? String(row[statusCol] || '') : ''
      },
      normalized: {
        orderNumber: rowOrder,
        temporaryOrderId: rowTemp,
        permanentOrderNumber: rowPerm,
        receiptCode: rowReceipt
      }
    });

    if (candidates.length >= maxResults) {
      break;
    }
  }

  return {
    input: {
      orderNumber: String(orderNumber || ''),
      receiptCode: String(receiptCode || ''),
      normalizedOrderNumber: lookupOrder,
      normalizedReceiptCode: lookupReceipt
    },
    totalRows: values.length - 1,
    candidateCount: candidates.length,
    candidates: candidates
  };
}

function getOrderItemsByKnownNumbers_(currentOrderNumber, temporaryOrderId, permanentOrderNumber) {
  var candidates = [currentOrderNumber, temporaryOrderId, permanentOrderNumber]
    .map(function(value) { return String(value || '').trim(); })
    .filter(function(value, idx, arr) { return value && arr.indexOf(value) === idx; });

  if (!candidates.length) {
    return [];
  }

  var all = [];
  candidates.forEach(function(candidate) {
    all = all.concat(getOrderItemsByOrderNumber_(candidate));
  });
  return all;
}

function addOrderItemRows_(orderNumber, orderItems) {
  if (!orderItems || !orderItems.length) {
    return;
  }

  var sheet = getSheetByNameOrThrow_(AppConfig.sheets.orderItems);
  var values = sheet.getDataRange().getValues();
  if (!values.length) {
    throw new Error('OrderItems sheet missing header row.');
  }

  var index = getHeaderIndexMap_(values[0]);
  var rows = orderItems.map(function(item) {
    return buildOrderItemRow_(index, {
      orderItemId: Utilities.getUuid(),
      orderNumber: orderNumber,
      apparelType: item.apparelType,
      apparelSize: item.apparelSize,
      quantity: item.quantity,
      createdAt: new Date()
    });
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, values[0].length).setValues(rows);
}

function getOrderItemsByOrderNumber_(orderNumber) {
  var sheet;
  try {
    sheet = getSheetByNameOrThrow_(AppConfig.sheets.orderItems);
  } catch (error) {
    return [];
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return [];
  }

  var index = getHeaderIndexMap_(values[0]);
  var orderNumberCol = index.OrderNumber;
  if (orderNumberCol === undefined) {
    return [];
  }

  return values.slice(1)
    .filter(function(row) {
      return String(row[orderNumberCol] || '').trim() === String(orderNumber).trim();
    })
    .map(function(row) {
      return {
        apparelType: index.ApparelType !== undefined ? String(row[index.ApparelType] || '') : '',
        apparelSize: index.ApparelSize !== undefined ? String(row[index.ApparelSize] || '') : '',
        quantity: index.Quantity !== undefined ? Number(row[index.Quantity] || 0) : 0
      };
    });
}

function buildOrderItemRow_(index, input) {
  var width = Object.keys(index).length;
  var row = new Array(width);
  setValueByHeader_(row, index, 'OrderItemID', input.orderItemId);
  setValueByHeader_(row, index, 'OrderNumber', input.orderNumber);
  setValueByHeader_(row, index, 'ApparelType', input.apparelType);
  setValueByHeader_(row, index, 'ApparelSize', input.apparelSize);
  setValueByHeader_(row, index, 'Quantity', input.quantity);
  setValueByHeader_(row, index, 'CreatedAt', input.createdAt);
  return row;
}

function setValueByHeader_(row, index, header, value) {
  if (index[header] !== undefined) {
    row[index[header]] = value;
  }
}
