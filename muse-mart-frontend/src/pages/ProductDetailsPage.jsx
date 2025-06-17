import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { placeOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import InputField from '../components/InputField'; // Assuming this component exists for general input fields

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  // Order form state
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentType, setPaymentType] = useState('CASH_ON_DELIVERY'); // New state for payment type, with a default

  // Define valid payment types (should match your backend enum)
  const validPaymentTypes = ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'CASH_ON_DELIVERY', 'WALLET'];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    setOrderError(null);

    if (!isAuthenticated) {
      setOrderError('You must be logged in to place an order.');
      setOrderLoading(false);
      return;
    }

    if (!address || !pincode || !phoneNumber || !paymentType) { // Added paymentType to validation
      setOrderError('Please fill in all shipping and payment details.');
      setOrderLoading(false);
      return;
    }

    try {
      await placeOrder({
        productId: product.id,
        address,
        pincode,
        phoneNumber,
        paymentType, // Pass paymentType to the API call
      }, token);
      alert('Order placed successfully!');
      navigate('/my-orders');
    } catch (err) {
      console.error('Error placing order:', err.response?.data?.message || err.message);
      setOrderError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center">
        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md w-full">
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center">
        <div className="text-center text-gray-600 p-8 text-lg max-w-md w-full">
          <p>Product not found.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg text-primary-800 font-medium transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const displayPrice = product.discount > 0
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price.toFixed(2);

  const mainImageUrl = product.images && product.images.length > 0
    ? product.images[activeImage].blob
    : `https://placehold.co/600x400/e0e0e0/000000?text=${product.productName.split(' ')[0] || 'Art'}`;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden md:flex md:space-x-8 p-6 border border-gray-100">
        {/* Product Image Section */}
        <div className="md:w-1/2 flex flex-col items-center">
          <div className="w-full h-96 bg-gray-50 rounded-lg p-4 flex items-center justify-center mb-4">
            <img
              src={mainImageUrl}
              alt={product.productName}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/e0e0e0/000000?text=Image Not Found`; }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto py-2 w-full">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${activeImage === index ? 'border-primary-500' : 'border-gray-200'}`}
                >
                  <img
                    src={img.blob}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/e0e0e0/000000?text=Thumb`; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details and Order Section */}
        <div className="md:w-1/2 pt-6 md:pt-0">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.productName}</h1>
                <p className="text-gray-500 mb-4">
                  {product.categoryName} / {product.subCategoryName}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium
                  ${product.stock === 'IN_STOCK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                `}
              >
                {product.stock.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center mb-6">
              {product.discount > 0 && (
                <span className="text-gray-400 line-through mr-2 text-lg">
                  ${product.price.toFixed(2)}
                </span>
              )}
              <span className="text-3xl font-bold text-gray-900">
                ${displayPrice}
              </span>
              {product.discount > 0 && (
                <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900">Artist</h3>
              <p className="mt-1 text-gray-600">{product.productOwnerName}</p>
            </div>
          </div>

          {/* Order Form */}
          {isAuthenticated ? (
            product.stock === 'IN_STOCK' && product.productOwnerId !== user.id ? (
              <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping & Payment Information</h2>
                {orderError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {orderError}
                  </div>
                )}
                <form onSubmit={handlePlaceOrder}>
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full shipping address"
                      rows="3"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-700 border p-2"
                      required
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <InputField
                      label="Postal Code"
                      id="pincode"
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g., 636007"
                      required
                    />
                    <InputField
                      label="Contact Number"
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+62"
                      required
                    />
                  </div>

                  {/* Payment Type Selection */}
                  <div className="mb-6">
                    <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="paymentType"
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-700 border p-2"
                      required
                    >
                      {validPaymentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    disabled={orderLoading || product.stock === 'OUT_OF_STOCK'}
                  >
                    {orderLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : 'Place Order'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                {product.productOwnerId === user.id ? (
                  <p className="text-sm">You are the owner of this product. You cannot purchase your own listings.</p>
                ) : (
                  <p className="text-sm">This product is currently out of stock and cannot be ordered.</p>
                )}
              </div>
            )
          ) : (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Please <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-800 font-medium">login</button> to place an order.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;