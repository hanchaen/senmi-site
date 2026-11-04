(function () {
  var PRODUCT = {
    item_id: 'apple_reset_patch',
    item_name: 'Apple Reset Patch',
    item_brand: 'senmi',
    item_category: 'cheek_patch'
  };
  var CART_KEY = 'senmi_cart';
  var SELECTION_KEY = 'senmi_last_selection';
  var UNIT_PRICE = 28000;
  var DISCOUNTED_UNIT_PRICE = 22400;
  var FREE_SHIPPING_THRESHOLD = 50000;
  var SHIPPING_FEE = 3000;

  function track(name, params) {
    if (typeof window.senmiTrack === 'function') window.senmiTrack(name, params);
  }

  function totalPrice(quantity) {
    return (quantity >= 2 ? DISCOUNTED_UNIT_PRICE : UNIT_PRICE) * quantity;
  }

  function priceSummary(quantity) {
    var regularTotal = UNIT_PRICE * quantity;
    var discountedTotal = totalPrice(quantity);
    var discount = regularTotal - discountedTotal;
    var shipping = discountedTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    return {
      regularTotal: regularTotal,
      discount: discount,
      discountedTotal: discountedTotal,
      shipping: shipping,
      finalTotal: discountedTotal + shipping,
      remainingForFreeShipping: Math.max(FREE_SHIPPING_THRESHOLD - discountedTotal, 0)
    };
  }

  function money(value) {
    return Number(value).toLocaleString('ko-KR') + '원';
  }

  function cartItem(quantity) {
    return Object.assign({}, PRODUCT, {
      item_variant: 'single',
      price: quantity >= 2 ? DISCOUNTED_UNIT_PRICE : UNIT_PRICE,
      base_unit_price: UNIT_PRICE,
      unit_count: 1,
      quantity: quantity
    });
  }

  track('view_item', {
    currency: 'KRW',
    value: UNIT_PRICE,
    items: [cartItem(1)]
  });

  document.querySelectorAll('[data-track-content]').forEach(function (element) {
    element.addEventListener('click', function () {
      track('select_content', {
        content_type: element.dataset.trackType,
        content_id: element.dataset.trackContent,
        placement: element.dataset.trackPlacement
      });
    });
  });

  var totalValue = document.getElementById('product-total');
  var totalQuantityValue = document.getElementById('product-total-quantity');
  var regularTotalValue = document.getElementById('product-regular-total');
  var discountValue = document.getElementById('product-discount');
  var subtotalValue = document.getElementById('product-subtotal');
  var shippingValue = document.getElementById('product-shipping');
  var shippingMessage = document.getElementById('shipping-message');
  var shippingProgress = document.getElementById('shipping-progress');
  var shippingBar = document.getElementById('shipping-bar');
  var addToCart = document.getElementById('add-to-cart');
  var buyNow = document.getElementById('cta-main');
  var priceLabel = document.getElementById('product-price');
  var decreaseQuantity = document.getElementById('product-quantity-decrease');
  var increaseQuantity = document.getElementById('product-quantity-increase');
  var quantityOutput = document.getElementById('product-quantity');
  var quantity = 1;
  var navigating = false;

  function updateProductSummary() {
    var summary = priceSummary(quantity);
    quantityOutput.textContent = quantity;
    priceLabel.textContent = 'KRW ' + UNIT_PRICE.toLocaleString('ko-KR');
    totalQuantityValue.textContent = '총 ' + quantity + '개';
    regularTotalValue.textContent = money(summary.regularTotal);
    regularTotalValue.classList.toggle('is-discounted', summary.discount > 0);
    discountValue.textContent = summary.discount ? '-' + money(summary.discount) : '0원';
    subtotalValue.textContent = money(summary.discountedTotal);
    shippingValue.textContent = summary.shipping ? money(summary.shipping) : '무료';
    totalValue.textContent = money(summary.finalTotal);
    if (summary.remainingForFreeShipping) {
      shippingMessage.innerHTML = '<strong>' + money(summary.remainingForFreeShipping) + '</strong>만 더 구매하면 무료배송';
    } else {
      shippingMessage.innerHTML = '<strong>무료배송 혜택이 적용되었습니다</strong>';
    }
    var progress = Math.min(summary.discountedTotal / FREE_SHIPPING_THRESHOLD * 100, 100);
    shippingBar.style.width = progress + '%';
    shippingProgress.setAttribute('aria-valuenow', String(Math.min(summary.discountedTotal, FREE_SHIPPING_THRESHOLD)));
    shippingProgress.setAttribute('aria-valuetext', summary.remainingForFreeShipping ? '무료배송까지 ' + money(summary.remainingForFreeShipping) : '무료배송 적용 완료');
  }

  function addSelectionToCart(buttonType) {
    if (navigating) return;
    navigating = true;
    var item = cartItem(quantity);
    sessionStorage.setItem(SELECTION_KEY, JSON.stringify(item));
    var cart = [];
    try { cart = JSON.parse(sessionStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
    var existing = cart.find(function (entry) { return entry.item_id === item.item_id; });
    if (existing) {
      existing.quantity += quantity;
      existing.price = existing.quantity >= 2 ? DISCOUNTED_UNIT_PRICE : UNIT_PRICE;
      existing.item_variant = 'single';
      existing.base_unit_price = UNIT_PRICE;
      existing.unit_count = 1;
    } else {
      cart.push(item);
    }
    sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
    track('add_to_cart', {
      currency: 'KRW',
      value: totalPrice(quantity),
      button_type: buttonType,
      items: [item]
    });
    location.href = 'cart.html';
  }

  if (totalValue && totalQuantityValue && regularTotalValue && discountValue && subtotalValue && shippingValue && shippingMessage && shippingProgress && shippingBar && addToCart && buyNow && decreaseQuantity && increaseQuantity && quantityOutput) {
    decreaseQuantity.addEventListener('click', function () {
      if (quantity === 1) return;
      var previous = quantity;
      quantity -= 1;
      updateProductSummary();
      track('product_quantity_update', {
        item_id: PRODUCT.item_id,
        previous_quantity: previous,
        new_quantity: quantity,
        update_method: 'decrease'
      });
    });
    increaseQuantity.addEventListener('click', function () {
      var previous = quantity;
      quantity += 1;
      updateProductSummary();
      track('product_quantity_update', {
        item_id: PRODUCT.item_id,
        previous_quantity: previous,
        new_quantity: quantity,
        update_method: 'increase'
      });
    });
    addToCart.addEventListener('click', function () { addSelectionToCart('add_to_cart'); });
    buyNow.addEventListener('click', function () {
      var item = cartItem(quantity);
      track('buy_now_click', {
        placement: 'product_detail',
        currency: 'KRW',
        value: totalPrice(quantity),
        items: [item]
      });
      addSelectionToCart('buy_now');
    });
    updateProductSummary();
  }

  document.querySelectorAll('.faq-toggle').forEach(function (button, index) {
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      var answer = document.getElementById(button.getAttribute('aria-controls'));
      answer.hidden = expanded;
      track(expanded ? 'faq_close' : 'faq_open', {
        faq_id: button.dataset.faqId,
        faq_position: index + 1
      });
    });
  });

  var reviewButtons = Array.prototype.slice.call(document.querySelectorAll('.review-card'));
  var reviewModal = document.getElementById('review-modal');
  if (reviewButtons.length && reviewModal) {
    var modalImage = document.getElementById('review-modal-image');
    var modalText = document.getElementById('review-modal-text');
    var modalAuthor = document.getElementById('review-modal-author');
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
      modalAuthor.textContent = '★★★★★  ' + card.dataset.reviewAuthor;
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

