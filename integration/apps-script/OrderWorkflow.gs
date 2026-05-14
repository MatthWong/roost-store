function onFormSubmit(e) {
  // Resolve identifiers and customer data first so they are available in the
  // catch block for error notification even if deeper workflow steps fail.
  var orderNumber = createTemporaryOrderId_();
  var receiptCode = createReceiptCode_();
  var formData = normalizeFormData_(e && e.namedValues ? e.namedValues : {});
  var resolvedCustomerEmail = getCustomerEmail_(formData);
  if (resolvedCustomerEmail && !getFormValue_(formData, ['School Email', 'Customer Email', 'CustomerEmail'])) {
    formData['School Email'] = resolvedCustomerEmail;
  }

  try {
    var sheet = getSheetByNameOrThrow_(AppConfig.sheets.orders);
    var headers = sheet.getDataRange().getValues()[0];
    var index = getHeaderIndexMap_(headers);
    var rowIndex = e.range.getRow();
    var now = new Date();
    var orderType = detectOrderType_(formData);
    var isCustom = isCustomOrderType_(orderType);

    validateFormSubmission_(formData, orderType);
    validateImageRules_(formData);

    var status = isCustom ? AppConfig.orderStatus.submitted : AppConfig.orderStatus.pending;
    var pickupWindow = isCustom ? '' : getNextPickupWindow_();
    var duplicateWarning = isCustom ? detectDuplicateCustomOrderSignature_(formData) : false;

    setCellValueIfHeaderExists_(sheet, rowIndex, index.OrderNumber, orderNumber);
    setCellValueIfHeaderExists_(sheet, rowIndex, index.ReceiptCode, receiptCode);
    setCellValueIfHeaderExists_(sheet, rowIndex, index.TemporaryOrderID, orderNumber);
    setCellValueIfHeaderExists_(sheet, rowIndex, index.PermanentOrderNumber, '');
    setCellValueIfHeaderExists_(sheet, rowIndex, index.Status, status);
    setCellValueIfHeaderExists_(sheet, rowIndex, index.OrderType, orderType);
    setCellValueIfHeaderExists_(sheet, rowIndex, index.QuoteRequired, shouldRequireQuote_(orderType));
    setCellValueIfHeaderExists_(sheet, rowIndex, index.ItemSummary, buildItemSummary_(formData, orderType));
    setCellValueIfHeaderExists_(sheet, rowIndex, index.PickupWindow, pickupWindow);
    setCellValueIfHeaderExists_(sheet, rowIndex, index.DuplicateWarning, duplicateWarning ? 'true' : 'false');
    var imageUrl = getDesignImageUploadValue_(formData, orderType);
    setCellValueIfHeaderExists_(sheet, rowIndex, index.ImageFileURL, imageUrl);
    setCellValueIfHeaderExists_(sheet, rowIndex, index.ImageFileName, getFileNameFromUrl_(imageUrl));
    setCellValueIfHeaderExists_(sheet, rowIndex, index.ImageUploadedAt, now);
    setCellValueIfHeaderExists_(sheet, rowIndex, index.UpdatedAt, now);

    if (isCustom) {
      addOrderItemRows_(orderNumber, extractOrderItems_(formData));
    }

    sendSubmissionConfirmationEmail_(formData, {
      orderNumber: orderNumber,
      receiptCode: receiptCode,
      orderType: orderType,
      status: status,
      pickupWindow: pickupWindow
    });

    return {
      orderNumber: orderNumber,
      receiptCode: receiptCode,
      pickupWindow: pickupWindow,
      status: status,
      duplicateWarning: duplicateWarning
    };
  } catch (error) {
    sendWorkflowErrorEmail_(formData, orderNumber, receiptCode, error);
    throw error;
  }
}

function setCellValueIfHeaderExists_(sheet, row, headerIndex, value) {
  if (headerIndex === undefined) {
    return;
  }
  sheet.getRange(row, headerIndex + 1).setValue(value);
}

function createOrderNumber_() {
  var now = new Date();
  var datePart = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');
  var randomPart = Math.floor(1000 + Math.random() * 9000);
  return 'RS-' + datePart + '-' + randomPart;
}

function createTemporaryOrderId_() {
  var now = new Date();
  var datePart = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');
  var randomPart = Math.floor(10000 + Math.random() * 90000);
  return 'TMP-' + datePart + '-' + randomPart;
}

function createReceiptCode_() {
  return Utilities.getUuid().slice(0, 8).toUpperCase();
}

