// // src/pages/HomePage.jsx
// import React, { useEffect, useState } from 'react';
// import ProductCard from '../components/ProductCard';
// import LoadingSpinner from '../components/LoadingSpinner';
// import api from '../api/axiosConfig';

// const HomePage = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await api.get('/products');
//         setProducts(response.data);
//       } catch (err) {
//         console.error('Error fetching products:', err);
//         setError('Failed to load products. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   if (error) {
//     return <div className="text-center text-red-600 p-8 text-lg">{error}</div>;
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Discover Unique Art Pieces</h1>
//       {products.length === 0 ? (
//         <p className="text-center text-gray-600 text-lg">No products available yet. Check back soon!</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {products.map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomePage;

















// // muse-mart-frontend/src/pages/HomePage.jsx
// import React, { useEffect, useState } from 'react';
// import ProductCard from '../components/ProductCard';
// import LoadingSpinner from '../components/LoadingSpinner';
// import api from '../api/axiosConfig';

// const HomePage = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await api.get('/products');
//         setProducts(response.data);
//       } catch (err) {
//         console.error('Error fetching products:', err);
//         setError('Failed to load products. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   if (error) {
//     return (
//       <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center">
//         <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//           <p className="text-lg font-semibold">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-12 bg-background">
//       <h1 className="text-5xl font-extrabold text-text-DEFAULT mb-12 text-center tracking-tight">
//         Discover Unique Art Pieces
//       </h1>
//       {products.length === 0 ? (
//         <p className="text-center text-text-light text-xl mt-10">No products available yet. Check back soon!</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
//           {products.map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomePage;













// // muse-mart-frontend/src/pages/HomePage.jsx
// import React, { useEffect, useState, useCallback } from 'react';
// import ProductCard from '../components/ProductCard';
// import LoadingSpinner from '../components/LoadingSpinner';
// import api from '../api/axiosConfig';
// import { getCategories, getSubcategories } from '../api/products'; // Assuming these are also exported from products.js

// const HomePage = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Filter states
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedSubCategory, setSelectedSubCategory] = useState('');
//   const [minPrice, setMinPrice] = useState('');
//   const [maxPrice, setMaxPrice] = useState('');
//   const [stockStatus, setStockStatus] = useState('');

//   // Category and Subcategory data for filters
//   const [categories, setCategories] = useState([]);
//   const [subCategories, setSubCategories] = useState([]);

//   // Function to fetch products based on filters
//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = {};
//       if (searchTerm) params.productName = searchTerm;
//       if (selectedCategory) params.categoryId = selectedCategory;
//       if (selectedSubCategory) params.subCategoryId = selectedSubCategory;
//       if (minPrice) params.minPrice = minPrice;
//       if (maxPrice) params.maxPrice = maxPrice;
//       if (stockStatus) params.stock = stockStatus;

//       const response = await api.get('/products', { params });
//       setProducts(response.data);
//     } catch (err) {
//       console.error('Error fetching products:', err);
//       setError('Failed to load products. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   }, [searchTerm, selectedCategory, selectedSubCategory, minPrice, maxPrice, stockStatus]);

//   // Fetch products initially and on filter changes
//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   // Fetch categories on component mount
//   useEffect(() => {
//     const fetchCategoriesData = async () => {
//       try {
//         const cats = await getCategories();
//         setCategories(cats);
//       } catch (err) {
//         console.error('Error fetching categories for filter:', err);
//       }
//     };
//     fetchCategoriesData();
//   }, []);

//   // Fetch subcategories when selectedCategory changes
//   useEffect(() => {
//     const fetchSubcategoriesData = async () => {
//       if (selectedCategory) {
//         try {
//           const subs = await getSubcategories(selectedCategory);
//           setSubCategories(subs);
//         } catch (err) {
//           console.error('Error fetching subcategories for filter:', err);
//           setSubCategories([]);
//         }
//       } else {
//         setSubCategories([]);
//         setSelectedSubCategory(''); // Reset subcategory when category is cleared
//       }
//     };
//     fetchSubcategoriesData();
//   }, [selectedCategory]);

