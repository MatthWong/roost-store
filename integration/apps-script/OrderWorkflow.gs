function onFormSubmit(e) {
  var sheet = getSheetByNameOrThrow_(AppConfig.sheets.orders);
  var headers = sheet.getDataRange().getValues()[0];
  var index = getHeaderIndexMap_(headers);

  var rowIndex = e.range.getRow();
  var orderNumber = createTemporaryOrderId_();
  var receiptCode = createReceiptCode_();
  var now = new Date();
  var formData = normalizeFormData_(e && e.namedValues ? e.namedValues : {});
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
  setCellValueIfHeaderExists_(sheet, rowIndex, index.ImageFileURL, getFormValue_(formData, ['Design Image Upload', 'DesignImageUpload']));
  setCellValueIfHeaderExists_(sheet, rowIndex, index.ImageFileName, getFileNameFromUrl_(getFormValue_(formData, ['Design Image Upload', 'DesignImageUpload'])));
  setCellValueIfHeaderExists_(sheet, rowIndex, index.ImageUploadedAt, now);
  setCellValueIfHeaderExists_(sheet, rowIndex, index.UpdatedAt, now);

  if (isCustom) {
    addOrderItemRows_(orderNumber, extractOrderItems_(formData));
  }

  return {
    orderNumber: orderNumber,
    receiptCode: receiptCode,
    pickupWindow: pickupWindow,
    status: status,
    duplicateWarning: duplicateWarning
  };
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
  assertAuthorizedOpsUser_();

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
  var email = getFormValue_(formData, ['School Email', 'Customer Email', 'CustomerEmail']);
  if (!name || !email) {
    throw new Error('Missing required customer name or email.');
  }

  if (orderType === AppConfig.customOrder.orderTypes.engraving) {
    var itemDescription = getFormValue_(formData, ['Item Description', 'Engraving Item Description']);
    var quantity = Number(getFormValue_(formData, ['Quantity', 'Engraving Quantity']) || 0);
    var engravingText = getFormValue_(formData, ['Engraving Text']);
    var imageUrl = getFormValue_(formData, ['Design Image Upload', 'DesignImageUpload']);
    if (!itemDescription || quantity < 1 || (!engravingText && !imageUrl)) {
      throw new Error('Engraving orders require item description, quantity, and engraving text or image.');
    }
  }

  if (orderType === AppConfig.customOrder.orderTypes.customItem) {
    var customDescription = getFormValue_(formData, ['Custom Item Description', 'Item Description']);
    var customQty = Number(getFormValue_(formData, ['Quantity', 'Custom Item Quantity']) || 0);
    if (!customDescription || customQty < 1) {
      throw new Error('Custom item orders require item description and quantity.');
    }
  }
}

function validateImageRules_(formData) {
  var imageUrl = getFormValue_(formData, ['Design Image Upload', 'DesignImageUpload']);
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
    return getFormValue_(formData, ['Item Description', 'Engraving Item Description']);
  }

  if (orderType === AppConfig.customOrder.orderTypes.customItem) {
    return getFormValue_(formData, ['Custom Item Description', 'Item Description']);
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
    var type = getFormValue_(formData, ['Apparel Type ' + i, 'ApparelType' + i]);
    var size = getFormValue_(formData, ['Size ' + i, 'Apparel Size ' + i, 'ApparelSize' + i]);
    var qtyRaw = getFormValue_(formData, ['Qty ' + i, 'Quantity ' + i, 'Apparel Qty ' + i]);
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
  var email = getFormValue_(formData, ['School Email', 'Customer Email', 'CustomerEmail']).toLowerCase();
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
  var clean = String(url || '').split('?')[0].toLowerCase();
  var parts = clean.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
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
  transitions[AppConfig.orderStatus.submitted] = [AppConfig.orderStatus.underReview];
  transitions[AppConfig.orderStatus.underReview] = [
    AppConfig.orderStatus.quoteProvided,
    AppConfig.orderStatus.inProduction
  ];
  transitions[AppConfig.orderStatus.quoteProvided] = [AppConfig.orderStatus.quoteAccepted];
  transitions[AppConfig.orderStatus.quoteAccepted] = [AppConfig.orderStatus.inProduction];
  transitions[AppConfig.orderStatus.inProduction] = [AppConfig.orderStatus.ready];
  transitions[AppConfig.orderStatus.ready] = [AppConfig.orderStatus.pickedUp];
  transitions[AppConfig.orderStatus.pending] = [AppConfig.orderStatus.processing, AppConfig.orderStatus.ready];
  transitions[AppConfig.orderStatus.processing] = [AppConfig.orderStatus.ready];

  if (!transitions[fromStatus]) {
    return true;
  }
  return transitions[fromStatus].indexOf(toStatus) !== -1;
}

function generateDeferredPaymentLink_(orderNumber) {
  var base = 'https://square.link/pay/';
  return base + encodeURIComponent(orderNumber) + '-' + Utilities.getUuid().slice(0, 6);
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
