import React, { useEffect, useState, useContext } from "react";
import "../style/Cart.css";
import {
  getBasket,
  updateBasketItem,
  deleteBasketItem,
  createOreders,
} from "../http/productApi";
import {getGift} from '../http/giftApi'
import { Context } from "..";
import { useNavigate } from 'react-router-dom';

const Cart = ({ userId, onClose, onUpdateTotal }) => {
  const navigate = useNavigate();
  const [basketItems, setBasketItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedGift, setSelectedGift] = useState(null); // New state for selected gift
  const [userDetails, setUserDetails] = useState({
    name: "",
    phone: "",
    city: "",
    email: "",
    promoCode: "",
    paymentMethod: "Безналичный расчет", // Default payment method
  });
  const { user } = useContext(Context);
  const {gift} = useContext(Context)
  const [errorMessage, setErrorMessage] = useState("");

  useEffect ( ()=> {
    getGift().then(data => gift.setGift(data))
  }, [])

  const item = gift.gift[0];

  const fetchBasket = async () => {
    try {
      const data = await getBasket(userId);
      const products = data.basket_products || [];
      setBasketItems(products);
      const total = products.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setTotalAmount(total);
      onUpdateTotal(total);
    } catch (error) {
      console.error("Error fetching basket:", error);
    }
  };

  useEffect(() => {
    fetchBasket();
  }, [userId]);

  const handleQuantityChange = async (item, action) => {
    let newQuantity =
      action === "increase" ? item.quantity + 1 : item.quantity - 1;
    if (newQuantity < 1) newQuantity = 1;

    const updatedBasketItems = basketItems.map((basketItem) =>
      basketItem.id === item.id
        ? { ...basketItem, quantity: newQuantity }
        : basketItem
    );

    setBasketItems(updatedBasketItems);
    const newTotal = updatedBasketItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalAmount(newTotal);
    onUpdateTotal(newTotal);

    try {
      await updateBasketItem(userId, item.product.id, {
        quantity: newQuantity,
      });
    } catch (error) {
      console.error("Error updating basket item:", error);
    }
  };

  const handleDeleteItem = async (productId) => {
    try {
      if (!productId) {
        console.error("Product ID is undefined or null.");
        return;
      }

      await deleteBasketItem(productId);
      const updatedBasketItems = basketItems.filter(
        (item) => item.product.id !== productId
      );
      setBasketItems(updatedBasketItems);
      const newTotal = updatedBasketItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setTotalAmount(newTotal);
      onUpdateTotal(newTotal);
    } catch (error) {
      console.error("Error deleting basket item:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserDetails((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleGiftSelection = (gift) => {
    setSelectedGift(gift);
  };

  const handleOrder = async () => {
    const { name, phone, city, email, paymentMethod } = userDetails;
    if (!name || !phone || !city || !email || !paymentMethod) {
      setErrorMessage("Пожалуйста, заполните все обязательные поля.");
      return;
    }
  
    // Фильтруем товары с type: 2
    const itemsType2 = basketItems.filter(item => item.product.type === 2);
    const itemsType3 = basketItems.filter(item => item.product.type === 3);
  
    // Суммируем количество товаров с type: 2
    const totalItemsType2 = itemsType2.reduce((total, item) => total + item.quantity, 0);
    const totalItemsType3 = itemsType3.reduce((total, item) => total + item.quantity, 0);
  
    // Проверяем количество товаров с type: 2
    if (totalItemsType2 < 20) {
      setErrorMessage("Удобрений должно быть не менее 20т.");
      return;
    }

    if (totalItemsType3 < 10) {
      setErrorMessage("Посевного материала должно быть не менее 10.");
      return;
    }
  
    // Ваши дополнительные проверки для других товаров, если необходимо
  
    const orderData = {
      userId,
      phone: userDetails.phone,
      fio: userDetails.name,
      city: userDetails.city,
      email: userDetails.email,
      comment: userDetails.comment,
      paymentMethod: userDetails.paymentMethod,
      giftId: selectedGift,
    };
  
    try {
      const order = await createOreders(orderData);
      console.log("Order created:", order);
      navigate('/order-confirmation');
      onClose();
    } catch (error) {
      console.error("Error creating order:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message); // Установка сообщения об ошибке
      } else {
        setErrorMessage("Произошла ошибка при создании заказа. Попробуйте еще раз.");
      }
    }
  };

  return (
    <>
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-icon" onClick={onClose}>
          ✖
        </span>
        <h2 className="cart-title">Заказ</h2>

        {basketItems.length > 0 ? (
          basketItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <span
                className="delete-icon"
                onClick={() => handleDeleteItem(item.product.id)}
              >
                ✖
              </span>

              <div className="cart-item-info">
                <p className="product-title">{item.product.name}</p>
                <p className="product-description">
                  {item.product.description_low}
                </p>
                <p className="obem">{item.product.weight}</p>
                <div className="quantity-controls">
                  <button
                    className="quantity-button"
                    onClick={() => handleQuantityChange(item, "decrease")}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    className="quantity-button"
                    onClick={() => handleQuantityChange(item, "increase")}
                  >
                    +
                  </button>
                  <span className="price-cart">{item.price} ₽</span>
                </div>
              </div>
              <img
                src={process.env.REACT_APP_API_URL + item.product.img}
                alt="Product"
                className="cart-item-image"
              />
            </div>
          ))
        ) : (
          <p>Корзина пуста</p>
        )}
        <div className="sum-section">
          <p className="sum-label">Сумма:</p>
          {userDetails.paymentMethod === "Наличными курьеру" ? (
            <>
              <div className="sum-details non-cash">
                <span className="cash-amount">{totalAmount} ₽&ensp; </span>
                <span className="cash-method"> Наличный расчет</span>
              </div>
              <div className="sum-details non-cash">
                <span className="non-cash-amount">
                  {(totalAmount * 1.05).toFixed(2)} ₽&ensp;{" "}
                </span>
                <span className="non-cash-method"> Безналичный расчет</span>
              </div>
            </>
          ) : (
            <>
              <div className="sum-details non-cash">
                <span className="cash-amount">
                  {(totalAmount * 1.05).toFixed(2)} ₽&ensp;{" "}
                </span>
                <span className="cash-method"> Безналичный расчет</span>
              </div>
              <div className="sum-details non-cash">
                <span className="non-cash-amount">{totalAmount} ₽&ensp; </span>
                <span className="non-cash-method"> Наличный расчет</span>
              </div>
            </>
          )}
        </div>
        {totalAmount >= 50000 && (
          <div className="gift-section">
            <h3 className="section-title">Выберите подарок:</h3>
            <div className="gift-options">
              {totalAmount >= 50000 && (
                <div
                  className={`gift-card ${selectedGift === "1" ? "selected" : ""}`}
                  onClick={() => handleGiftSelection("1")}
                ><img  src={process.env.REACT_APP_API_URL + item?.imgOne} className="product-imagee" /><p/>Получить</div>
              )}
              {totalAmount >= 100000 && (
                <div
                  className={`gift-card ${selectedGift === "2" ? "selected" : ""}`}
                  onClick={() => handleGiftSelection("2")}
                ><img  src={process.env.REACT_APP_API_URL + item?.imgTwo}className="product-imagee" /><p/>Получить</div>
              )}
              {totalAmount >= 150000 && (
                <div
                  className={`gift-card ${selectedGift === "3" ? "selected" : ""}`}
                  onClick={() => handleGiftSelection("3")}
                ><img  src={process.env.REACT_APP_API_URL + item?.imgThree}className="product-imagee" /><p/>Получить</div>
              )}
            </div>
          </div>
        )}
        <h3 className="section-title">Данные</h3>
        <label>ФИО</label>
        <input
  type="text"
  name="name"
  value={userDetails.name}
  onChange={handleInputChange}
  className="intext"
  required
/>
        <label>Телефон</label>
        <input
          type="tel"
          name="phone"
          value={userDetails.phone}
          onChange={handleInputChange}
          className="intext"
        />

        <h3 className="section-title">Доставка</h3>
        <label>Город</label>
        <input
          type="text"
          name="city"
          value={userDetails.city}
          onChange={handleInputChange}
          className="intext"
        />
        <label>Почта</label>
        <input
          type="email"
          name="email"
          value={userDetails.email}
          onChange={handleInputChange}
          className="intext"
        />

        <h3 className="section-title">Способ оплаты</h3>
        <div className="payment-options">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="Наличными курьеру"
              checked={userDetails.paymentMethod === "Наличными курьеру"}
              onChange={handleInputChange}
            />{" "}
            Наличными курьеру
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="Банковский перевод"
              checked={userDetails.paymentMethod === "Банковский перевод"}
              onChange={handleInputChange}
            />{" "}
            Банковский перевод
          </label>
        </div>

        <h3 className="section-title">Комментарий</h3>
        <label>Промокод</label>
        <input
          type="text"
          name="promoCode"
          value={userDetails.promoCode}
          onChange={handleInputChange}
          className="intext"
        />
        <label>Комментарий к заказу</label>
        <input
          type="text"
          name="comment"
          value={userDetails.comment}
          onChange={handleInputChange}
          className="intext"
        />
         {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button className="order-button" onClick={handleOrder}>
          Оформить
        </button>
      </div>
    </div>
    </>
  );
};

export default Cart;