function getNextPickupWindow_() {
  var hours = getAllRowsAsObjects_(AppConfig.sheets.storeHours)
    .filter(function(row) { return String(row.IsOpen).toLowerCase() === 'true'; })
    .map(function(row) {
      return {
        dayOfWeek: Number(row.DayOfWeek),
        openTime: String(row.OpenTime || '08:30'),
        closeTime: String(row.CloseTime || '12:00')
      };
    });

  if (!hours.length) {
    return 'To be scheduled';
  }

  var now = new Date();
  var today = now.getDay();

  for (var offset = 0; offset <= 7; offset += 1) {
    var candidateDay = (today + offset) % 7;
    var window = hours.find(function(h) { return h.dayOfWeek === candidateDay; });
    if (!window) {
      continue;
    }

    var pickupDate = new Date(now);
    pickupDate.setDate(now.getDate() + offset);

    if (offset === 0) {
      var closeParts = window.closeTime.split(':');
      var closeAt = new Date(now);
      closeAt.setHours(Number(closeParts[0]), Number(closeParts[1] || 0), 0, 0);
      if (now > closeAt) {
        continue;
      }
    }

    var dayLabel = Utilities.formatDate(pickupDate, Session.getScriptTimeZone(), 'EEE, MMM d');
    return dayLabel + ' ' + window.openTime + '-' + window.closeTime;
  }

  return 'To be scheduled';
}

function updateOrderStatus(orderNumber, newStatus) {
  assertOfficerOrSponsor_();

  var allowed = Object.keys(AppConfig.orderStatus).map(function(key) {
    return AppConfig.orderStatus[key];
  });
  if (allowed.indexOf(newStatus) === -1) {
    throw new Error('Invalid status: ' + newStatus);
  }

  var sheet = getSheetByNameOrThrow_(AppConfig.sheets.orders);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    throw new Error('Orders sheet is empty.');
  }

  var headers = values[0];
  var index = getHeaderIndexMap_(headers);
  var orderNumberCol = index.OrderNumber;
  var statusCol = index.Status;
  var updatedAtCol = index.UpdatedAt;
  var pickupWindowCol = index.PickupWindow;
  var permanentOrderNumberCol = index.PermanentOrderNumber;
  var paymentLinkCol = index.PaymentLink;
  var quoteRequiredCol = index.QuoteRequired;

  if (orderNumberCol === undefined || statusCol === undefined) {
    throw new Error('Orders sheet missing OrderNumber/Status columns.');
  }

  for (var row = 1; row < values.length; row += 1) {
    var current = String(values[row][orderNumberCol] || '').trim();
    if (current === String(orderNumber).trim()) {
      var currentStatus = String(values[row][statusCol] || '').trim();
      if (!isAllowedStatusTransition_(currentStatus, newStatus)) {
        throw new Error('Invalid status transition from ' + currentStatus + ' to ' + newStatus);
      }

      // Prevent moving to Picked Up until the order is marked as paid
      if (newStatus === AppConfig.orderStatus.pickedUp) {
        var isPaidIdx = firstDefinedIndex_(index, ['IsPaid', 'Is Paid', 'Paid']);
        var isPaid = isPaidIdx !== undefined && String(values[row][isPaidIdx] || '').toLowerCase() === 'true';
        if (!isPaid) {
          throw new Error('Order ' + orderNumber + ' must be marked as paid before it can be Picked Up.');
        }
      }

      sheet.getRange(row + 1, statusCol + 1).setValue(newStatus);

      if (newStatus === AppConfig.orderStatus.inProduction && pickupWindowCol !== undefined) {
        sheet.getRange(row + 1, pickupWindowCol + 1).setValue(getNextPickupWindow_());
      }

      if (newStatus === AppConfig.orderStatus.inProduction && permanentOrderNumberCol !== undefined) {
        var currentPermanent = String(values[row][permanentOrderNumberCol] || '').trim();
        if (!currentPermanent) {
          var permanentOrder = createOrderNumber_();
          sheet.getRange(row + 1, permanentOrderNumberCol + 1).setValue(permanentOrder);
          sheet.getRange(row + 1, orderNumberCol + 1).setValue(permanentOrder);
          orderNumber = permanentOrder;
        }
      }

      if (newStatus === AppConfig.orderStatus.quoteAccepted && paymentLinkCol !== undefined) {
        var quoteRequired = quoteRequiredCol !== undefined && String(values[row][quoteRequiredCol] || '').toLowerCase() === 'true';
        if (quoteRequired) {
          var generatedLink = generateDeferredPaymentLink_(orderNumber);
          sheet.getRange(row + 1, paymentLinkCol + 1).setValue(generatedLink);
        }
      }

      if (updatedAtCol !== undefined) {
        sheet.getRange(row + 1, updatedAtCol + 1).setValue(new Date());
      }
      return {
        orderNumber: orderNumber,
        status: newStatus
      };
    }
  }

  throw new Error('Order not found: ' + orderNumber);
}

function normalizeFormData_(namedValues) {
  var normalized = {};
  Object.keys(namedValues || {}).forEach(function(key) {
    var value = namedValues[key];
    normalized[String(key || '').trim()] = Array.isArray(value) ? String(value[0] || '').trim() : String(value || '').trim();
  });
  return normalized;
}

