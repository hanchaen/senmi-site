(function () {
  var CART_KEY = 'senmi_cart';
  var UNIT_PRICE = 28000;
  var DISCOUNTED_UNIT_PRICE = 22400;
  var FREE_SHIPPING_THRESHOLD = 50000;
  var SHIPPING_FEE = 3000;
  var FIRST_PURCHASE_FREE_SHIPPING = true;
  var cart = [];
  try { cart = JSON.parse(sessionStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }

  var content = document.getElementById('cart-content');
  var empty = document.getElementById('empty-cart');
  var list = document.getElementById('cart-list');
  var subtotal = document.getElementById('subtotal');
  var total = document.getElementById('cart-total');
  var regularTotal = document.getElementById('cart-regular-total');
  var discount = document.getElementById('cart-discount');
  var shipping = document.getElementById('cart-shipping');
  var shippingMessage = document.getElementById('cart-shipping-message');
  var shippingProgress = document.getElementById('cart-shipping-progress');
  var shippingBar = document.getElementById('cart-shipping-bar');

  function track(name, params) {
    if (typeof window.senmiTrack === 'function') window.senmiTrack(name, params);
  }
  function money(value) { return Number(value).toLocaleString('ko-KR') + '원'; }
  function lineValue(item) {
    var price = item.quantity >= 2 ? DISCOUNTED_UNIT_PRICE : UNIT_PRICE;
    return price * item.quantity;
  }
  function totalValue() {
    return cart.reduce(function (sum, item) { return sum + lineValue(item); }, 0);
  }
  function regularTotalValue() {
    return cart.reduce(function (sum, item) { return sum + UNIT_PRICE * item.quantity; }, 0);
  }
  function priceSummary() {
    var discountedTotal = totalValue();
    var regular = regularTotalValue();
    var shippingFee = FIRST_PURCHASE_FREE_SHIPPING ? 0 : (discountedTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);
    return {
      regularTotal: regular,
      discount: regular - discountedTotal,
      discountedTotal: discountedTotal,
      shipping: shippingFee,
      finalTotal: discountedTotal + shippingFee,
      remainingForFreeShipping: FIRST_PURCHASE_FREE_SHIPPING ? 0 : Math.max(FREE_SHIPPING_THRESHOLD - discountedTotal, 0)
    };
  }
  function totalQuantity() {
    return cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
  }
  function save() { sessionStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  function render() {
    if (!cart.length) {
      content.hidden = true;
      empty.hidden = false;
      return;
    }
    content.hidden = false;
    empty.hidden = true;
    list.innerHTML = '';
    cart.forEach(function (item, index) {
      item.item_variant = 'single';
      item.base_unit_price = UNIT_PRICE;
      item.unit_count = 1;
      item.price = item.quantity >= 2 ? DISCOUNTED_UNIT_PRICE : UNIT_PRICE;
      var article = document.createElement('article');
      article.className = 'cart-item';
      article.innerHTML = '<img src="assets/images/product-01.jpg" alt="애플 리셋 패치">' +
        '<div><h2>Apple Reset Patch</h2><p class="variant">애플 리셋 패치</p>' +
        '<div class="quantity" aria-label="수량 변경"><button type="button" data-action="decrease" aria-label="수량 줄이기">−</button><span aria-live="polite">' + item.quantity + '</span><button type="button" data-action="increase" aria-label="수량 늘리기">+</button></div></div>' +
        '<div class="item-side"><div class="item-price">' + money(lineValue(item)) + '</div><button type="button" class="remove" data-action="remove">삭제</button></div>';
      article.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('click', function () { update(index, button.dataset.action); });
      });
      list.appendChild(article);
    });
    save();
    var summary = priceSummary();
    regularTotal.textContent = money(summary.regularTotal);
    discount.textContent = summary.discount ? '-' + money(summary.discount) : '0원';
    subtotal.textContent = money(summary.discountedTotal);
    shipping.textContent = summary.shipping ? money(summary.shipping) : '무료';
    total.textContent = money(summary.finalTotal);
    shippingMessage.innerHTML = FIRST_PURCHASE_FREE_SHIPPING ? '<strong>첫 구매 무료배송 혜택이 적용되었습니다</strong>' : (summary.remainingForFreeShipping ? '<strong>' + money(summary.remainingForFreeShipping) + '</strong>만 더 구매하면 무료배송' : '<strong>무료배송 혜택이 적용되었습니다</strong>');
    shippingBar.style.width = (FIRST_PURCHASE_FREE_SHIPPING ? 100 : Math.min(summary.discountedTotal / FREE_SHIPPING_THRESHOLD * 100, 100)) + '%';
    shippingProgress.setAttribute('aria-valuenow', String(FIRST_PURCHASE_FREE_SHIPPING ? FREE_SHIPPING_THRESHOLD : Math.min(summary.discountedTotal, FREE_SHIPPING_THRESHOLD)));
    shippingProgress.setAttribute('aria-valuetext', FIRST_PURCHASE_FREE_SHIPPING ? '첫 구매 무료배송 적용 완료' : (summary.remainingForFreeShipping ? '무료배송까지 ' + money(summary.remainingForFreeShipping) : '무료배송 적용 완료'));
  }

  function update(index, action) {
    var item = cart[index];
    var previous = item.quantity;
    if (action === 'remove') {
      track('remove_from_cart', { currency: 'KRW', value: lineValue(item), items: [item] });
      cart.splice(index, 1);
    } else if (action === 'decrease' && previous === 1) {
      return;
    } else {
      item.quantity += action === 'increase' ? 1 : -1;
      item.price = item.quantity >= 2 ? DISCOUNTED_UNIT_PRICE : UNIT_PRICE;
      track('cart_quantity_update', {
        item_id: item.item_id,
        previous_quantity: previous,
        new_quantity: item.quantity,
        update_method: action
      });
    }
    save();
    render();
  }

  if (cart.length) track('view_cart', { currency: 'KRW', value: totalValue(), items: cart });
  render();

  var continueShopping = document.getElementById('continue-shopping');
  var purchaseButton = document.getElementById('cart-news-signup');
  var headerHomeText = document.getElementById('cart-header-home-text');
  var headerHomeLogo = document.getElementById('cart-header-home-logo');
  var headerNews = document.getElementById('cart-header-news');
  var emptyCartShop = document.getElementById('empty-cart-shop');
  if (continueShopping) continueShopping.addEventListener('click', function () {
    track('select_content', { content_type: 'navigation', content_id: 'cart_continue_shopping', placement: 'cart', destination: 'product' });
  });
  if (headerHomeText) headerHomeText.addEventListener('click', function () {
    track('select_content', { content_type: 'navigation', content_id: 'cart_header_home_text', placement: 'cart_header' });
  });
  if (headerHomeLogo) headerHomeLogo.addEventListener('click', function () {
    track('select_content', { content_type: 'navigation', content_id: 'cart_header_home_logo', placement: 'cart_header' });
  });
  if (headerNews) headerNews.addEventListener('click', function () {
    track('select_content', { content_type: 'cta', content_id: 'cart_header_news', placement: 'cart_header', destination: 'apply' });
  });
  if (emptyCartShop) emptyCartShop.addEventListener('click', function () {
    track('select_content', { content_type: 'navigation', content_id: 'empty_cart_shop', placement: 'empty_cart' });
  });

  if (purchaseButton) {
    purchaseButton.addEventListener('click', function () {
      var summary = priceSummary();
      var transactionId = 'SENMI-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      var purchaseItems = cart.map(function (item) {
        return {
          item_id: item.item_id || 'apple_reset_patch',
          item_name: 'Apple Reset Patch',
          item_variant: item.item_variant || 'single',
          price: item.quantity >= 2 ? DISCOUNTED_UNIT_PRICE : UNIT_PRICE,
          quantity: item.quantity
        };
      });
      var purchaseData = {
        transaction_id: transactionId,
        currency: 'KRW',
        value: summary.finalTotal,
        shipping: summary.shipping,
        items: purchaseItems
      };
      sessionStorage.setItem('senmi_pending_purchase', JSON.stringify(purchaseData));
      track('begin_checkout', {
        currency: purchaseData.currency,
        value: purchaseData.value,
        items: purchaseData.items
      });
      var debugQuery = new URLSearchParams(location.search).get('ga_debug') === '1' ? '?ga_debug=1&purchase=20261106-1' : '?purchase=20261106-1';
      setTimeout(function () {
        window.location.href = 'https://hanchaen.github.io/senmi-site/result.html' + debugQuery;
      }, 150);
    });
  }
})();
