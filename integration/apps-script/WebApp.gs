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
      template.webAppUrl = ScriptApp.getService().getUrl();
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

    if (action === 'dashboard') {
      try {
        assertAuthorizedOpsUser_();
      } catch (authErr) {
        var authPage = HtmlService.createHtmlOutput(
          '<!doctype html><html><head><meta charset="utf-8">'
          + '<style>body{margin:0;display:flex;align-items:center;justify-content:center;'
          + 'min-height:100vh;background:#1a1a2e;font-family:Arial,sans-serif;color:#e0e0e0;}'
          + '.box{text-align:center;padding:32px;}.box h2{margin:0 0 12px;font-size:18px;}'
          + '.box p{color:#9a9ab0;margin:0 0 20px;font-size:13px;}'
          + '.btn{display:inline-block;background:#5b2d90;color:#fff;padding:10px 22px;'
          + 'border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;}</style>'
          + '</head><body><div class="box">'
          + '<h2>&#128274; Sign-in Required</h2>'
          + '<p>The dashboard must be opened directly in a browser tab.<br>'
          + 'Embedded iframes cannot pass your Google identity.</p>'
          + '<a class="btn" href="' + ScriptApp.getService().getUrl() + '?action=dashboard" target="_blank">'
          + 'Open Dashboard in New Tab</a>'
          + '</div></body></html>'
        );
        return authPage.setTitle('Sign-in Required')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      }
      var dashboardData = getDashboardOrders();
      var userRole = getUserRole_();
      var template = HtmlService.createTemplateFromFile('Dashboard');
      template.initialDataJson = JSON.stringify(dashboardData);
      template.userRole = userRole || 'MEMBER';
      template.webAppUrl = ScriptApp.getService().getUrl();
      return template.evaluate()
        .setTitle('Roost Store — Ops Dashboard')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    if (action === 'dashboard-data') {
      assertAuthorizedOpsUser_();
      var role = getUserRole_();
      return jsonResponse_(200, {
        orders: getDashboardOrders(),
        userRole: role || 'MEMBER'
      });
    }

    if (action === 'update-status') {
      assertOfficerOrSponsor_();
      var updateOrderNumber = String((e.parameter.orderNumber || '')).trim();
      var updateNewStatus = String((e.parameter.newStatus || '')).trim();
      if (!updateOrderNumber || !updateNewStatus) {
        return jsonResponse_(400, { error: 'orderNumber and newStatus are required.' });
      }
      var result = updateOrderStatus(updateOrderNumber, updateNewStatus);
      return jsonResponse_(200, result);
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

// Called via google.script.run from Dashboard.html — bypasses CORS.
function getDashboardDataForUI() {
  assertAuthorizedOpsUser_();
  return {
    orders: getDashboardOrders(),
    userRole: getUserRole_() || 'MEMBER'
  };
}

// Updates a status and returns fresh dashboard data in one round-trip.
// Avoids nested google.script.run calls and read-after-write timing issues.
function updateStatusAndGetDashboard(orderNumber, newStatus) {
  updateOrderStatus(orderNumber, newStatus); // assertOfficerOrSponsor_ called inside
  return {
    orders: getDashboardOrders(),
    userRole: getUserRole_() || 'MEMBER'
  };
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