function detectOrderType_(formData) {
  var value = getFormValue_(formData, ['Order Type', 'OrderType', 'Custom Order Type']);
  if (!value) {
    return '';
  }

  var normalized = String(value).toLowerCase();
  if (normalized.indexOf('engraving') !== -1) {
    return AppConfig.customOrder.orderTypes.engraving;
  }
  if (normalized.indexOf('embroidery') !== -1) {
    return AppConfig.customOrder.orderTypes.embroidery;
  }
  if (normalized.indexOf('heat') !== -1) {
    return AppConfig.customOrder.orderTypes.heatPress;
  }
  if (normalized.indexOf('custom') !== -1) {
    return AppConfig.customOrder.orderTypes.customItem;
  }
  return value;
}

function isCustomOrderType_(orderType) {
  return [
    AppConfig.customOrder.orderTypes.engraving,
    AppConfig.customOrder.orderTypes.embroidery,
    AppConfig.customOrder.orderTypes.heatPress,
    AppConfig.customOrder.orderTypes.customItem
  ].indexOf(orderType) !== -1;
}

function shouldRequireQuote_(orderType) {
  return orderType === AppConfig.customOrder.orderTypes.customItem;
}

function validateFormSubmission_(formData, orderType) {
  var name = getFormValue_(formData, ['Full Name', 'Customer Name', 'CustomerName']);
  var email = getCustomerEmail_(formData);
  if (!name || !email) {
    throw new Error('Missing required customer name or email.');
  }

  if (orderType === AppConfig.customOrder.orderTypes.engraving) {
    var itemDescription = getFormValue_(formData, ['Engraving Item Description', 'Item Description', 'Engraving Description']);
    var quantity = Number(getFormValue_(formData, ['Engraving Quantity', 'Quantity']) || 0);
    var engravingText = getFormValue_(formData, ['Engraving Text']);
    var imageUrl = getDesignImageUploadValue_(formData, orderType);
    if (!itemDescription || quantity < 1 || (!engravingText && !imageUrl)) {
      throw new Error('Engraving orders require item description, quantity, and engraving text or image.');
    }
  }

  if (orderType === AppConfig.customOrder.orderTypes.customItem) {
    var customDescription = getFormValue_(formData, ['Custom Item Description', 'Custom Item Details', 'Item Description', 'Describe the item', 'Describe Your Item', 'Item Details']);
    var customQty = Number(getFormValue_(formData, ['Custom Item Quantity', 'Quantity', 'Item Quantity', 'Requested Quantity', 'Qty']) || 0);
    if (!customDescription || customQty < 1) {
      throw new Error('Custom item orders require item description and quantity.');
    }
  }
}

function validateImageRules_(formData) {
  var imageUrl = getFormValue_(formData, [
    'Engraving Design Image Upload',
    'Embroidery Design Image Upload',
    'Heat Press Design Image Upload',
    'Design Image Upload',
    'DesignImageUpload'
  ]);
  if (!imageUrl) {
    return;
  }

  var extension = getFileExtension_(imageUrl);
  if (extension && AppConfig.customOrder.image.allowedExtensions.indexOf(extension) === -1) {
    throw new Error('Unsupported design image format. Allowed: ' + AppConfig.customOrder.image.allowedExtensions.join(', '));
  }
}

function getFormValue_(formData, keys) {
  for (var i = 0; i < keys.length; i += 1) {
    if (formData[keys[i]]) {
      return String(formData[keys[i]]).trim();
    }
  }
  return '';
}

function buildItemSummary_(formData, orderType) {
  if (orderType === AppConfig.customOrder.orderTypes.engraving) {
    return getFormValue_(formData, ['Engraving Item Description', 'Item Description', 'Engraving Description']);
  }

  if (orderType === AppConfig.customOrder.orderTypes.customItem) {
    return getFormValue_(formData, ['Custom Item Description', 'Custom Item Details', 'Item Description', 'Describe the item', 'Describe Your Item', 'Item Details']);
  }

  var items = extractOrderItems_(formData).map(function(item) {
    return item.quantity + 'x ' + item.apparelType + ' ' + item.apparelSize;
  });
  return items.join(', ');
}

function extractOrderItems_(formData) {
  var keys = Object.keys(formData || {});
  var items = [];

  for (var i = 1; i <= 8; i += 1) {
    var type = getFormValue_(formData, ['Apparel Type ' + i, 'ApparelType' + i, 'Embroidery Apparel Type ' + i, 'Heat Press Apparel Type ' + i]);
    var size = getFormValue_(formData, ['Size ' + i, 'Apparel Size ' + i, 'ApparelSize' + i, 'Embroidery Size ' + i, 'Heat Press Size ' + i]);
    var qtyRaw = getFormValue_(formData, ['Qty ' + i, 'Quantity ' + i, 'Apparel Qty ' + i, 'Embroidery Qty ' + i, 'Heat Press Qty ' + i]);
    var qty = Number(qtyRaw || 0);
    if (type && size && qty >= 1) {
      items.push({ apparelType: type, apparelSize: size, quantity: qty });
    }
  }

  if (items.length) {
    return items;
  }

  keys.forEach(function(key) {
    if (String(key).toLowerCase().indexOf('apparel') === -1) {
      return;
    }

    var value = String(formData[key] || '').trim();
    var parsed = parseLegacyItemSummary_(value);
    if (parsed) {
      items.push(parsed);
    }
  });

  return items;
}

