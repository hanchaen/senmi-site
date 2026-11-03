(function () {
  var CART_KEY = 'senmi_cart';
  var UNIT_PRICE = 28000;
  var DISCOUNTED_UNIT_PRICE = 22400;
  var cart = [];
  try { cart = JSON.parse(sessionStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }

  var content = document.getElementById('cart-content');
  var empty = document.getElementById('empty-cart');
  var list = document.getElementById('cart-list');
  var subtotal = document.getElementById('subtotal');
  var total = document.getElementById('cart-total');

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
    subtotal.textContent = money(totalValue());
    total.textContent = money(totalValue());
  }

  function update(index, action) {
    var item = cart[index];
    var previous = item.quantity;
    if (action === 'remove' || (action === 'decrease' && previous === 1)) {
      track('remove_from_cart', { currency: 'KRW', value: lineValue(item), items: [item] });
      cart.splice(index, 1);
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
  if (headerNews) headerNews.addEventListener('click', function () {
    track('select_content', { content_type: 'cta', content_id: 'cart_header_news', placement: 'cart_header', destination: 'apply' });
  });
  if (emptyCartShop) emptyCartShop.addEventListener('click', function () {
    track('select_content', { content_type: 'navigation', content_id: 'empty_cart_shop', placement: 'empty_cart' });
  });

  var modal = document.getElementById('purchase-modal');
  var form = document.getElementById('purchase-interest-form');
  var closeButton = document.getElementById('purchase-modal-close');
  var nameInput = document.getElementById('purchase-name');
  var emailInput = document.getElementById('purchase-email');
  var nameError = document.getElementById('purchase-name-error');
  var emailError = document.getElementById('purchase-email-error');
  var toast = document.getElementById('purchase-toast');
  var toastTimer;

  function openPurchaseModal() {
    track('purchase_intent', {
      item_id: 'apple_reset_patch',
      quantity: totalQuantity(),
      value: totalValue(),
      currency: 'KRW',
      placement: 'cart'
    });
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-lock');
    nameInput.focus();
  }

  function closePurchaseModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-lock');
    nameError.textContent = '';
    emailError.textContent = '';
    purchaseButton.focus();
  }

  if (purchaseButton && modal && form) {
    purchaseButton.addEventListener('click', openPurchaseModal);
    closeButton.addEventListener('click', closePurchaseModal);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) closePurchaseModal();
    });
    document.addEventListener('keydown', function (event) {
      if (!modal.classList.contains('open')) return;
      if (event.key === 'Escape') {
        closePurchaseModal();
        return;
      }
      if (event.key === 'Tab') {
        var focusable = Array.prototype.slice.call(modal.querySelectorAll('input, button')).filter(function (element) { return !element.disabled; });
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      nameError.textContent = nameInput.value.trim() ? '' : '이름을 입력해 주세요.';
      emailError.textContent = emailInput.validity.valid && emailInput.value.trim() ? '' : '올바른 이메일 주소를 입력해 주세요.';
      if (nameError.textContent || emailError.textContent) {
        (nameError.textContent ? nameInput : emailInput).focus();
        return;
      }
      nameInput.value = '';
      emailInput.value = '';
      closePurchaseModal();
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.hidden = true; }, 3000);
    });
  }
})();