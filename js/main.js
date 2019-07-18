/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// JSON Sever URL https://desolate-fortress-87231.herokuapp.com/

// JSON.parse(轉物件陣列);
// JSON.stringify(轉字串);

// 選單控制
const menuToggle = document.getElementById('menuToggle');
menuToggle.addEventListener('click', (() => {
  document.getElementById('menu').classList.toggle('header__menu--open');
}));

let products = [];
let orders = [];
let coupons = [];
let isnew = false;
let isnum = '';

const productsList = document.getElementById('productsList');
const orderList = document.getElementById('orderList');
const couponList = document.getElementById('couponList');
const loading = document.getElementById('loading');

// product
// 取得產品資料
function getProduct() {
  if (window.location.pathname === '/product.html') {
    loading.style.display = 'flex';
  }
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open('GET', 'https://desolate-fortress-87231.herokuapp.com/products');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send();

  xhr.addEventListener('readystatechange', (() => {
    if (xhr.readyState === 4) {
      products = JSON.parse(xhr.responseText);
      // 重新排列，由新到舊
      products = products.sort((a, b) => (a.id < b.id ? 1 : -1));
      // eslint-disable-next-line no-use-before-define
      getProductsList();
      loading.style.display = 'none';
    }
  }));
}
window.addEventListener('load', getProduct);

// 取得產品頁
function getProductsList() {
  let str = '';

  if (window.location.pathname === '/product.html') {
    products.forEach((item) => {
      const originPriceFilter = item.origin_price.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
      const priceFilter = item.price.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
      str += `
      <li class="product__block">
        <div class="product__image" style="background-image: url('${item.imageUrl}')"></div>
        <div class="product__name">
          <p>${item.category}</p>
          <p>${item.title}</p>
        </div>
        <p>$${priceFilter}</p>
        <del>$${originPriceFilter}</del>
        <form class="product__button">
          <button id="deletBtn" data-type="delet" data-index="${item.id}" type="button">刪除</button>
          <button id="modifyBtn" data-type="modify" data-index="${item.id}" type="button">編輯</button>
        </form>
      </li>`;
    });
    productsList.innerHTML = str;
  }
}

// 刪除 & 編輯商品
if (window.location.pathname === '/product.html') {
  productsList.addEventListener('click', ((event) => {
    event.preventDefault();
    if (event.target.nodeName !== 'BUTTON') {
      return;
    }
    const num = event.target.dataset.index;
    if (event.target.dataset.type === 'delet') {
      loading.style.display = 'flex';
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.open('DELETE', `https://desolate-fortress-87231.herokuapp.com/products/${num}`);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send();
      xhr.addEventListener('readystatechange', (() => {
        if (xhr.readyState === 4) {
          getProduct();
          loading.style.display = 'none';
        }
      }));
    } else if (event.target.dataset.type === 'modify') {
      // eslint-disable-next-line no-use-before-define
      openProductModal('modify', num);
      loading.style.display = 'none';
    }
  }));
}

// 編輯商品
const newProductOpen = document.getElementById('newProductOpen');
const newProductClose = document.getElementById('newProductClose');
const newProduct = document.getElementById('newProduct');

const newProductTitle = document.getElementById('newProductTitle');
const newProductCategory = document.getElementById('newProductCategory');
const newProductOriginPrice = document.getElementById('newProductOriginPrice');
const newProductPrice = document.getElementById('newProductPrice');
const newProductUnit = document.getElementById('newProductUnit');
const newProductIsnabled = document.getElementById('newProductIsnabled');
const newProductImg = document.getElementById('newProductImg');
const productImg = document.getElementById('productImg');


function openProductModal(activity, num) {
  newProduct.classList.toggle('newproduct--open');
  newProduct.classList.toggle('newproduct--close');

  // 先清空欄位
  switch (true) {
    default:
      newProductTitle.value = '';
      newProductCategory.value = '';
      newProductOriginPrice.value = '';
      newProductPrice.value = '';
      newProductUnit.value = '';
      newProductIsnabled.checked = false;
      newProductImg.value = '';
      productImg.setAttribute('src', '');
      break;
  }
  if (activity === 'modify') {
    // 編輯則放入產品細節
    isnew = false;
    isnum = num;
    let product = [];
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', `https://desolate-fortress-87231.herokuapp.com/products/${isnum}`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
    xhr.addEventListener('readystatechange', (() => {
      if (xhr.readyState === 4) {
        // 將資料寫入 localStorage
        product = JSON.parse(xhr.responseText);
        // eslint-disable-next-line no-use-before-define
        newProductTitle.value = product.title;
        newProductCategory.value = product.category;
        newProductOriginPrice.value = product.origin_price;
        newProductPrice.value = product.price;
        newProductUnit.value = product.unit;
        newProductIsnabled.checked = product.is_enabled;
        newProductImg.value = product.imageUrl;
        productImg.setAttribute('src', product.imageUrl);
      }
    }));
  } else {
    // 新增則更改狀態;
    isnew = true;
    // 新增圖片時，預覽圖片
    newProductImg.addEventListener('change', (() => {
      productImg.setAttribute('src', newProductImg.value);
    }));
  }
}
if (window.location.pathname === '/product.html') {
  newProductOpen.addEventListener('click', openProductModal);
  newProductClose.addEventListener('click', openProductModal);
}

// 送出商品資訊
const newProductSubmit = document.getElementById('newProductSubmit');