function parseLegacyItemSummary_(value) {
  var parts = String(value || '').split(':');
  if (parts.length < 2) {
    return null;
  }
  var head = parts[0].trim().split(' ');
  if (head.length < 2) {
    return null;
  }
  var quantity = Number(head[0].replace(/[^0-9]/g, ''));
  var size = head[1].trim();
  var apparelType = parts.slice(1).join(':').trim();
  if (!quantity || !size || !apparelType) {
    return null;
  }
  return { apparelType: apparelType, apparelSize: size, quantity: quantity };
}

function detectDuplicateCustomOrderSignature_(formData) {
  var email = getCustomerEmail_(formData).toLowerCase();
  var orderType = detectOrderType_(formData);
  var summary = buildItemSummary_(formData, orderType);
  var recentOrders = getAllRowsAsObjects_(AppConfig.sheets.orders).slice(-25);
  var now = new Date();

  return recentOrders.some(function(row) {
    var rowEmail = String(row.CustomerEmail || row['School Email'] || '').toLowerCase();
    var rowType = String(row.OrderType || '').trim();
    var rowSummary = String(row.ItemSummary || '').trim();
    var rowTimestamp = new Date(row.Timestamp || row.UpdatedAt || 0);
    var ageMs = now.getTime() - rowTimestamp.getTime();
    return rowEmail === email && rowType === orderType && rowSummary === summary && ageMs >= 0 && ageMs <= 10 * 60 * 1000;
  });
}

function getFileExtension_(url) {
  // Google Forms file uploads produce Drive URLs (e.g. https://drive.google.com/open?id=...)
  // which have no file extension in the path. Extract the extension from the last path
  // segment only so that domain parts like "com" are never treated as an extension.
  var clean = String(url || '').split('?')[0].toLowerCase();
  var pathParts = clean.split('/');
  var filename = pathParts[pathParts.length - 1];
  var dotIndex = filename.lastIndexOf('.');
  return dotIndex !== -1 ? filename.slice(dotIndex + 1) : '';
}

function getFileNameFromUrl_(url) {
  var clean = String(url || '').split('?')[0];
  var parts = clean.split('/');
  return parts.length ? parts[parts.length - 1] : '';
}

function isAllowedStatusTransition_(fromStatus, toStatus) {
  if (!fromStatus) {
    return true;
  }

  var transitions = {};
  // Submitted: custom orders go to Under Review; non-custom go straight to In Production or Ready for Pickup
  transitions[AppConfig.orderStatus.submitted] = [
    AppConfig.orderStatus.underReview,
    AppConfig.orderStatus.inProduction,
    AppConfig.orderStatus.ready
  ];
  transitions[AppConfig.orderStatus.underReview] = [
    AppConfig.orderStatus.quoteProvided,
    AppConfig.orderStatus.inProduction
  ];
  transitions[AppConfig.orderStatus.quoteProvided] = [AppConfig.orderStatus.quoteAccepted];
  transitions[AppConfig.orderStatus.quoteAccepted] = [AppConfig.orderStatus.pendingProduction];
  transitions[AppConfig.orderStatus.pendingProduction] = [AppConfig.orderStatus.inProduction];
  transitions[AppConfig.orderStatus.inProduction] = [AppConfig.orderStatus.ready];
  transitions[AppConfig.orderStatus.ready] = [AppConfig.orderStatus.pickedUp];

  if (!transitions[fromStatus]) {
    return true;
  }
  return transitions[fromStatus].indexOf(toStatus) !== -1;
}

function generateDeferredPaymentLink_(orderNumber) {
  var base = 'https://square.link/pay/';
  return base + encodeURIComponent(orderNumber) + '-' + Utilities.getUuid().slice(0, 6);
}

// ─── Shopping Cart Order Submission ──────────────────────────────────────────
// Called via google.script.run from Dashboard.html.
// Marks an order as paid and returns fresh dashboard data in one round-trip.
function markOrderPaidAndGetDashboard(orderNumber) {
  assertAuthorizedOpsUser_();
  var sheet = getSheetByNameOrThrow_(AppConfig.sheets.orders);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var index = getHeaderIndexMap_(headers);
  var orderNumberCol = index.OrderNumber;
  var isPaidCol = firstDefinedIndex_(index, ['IsPaid', 'Is Paid', 'Paid']);

  if (orderNumberCol === undefined) {
    throw new Error('Orders sheet is missing OrderNumber column.');
  }
  if (isPaidCol === undefined) {
    throw new Error('Orders sheet is missing IsPaid column. Please add an "IsPaid" column.');
  }

  var found = false;
  for (var i = 1; i < values.length; i += 1) {
    if (String(values[i][orderNumberCol] || '').trim() === String(orderNumber || '').trim()) {
      sheet.getRange(i + 1, isPaidCol + 1).setValue(true);
      found = true;
      break;
    }
  }
  if (!found) {
    throw new Error('Order not found: ' + orderNumber);
  }

  return {
    orders:   getDashboardOrders(),
    userRole: getUserRole_()
  };
}

// Called via google.script.run from Dashboard.html.
// Cancels an order, sends a cancellation email to the customer, and returns fresh dashboard data.
function cancelOrderAndGetDashboard(orderNumber, cancelReason) {
  assertOfficerOrSponsor_();

  var reason = String(cancelReason || '').trim();
  if (!reason) {
    throw new Error('A cancellation reason is required.');
  }

  var sheet = getSheetByNameOrThrow_(AppConfig.sheets.orders);
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var index = getHeaderIndexMap_(headers);

  var orderNumberCol  = index.OrderNumber;
  var statusCol       = index.Status;
  var updatedAtCol    = index.UpdatedAt;
  var customerEmailCol = firstDefinedIndex_(index, ['CustomerEmail', 'Customer Email', 'School Email']);
  var customerNameCol  = firstDefinedIndex_(index, ['CustomerName', 'Customer Name', 'Full Name', 'Name']);
  var itemSummaryCol   = index.ItemSummary;

  if (orderNumberCol === undefined || statusCol === undefined) {
    throw new Error('Orders sheet is missing OrderNumber or Status column.');
  }

  var found = false;
  for (var i = 1; i < values.length; i += 1) {
    if (String(values[i][orderNumberCol] || '').trim() !== String(orderNumber || '').trim()) {
      continue;
    }
    found = true;

    // Write Cancelled status and timestamp
    sheet.getRange(i + 1, statusCol + 1).setValue(AppConfig.orderStatus.cancelled);
    if (updatedAtCol !== undefined) {
      sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date());
    }

    // Send cancellation email
    var customerEmail = customerEmailCol !== undefined ? String(values[i][customerEmailCol] || '').trim() : '';
    var customerName  = customerNameCol  !== undefined ? String(values[i][customerNameCol]  || '').trim() : 'Customer';
    var itemSummary   = itemSummaryCol   !== undefined ? String(values[i][itemSummaryCol]   || '').trim() : '';

    if (customerEmail) {
      try {
        var subject = 'Roost Store Order Cancelled: ' + orderNumber;
        var body = [
          'Hi ' + (customerName || 'there') + ',',
          '',
          'Your Roost Store order has been cancelled.',
          '',
          'Order Number : ' + orderNumber,
          (itemSummary ? 'Items         : ' + itemSummary : ''),
          '',
          'Reason for cancellation:',
          '  ' + reason,
          '',
          'If you believe this is a mistake or have questions, please reply to this email or contact the store team directly.',
          '',
          'Thank you,',
          'Roost Store'
        ].filter(function(l) { return l !== undefined; }).join('\n');

        MailApp.sendEmail({ to: customerEmail, subject: subject, body: body });
      } catch (mailErr) {
        Logger.log('Cancellation email failed for ' + orderNumber + ': ' + mailErr.message);
      }
    } else {
      Logger.log('No customer email found for cancelled order ' + orderNumber + ' — email not sent.');
    }

    break;
  }

  if (!found) {
    throw new Error('Order not found: ' + orderNumber);
  }

  return {
    orders:   getDashboardOrders(),
    userRole: getUserRole_()
  };
}

// Called via google.script.run from Cart.html.
// payload: {
//   customerName: string,
//   customerEmail: string,
//   items: [{ sku, name, quantity, unitPriceCents, paymentLink }]
// }
function submitCartOrder(payload) {
  // --- Validate inputs ---
  var name  = String((payload && payload.customerName)  || '').trim();
  var email = String((payload && payload.customerEmail) || '').trim();
  var items = (payload && Array.isArray(payload.items)) ? payload.items : [];

  if (!name)  { throw new Error('Full name is required.'); }
  if (!email || email.indexOf('@') === -1) { throw new Error('A valid school email is required.'); }
  if (!items.length) { throw new Error('Your cart is empty.'); }

  for (var v = 0; v < items.length; v += 1) {
    if (!Number.isFinite(items[v].quantity) || items[v].quantity < 1) {
      throw new Error('Invalid quantity for "' + (items[v].name || 'item') + '".');
    }
  }

  // --- Server-side inventory check ---
  var products = getActiveProducts();
  var productMap = {};
  products.forEach(function(p) { productMap[p.sku || p.name] = p; });

  for (var k = 0; k < items.length; k += 1) {
    var key = items[k].sku || items[k].name;
    var product = productMap[key];
    if (product && product.inventoryCount !== null && product.inventoryCount <= 0) {
      throw new Error('"' + items[k].name + '" is out of stock.');
    }
  }

  // --- Generate identifiers ---
  var orderNumber = createOrderNumber_();
  var receiptCode = createReceiptCode_();
  var now = new Date();

  // --- Build item summary ---
  var itemSummary = items.map(function(item) {
    return item.quantity + '\u00d7 ' + item.name;
  }).join(', ');

  // --- Write Orders row ---
  var ordersSheet = getSheetByNameOrThrow_(AppConfig.sheets.orders);
  var ordersHeaders = ordersSheet.getDataRange().getValues()[0];
  var ordersIndex = getHeaderIndexMap_(ordersHeaders);

  var newOrderRow = new Array(ordersHeaders.length).fill('');
  function setOrderCell(header, value) {
    if (ordersIndex[header] !== undefined) { newOrderRow[ordersIndex[header]] = value; }
  }
  setOrderCell('OrderNumber',         orderNumber);
  setOrderCell('ReceiptCode',         receiptCode);
  setOrderCell('TemporaryOrderID',    orderNumber);
  setOrderCell('PermanentOrderNumber','');
  setOrderCell('Status',              AppConfig.orderStatus.pending);
  setOrderCell('OrderType',           'Cart Order');
  setOrderCell('ItemSummary',         itemSummary);
  setOrderCell('UpdatedAt',           now);
  setOrderCell('QuoteRequired',       false);
  // Store customer info in common form-response column names if they exist
  setOrderCell('Full Name',           name);
  setOrderCell('School Email',        email);
  ordersSheet.appendRow(newOrderRow);

  // --- Write OrderItems rows ---
  var orderItemsSheet = getSheetByNameOrThrow_(AppConfig.sheets.orderItems);
  var orderItemsHeaders = orderItemsSheet.getDataRange().getValues()[0];
  var orderItemsIndex = getHeaderIndexMap_(orderItemsHeaders);

  var itemRows = items.map(function(item) {
    var row = new Array(orderItemsHeaders.length).fill('');
    function setItemCell(header, value) {
      if (orderItemsIndex[header] !== undefined) { row[orderItemsIndex[header]] = value; }
    }
    setItemCell('OrderItemID',    Utilities.getUuid());
    setItemCell('OrderNumber',    orderNumber);
    setItemCell('ApparelType',    item.sku || '');   // reuse column for SKU
    setItemCell('ApparelSize',    item.name || '');  // reuse column for product name
    setItemCell('Quantity',       item.quantity);
    setItemCell('UnitPriceCents', item.unitPriceCents || 0);
    setItemCell('CreatedAt',      now);
    return row;
  });
  if (itemRows.length) {
    orderItemsSheet.getRange(orderItemsSheet.getLastRow() + 1, 1, itemRows.length, orderItemsHeaders.length)
      .setValues(itemRows);
  }

  // --- Generate Square payment link (SQUARE_API mode only) ---
  var paymentUrl = null;
  if (isSquareApiEnabled()) {
    try {
      var checkerBase = getStatusCheckerUrl_();
      var squareRedirectUrl = checkerBase
        ? checkerBase + '?action=checker&orderNumber=' + encodeURIComponent(orderNumber) + '&receiptCode=' + encodeURIComponent(receiptCode)
        : '';
      paymentUrl = createCartPaymentLink_(orderNumber, name, email, items, squareRedirectUrl);
      // Persist URL to Orders sheet PaymentLink column
      var ordersValues = ordersSheet.getDataRange().getValues();
      var ordersHeadersRefresh = ordersValues[0];
      var ordersIndexRefresh = getHeaderIndexMap_(ordersHeadersRefresh);
      var paymentLinkColIdx = ordersIndexRefresh.PaymentLink;
      if (paymentLinkColIdx !== undefined) {
        var lastRow = ordersSheet.getLastRow();
        ordersSheet.getRange(lastRow, paymentLinkColIdx + 1).setValue(paymentUrl);
      }
    } catch (squareErr) {
      Logger.log('Square payment link creation failed for ' + orderNumber + ': ' + squareErr.message);
      paymentUrl = null; // degrade gracefully — order row already written
    }
  }

  // --- Send confirmation email ---
  sendCartConfirmationEmail_({
    customerName:  name,
    customerEmail: email,
    orderNumber:   orderNumber,
    receiptCode:   receiptCode,
    items:         items,
    paymentUrl:    paymentUrl
  });

  return {
    orderNumber: orderNumber,
    receiptCode: receiptCode,
    paymentUrl:  paymentUrl,
    items: items.map(function(item) {
      return { name: item.name, quantity: item.quantity, paymentLink: item.paymentLink || '' };
    })
  };
}

