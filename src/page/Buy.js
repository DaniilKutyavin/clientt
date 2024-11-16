import React, { useState, useEffect } from 'react';
import '../style/Buy.css';
import arrowDown from '../img/стрелка вниз.svg';
import exampleImage from '../img/ценник.svg';
import Store from '../componenets/Store';
import Shkal from '../componenets/Shkal';
import lupa from '../img/лупа.svg';
import { getbuyProduct } from '../http/productApi'; // Adjust the path to your api file
import {
    submitPartnershipFormTwo,
  } from "../http/contactApi";
import { useNavigate, useLocation } from "react-router-dom";
const Prod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isbuy = location.pathname === '/buy';
  const isbuyform = location.pathname === '/buyform';

  const [formData, setFormData] = useState({
    fio: '',
    telephone: '',
    email: '',
  });

  const [filtersOpen, setFiltersOpen] = useState({
    category: true,
  });

  const [expandedBlocks, setExpandedBlocks] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitPartnershipFormTwo(formData);
      setFormData({ fio: '', telephone: '', email: '' });
      navigate('/confirmation3');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const toggleFilter = (filter) => {
    setFiltersOpen({
      ...filtersOpen,
      [filter]: !filtersOpen[filter],
    });
  };

  const toggleExpand = (id) => {
    setExpandedBlocks({
      ...expandedBlocks,
      [id]: !expandedBlocks[id],
    });
  };

  const handleCategoryChange = (e) => {
    const value = parseInt(e.target.value);
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((cat) => cat !== value)
        : [...prevSelected, value]
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getbuyProduct();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    // Сбросить все чекбоксы
    const checkboxes = document.querySelectorAll('.custom-checkbox');
    checkboxes.forEach((checkbox) => (checkbox.checked = false));
  };

  const filteredProducts = products
    .filter((product) => 
      selectedCategories.length ? selectedCategories.includes(product.category) : true
    )
    .filter((product) => 
      product.name.toLowerCase().includes(searchQuery)
    );

    return (
        <>
            <div className="header">
                <div className="title-block">
                    <h1>Закупка С/Х культур</h1>
                    <p className="pod">Продайте по максимально выгодным ценам</p>
                </div>
            </div>

            {isbuy && (
                            <div className="wrapperr">
                <div className="catalog-containerr">
                    <div className="left-section">
                        <div className="filter-block">
                            <div className="search-bar">
                            <input
                    type="text"
                    placeholder="Поиск..."
                    className="search-input"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                                <span className="search-icon"><img src={lupa} alt="Search" /></span>
                            </div>
                            <div className="filter-section">
                                <h2 onClick={() => toggleFilter('category')}>
                                    Категория
                                    <img src={arrowDown} alt="Arrow Down" className={`filter-arrow ${filtersOpen.category ? 'open' : ''}`} />
                                </h2>
                                {filtersOpen.category && (
                    <div className="filter-content">
                      {[{ id: 1, name: 'Пшеница' }, { id: 2, name: 'Ячмень' }, { id: 3, name: 'Кукуруза' }, { id: 4, name: 'Подсолнечник' }, { id: 5, name: 'Соя' }, { id: 6, name: 'Рапс' }, { id: 7, name: 'Нут' }, { id: 8, name: 'Горох' }, { id: 9, name: 'Рожь' }]
                        .map(({ id, name }) => (
                          <div key={id}>
                            <input
                              type="checkbox"
                              className="custom-checkbox"
                              value={id}
                              id={id}
                              onChange={handleCategoryChange}
                            />
                            <label htmlFor={id}>{name}</label>
                          </div>
                        ))}
                    </div>
                  )}
                            </div>
                            <button className="filter-cancel-button" onClick={handleResetFilters}>
                  Сбросить фильтр
                </button>
                        </div>
                    </div>
                    <div className="right-section">
                        <div className="product-list">
                            {loading && <p>Загрузка...</p>}
                            {error && <p>Ошибка: {error}</p>}
                            {!loading && !error && products.length === 0 && (
                                <div className="info-blockk">
                                    <div className="text-contentt">
                                        <h1 className="titleoffer">Нет доступных оферов!</h1>
                                        <p>Хотите узнать о возможности продать культуру первым?</p>
                                        <p>Напишите в службу поддержки или позвоните оператору. Вас уведомят заранее!</p>
                                    </div>
                                    <div className="image-contentt">
                                        <img src={exampleImage} alt="Example" />
                                    </div>
                                </div>
                            )}
                            {filteredProducts.map((product, index) => (
                                <div key={index} className="product-item">
                                    <div className="product-header" onClick={() => toggleExpand(product.id)}>
                                    <div className="product-title-price">
  <span className="product-title">{product.name}</span>
  

  {product.price_one > 0 && (
    <p><span className="product-pricee">{product.price_one} р/т</span> Наличный</p>
  )}
  

  {product.price_two > 0 && (
    <p><span className="product-pricee">{product.price_two} р/т</span>  Без нал. (без НДС)</p>
  )}
</div>
                                        <img src={arrowDown} alt="Arrow Down" className={`expand-arrow ${expandedBlocks[product.id] ? 'open' : ''}`} />
                                    </div>
                                    {expandedBlocks[product.id] && (
                                        <div className="product-description">
                                            {product.info.map((infoItem) => (
                                                <p key={infoItem.id}>{infoItem.name}</p>
                                                
                                            ))}
                                             <button className="sell-button" onClick={() => navigate('/buyform')}>Продать</button>
                                        </div>
                                    )}
                                    <div className="divider"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </div>
            )}
            
             {isbuyform && (
                 <div className="partnership-form" style={{marginLeft:"20px"}}>
                 <h2>Заполните форму</h2>
                 <form onSubmit={handleSubmit}>
                   <div className="form-container">
                     <div className="form-fields">
                       <div className="form-group">
                         <label htmlFor="fio">Имя Отчество</label>
                         <input
                           type="text"
                           id="fio"
                           value={formData.fio}
                           onChange={handleChange}
                           required
                         />
                       </div>
                       <div className="form-group">
                         <label htmlFor="telephone">Телефон</label>
                         <input
                           type="tel"
                           id="telephone"
                           value={formData.telephone}
                           onChange={handleChange}
                           required
                         />
                       </div>
                       <div className="form-group">
                         <label htmlFor="email">Email</label>
                         <input
                           type="email"
                           id="email"
                           value={formData.email}
                           onChange={handleChange}
                           required
                         />
                       </div>
                     </div>
                     <button type="submit" className="submit-button">
                       Отправить
                     </button>
                   </div>
                   
                   <p>Наш менеджер свяжется с Вами в ближайшее время.</p>
                 </form>
               </div>
             )}
            
            <Store />
            <Shkal />
        </>
    );
};

export default Prod;
