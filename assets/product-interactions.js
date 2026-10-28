(function () {
  var PRODUCT = {
    item_id: 'apple_reset_patch',
    item_name: 'Apple Reset Patch',
    item_brand: 'senmi',
    item_category: 'cheek_patch'
  };
  var CART_KEY = 'senmi_cart';

  function track(name, params) {
    if (typeof window.senmiTrack === 'function') window.senmiTrack(name, params);
  }

  function selectedItem(option) {
    return Object.assign({}, PRODUCT, {
      item_variant: option.value,
      price: Number(option.dataset.price),
      quantity: 1
    });
  }

  var optionSelect = document.getElementById('product-option');
  var totalValue = document.getElementById('product-total');
  var optionError = document.getElementById('option-error');
  var addToCart = document.getElementById('add-to-cart');

  if (optionSelect && totalValue && addToCart) {
    optionSelect.addEventListener('change', function () {
      var option = optionSelect.options[optionSelect.selectedIndex];
      optionError.textContent = '';
      if (!option.value) {
        totalValue.textContent = '0 (0개)';
        return;
      }
      var item = selectedItem(option);
      totalValue.textContent = item.price.toLocaleString('ko-KR') + '원 (' + option.dataset.count + '개 구성)';
      track('select_item', {
        item_list_id: 'product_option',
        item_list_name: 'product_option',
        items: [item]
      });
    });

    addToCart.addEventListener('click', function () {
      var option = optionSelect.options[optionSelect.selectedIndex];
      if (!option.value) {
        optionError.textContent = '구성을 먼저 선택해 주세요.';
        optionSelect.focus();
        return;
      }
      var item = selectedItem(option);
      var cart = [];
      try { cart = JSON.parse(sessionStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
      var existing = cart.find(function (entry) { return entry.item_variant === item.item_variant; });
      if (existing) existing.quantity += 1;
      else cart.push(item);
      sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
      track('add_to_cart', { currency: 'KRW', value: item.price, items: [item] });
      location.href = 'cart.html';
    });
  }

  document.querySelectorAll('.faq-toggle').forEach(function (button, index) {
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      var answer = document.getElementById(button.getAttribute('aria-controls'));
      answer.hidden = expanded;
      track(expanded ? 'faq_close' : 'faq_open', {
        faq_id: button.dataset.faqId,
        faq_question: button.textContent.trim(),
        faq_position: index + 1
      });
    });
  });

  var reviewButtons = Array.prototype.slice.call(document.querySelectorAll('.review-card'));
  var reviewModal = document.getElementById('review-modal');
  if (reviewButtons.length && reviewModal) {
    var modalImage = document.getElementById('review-modal-image');
    var modalText = document.getElementById('review-modal-text');
    var modalTitle = document.getElementById('review-modal-title');
    var closeButton = document.getElementById('review-modal-close');
    var previousButton = document.getElementById('review-previous');
    var nextButton = document.getElementById('review-next');
    var activeIndex = 0;

    function showReview(index, shouldTrack) {
      activeIndex = (index + reviewButtons.length) % reviewButtons.length;
      var card = reviewButtons[activeIndex];
      var image = card.querySelector('img');
      modalImage.src = image.src;
      modalImage.alt = image.alt;
      modalTitle.textContent = '애플 리셋 패치 후기 ' + (activeIndex + 1);
      modalText.textContent = card.dataset.reviewText;
      if (shouldTrack) {
        track('select_content', {
          content_type: 'review',
          content_id: card.dataset.reviewId,
          content_position: activeIndex + 1
        });
      }
    }

    function openReview(index) {
      showReview(index, true);
      reviewModal.classList.add('open');
      reviewModal.setAttribute('aria-hidden', 'false');
      closeButton.focus();
    }

    function closeReview(method) {
      if (!reviewModal.classList.contains('open')) return;
      var id = reviewButtons[activeIndex].dataset.reviewId;
      reviewModal.classList.remove('open');
      reviewModal.setAttribute('aria-hidden', 'true');
      track('review_modal_close', { content_id: id, close_method: method });
      reviewButtons[activeIndex].focus();
    }

    reviewButtons.forEach(function (button, index) {
      button.addEventListener('click', function () { openReview(index); });
    });
    closeButton.addEventListener('click', function () { closeReview('close_button'); });
    reviewModal.addEventListener('click', function (event) {
      if (event.target === reviewModal) closeReview('backdrop');
    });
    previousButton.addEventListener('click', function () {
      var from = reviewButtons[activeIndex].dataset.reviewId;
      showReview(activeIndex - 1, false);
      track('review_navigate', { from_review_id: from, to_review_id: reviewButtons[activeIndex].dataset.reviewId, direction: 'previous' });
    });
    nextButton.addEventListener('click', function () {
      var from = reviewButtons[activeIndex].dataset.reviewId;
      showReview(activeIndex + 1, false);
      track('review_navigate', { from_review_id: from, to_review_id: reviewButtons[activeIndex].dataset.reviewId, direction: 'next' });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeReview('escape');
    });
  }
})();

