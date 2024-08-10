// 
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const productList = document.getElementById('product-list');
    const productForm = document.getElementById('product-form');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');

    // Function to attach delete event listeners
    const attachDeleteEventListeners = () => {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.parentElement.dataset.id, 10);
                socket.emit('deleteProduct', productId);
            });
        });
    };

    // Listen for updates to the product list
    socket.on('updateProducts', (products) => {
        productList.innerHTML = '';
        products.forEach(product => {
            const li = document.createElement('li');
            li.dataset.id = product.id;
            li.innerHTML = `${product.name} - $${product.price} <button class="delete-btn">Delete</button>`;
            productList.appendChild(li);
        });

        // Attach delete event listeners after updating the product list
        attachDeleteEventListeners();
    });

    // Handle product form submissions
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = productNameInput.value;
        const price = parseFloat(productPriceInput.value);

        if (name && !isNaN(price)) {
            socket.emit('addProduct', { id: Date.now(), name, price });
            productNameInput.value = '';
            productPriceInput.value = '';
        }
    });
});