function addNewProduct() {
  let httpMethods = 'POST';
  if (isnew === false) {
    httpMethods = 'PATCH';
  }
  loading.style.display = 'flex';
  const data = `title=${newProductTitle.value}&category=${newProductCategory.value}&origin_price=${newProductOriginPrice.value}&price=${newProductPrice.value}&unit=${newProductUnit.value}&is_enabled=${newProductIsnabled.checked}&imageUrl=${newProductImg.value}`;
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open(`${httpMethods}`, `https://desolate-fortress-87231.herokuapp.com/products/${isnum}`);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(data);
  xhr.addEventListener('readystatechange', (() => {
    if (xhr.readyState === 4) {
      newProduct.classList.toggle('newproduct--open');
      newProduct.classList.toggle('newproduct--close');
      getProduct();
      loading.style.display = 'none';
    }
  }));
}
if (window.location.pathname === '/product.html') {
  newProductSubmit.addEventListener('click', addNewProduct);
}

// 搜尋產品
const selectProduct = document.getElementById('selectProduct');
const selectProductBtn = document.getElementById('selectProductBtn');

function toSelectProduct(event) {
  if (event.keyCode === 13) {
    loading.style.display = 'flex';
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', `https://desolate-fortress-87231.herokuapp.com/products?q=${selectProduct.value}`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
    xhr.addEventListener('readystatechange', (() => {
      if (xhr.readyState === 4) {
        products = JSON.parse(xhr.responseText);
        products = products.sort((a, b) => (a.id < b.id ? 1 : -1));
        getProductsList();
        loading.style.display = 'none';
      }
    }));
  } else if (event.target.id === 'selectProductBtn') {
    loading.style.display = 'flex';
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', `https://desolate-fortress-87231.herokuapp.com/products?q=${selectProduct.value}`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
    xhr.addEventListener('readystatechange', (() => {
      if (xhr.readyState === 4) {
        products = JSON.parse(xhr.responseText);
        products = products.sort((a, b) => (a.id < b.id ? 1 : -1));
        getProductsList();
        loading.style.display = 'none';
      }
    }));
  }
}
if (window.location.pathname === '/product.html') {
  selectProduct.addEventListener('keyup', toSelectProduct);
  selectProductBtn.addEventListener('click', toSelectProduct);
}

// order
// 取得訂單資料
function getOrders() {
  if (window.location.pathname === '/index.html' || window.location.pathname === '/orders.html') {
    loading.style.display = 'flex';
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', 'https://desolate-fortress-87231.herokuapp.com/order');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
    xhr.addEventListener('readystatechange', (() => {
      if (xhr.readyState === 4) {
        orders = JSON.parse(xhr.responseText);
        // eslint-disable-next-line max-len
        orders = orders.sort((a, b) => (Date.parse(a.createTime) < Date.parse(b.createTime) ? 1 : -1));
        // eslint-disable-next-line no-use-before-define
        getOrdersList();
        // eslint-disable-next-line no-use-before-define
        getIndexReport();
        loading.style.display = 'none';
      }
    }));
  }
}
window.addEventListener('load', getOrders());

// 取得訂單頁
function getOrdersList() {
  let ispaid = '';
  let product = '';
  let str = '';

  if (window.location.pathname === '/orders.html') {
    orders.forEach((item) => {
      if (item.is_paid) {
        ispaid = '已完成付款';
      } else {
        ispaid = '未完成付款';
      }
      // 印出購物車清單
      item.product.forEach((itemProduct) => {
        if (itemProduct.title !== '') {
          product += `<p>${itemProduct.title}× ${itemProduct.qty}</p>`;
        }
      });
      const originPriceFilter = item.price.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
      let priceCost = '';
      if (item.useCoupon.cost !== '') {
        priceCost = Math.ceil(item.price * item.useCoupon.cost);
      } else {
        priceCost = Math.ceil(item.price * 1);
      }
      const priceCostFilter = priceCost.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');

      if (item.useCoupon.cost !== '') {
        str += `
          <li class="order__block">
            <div class="order__date">
              <p>${item.createTime}</p>
              <p>訂單編號：${item.order_id}</p>
            </div>
            <div class="order__flex">
              <div class="order__guest">
                <p>${item.guest.name}</p>
                <p>${item.guest.tel}</p>
              </div>
              <div class="order__products">
                ${product}
              </div>
              <div class="order__price">
                <div>
                  <p>$ ${priceCostFilter}</p>
                  <del>$ ${originPriceFilter}</del>
                </div>
                <p>已套用優惠卷</p>
              </div>
            </div>
            <p>${ispaid}</p>
            <button type="button" data-index="${item.id}" data-type="local" class="order__button">刪除</button>
          </li>`;
      } else {
        str += `
          <li class="order__block">
            <div class="order__date">
              <p>${item.createTime}</p>
              <p>訂單編號：${item.order_id}</p>
            </div>
            <div class="order__flex">
              <div class="order__guest">
                <p>${item.guest.name}</p>
                <p>${item.guest.tel}</p>
              </div>
              <div class="order__products">
                ${product}
              </div>
              <div class="order__price">
                <div>
                  <p>$ ${originPriceFilter}</p>
                </div>
              </div>
            </div>
            <p>${ispaid}</p>
            <button type="button" data-index="${item.id}" data-type="local" class="order__button">刪除</button>
          </li>`;
      }
      product = ''; // 清空產品變數，避免迴圈累加產品
    });
    orderList.innerHTML = str;
  }
}

