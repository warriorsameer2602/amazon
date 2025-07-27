const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample products database
const products = [
    {
        id: 1,
        title: "Wireless Bluetooth Headphones",
        price: 2999,
        originalPrice: 4999,
        rating: 4.5,
        reviews: 1250,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        category: "Electronics",
        brand: "TechSound",
        description: "Premium quality wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality.",
        features: ["Active Noise Cancellation", "30hr Battery", "Quick Charge", "Bluetooth 5.0"],
        inStock: true,
        fastDelivery: true,
        discount: 40
    },
    {
        id: 2,
        title: "Smartphone 128GB",
        price: 15999,
        originalPrice: 19999,
        rating: 4.2,
        reviews: 2840,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
        category: "Mobile",
        brand: "TechPro",
        description: "Latest smartphone with AI-powered camera, fast processor, and all-day battery life.",
        features: ["AI Camera", "5G Ready", "Fast Charging", "Water Resistant"],
        inStock: true,
        fastDelivery: true,
        discount: 20
    },
    {
        id: 3,
        title: "Gaming Laptop 16GB RAM",
        price: 65999,
        originalPrice: 79999,
        rating: 4.7,
        reviews: 890,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
        category: "Computers",
        brand: "GameMaster",
        description: "High-performance gaming laptop with RTX graphics, RGB keyboard, and advanced cooling system.",
        features: ["RTX Graphics", "RGB Keyboard", "16GB RAM", "1TB SSD"],
        inStock: true,
        fastDelivery: false,
        discount: 17
    },
    {
        id: 4,
        title: "Smart Fitness Watch",
        price: 3999,
        originalPrice: 5999,
        rating: 4.3,
        reviews: 1680,
        image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=300&h=300&fit=crop",
        category: "Wearables",
        brand: "FitTech",
        description: "Advanced fitness tracker with heart rate monitor, GPS, and 7-day battery life.",
        features: ["Heart Rate Monitor", "GPS Tracking", "7-day Battery", "Waterproof"],
        inStock: true,
        fastDelivery: true,
        discount: 33
    },
    {
        id: 5,
        title: "Wireless Gaming Mouse",
        price: 1299,
        originalPrice: 1999,
        rating: 4.6,
        reviews: 3250,
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop",
        category: "Gaming",
        brand: "ProGamer",
        description: "Professional gaming mouse with RGB lighting, programmable buttons, and precision sensor.",
        features: ["RGB Lighting", "Programmable Buttons", "Precision Sensor", "Wireless"],
        inStock: true,
        fastDelivery: true,
        discount: 35
    },
    {
        id: 6,
        title: "Bluetooth Speaker Pro",
        price: 2499,
        originalPrice: 3499,
        rating: 4.4,
        reviews: 2100,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
        category: "Audio",
        brand: "SoundWave",
        description: "Portable Bluetooth speaker with 360° sound, waterproof design, and 24-hour battery.",
        features: ["360° Sound", "Waterproof", "24hr Battery", "Voice Assistant"],
        inStock: true,
        fastDelivery: true,
        discount: 29
    }
];

// Routes
app.get('/', (req, res) => {
    const featuredProducts = products.slice(0, 4);
    const topDeals = products.filter(p => p.discount > 25);
    res.render('index', { 
        products, 
        featuredProducts, 
        topDeals,
        pageTitle: 'Amazon Clone - Shop Everything You Need'
    });
});

app.get('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    const relatedProducts = products.filter(p => p.category === product?.category && p.id !== productId).slice(0, 4);
    
    res.render('product', { 
        product, 
        relatedProducts,
        pageTitle: product ? `${product.title} - Amazon Clone` : 'Product Not Found'
    });
});

app.get('/cart', (req, res) => {
    res.render('cart', { 
        pageTitle: 'Shopping Cart - Amazon Clone'
    });
});

app.get('/orders', (req, res) => {
    res.render('orders', { 
        pageTitle: 'Your Orders - Amazon Clone'
    });
});

// API Routes
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    const category = req.query.category || '';
    
    let filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query)
    );
    
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    res.json(filteredProducts);
});

// app.listen(PORT, () => {
//     console.log(`🚀 Amazon Clone running on http://localhost:${PORT}`);
//     console.log('📱 Features: Interactive UI, Real-time Cart, Smooth Animations');
// });

//module.exports = app;
// NEW - Use this instead:
module.exports = app;

// Only listen when running locally
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Amazon Clone Server running on http://localhost:${PORT}`);
    });
}

