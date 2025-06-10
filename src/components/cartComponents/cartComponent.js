import React, { useState } from 'react';
import  '../cartComponents/cartStyle.css';
import { useCart } from './cartContext.tsx';

const cartComponent = (isCartOpenValue) => {
    
    const { itemCount, total } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(isCartOpenValue);

    return (
        <input type='button' className='cart-button' onClick={() => setIsCartOpen(isCartOpenValue)}>
            <div style={{display:'flex',alignItems:'center'}}>
                <div style={{display: 'flex', alignItems: 'anchor-center',justifyContent:'center', width: '36px',height: '36px',borderRadius: '50%', backgroundColor: '#fff',color: '#333',transition: 'all .25s ease'}}>
                    <i class="fa-light fa-basket-shopping"></i>
                </div>
                <div style={{paddingLeft: '5px'}}>{total.toFixed(2)} ₺</div>
            </div>
            <span className='cart-count'>{itemCount}</span>
        </input>
    )
};
export default cartComponent;

// import React from 'react';
// import { useCart } from './cartContext';

// const Cart = () => {
//   const { items, addItem, removeItem, total, itemCount } = useCart();

//   return (
//     <div>
//       <h1>Sepet</h1>
//       <p>Toplam Ürün: {itemCount}</p>
//       <p>Toplam Fiyat: {total} ₺</p>
//       <ul>
//         {items.map(item => (
//           <li key={item.id}>
//             {item.name} - {item.quantity} x {item.price} ₺
//             <button onClick={() => removeItem(item.id)}>Kaldır</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Cart;