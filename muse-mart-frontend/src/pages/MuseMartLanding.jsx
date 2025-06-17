import React, { useState, useEffect } from 'react';
import { getAllProducts, getCategories } from '../api/products';
import { Link } from 'react-router-dom';

const MuseMartLanding = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState({
        min: '',
        max: ''
    });
    const [showScrollToTop, setShowScrollToTop] = useState(false); // New state for scroll button visibility

    const images ={
        "Glass Art":"https://4.bp.blogspot.com/-kAK18F8f2-4/UMoobw7AIXI/AAAAAAAAAk8/BhUAE_OIcP8/s1600/stained_glass_painting_by_sstroitel-d4mukfo.jpg",
        "Paintings":"https://wallpaperaccess.com/full/2551689.jpg",
        "Pottery":"https://static.vecteezy.com/system/resources/previews/026/449/716/non_2x/vibrant-colors-shape-traditional-ceramics-a-celebration-of-nature-indoors-generated-by-ai-free-photo.jpg",
        "Weaving":"https://mrs-cook.weebly.com/uploads/2/3/0/6/23067164/9942330_orig.jpg"
    }

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch all products
                const allProducts = await getAllProducts();
                setProducts(allProducts);
                setFilteredProducts(allProducts);

                // Fetch categories
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);

                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };
        fetchInitialData();

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle scroll event to show/hide the button
    const handleScroll = () => {
        if (window.scrollY > 300) { // Show button after scrolling down 300px
            setShowScrollToTop(true);
        } else {
            setShowScrollToTop(false);
        }
    };

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scroll animation
        });
    };

    const handleSearch = () => {
        let filtered = [...products];

        // Apply category filter
        if (activeCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.categoryName.toLowerCase() === activeCategory
            );
        }

        // Apply search term filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.productName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply price range filter
        if (priceRange.min) {
            filtered = filtered.filter(product =>
                product.price >= Number(priceRange.min)
            );
        }
        if (priceRange.max) {
            filtered = filtered.filter(product =>
                product.price <= Number(priceRange.max)
            );
        }

        setFilteredProducts(filtered);
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        // Don't filter immediately, wait for search button click
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setPriceRange({ min: '', max: '' });
        setActiveCategory('all');
        setFilteredProducts(products);
    };

    // Function to scroll to the Featured Artworks section
    const scrollToFeaturedArtworks = () => {
        document.getElementById('filter-section').scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                Error: {error.message}
                <button
                    onClick={() => window.location.reload()}
                    className="ml-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <header className="relative bg-gradient-to-r from-purple-600 to-indigo-800 text-white py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Discover Unique Art at MuseMart</h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                        Where creativity meets commerce. Buy and sell original artworks from talented artists worldwide.
                    </p>
                    <button
                        onClick={scrollToFeaturedArtworks}
                        className="inline-block bg-white text-purple-700 hover:bg-purple-100 font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
                    >
                        Explore Now
                    </button>
                </div>
            </header>

            {/* Categories Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Art Categories</h2>

                    <div className="flex justify-center mb-8">
                        <button
                            onClick={() => handleCategoryChange('all')}
                            className={`px-6 py-2 rounded-full font-medium ${activeCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            All Categories
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((category,index) => (
                            <CategoryCard
                                key={category.id}
                                title={category.categoryName}
                                image={images[category.categoryName]}
                                active={activeCategory === category.categoryName.toLowerCase()}
                                onClick={() => handleCategoryChange(category.categoryName.toLowerCase())}
                            />
                        ))}
                    </div>
                </div>
            </section>
            {/* Search and Filter Section */}
            <section id='filter-section' className="py-8 px-4 sm:px-6 lg:px-8 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="w-full md:w-1/3">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                Search Artworks
                            </label>
                            <div className="flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by product name..."
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border-gray-300 focus:ring-purple-500 focus:border-purple-500 sm:text-sm border"
                                />

                            </div>
                        </div>

                        <div className="w-full md:w-1/3">
                            <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-1">
                                Price Range
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/3 flex items-end justify-end space-x-3">
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Search
                            </button>
                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section id="featured-artworks" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Featured Artworks</h2>
                        <p className="text-gray-600">{filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found</p>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No artworks found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                            <button
                                onClick={handleResetFilters}
                                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-indigo-800 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Piece?</h2>
                    <p className="text-xl mb-8">
                        Join thousands of art lovers who have discovered unique artworks through MuseMart.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={scrollToFeaturedArtworks}
                            className="bg-white text-purple-700 hover:bg-purple-100 font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
                        >
                            Browse All Art
                        </button>
                        <Link
                            to="/sell"
                            className="bg-transparent border-2 border-white hover:bg-white hover:text-purple-700 font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
                        >
                            Sell Your Art
                        </Link>
                    </div>
                </div>
            </section>

            {/* Scroll to Top Button */}
            {showScrollToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 z-50"
                    aria-label="Scroll to top"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                    </svg>
                </button>
            )}
        </div>
    );
};

// Category Card Component
const CategoryCard = ({ title, image, active, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${active ? 'ring-4 ring-purple-500' : 'hover:ring-2 hover:ring-purple-300'}`}
        >
            <img
                src={image}
                alt={title}
                className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <h3 className="text-white text-xl font-bold">{title}</h3>
            </div>
        </div>
    );
};

// Product Card Component
const ProductCard = ({ product }) => {
    const imageUrl = product.images && product.images.length > 0
        ? product.images[0].blob
        : `https://via.placeholder.com/300/F3E8FF/4C1D95?text=${product.productName.replace(/\s/g, '+')}`;

    return (
        <Link to={`/product/${product.id}`} className="group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={product.productName}
                        className="absolute h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                </div>
                <div className="p-4 flex-grow">
                    <h3 className="font-bold text-lg mb-1 text-gray-800 truncate">{product.productName}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {product.productOwnerName}</p>
                    <div className="mt-4 flex justify-between items-center">
                        <span className="font-bold text-purple-600">${product.price.toFixed(2)}</span>
                        {product.discount > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                {product.discount}% OFF
                            </span>
                        )}
                    </div>
                </div>
                <div className="px-4 pb-4">
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2 px-4 rounded-full transition duration-300">
                        View Details
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default MuseMartLanding;