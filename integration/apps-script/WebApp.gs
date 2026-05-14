function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'status';

    if (action === 'checker') {
      var checkerOrderNumber = String((e.parameter.orderNumber || '')).trim();
      var checkerReceiptCode = String((e.parameter.receiptCode || '')).trim();
      var checkerPayload = null;

      if (checkerOrderNumber || checkerReceiptCode) {
        if (!checkerOrderNumber || !checkerReceiptCode) {
          checkerPayload = { statusCode: 400, data: { error: 'Please enter both order number and receipt code.' } };
        } else {
          var checkerStatus = getCustomerOrderStatus(checkerOrderNumber, checkerReceiptCode);
          if (!checkerStatus) {
            checkerPayload = { statusCode: 404, data: { error: 'No matching order found.' } };
          } else {
            checkerPayload = {
              statusCode: 200,
              data: {
                orderNumber: checkerStatus.orderNumber,
                status: checkerStatus.status,
                pickupWindow: checkerStatus.pickupWindow,
                orderType: checkerStatus.orderType,
                quoteRequired: checkerStatus.quoteRequired,
                lineItems: checkerStatus.lineItems,
                updatedAt: checkerStatus.updatedAt
              }
            };
          }
        }
      }

      var template = HtmlService.createTemplateFromFile('StatusChecker');
      template.initialOrderNumber = checkerOrderNumber;
      template.initialReceiptCode = checkerReceiptCode;
      template.initialPayloadJson = JSON.stringify(checkerPayload);
      return template.evaluate().setTitle('Order Status Checker');
    }

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

    if (action === 'debug-status') {
      assertAuthorizedOpsUser_();
      var debugOrderNumber = String((e.parameter.orderNumber || '')).trim();
      var debugReceiptCode = String((e.parameter.receiptCode || '')).trim();
      if (!debugOrderNumber && !debugReceiptCode) {
        return jsonResponse_(400, { error: 'Provide orderNumber or receiptCode for debug lookup.' });
      }

      return jsonResponse_(200, getOrderStatusDebugSnapshot(debugReceiptCode, debugOrderNumber, 25));
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

function getOrderStatusForChecker(orderNumber, receiptCode) {
  try {
    var cleanOrderNumber = String(orderNumber || '').trim();
    var cleanReceiptCode = String(receiptCode || '').trim();
    if (!cleanOrderNumber || !cleanReceiptCode) {
      return { statusCode: 400, data: { error: 'orderNumber and receiptCode are required.' } };
    }

    var status = getCustomerOrderStatus(cleanOrderNumber, cleanReceiptCode);
    if (!status) {
      return { statusCode: 404, data: { error: 'No matching order found.' } };
    }

    return {
      statusCode: 200,
      data: {
        orderNumber: status.orderNumber,
        status: status.status,
        pickupWindow: status.pickupWindow,
        orderType: status.orderType,
        quoteRequired: status.quoteRequired,
        lineItems: status.lineItems,
        updatedAt: status.updatedAt
      }
    };
  } catch (error) {
    return { statusCode: 500, data: { error: error.message } };
  }
}