// 建立新訂單
const newOrderOpen = document.getElementById('newOrderOpen');
const newOrderClose = document.getElementById('newOrderClose');
const newOrder = document.getElementById('newOrder');

let tempProduct = {
  qty: '1',
};
let cartList = JSON.parse(localStorage.getItem('cartListLocal')) || [];
let carttotalarr = [];
let carttotal = '';
let tempNewOrder = {
  useCoupon: {
    name: '',
    cost: '',
  },
};
let tempGuest = {};
let paid = false; // 判斷是否已完成付款
let useCoupon = false; // 判斷是否有使用優惠卷
const newOrderProductCheck = document.getElementById('newOrderProductCheck');
const newOrderPrice = document.getElementById('newOrderPrice');
const orderCoupon = document.getElementById('orderCoupon');
const orderCouponCheck = document.getElementById('orderCouponCheck');
const newOrderPaid = document.getElementById('newOrderPaid');

const newOrderName = document.getElementById('newOrderName');
const newOrderNameCheck = document.getElementById('newOrderNameCheck');
const newOrderTel = document.getElementById('newOrderTel');
const newOrderTelCheck = document.getElementById('newOrderTelCheck');
const newOrderAdd = document.getElementById('newOrderAdd');
const newOrderAddCheck = document.getElementById('newOrderAddCheck');
const newOrderEmail = document.getElementById('newOrderEmail');
const newOrderEmailCheck = document.getElementById('newOrderEmailCheck');
const newOrderSubmit = document.getElementById('newOrderSubmit');

function openOrderModal() {
  newOrder.classList.toggle('neworder--open');
  newOrder.classList.toggle('neworder--close');

  const orderProduct = document.getElementById('orderProduct');
  let str = '';
  products.forEach((item) => {
    str += `
      <li class="products">
        <div class="products__img" style="background-image: url('${item.imageUrl}')"></div>
        <div class="products__info">
          <p>${item.category}</p>
          <p>${item.title}</p>
          <div class="products__price">
            <del>$ ${item.origin_price.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}</del>
            <p>$ ${item.price.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}</p>
          </div>
          <form class="products__form" action="">
            <select class="products__select" data-index="${item.id}" name="selectqty" id="">
              <option value="1">選購 1 盆</option>
              <option value="2">選購 2 盆</option>
              <option value="3">選購 3 盆</option>
              <option value="4">選購 4 盆</option>
              <option value="5">選購 5 盆</option>
              <option value="6">選購 6 盆</option>
              <option value="7">選購 7 盆</option>
              <option value="8">選購 8 盆</option>
              <option value="9">選購 9 盆</option>
              <option value="10">選購 10 盆</option>
            </select>
            <button class="products__button" type="button" data-index="${item.id}" name="addtocartbtn">加入購物車</button>
          </form>
        </div>
      </li>
    `;
  });
  orderProduct.innerHTML = str;

  // 取得欲加入購物車的商品數量
  const selectqty = document.getElementsByName('selectqty');
  selectqty.forEach((item) => {
    item.addEventListener('change', () => {
      tempProduct.qty = '';
      tempProduct.qty = item.value;
    });
  });

  // 加到購物車
  const addtocartbtn = document.getElementsByName('addtocartbtn');
  addtocartbtn.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const num = event.target.dataset.index;
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.open('GET', `https://desolate-fortress-87231.herokuapp.com/products/${num}`);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send();
      xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
          const product = JSON.parse(xhr.responseText);
          tempProduct.category = product.category;
          tempProduct.id = product.id;
          tempProduct.imageUrl = product.imageUrl;
          tempProduct.origin_price = product.origin_price;
          tempProduct.price = product.price;
          tempProduct.title = product.title;
          tempProduct.unit = product.unit;
          // 將商品加入購物車
          cartList.splice(0, 0, tempProduct);
          // 將購物車存放至 localStorage
          localStorage.setItem('cartListLocal', JSON.stringify(cartList));
          // 將商品重置，避免數量及商品錯誤
          tempProduct = {
            qty: '1',
          };
          // eslint-disable-next-line no-use-before-define
          getCartList();
        }
      });
    });
  });

  // 取得購物車列表
  function getCartList() {
    let cartstr = '';
    carttotalarr = [];
    carttotal = '';
    if (cartList.length > 0) {
      cartList.forEach((item) => {
        cartstr += `
        <p>${item.title} × ${item.qty} ${item.unit}<i class="far fa-trash-alt" name="delcartbtn"></i></p>
        `;
        carttotalarr.splice(0, 0, (item.price * item.qty));
      });
      // 將購物車內所有商品價格加總
      carttotal = carttotalarr.reduce((a, b) => Number(a) + Number(b), 0);
    } else {
      cartstr += '<p>您尚未選購商品！</p>';
      carttotal = 0;
    }
    newOrderProductCheck.innerHTML = cartstr;
    // 判斷是否有使用優惠卷
    if (useCoupon) {
      newOrderPrice.textContent = `$ ${Math.ceil(carttotal * Number(tempNewOrder.useCoupon.cost)).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}`;
    } else {
      newOrderPrice.textContent = `$ ${carttotal.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}`;
    }
    // eslint-disable-next-line no-use-before-define
    delCart();
  }

  // 刪除購物車內商品
  function delCart() {
    const delcartbtn = document.getElementsByName('delcartbtn');
    delcartbtn.forEach((item, index) => {
      item.addEventListener('click', () => {
        cartList.splice(index, 1);
        // 更新 localStorage 內的購物車列表
        localStorage.setItem('cartListLocal', JSON.stringify(cartList));
        getCartList();
      });
    });
    // 如果購物車為空 則重置優惠卷資訊
    if (cartList.length === 0) {
      orderCoupon.value = '';
      orderCouponCheck.style.display = 'inline';
      orderCouponCheck.style.color = '#4A593D';
      orderCouponCheck.textContent = '輸入：onsale，即可享 7 折優惠';
      useCoupon = false;
    }
  }

  // 使用優惠卷
  orderCoupon.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
      coupons.forEach((item) => {
        if (item.code === orderCoupon.value) {
          carttotal = Math.ceil(item.cost * carttotal);
          newOrderPrice.textContent = `$ ${carttotal.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}`;
          orderCouponCheck.style.display = 'block';
          orderCouponCheck.style.color = '#86C166';
          orderCouponCheck.textContent = '折扣成功!';
          tempNewOrder.useCoupon = {};
          tempNewOrder.useCoupon.name = item.code;
          tempNewOrder.useCoupon.cost = item.cost;
          useCoupon = true;
        } else {
          orderCouponCheck.style.display = 'block';
          orderCouponCheck.style.color = '#C73E3A';
          orderCouponCheck.textContent = '優惠代碼錯誤';
          useCoupon = false;
        }
      });
    }
  });

  // 判斷是否完成付款
  newOrderPaid.onclick = () => {
    paid = true;
    newOrderPaid.textContent = '成功付款';
  };
}
if (window.location.pathname === '/orders.html') {
  newOrderOpen.addEventListener('click', openOrderModal);
}

