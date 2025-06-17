import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import InputField from '../components/InputField';
import { getMyProducts, addProduct, updateProduct, getCategories, getSubcategories, getReceivedOrders, updateOrderStatus } from '../api/products';
import ProductCard from '../components/ProductCard';

const SellPage = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    productName: '',
    categoryId: '',
    subCategoryId: '',
    price: '',
    discount: '0',
    stock: 'IN_STOCK',
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const fetchMyProductsCategoriesAndOrders = useCallback(async () => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);
    try {
      const [productsResponse, categoriesResponse, receivedOrdersResponse] = await Promise.all([
        getMyProducts(token),
        getCategories(),
        getReceivedOrders(token)
      ]);
      setProducts(productsResponse);
      setCategories(categoriesResponse);
      setReceivedOrders(receivedOrdersResponse);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load your products, categories, or orders.');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (!authLoading && !user) {
      setError('Please log in to manage your products.');
      setLoading(false);
      return;
    }
    if (user && token) {
      fetchMyProductsCategoriesAndOrders();
    }
  }, [user, token, authLoading, fetchMyProductsCategoriesAndOrders]);

  useEffect(() => {
    if (productForm.categoryId) {
      const fetchSubs = async () => {
        try {
          const subs = await getSubcategories(productForm.categoryId);
          setSubCategories(subs);
          if (isEditingProduct && !subs.some(s => s.id === productForm.subCategoryId)) {
            setProductForm(prev => ({ ...prev, subCategoryId: '' }));
          }
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          setSubCategories([]);
        }
      };
      fetchSubs();
    } else {
      setSubCategories([]);
    }
  }, [productForm.categoryId, isEditingProduct]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);

    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productDataToSend = { ...productForm };
      
      const base64Images = selectedImages.map(file => {
          return imagePreviews[selectedImages.indexOf(file)];
      }).filter(Boolean);

      productDataToSend.images = base64Images;

      if (isEditingProduct) {
        const updatePayload = {
          price: productForm.price,
          discount: productForm.discount,
          stock: productForm.stock,
        };
        if (base64Images.length > 0) {
            updatePayload.images = base64Images;
        }

        await updateProduct(isEditingProduct, updatePayload, token);
        alert('Product updated successfully!');
      } else {
        if (base64Images.length === 0) {
            setError('Please upload at least one image for the product.');
            setLoading(false);
            return;
        }
        await addProduct(productDataToSend, token);
        alert('Product added successfully!');
      }

      await fetchMyProductsCategoriesAndOrders();
      setProductForm({
        productName: '',
        categoryId: '',
        subCategoryId: '',
        price: '',
        discount: '0',
        stock: 'IN_STOCK',
      });
      setSelectedImages([]);
      setImagePreviews([]);
      setIsAddingProduct(false);
      setIsEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setIsEditingProduct(product.id);
    setProductForm({
      productName: product.productName,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      price: product.price,
      discount: product.discount,
      stock: product.stock,
    });
    if (product.images && product.images.length > 0) {
        setImagePreviews(product.images.map(img => img.blob).filter(Boolean));
    } else {
        setImagePreviews([]);
    }
    setSelectedImages([]);
    setIsAddingProduct(true);
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    if (!token) {
      setError('Authentication token missing. Please log in.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateOrderStatus(orderId, newStatus, token);
      alert(`Order ${orderId} status updated to ${newStatus}`);
      await fetchMyProductsCategoriesAndOrders();
    } catch (err) {
      console.error('Error updating order status:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setLoading(false);
    }
  };

    const formatPaymentType = (type) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (error && !isAddingProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md border border-red-200">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">{error}</h3>
            <div className="mt-4">
              <button
                // onClick={() => navigate('/login')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">You must be logged in to sell products.</h3>
          <div className="mt-4">
            <button
            //   onClick={() => navigate('/login')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Your Products for Sale
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage your products and view orders
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <button
            onClick={() => {
              setIsAddingProduct(!isAddingProduct);
              setIsEditingProduct(null);
              setProductForm({
                productName: '', categoryId: '', subCategoryId: '', price: '', discount: '0', stock: 'IN_STOCK',
              });
              setSelectedImages([]);
              setImagePreviews([]);
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            {isAddingProduct ? (
              <>
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Product
              </>
            )}
          </button>
        </div>

        {(isAddingProduct || isEditingProduct) && (
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md mb-16 border border-gray-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isEditingProduct ? 'Update your product details' : 'Fill in the details of your new product'}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleAddOrUpdateProduct} className="space-y-6">
              <InputField
                label="Product Name"
                id="productName"
                name="productName"
                value={productForm.productName}
                onChange={handleFormChange}
                placeholder="e.g., Abstract Oil Painting"
                required
                disabled={!!isEditingProduct}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={productForm.categoryId}
                    onChange={handleFormChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                    disabled={!!isEditingProduct}
                  >
                    <option value="">Select a Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subCategoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subCategoryId"
                    name="subCategoryId"
                    value={productForm.subCategoryId}
                    onChange={handleFormChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                    disabled={!productForm.categoryId || !!isEditingProduct}
                  >
                    <option value="">Select a Subcategory</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.subCategoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Price ($)"
                  id="price"
                  name="price"
                  type="number"
                  value={productForm.price}
                  onChange={handleFormChange}
                  placeholder="e.g., 99.99"
                  step="0.01"
                  min="0.01"
                  required
                />

                <InputField
                  label="Discount (%)"
                  id="discount"
                  name="discount"
                  type="number"
                  value={productForm.discount}
                  onChange={handleFormChange}
                  placeholder="e.g., 10"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="stock"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleFormChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>

              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images {!isEditingProduct && <span className="text-red-500">*</span>}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload images</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={src} 
                        alt={`Product Preview ${index + 1}`} 
                        className="w-24 h-24 object-cover rounded-lg shadow-sm border border-gray-200" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreviews(prev => prev.filter((_, i) => i !== index));
                          setSelectedImages(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : isEditingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Your Listed Products</h2>
            <p className="mt-2 text-sm text-gray-500">
              {products.length} {products.length === 1 ? 'product' : 'products'} listed
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No products listed yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first product.</p>
              <div className="mt-6">
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Product
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <ProductCard product={product} />
                  <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Orders Received</h2>
            <p className="mt-2 text-sm text-gray-500">
              {receivedOrders.length} {receivedOrders.length === 1 ? 'order' : 'orders'} received
            </p>
          </div>

          {receivedOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No orders received yet</h3>
              <p className="mt-1 text-sm text-gray-500">Your orders will appear here when customers purchase your products.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedOrders.map(order => (
                <div key={order.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          {order.product.images && order.product.images.length > 0 && (
                            <img
                              src={order.product.images[0].blob}
                              alt={order.product.productName}
                              className="flex-shrink-0 h-16 w-16 rounded-md object-cover"
                            />
                          )}
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">{order.product.productName}</h3>
                            <p className="text-sm text-gray-500">Order #{order.id}</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Buyer:</span> {order.buyerName} ({order.buyer.email})
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Phone:</span> {order.phoneNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Address:</span> {order.address}, {order.pincode}
                          </p>
                           <p className="text-sm text-gray-600">
                            <span className="font-medium">Payment Type:</span> {formatPaymentType(order.paymentType)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-end">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <label htmlFor={`status-${order.id}`} className="sr-only">Update Status</label>
                          <select
                            id={`status-${order.id}`}
                            value={order.status}
                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(statusOption => (
                              <option key={statusOption} value={statusOption}>{statusOption}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellPage;