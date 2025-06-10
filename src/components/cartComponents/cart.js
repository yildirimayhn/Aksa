class Cart {
    constructor() {
      this.items = [];
    }
  
    // Sepete ürün ekleme
    addItem(newItem) {
      const existingItem = this.items.find(item => item.id === newItem.id);
      if (existingItem) {
        this.items = this.items.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        this.items.push({ ...newItem, quantity: 1 });
      }
    }
  
    // Sepetten ürün çıkarma
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
    }
  
    // Ürün miktarını güncelleme
    updateQuantity(id, quantity) {
      if (quantity < 1) {
        this.removeItem(id);
        return;
      }
      this.items = this.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
    }
  
    // Sepeti temizleme
    clearCart() {
      this.items = [];
    }
  
    // Toplam fiyat hesaplama
    getTotal() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  
    // Toplam ürün sayısını hesaplama
    getItemCount() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
  
    // Sepetteki ürünleri alma
    getItems() {
      return this.items;
    }
  }
  
  module.exports = Cart;