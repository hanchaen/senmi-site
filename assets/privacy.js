/*
  신청 폼 처리. 입력값은 어디로도 보내지 않습니다.
  - 폼 입력칸에는 name 속성이 없어서, 스크립트가 꺼져 있어도 값이 주소창·서버로 넘어가지 않습니다.
  - 제출 → 개인정보 안내 팝업 → 동의 → 입력값 즉시 삭제 → result.html 이동.
  - 나중에 폼을 Make·구글시트 등에 연결하면 팝업 문구(index.html의 #privacy-modal)를 반드시 고쳐야 합니다.
*/
(function () {
  var form = document.getElementById('lead-form');
  var modal = document.getElementById('privacy-modal');
  if (!modal) return;
  var agree = document.getElementById('privacy-agree');
  var ok = document.getElementById('privacy-ok');
  var cancel = document.getElementById('privacy-cancel');
  var mode = 'info';
  var triggerLocation = 'unknown';
  var formStarted = false;

  function track(name, params) {
    if (typeof window.senmiTrack === 'function') window.senmiTrack(name, params);
  }

  function wipe() {
    if (!form) return;
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
      else el.value = '';
    });
    form.reset();
  }

  function open(m, locationName) {
    mode = m;
    triggerLocation = locationName || 'unknown';
    agree.checked = false;
    ok.disabled = true;
    ok.textContent = m === 'submit' ? '동의하고 완료하기' : '확인했습니다';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    agree.focus();
  }

  function close(method) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    track('privacy_notice_close', { modal_mode: mode, trigger_location: triggerLocation, close_method: method });
  }

  agree.addEventListener('change', function () {
    ok.disabled = !agree.checked;
    track('privacy_consent_update', { modal_mode: mode, consent_state: agree.checked ? 'granted' : 'revoked' });
  });
  cancel.addEventListener('click', function () { close('cancel_button'); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close('backdrop'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) close('escape');
  });

  ok.addEventListener('click', function () {
    if (mode !== 'submit') {
      track('privacy_notice_accept', { modal_mode: 'info', trigger_location: triggerLocation });
      close('confirm_button');
      return;
    }
    var leadParams = { lead_source: 'website_waitlist', form_id: 'lead_form', form_name: 'apple_patch_waitlist' };
    if (new URLSearchParams(location.search).get('ga_debug') === '1') leadParams.debug_mode = true;
    try {
      var selection = JSON.parse(sessionStorage.getItem('senmi_last_selection'));
      if (selection) {
        leadParams.item_id = selection.item_id;
        leadParams.item_variant = selection.item_variant;
      }
    } catch (e) {}
    wipe();
    var moved = false;
    function moveToResult() {
      if (moved) return;
      moved = true;
      location.replace('result.html');
    }
    if (typeof window.gtag === 'function') {
      leadParams.event_callback = moveToResult;
      leadParams.event_timeout = 1200;
      window.gtag('event', 'generate_lead', leadParams);
      if (window.fbq) fbq('track', 'Lead');
      setTimeout(moveToResult, 1400);
    } else {
      moveToResult();
    }
  });

  document.querySelectorAll('[data-privacy-open]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var locationName = b.dataset.privacyLocation || 'unknown';
      track('privacy_notice_open', { trigger_location: locationName, modal_mode: 'info' });
      open('info', locationName);
    });
  });

  if (form) {
    form.addEventListener('input', function () {
      if (formStarted) return;
      formStarted = true;
      track('lead_form_start', { form_id: 'lead_form', form_name: 'apple_patch_waitlist' });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        var missing = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (field) { return !field.validity.valid; }).length;
        track('lead_form_submit_attempt', { form_id: 'lead_form', validation_status: 'invalid', missing_field_count: missing });
        form.reportValidity();
        return;
      }
      track('lead_form_submit_attempt', { form_id: 'lead_form', validation_status: 'valid', missing_field_count: 0 });
      track('privacy_notice_open', { trigger_location: 'lead_form_submit', modal_mode: 'submit' });
      open('submit', 'lead_form_submit');
    });
  }

  // 검토 메모 패널 닫기 (검토용 빌드에만 있음)
  var rp = document.querySelector('.review-panel button');
  if (rp) rp.addEventListener('click', function () { rp.parentNode.remove(); });
})();
