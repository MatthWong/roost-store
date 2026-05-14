var IntegrationMode = Object.freeze({
  PAYMENT_LINKS: 'PAYMENT_LINKS',
  SQUARE_API: 'SQUARE_API'
});

var AppConfig = Object.freeze({
  defaultMode: IntegrationMode.PAYMENT_LINKS,
  modeProperty: 'INTEGRATION_MODE',
  statusCheckerUrlProperty: 'STATUS_CHECKER_URL',
  allowedDomainProperty: 'ALLOWED_SCHOOL_DOMAIN',
  square: {
    tokenProperty: 'SQUARE_PERSONAL_ACCESS_TOKEN',
    locationProperty: 'SQUARE_LOCATION_ID',
    environmentProperty: 'SQUARE_ENVIRONMENT',
    baseUrl: 'https://connect.squareup.com/v2',
    sandboxBaseUrl: 'https://connect.squareupsandbox.com/v2'
  },
  sheets: {
    orders: 'Orders',
    orderItems: 'OrderItems',
    products: 'Products',
    paymentLinks: 'PaymentLinks',
    storeHours: 'StoreHours',
    clubRoster: 'ClubRoster'
  },
  orderStatus: {
    submitted: 'Submitted',
    underReview: 'Under Review',
    quoteProvided: 'Quote Provided',
    quoteAccepted: 'Quote Accepted',
    inProduction: 'In Production',
    pending: 'Pending',
    processing: 'Processing',
    ready: 'Ready for Pickup',
    pickedUp: 'Picked Up',
    cancelled: 'Cancelled'
  },
  customOrder: {
    orderTypes: {
      engraving: 'Engraving',
      embroidery: 'Embroidery',
      heatPress: 'Heat Press',
      customItem: 'Custom Item'
    },
    apparelTypes: ['Short-sleeve t-shirt', 'Long-sleeve t-shirt', 'Hoodie', 'Polo'],
    apparelSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    image: {
      allowedExtensions: ['png', 'jpg', 'jpeg', 'svg'],
      maxSizeMb: 5,
      maxFiles: 1
    }
  }
});

function getIntegrationMode() {
  var properties = PropertiesService.getScriptProperties();
  var mode = properties.getProperty(AppConfig.modeProperty);
  return mode || AppConfig.defaultMode;
}

function setIntegrationMode(mode) {
  if (mode !== IntegrationMode.PAYMENT_LINKS && mode !== IntegrationMode.SQUARE_API) {
    throw new Error('Invalid integration mode: ' + mode);
  }
  PropertiesService.getScriptProperties().setProperty(AppConfig.modeProperty, mode);
  return mode;
}

function getSquareAccessToken_() {
  return PropertiesService.getScriptProperties().getProperty(AppConfig.square.tokenProperty);
}

function getSquareLocationId_() {
  return PropertiesService.getScriptProperties().getProperty(AppConfig.square.locationProperty);
}

function getSquareBaseUrl_() {
  var env = PropertiesService.getScriptProperties().getProperty(AppConfig.square.environmentProperty) || '';
  if (env.toLowerCase() === 'production') {
    return AppConfig.square.baseUrl;
  }
  return AppConfig.square.sandboxBaseUrl;
}

function isSquareApiReady() {
  return Boolean(getSquareAccessToken_()) && Boolean(getSquareLocationId_());
}

function isSquareApiEnabled() {
  return getIntegrationMode() === IntegrationMode.SQUARE_API && isSquareApiReady();
}

function getAppModeSummary() {
  return {
    integrationMode: getIntegrationMode(),
    squareApiReady: isSquareApiReady(),
    squareApiEnabled: isSquareApiEnabled()
  };
}