//   const handleCategoryChange = (e) => {
//     setSelectedCategory(e.target.value);
//     setSelectedSubCategory(''); // Reset subcategory when category changes
//   };

//   const handleClearFilters = () => {
//     setSearchTerm('');
//     setSelectedCategory('');
//     setSelectedSubCategory('');
//     setMinPrice('');
//     setMaxPrice('');
//     setStockStatus('');
//   };

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   if (error) {
//     return (
//       <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center">
//         <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//           <p className="text-lg font-semibold">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-12 bg-background">
//       <h1 className="text-5xl font-extrabold text-text-DEFAULT mb-12 text-center tracking-tight">
//         Discover Unique Art Pieces
//       </h1>

//       {/* Filter Section */}
//       <div className="mb-10 p-6 bg-card rounded-xl shadow-md">
//         <h2 className="text-2xl font-bold text-text-DEFAULT mb-6">Filter Products</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Product Name */}
//           <div>
//             <label htmlFor="searchTerm" className="block text-text-DEFAULT text-sm font-semibold mb-2">Product Name</label>
//             <input
//               type="text"
//               id="searchTerm"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search by product name"
//               className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-text-DEFAULT leading-tight focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-DEFAULT transition duration-200"
//             />
//           </div>

//           {/* Category */}
//           <div>
//             <label htmlFor="filterCategory" className="block text-text-DEFAULT text-sm font-semibold mb-2">Category</label>
//             <select
//               id="filterCategory"
//               value={selectedCategory}
//               onChange={handleCategoryChange}
//               className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-text-DEFAULT leading-tight focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-DEFAULT transition duration-200"
//             >
//               <option value="">All Categories</option>
//               {categories.map(cat => (
//                 <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
//               ))}
//             </select>
//           </div>

//           {/* Subcategory */}
//           <div>
//             <label htmlFor="filterSubCategory" className="block text-text-DEFAULT text-sm font-semibold mb-2">Subcategory</label>
//             <select
//               id="filterSubCategory"
//               value={selectedSubCategory}
//               onChange={(e) => setSelectedSubCategory(e.target.value)}
//               disabled={!selectedCategory || subCategories.length === 0}
//               className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-text-DEFAULT leading-tight focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-DEFAULT transition duration-200"
//             >
//               <option value="">All Subcategories</option>
//               {subCategories.map(sub => (
//                 <option key={sub.id} value={sub.id}>{sub.subCategoryName}</option>
//               ))}
//             </select>
//           </div>

//           {/* Price Range */}
//           <div className="flex gap-4">
//             <div>
//               <label htmlFor="minPrice" className="block text-text-DEFAULT text-sm font-semibold mb-2">Min Price</label>
//               <input
//                 type="number"
//                 id="minPrice"
//                 value={minPrice}
//                 onChange={(e) => setMinPrice(e.target.value)}
//                 placeholder="Min"
//                 className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-text-DEFAULT leading-tight focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-DEFAULT transition duration-200"
//               />
//             </div>
//             <div>
//               <label htmlFor="maxPrice" className="block text-text-DEFAULT text-sm font-semibold mb-2">Max Price</label>
//               <input
//                 type="number"
//                 id="maxPrice"
//                 value={maxPrice}
//                 onChange={(e) => setMaxPrice(e.target.value)}
//                 placeholder="Max"
//                 className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-text-DEFAULT leading-tight focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-DEFAULT transition duration-200"
//               />
//             </div>
//           </div>

//           {/* Stock Status */}
//           <div>
//             <label htmlFor="stockStatus" className="block text-text-DEFAULT text-sm font-semibold mb-2">Stock Status</label>
//             <select
//               id="stockStatus"
//               value={stockStatus}
//               onChange={(e) => setStockStatus(e.target.value)}
//               className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-text-DEFAULT leading-tight focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-DEFAULT transition duration-200"
//             >
//               <option value="">All Stock</option>
//               <option value="IN_STOCK">In Stock</option>
//               <option value="OUT_OF_STOCK">Out of Stock</option>
//             </select>
//           </div>
//         </div>
//         <div className="flex justify-end mt-6">
//           <button
//             onClick={handleClearFilters}
//             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-sm transition-all duration-300"
//           >
//             Clear Filters
//           </button>
//         </div>
//       </div>

//       {products.length === 0 ? (
//         <p className="text-center text-text-light text-xl mt-10">No products available yet. Check back soon!</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
//           {products.map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomePage;

























import React, { useEffect, useState, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import api from '../api/axiosConfig';
import { getCategories, getSubcategories } from '../api/products';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [stockStatus, setStockStatus] = useState('');

  // Category and Subcategory data for filters
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Mobile filter sidebar state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch products with current filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm) params.productName = searchTerm;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedSubCategory) params.subCategoryId = selectedSubCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (stockStatus) params.stock = stockStatus;

      const response = await api.get('/products', { params });
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedSubCategory, minPrice, maxPrice, stockStatus]);

  // Fetch products on initial load and filter changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch categories
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategoriesData();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategoriesData = async () => {
      if (selectedCategory) {
        try {
          const subs = await getSubcategories(selectedCategory);
          setSubCategories(subs);
        } catch (err) {
          console.error('Error fetching subcategories:', err);
          setSubCategories([]);
        }
      } else {
        setSubCategories([]);
        setSelectedSubCategory('');
      }
    };
    fetchSubcategoriesData();
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory('');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setMinPrice('');
    setMaxPrice('');
    setStockStatus('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center p-4">
        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md w-full">
          <p className="text-lg font-semibold">{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Discover Unique Art at MuseMart</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Find handcrafted paintings, weavings, pottery, and glass art from talented artists worldwide.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex shadow-lg rounded-lg overflow-hidden">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for artworks..."
                className="flex-grow px-6 py-4 text-gray-800 focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-white text-purple-700 hover:bg-purple-100 px-6 flex items-center justify-center transition duration-300"
              >
                <FiSearch className="h-6 w-6" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-md sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                <button 
                  onClick={handleClearFilters}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  Clear all
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Category</h3>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory Filter */}
              {selectedCategory && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3">Subcategory</h3>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    disabled={subCategories.length === 0}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">All Subcategories</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.subCategoryName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Price Range</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="minPrice" className="block text-sm text-gray-600 mb-1">Min</label>
                    <input
                      type="number"
                      id="minPrice"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="$0"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxPrice" className="block text-sm text-gray-600 mb-1">Max</label>
                    <input
                      type="number"
                      id="maxPrice"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="$1000"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Availability</h3>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All</option>
                  <option value="IN_STOCK">In Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="md:hidden flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Artworks</h2>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
              >
                <FiFilter className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileFiltersOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="relative ml-auto w-full max-w-xs h-screen bg-white shadow-xl">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                  <button 
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                {/* Mobile Filter Content */}
                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Category</h3>
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Filter */}
                  {selectedCategory && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Subcategory</h3>
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        disabled={subCategories.length === 0}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">All Subcategories</option>
                        {subCategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.subCategoryName}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Price Range</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="mobileMinPrice" className="block text-sm text-gray-600 mb-1">Min</label>
                        <input
                          type="number"
                          id="mobileMinPrice"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="$0"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label htmlFor="mobileMaxPrice" className="block text-sm text-gray-600 mb-1">Max</label>
                        <input
                          type="number"
                          id="mobileMaxPrice"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="$1000"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Availability</h3>
                    <select
                      value={stockStatus}
                      onChange={(e) => setStockStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All</option>
                      <option value="IN_STOCK">In Stock</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      fetchProducts();
                      setMobileFiltersOpen(false);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;