// 檢驗訂單輸入欄位是否正確
if (window.location.pathname === '/orders.html') {
  newOrderSubmit.addEventListener('click', ((event) => {
    let orderName = false;
    let orderAdd = false;
    let orderTel = false;
    let orderEmail = false;
    // 訂購人姓名
    if (newOrderName.value === '') {
      newOrderName.style.borderBottom = '2px solid #C73E3A';
      newOrderNameCheck.style.display = 'inline';
      orderName = false;
    } else {
      newOrderName.style.borderBottom = '2px solid #9eb386';
      newOrderNameCheck.style.display = 'none';
      orderName = true;
    }
    // 訂購人電話
    if (newOrderTel.value === '') {
      newOrderTel.style.borderBottom = '2px solid #C73E3A';
      newOrderTelCheck.style.display = 'inline';
      orderTel = false;
    } else {
      newOrderTel.style.borderBottom = '2px solid #9eb386';
      newOrderTelCheck.style.display = 'none';
      orderTel = true;
    }
    // 訂購人地址
    if (newOrderAdd.value === '') {
      newOrderAdd.style.borderBottom = '2px solid #C73E3A';
      newOrderAddCheck.style.display = 'inline';
      orderAdd = false;
    } else {
      newOrderAdd.style.borderBottom = '2px solid #9eb386';
      newOrderAddCheck.style.display = 'none';
      orderAdd = true;
    }
    // 訂購人電子郵件
    const emailRule = /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    if (newOrderEmail.value === '') {
      newOrderEmail.style.borderBottom = '2px solid #C73E3A';
      newOrderEmailCheck.style.display = 'inline';
      orderEmail = false;
    } else if (emailRule.test(newOrderEmail.value)) {
      newOrderEmail.style.borderBottom = '2px solid #9eb386';
      newOrderEmailCheck.style.display = 'none';
      orderEmail = true;
    } else {
      newOrderEmail.style.borderBottom = '2px solid #C73E3A';
      newOrderEmailCheck.style.display = 'inline';
      newOrderEmailCheck.textContent = '電子郵件輸入錯誤';
      orderEmail = false;
    }
    if (orderAdd === true && orderName === true && orderTel === true && orderEmail === true) {
      // eslint-disable-next-line no-use-before-define
      submitNewOrder(event);
    }
  }));
}

// 送出訂單資訊
function submitNewOrder(event) {
  if (window.location.pathname === '/orders.html') {
    const toDay = new Date();
    tempNewOrder.createTime = `${toDay.getFullYear()}-${(`0${toDay.getMonth() + 1}`).substr(-2)}-${(`0${toDay.getDate()}`).substr(-2)}`;
    tempNewOrder.order_id = (() => {
      const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
      let res = '';
      for (let i = 0; i < 10; i += 1) {
        const id = Math.ceil(Math.random() * 35);
        res += chars[id];
      }
      return res;
    })();
    tempNewOrder.is_paid = paid;
    tempGuest.address = newOrderAdd.value;
    tempGuest.email = newOrderEmail.value;
    tempGuest.name = newOrderName.value;
    tempGuest.tel = newOrderTel.value;
    tempNewOrder.guest = tempGuest;
    tempNewOrder.price = carttotal;
    tempNewOrder.product = cartList;
    loading.style.display = 'flex';
    const data = JSON.stringify(tempNewOrder);
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('POST', 'https://desolate-fortress-87231.herokuapp.com/order');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === 4) {
        // eslint-disable-next-line no-use-before-define
        resetCart(event);
        getOrders();
        loading.style.display = 'none';
      }
    });
  }
}