function sendCartConfirmationEmail_(data) {
  var checkerUrl = getStatusCheckerUrl_();
  var subject = 'Roost Store Order Confirmation: ' + data.orderNumber;

  var lines = [
    'Hi ' + data.customerName + ',',
    '',
    'Thank you for your Roost Store order! Here\'s your summary:',
    '',
    'Order Number : ' + data.orderNumber,
    'Receipt Code : ' + data.receiptCode,
    ''
  ];

  lines.push('Items:');
  data.items.forEach(function(item) {
    var price = item.unitPriceCents ? ' — $' + (item.unitPriceCents / 100).toFixed(2) + ' each' : '';
    lines.push('  ' + item.quantity + '\u00d7 ' + item.name + price);
  });

  lines.push('');
  if (data.paymentUrl) {
    lines.push('Complete your payment here:');
    lines.push(data.paymentUrl);
  } else {
    var hasItemLinks = data.items.some(function(item) { return item.paymentLink; });
    if (hasItemLinks) {
      lines.push('Complete your payment below (one link per item):');
      data.items.forEach(function(item) {
        if (item.paymentLink) {
          lines.push('  ' + item.name + ': ' + item.paymentLink);
        }
      });
    } else {
      lines.push('To complete payment, please contact the store team — we\'ll send you a payment link shortly.');
    }
  }

  if (checkerUrl) {
    var statusLink = checkerUrl +
      '?action=checker&orderNumber=' + encodeURIComponent(data.orderNumber) +
      '&receiptCode=' + encodeURIComponent(data.receiptCode);
    lines.push('');
    lines.push('Track your order status here:');
    lines.push(statusLink);
  }

  lines.push('');
  lines.push('If you have questions, reply to this email or contact the store team.');

  try {
    MailApp.sendEmail({ to: data.customerEmail, subject: subject, body: lines.join('\n') });
  } catch (err) {
    Logger.log('Cart confirmation email failed for ' + data.customerEmail + ': ' + err.message);
  }
}

function testStatusTransitionRules() {
  return {
    submittedToUnderReview: isAllowedStatusTransition_(AppConfig.orderStatus.submitted, AppConfig.orderStatus.underReview),
    underReviewToInProduction: isAllowedStatusTransition_(AppConfig.orderStatus.underReview, AppConfig.orderStatus.inProduction),
    readyToPickedUp: isAllowedStatusTransition_(AppConfig.orderStatus.ready, AppConfig.orderStatus.pickedUp),
    invalidTransitionBlocked: !isAllowedStatusTransition_(AppConfig.orderStatus.submitted, AppConfig.orderStatus.pickedUp)
  };
}

function assertAuthorizedOpsUser_() {
  var email = Session.getActiveUser().getEmail();
  var domain = PropertiesService.getScriptProperties().getProperty(AppConfig.allowedDomainProperty) || '';

  if (!email) {
    throw new Error('Unable to verify user identity.');
  }

  if (domain && email.split('@')[1] !== domain) {
    throw new Error('User domain is not allowed.');
  }

  var roster = getAllRowsAsObjects_(AppConfig.sheets.clubRoster);
  var found = roster.find(function(row) {
    return String(row.Email || '').toLowerCase() === email.toLowerCase() && String(row.IsActive).toLowerCase() === 'true';
  });

  if (!found) {
    throw new Error('User is not an active DECA operations member.');
  }
}

function getUserRole_() {
  var email = Session.getActiveUser().getEmail();
  if (!email) {
    return null;
  }
  var roster = getAllRowsAsObjects_(AppConfig.sheets.clubRoster);
  var found = roster.find(function(row) {
    return String(row.Email || '').toLowerCase() === email.toLowerCase() && String(row.IsActive).toLowerCase() === 'true';
  });
  return found ? String(found.Role || '').toUpperCase() : null;
}

function assertOfficerOrSponsor_() {
  assertAuthorizedOpsUser_();
  var role = getUserRole_();
  if (role !== 'OFFICER' && role !== 'SPONSOR') {
    throw new Error('This action requires Officer or Sponsor role.');
  }
}

function getDesignImageUploadValue_(formData, orderType) {
  var keys = ['Design Image Upload', 'DesignImageUpload'];

  if (orderType === AppConfig.customOrder.orderTypes.engraving) {
    keys.unshift('Engraving Design Image Upload');
  } else if (orderType === AppConfig.customOrder.orderTypes.embroidery) {
    keys.unshift('Embroidery Design Image Upload');
  } else if (orderType === AppConfig.customOrder.orderTypes.heatPress) {
    keys.unshift('Heat Press Design Image Upload');
  }

  return getFormValue_(formData, keys);
}

