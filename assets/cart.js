(function () {
  var CART_KEY = 'senmi_cart';
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
  function variantLabel(value) { return value === '2_pack' ? '애플 리셋 패치 2개' : '애플 리셋 패치 1개'; }
  function totalValue() { return cart.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0); }
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
      var article = document.createElement('article');
      article.className = 'cart-item';
      article.innerHTML = '<img src="assets/images/product-01.jpg" alt="애플 리셋 패치">' +
        '<div><h2>Apple Reset Patch</h2><p class="variant">' + variantLabel(item.item_variant) + '</p>' +
        '<div class="quantity" aria-label="수량 변경"><button type="button" data-action="decrease" aria-label="수량 줄이기">−</button><span aria-live="polite">' + item.quantity + '</span><button type="button" data-action="increase" aria-label="수량 늘리기">+</button></div></div>' +
        '<div class="item-side"><div class="item-price">' + money(item.price * item.quantity) + '</div><button type="button" class="remove" data-action="remove">삭제</button></div>';
      article.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('click', function () { update(index, button.dataset.action); });
      });
      list.appendChild(article);
    });
    subtotal.textContent = money(totalValue());
    total.textContent = money(totalValue());
  }

  function update(index, action) {
    var item = cart[index];
    var previous = item.quantity;
    if (action === 'remove' || (action === 'decrease' && previous === 1)) {
      track('remove_from_cart', { currency: 'KRW', value: item.price * item.quantity, items: [item] });
      cart.splice(index, 1);
    } else {
      item.quantity += action === 'increase' ? 1 : -1;
      track('cart_quantity_update', {
        item_id: item.item_id,
        item_variant: item.item_variant,
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
  var newsSignup = document.getElementById('cart-news-signup');
  var headerHomeText = document.getElementById('cart-header-home-text');
  var headerHomeLogo = document.getElementById('cart-header-home-logo');
  var headerNews = document.getElementById('cart-header-news');
  var emptyCartShop = document.getElementById('empty-cart-shop');
  if (continueShopping) continueShopping.addEventListener('click', function () {
    track('select_content', { content_type: 'navigation', content_id: 'cart_continue_shopping', placement: 'cart', destination: 'product' });
  });
  if (newsSignup) newsSignup.addEventListener('click', function () {
    track('select_content', { content_type: 'cta', content_id: 'cart_news_signup', placement: 'cart', destination: 'apply' });
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
})();