// 清空購物車 & 訂單資訊
function resetCart(event) {
  newOrder.classList.toggle('neworder--open');
  newOrder.classList.toggle('neworder--close');
  tempProduct = {
    qty: '1',
  };
  tempGuest = {};
  newOrderAdd.value = '';
  newOrderEmail.value = '';
  newOrderName.value = '';
  newOrderTel.value = '';
  if (event.target.dataset.type === 'newOrderSubmit') {
    // 若送出訂單則清空購物車資訊、優惠卷資訊
    cartList = [];
    localStorage.setItem('cartListLocal', JSON.stringify(cartList));
    newOrderPrice.textContent = '$ 0';
    newOrderProductCheck.innerHTML = '<p>您尚未選購商品！</p>';
    orderCoupon.value = '';
    orderCouponCheck.style.display = 'inline';
    orderCouponCheck.style.color = '#4A593D';
    orderCouponCheck.textContent = '輸入：onsale，即可享 7 折優惠';
    useCoupon = false;
    tempNewOrder = {
      useCoupon: {},
    };
  } else {
    paid = false;
    newOrderPaid.textContent = '確認付款';
  }
}
if (window.location.pathname === '/orders.html') {
  newOrderClose.addEventListener('click', resetCart);
}

// 刪除訂單
if (window.location.pathname === '/orders.html') {
  orderList.addEventListener('click', ((event) => {
    event.preventDefault();
    if (event.target.nodeName !== 'BUTTON') {
      return;
    }
    loading.style.display = 'flex';
    const num = event.target.dataset.index;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('DELETE', `https://desolate-fortress-87231.herokuapp.com/order/${num}`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
    xhr.addEventListener('readystatechange', (() => {
      if (xhr.readyState === 4) {
        getOrders();
        loading.style.display = 'none';
      }
    }));
  }));
}

// 搜尋訂單
const selectOrder = document.getElementById('selectOrder');
const selectOrderBtn = document.getElementById('selectOrderBtn');
function toSelectOrder(event) {
  if (event.keyCode === 13) {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', `https://desolate-fortress-87231.herokuapp.com/order?q=${selectOrder.value}`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
    xhr.addEventListener('readystatechange', (() => {
      if (xhr.readyState === 4) {
        orders = JSON.parse(xhr.responseText);
        // eslint-disable-next-line max-len
        orders = orders.sort((a, b) => (Date.parse(a.createTime) < Date.parse(b.createTime) ? 1 : -1));
        getOrdersList();
      }
    }));
  } else if (event.target.id === 'selectOrderBtn') {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', `https://desolate-fortress-87231.herokuapp.com/order?q=${selectOrder.value}`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
    xhr.addEventListener('readystatechange', (() => {
      if (xhr.readyState === 4) {
        orders = JSON.parse(xhr.responseText);
        // eslint-disable-next-line max-len
        orders = orders.sort((a, b) => (Date.parse(a.createTime) < Date.parse(b.createTime) ? 1 : -1));
        getOrdersList();
      }
    }));
  }
}
if (window.location.pathname === '/orders.html') {
  selectOrder.addEventListener('keyup', toSelectOrder);
  selectOrderBtn.addEventListener('click', toSelectOrder);
}

// 取得優惠劵資料
function getCoupon() {
  loading.style.display = 'flex';
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open('GET', 'https://desolate-fortress-87231.herokuapp.com/coupon');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send();
  xhr.addEventListener('readystatechange', () => {
    if (xhr.readyState === 4) {
      coupons = JSON.parse(xhr.responseText);
      // eslint-disable-next-line no-use-before-define
      getCouponList();
      loading.style.display = 'none';
    }
  });
}
window.addEventListener('load', getCoupon());


// 取得優惠劵
function getCouponList() {
  let str = '';

  if (window.location.pathname === '/coupon.html') {
    const toDay = new Date();
    coupons.forEach((item) => {
      str += `
      <li class="coupon__block">
        <p>${toDay.getFullYear()}-${(`0${toDay.getMonth() + 1}`).substr(-2)}-${(`0${toDay.getDate()}`).substr(-2)}</p>
        <p>${item.code}</p>
        <p>${item.cost * 100} %</p>
        <form class="coupon__button">
          <button data-type="delet" data-index="${item.id}">刪除</button>
          <button data-type="modify" data-index="${item.id}">編輯</button>
        </form>
      </li>`;
    });
    couponList.innerHTML = str;
  }
}

// 刪除 & 編輯優惠劵
if (window.location.pathname === '/coupon.html') {
  couponList.addEventListener('click', ((event) => {
    event.preventDefault();
    if (event.target.nodeName !== 'BUTTON') {
      return;
    }
    const num = event.target.dataset.index;
    if (event.target.dataset.type === 'delet') {
      loading.style.display = 'flex';
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.open('DELETE', `https://desolate-fortress-87231.herokuapp.com/coupon/${num}`);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send();
      xhr.addEventListener('readystatechange', (() => {
        if (xhr.readyState === 4) {
          getCoupon();
          loading.style.display = 'none';
        }
      }));
    } else if (event.target.dataset.type === 'modify') {
      // eslint-disable-next-line no-use-before-define
      openCouponModal('modify', num);
      loading.style.display = 'none';
    }
  }));
}

// 編輯商品
const newCouponOpen = document.getElementById('newCouponOpen');
const newCouponClose = document.getElementById('newCouponClose');
const newCoupon = document.getElementById('newCoupon');

const newCoupontCode = document.getElementById('newCoupontCode');
const newCoupontCost = document.getElementById('newCoupontCost');

function openCouponModal(activity, num) {
  newCoupon.classList.toggle('newcoupon--open');
  newCoupon.classList.toggle('newcoupon--close');

  // 先清空欄位
  switch (true) {
    default:
      newCoupontCode.value = '';
      newCoupontCost.value = '';
      break;
  }
  if (activity === 'modify') {
    // 編輯則放入優惠劵細節
    isnew = false;
    isnum = num;
    let coupon = [];
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', `https://desolate-fortress-87231.herokuapp.com/coupon/${isnum}`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
    xhr.addEventListener('readystatechange', (() => {
      if (xhr.readyState === 4) {
        // 將資料寫入 localStorage
        coupon = JSON.parse(xhr.responseText);
        newCoupontCode.value = coupon.code;
        newCoupontCost.value = coupon.cost * 100;
      }
    }));
  } else {
    // 新增則更改狀態;
    isnew = true;
  }
}
if (window.location.pathname === '/coupon.html') {
  newCouponOpen.addEventListener('click', openCouponModal);
  newCouponClose.addEventListener('click', openCouponModal);
}

// 送出商品資訊
const newCouponSubmit = document.getElementById('newCouponSubmit');

function addNewCoupon() {
  let httpMethods = 'POST';
  if (isnew === false) {
    httpMethods = 'PATCH';
  }
  loading.style.display = 'flex';
  const data = `code=${newCoupontCode.value}&cost=${newCoupontCost.value / 100}`;
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open(`${httpMethods}`, `https://desolate-fortress-87231.herokuapp.com/coupon/${isnum}`);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(data);
  xhr.addEventListener('readystatechange', (() => {
    if (xhr.readyState === 4) {
      newCoupon.classList.toggle('newcoupon--open');
      newCoupon.classList.toggle('newcoupon--close');
      getCoupon();
      loading.style.display = 'none';
    }
  }));
}
if (window.location.pathname === '/coupon.html') {
  newCouponSubmit.addEventListener('click', addNewCoupon);
}

// 首頁分析
function getIndexReport() {
  if (window.location.pathname === '/index.html') {
    // 營業額
    const totalOrderPriceArr = [];
    orders.forEach((item) => {
      totalOrderPriceArr.splice(0, 0, item.price);
    });
    const totalPrice = totalOrderPriceArr.reduce((a, b) => Number(a) + Number(b), 0);
    document.getElementById('totalRevenue').textContent = `$ ${totalPrice.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}`;

    // 各個分類的銷售產品
    const smallSucculent = [];
    const bigSucculent = [];
    const succulentPot = [];
    const succulentGift = [];

    // 取出熱銷品
    const hotProduct = [];
    orders.forEach((obj) => {
      obj.product.forEach((item) => {
        // 取出所有訂單所購買的商品
        for (let i = 0; i < item.qty; i += 1) {
          hotProduct.splice(0, 0, item.title);
        }
        // 取出所有訂單各個分類的商品
        if (item.category === '小型多肉') {
          smallSucculent.splice(0, 0, item);
        } else if (item.category === '大型多肉') {
          bigSucculent.splice(0, 0, item);
        } else if (item.category === '多肉盆栽') {
          succulentPot.splice(0, 0, item);
        } else {
          succulentGift.splice(0, 0, item);
        }
      });
    });

    // 取出全商品的熱銷品陣列中出現次數最多的物件
    let mf = 1;
    let m = 0;
    let item;
    for (let i = 0; i < hotProduct.length; i += 1) {
      for (let j = i; j < hotProduct.length; j += 1) {
        if (hotProduct[i] === hotProduct[j]) { m += 1; }
        if (mf < m) {
          mf = m;
          item = hotProduct[i];
        }
      }
      m = 0;
    }
    document.getElementById('hotProduct').textContent = item;

    // 記算訂單數量
    const totalOrderNum = orders.length;
    document.getElementById('totalOrder').textContent = totalOrderNum;

    // 綜合分析
    // 小型多肉
    // 先取出所有產品名稱及取出分類總銷售額
    let smallRevenue = ''; // 分類總銷售額
    let smallSalesVolume = '';
    let dataTitle = []; // 產品名稱
    // eslint-disable-next-line no-shadow
    smallSucculent.forEach((item) => {
      dataTitle.splice(0, 0, item.title);
      smallRevenue = Number(smallRevenue) + Number(item.price);
      smallSalesVolume = Number(smallSalesVolume) + Number(item.qty);
    });
    document.getElementById('smallRevenue').textContent = `[ $ ${smallRevenue.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}]`;

    // 將各個相同產品所賣出的金額取出相加
    let dataTitleFilter = dataTitle.filter((el, i, arr) => arr.indexOf(el) === i); // 去除重複的商品名稱
    let smallDataArr = new Array(dataTitleFilter.length);
    // eslint-disable-next-line no-shadow
    dataTitleFilter.forEach((item, index) => {
      smallDataArr.splice(index, 1, {
        title: item,
        price: '',
      });
      for (let i = 0; i < smallSucculent.length; i += 1) {
        if (item === smallSucculent[i].title) {
          // eslint-disable-next-line max-len
          smallDataArr[index].price = Number(smallDataArr[index].price) + Number(smallSucculent[i].price);
        }
      }
    });
    smallDataArr = smallDataArr.sort((a, b) => (a.price < b.price ? 1 : -1)); // 重新排列陣列由價錢高至低
    let str = '';
    for (let i = 0; i < 3; i += 1) {
      if (smallDataArr[i] !== undefined) {
        str += `<span>${smallDataArr[i].title} $ ${smallDataArr[i].price}</span>`;
      }
    }
    document.getElementById('smallstr').innerHTML = str; // 印出分類中銷售額最高商品

    // 大型多肉
    // 先取出所有產品名稱
    let bigRevenue = '';
    let bigSalesVolume = '';
    dataTitle = [];
    // eslint-disable-next-line no-shadow
    bigSucculent.forEach((item) => {
      dataTitle.splice(0, 0, item.title);
      bigRevenue = Number(bigRevenue) + Number(item.price);
      bigSalesVolume = Number(bigSalesVolume) + Number(item.qty);
    });
    document.getElementById('bigRevenue').textContent = `[ $ ${bigRevenue.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}]`;

    // 將各個相同產品所賣出的金額取出相加
    dataTitleFilter = dataTitle.filter((el, i, arr) => arr.indexOf(el) === i); // 去除重複的商品名稱
    let bigDataArr = new Array(dataTitleFilter.length);
    // eslint-disable-next-line no-shadow
    dataTitleFilter.forEach((item, index) => {
      bigDataArr.splice(index, 1, {
        title: item,
        price: '',
      });
      for (let i = 0; i < bigSucculent.length; i += 1) {
        if (item === bigSucculent[i].title) {
          bigDataArr[index].price = Number(bigDataArr[index].price) + Number(bigSucculent[i].price);
        }
      }
    });
    bigDataArr = bigDataArr.sort((a, b) => (a.price < b.price ? 1 : -1)); // 重新排列陣列由價錢高至低
    str = '';
    for (let i = 0; i < 3; i += 1) {
      if (bigDataArr[i] !== undefined) {
        str += `<span>${bigDataArr[i].title} $ ${bigDataArr[i].price}</span>`;
      }
    }
    document.getElementById('bigstr').innerHTML = str;

    // 多肉盆栽
    // 先取出所有產品名稱
    let potRevenue = '';
    let potSalesVolume = '';
    dataTitle = [];
    // eslint-disable-next-line no-shadow
    succulentPot.forEach((item) => {
      dataTitle.splice(0, 0, item.title);
      potRevenue = Number(potRevenue) + Number(item.price);
      potSalesVolume = Number(potSalesVolume) + Number(item.qty);
    });
    document.getElementById('potRevenue').textContent = `[ $ ${potRevenue.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}]`;

    // 將各個相同產品所賣出的金額取出相加
    dataTitleFilter = dataTitle.filter((el, i, arr) => arr.indexOf(el) === i); // 去除重複的商品名稱
    let potDataArr = new Array(dataTitleFilter.length);
    // eslint-disable-next-line no-shadow
    dataTitleFilter.forEach((item, index) => {
      potDataArr.splice(index, 1, {
        title: item,
        price: '',
      });
      for (let i = 0; i < succulentPot.length; i += 1) {
        if (item === succulentPot[i].title) {
          potDataArr[index].price = Number(potDataArr[index].price) + Number(succulentPot[i].price);
        }
      }
    });
    potDataArr = potDataArr.sort((a, b) => (a.price < b.price ? 1 : -1)); // 重新排列陣列由價錢高至低
    str = '';
    for (let i = 0; i < 3; i += 1) {
      if (potDataArr[i] !== undefined) {
        str += `<span>${potDataArr[i].title} $ ${potDataArr[i].price}</span>`;
      }
    }
    document.getElementById('potstr').innerHTML = str;

    // 客製禮品
    // 先取出所有產品名稱
    let giftRevenue = '';
    let giftSalesVolume = '';
    dataTitle = [];
    // eslint-disable-next-line no-shadow
    succulentGift.forEach((item) => {
      dataTitle.splice(0, 0, item.title);
      giftRevenue = Number(giftRevenue) + Number(item.price);
      giftSalesVolume = Number(giftSalesVolume) + Number(item.qty);
    });
    document.getElementById('giftRevenue').textContent = `[ $ ${giftRevenue.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}]`;

    // 將各個相同產品所賣出的金額取出相加
    dataTitleFilter = dataTitle.filter((el, i, arr) => arr.indexOf(el) === i); // 去除重複的商品名稱
    let giftDataArr = new Array(dataTitleFilter.length);
    // eslint-disable-next-line no-shadow
    dataTitleFilter.forEach((item, index) => {
      giftDataArr.splice(index, 1, {
        title: item,
        price: '',
      });
      for (let i = 0; i < succulentGift.length; i += 1) {
        if (item === succulentGift[i].title) {
          // eslint-disable-next-line max-len
          giftDataArr[index].price = Number(giftDataArr[index].price) + Number(succulentGift[i].price);
        }
      }
    });
    giftDataArr = giftDataArr.sort((a, b) => (a.price < b.price ? 1 : -1)); // 重新排列陣列由價錢高至低
    str = '';
    for (let i = 0; i < 3; i += 1) {
      if (giftDataArr[i] !== undefined) {
        str += `<span>${giftDataArr[i].title} $ ${giftDataArr[i].price}</span>`;
      }
    }
    document.getElementById('giftstr').innerHTML = str;

    // 切換圖表
    const totalRevenueBtn = document.getElementById('totalRevenueBtn');
    const costinfo = document.getElementById('costinfo');
    const hotProducts = document.getElementById('hotProducts');
    const orderinfo = document.getElementById('orderinfo');

    totalRevenueBtn.addEventListener('click', (() => {
      costinfo.style.display = 'flex';
      hotProducts.style.display = 'none';
      orderinfo.style.display = 'none';
    }));

    const hotProductBtn = document.getElementById('hotProductBtn');
    hotProductBtn.addEventListener('click', (() => {
      costinfo.style.display = 'none';
      hotProducts.style.display = 'flex';
      orderinfo.style.display = 'none';
    }));

    const totalOrderBtn = document.getElementById('totalOrderBtn');
    totalOrderBtn.addEventListener('click', (() => {
      costinfo.style.display = 'none';
      hotProducts.style.display = 'none';
      orderinfo.style.display = 'flex';
    }));

    // 圖表
    // 營業額分析
    Chart.defaults.global.defaultFontFamily = 'Noto Sans TC';
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChartData = {
      type: 'bar',
      data: {
        labels: ['November', 'December', 'January', 'February', 'March', 'April', 'May', 'Now'],
        datasets: [{
          label: 'Total Revenue',
          data: [87506, 68486, 59450, 84302, 74397, 69758, 83470, Number(totalPrice)],
          backgroundColor: ['#A8D8B9', '#F19483', '#75B9BE', '#F3DE8A', '#A8D8B9', '#F19483', '#75B9BE', '#F3DE8A'],
          borderColor: [],
          borderWidth: 0,
        }],
      },
      options: {
        elements: {
          point: {
            radius: 5,
          },
          line: {
            tension: 0, // disables bezier curves
          },
        },
        legend: {
          display: false,
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              stepSize: 5000,
            },
          }],
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    };
    const myChart = new Chart(ctx, myChartData);

    // 總營業額分析
    const ctxcost = document.getElementById('costChart').getContext('2d');
    const costChartData = {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [
            smallSalesVolume,
            bigSalesVolume,
            potSalesVolume,
            giftSalesVolume,
          ],
          backgroundColor: [
            '#A8D8B9',
            '#F19483',
            '#75B9BE',
            '#F3DE8A',
          ],
        }],
        labels: [
          '小型多肉',
          '大型多肉',
          '多肉盆栽',
          '客製禮品',
        ],
      },
      options: {
        responsive: true,
        aspectRatio: 1,
        legend: {
          position: 'left',
          labels: {},
        },
        title: {
          display: true,
          text: '總銷售數量',
          fontSize: '28',
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
    };
    const costChart = new Chart(ctxcost, costChartData);

    // 熱銷品分析
    const ctxhot = document.getElementById('hotProductChart').getContext('2d');
    const hotProductChartData = {
      type: 'line',
      data: {
        labels: [
          'November',
          'December',
          'January',
          'February',
          'March',
          'April',
          'May',
          'Now',
        ],
        datasets: [{
          label: '小型多肉',
          backgroundColor: '#A8D8B9',
          fill: false,
          data: [21, 18, 24, 26, 20, 15, 23, smallSalesVolume],
          borderColor: [
            '#A8D8B9',
          ],
        }, {
          label: '大型多肉',
          backgroundColor: '#F19483',
          fill: false,
          data: [12, 10, 6, 13, 9, 11, 7, bigSalesVolume],
          borderColor: [
            '#F19483',
          ],
        }, {
          label: '多肉盆栽',
          backgroundColor: '#75B9BE',
          fill: false,
          data: [12, 10, 13, 15, 9, 14, 11, potSalesVolume],
          borderColor: [
            '#75B9BE',
          ],
        }, {
          label: '客製禮品',
          backgroundColor: '#F3DE8A',
          fill: false,
          data: [7, 4, 2, 6, 10, 5, 8, giftSalesVolume],
          borderColor: [
            '#F3DE8A',
          ],
        }],
      },
      options: {
        responsive: true,
        aspectRatio: 1,
        legend: {
          position: 'top',
          labels: {},
        },
        title: {
          display: true,
          text: '總銷售數量',
          fontSize: '28',
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
    };
    const hotProductChart = new Chart(ctxhot, hotProductChartData);

    // 總訂單分析
    const ctxorder = document.getElementById('orderChart').getContext('2d');
    const orderChartData = {
      type: 'line',
      data: {
        labels: [
          'November',
          'December',
          'January',
          'February',
          'March',
          'April',
          'May',
          'Now',
        ],
        datasets: [{
          label: '訂單數量',
          backgroundColor: '#F3DE8A',
          fill: false,
          data: [15, 20, 14, 17, 18, 14, 12, totalOrderNum],
          borderColor: [
            '#F3DE8A',
          ],
        }],
      },
      options: {
        responsive: true,
        aspectRatio: 1,
        legend: {
          position: 'top',
          labels: {},
        },
        title: {
          display: true,
          text: '總訂單數量',
          fontSize: '28',
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
    };
    const orderChart = new Chart(ctxorder, orderChartData);
  }
}
window.addEventListener('load', getIndexReport);