function sendSubmissionConfirmationEmail_(formData, orderData) {
  var recipients = getSubmissionEmailRecipients_(formData);
  if (!recipients.to) {
    return;
  }

  var name = getFormValue_(formData, ['Full Name', 'Customer Name', 'CustomerName']) || 'Customer';
  var checkerUrl = getStatusCheckerUrl_();

  var subject = 'Roost Store Order Confirmation: ' + orderData.orderNumber;
  var lines = [
    'Hi ' + name + ',',
    '',
    'Thanks for your Roost Store order submission.',
    '',
    'Order number: ' + orderData.orderNumber,
    'Receipt code: ' + orderData.receiptCode,
    'Order type: ' + (orderData.orderType || 'N/A'),
    'Current status: ' + (orderData.status || 'Submitted')
  ];

  if (orderData.pickupWindow) {
    lines.push('Pickup window: ' + orderData.pickupWindow);
  }

  if (checkerUrl) {
    var statusLink = checkerUrl +
      '?action=checker&orderNumber=' + encodeURIComponent(orderData.orderNumber) +
      '&receiptCode=' + encodeURIComponent(orderData.receiptCode);
    lines.push('');
    lines.push('Check your order status here:');
    lines.push(statusLink);
  }

  lines.push('');
  lines.push('If you need help, reply to this email or contact the store team.');

  try {
    var mailOptions = {
      to: recipients.to,
      subject: subject,
      body: lines.join('\n')
    };
    if (recipients.cc) {
      mailOptions.cc = recipients.cc;
    }
    MailApp.sendEmail(mailOptions);
  } catch (error) {
    Logger.log('Submission email failed for ' + recipients.to + ': ' + error.message);
    throw error;
  }
}

function getStatusCheckerUrl_() {
  var value = PropertiesService.getScriptProperties().getProperty(AppConfig.statusCheckerUrlProperty);
  return String(value || '').trim();
}

function sendWorkflowErrorEmail_(formData, orderNumber, receiptCode, error) {
  var name = getFormValue_(formData, ['Full Name', 'Customer Name', 'CustomerName']) || 'Customer';
  var recipients = getSubmissionEmailRecipients_(formData);
  var adminEmail = '';
  try { adminEmail = String(Session.getEffectiveUser().getEmail() || '').trim(); } catch (e) {}

  // Customer notification
  if (recipients.to) {
    try {
      MailApp.sendEmail({
        to: recipients.to,
        subject: 'Roost Store — Issue with Your Order Submission',
        body: [
          'Hi ' + name + ',',
          '',
          'We received your order submission but encountered an issue while processing it.',
          'Our store team has been notified and will follow up with you shortly.',
          '',
          'For reference:',
          'Order number: ' + orderNumber,
          'Receipt code: ' + receiptCode,
          '',
          'If you need immediate assistance, please reply to this email or contact the store team.',
          '',
          '— Roost Store'
        ].join('\n')
      });
    } catch (mailErr) {
      Logger.log('Error notification to customer failed: ' + mailErr.message);
    }
  }

  // Admin notification
  if (adminEmail && adminEmail !== recipients.to) {
    try {
      MailApp.sendEmail({
        to: adminEmail,
        subject: 'Roost Store — Workflow Error: ' + orderNumber,
        body: [
          'A form submission workflow error occurred.',
          '',
          'Order number: ' + orderNumber,
          'Receipt code: ' + receiptCode,
          'Customer name: ' + name,
          'Customer email: ' + (recipients.to || '(unknown)'),
          '',
          'Error: ' + error.message,
          '',
          'The order row may have been created in the sheet without full processing.',
          'Please review and manually update the order status if needed.'
        ].join('\n')
      });
    } catch (mailErr) {
      Logger.log('Error notification to admin failed: ' + mailErr.message);
    }
  }

  Logger.log('Workflow error for ' + orderNumber + ': ' + error.message);
}

function getCustomerEmail_(formData) {
  var schoolEmail = getFormValue_(formData, ['School Email', 'Customer Email', 'CustomerEmail']);
  if (schoolEmail) {
    return schoolEmail;
  }
  return getLoggedInUserEmail_(formData);
}

function getLoggedInUserEmail_(formData) {
  var respondentEmail = getFormValue_(formData, ['Email Address', 'Respondent Email']);
  if (respondentEmail) {
    return respondentEmail;
  }

  try {
    return String(Session.getActiveUser().getEmail() || '').trim();
  } catch (error) {
    return '';
  }
}

function getSubmissionEmailRecipients_(formData) {
  var schoolEmail = getFormValue_(formData, ['School Email', 'Customer Email', 'CustomerEmail']);
  var loggedInEmail = getLoggedInUserEmail_(formData);
  var primary = schoolEmail || loggedInEmail;
  var cc = '';

  if (schoolEmail && loggedInEmail && schoolEmail.toLowerCase() !== loggedInEmail.toLowerCase()) {
    cc = loggedInEmail;
  }

  return {
    to: primary,
    cc: cc
  };
}
