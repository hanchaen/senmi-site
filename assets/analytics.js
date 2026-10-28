(function () {
  var debugMode = new URLSearchParams(location.search).get('ga_debug') === '1';
  window.senmiTrack = function (eventName, params) {
    if (typeof window.gtag === 'function') {
      var eventParams = Object.assign({}, params || {});
      if (debugMode) eventParams.debug_mode = true;
      window.gtag('event', eventName, eventParams);
    }
  };
})();

