(function () {
  var debugMode = new URLSearchParams(location.search).get('ga_debug') === '1';
  window.senmiTrack = function (eventName, params) {
    if (typeof window.gtag === 'function') {
      var eventParams = Object.assign({}, params || {});
      if (debugMode) eventParams.debug_mode = true;
      window.gtag('event', eventName, eventParams);
      if (window.fbq && eventName !== 'page_view' && !/scroll/i.test(eventName)) {
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
          fbq('track', 'Purchase', { value: eventParams.value, currency: 'KRW' });
        } else if (metaEventName) {
          fbq('track', metaEventName);
        } else {
          fbq('trackCustom', eventName);
        }
      }
    }
  };
})();

