import React from 'react';
import { CartProvider } from './cartContext';
import App from './App';

const Root = () => (
  <CartProvider>
    <App />
  </CartProvider>
);

export default Root;