function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'status';

    if (action === 'status') {
      var orderNumber = String((e.parameter.orderNumber || '')).trim();
      var receiptCode = String((e.parameter.receiptCode || '')).trim();
      if (!orderNumber || !receiptCode) {
        return jsonResponse_(400, { error: 'orderNumber and receiptCode are required.' });
      }

      var status = getCustomerOrderStatus(orderNumber, receiptCode);
      if (!status) {
        return jsonResponse_(404, { error: 'No matching order found.' });
      }
      return jsonResponse_(200, {
        orderNumber: status.orderNumber,
        status: status.status,
        pickupWindow: status.pickupWindow,
        orderType: status.orderType,
        quoteRequired: status.quoteRequired,
        lineItems: status.lineItems,
        updatedAt: status.updatedAt
      });
    }

    if (action === 'products') {
      return jsonResponse_(200, {
        integrationMode: getIntegrationMode(),
        squareApiEnabled: isSquareApiEnabled(),
        products: getStorefrontProducts()
      });
    }

    if (action === 'mode') {
      assertAuthorizedOpsUser_();
      var nextMode = String((e.parameter.mode || '')).trim();
      if (!nextMode) {
        return jsonResponse_(200, getAppModeSummary());
      }
      return jsonResponse_(200, {
        mode: setIntegrationMode(nextMode),
        summary: getAppModeSummary()
      });
    }

    return jsonResponse_(404, { error: 'Unknown action.' });
  } catch (error) {
    return jsonResponse_(500, { error: error.message });
  }
}

function jsonResponse_(statusCode, payload) {
  return ContentService
    .createTextOutput(JSON.stringify({ statusCode: statusCode, data: payload }))
    .setMimeType(ContentService.MimeType.JSON);
}
