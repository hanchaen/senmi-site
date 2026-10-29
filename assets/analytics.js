(function () {
  var debugMode = new URLSearchParams(location.search).get('ga_debug') === '1';
  window.senmiTrack = function (eventName, params) {
    if (typeof window.gtag === 'function') {
      var eventParams = Object.assign({}, params || {});
      if (debugMode) eventParams.debug_mode = true;
      window.gtag('event', eventName, eventParams);
      if (window.fbq && eventName !== 'page_view' && eventName.indexOf('scroll') === -1) {
        var metaEventNames = {
          generate_lead: 'Lead',
          sign_up: 'CompleteRegistration',
          contact_click: 'Contact',
          view_item: 'ViewContent',
          add_to_cart: 'AddToCart',
          begin_checkout: 'InitiateCheckout',
          purchase: 'Purchase',
          search: 'Search'
        };
        var metaEventName = metaEventNames[eventName];
        if (eventName === 'purchase') {
          window.fbq('track', 'Purchase', { value: eventParams.value, currency: 'KRW' });
        } else if (metaEventName) {
          window.fbq('track', metaEventName);
        } else {
          window.fbq('trackCustom', eventName);
        }
      }
    }
  };
})();

