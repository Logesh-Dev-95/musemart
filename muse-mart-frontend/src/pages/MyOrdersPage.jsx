import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMyOrders } from '../api/orders';
import { format } from 'date-fns';

const MyOrdersPage = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setError('Please log in to view your orders.');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await getMyOrders(token);
        setOrders(response);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchOrders();
    }
  }, [user, token, authLoading]);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center">
        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-gray-600 p-8 text-lg">You must be logged in to view your orders.</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format payment type for display
  const formatPaymentType = (type) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="container mx-auto px-4 py-12 bg-background">
      <h1 className="text-5xl font-extrabold text-text-DEFAULT mb-12 text-center tracking-tight">
        My Purchase Orders
      </h1>

      {orders.length === 0 ? (
        <p className="text-center text-text-light text-xl mt-10">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const product = order.product;
            const imageUrl = product && product.images && product.images.length > 0
              ? product.images[0].blob
              : `https://placehold.co/120x100/e0e0e0/000000?text=Product`;
            const displayPrice = product?.discount > 0
              ? (product.price * (1 - product.discount / 100)).toFixed(2)
              : product?.price.toFixed(2);

            return (
              <div key={order.id} className="bg-card p-8 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-text-DEFAULT mb-1">Order ID: <span className="text-primary-DEFAULT">{order.id.substring(0, 8)}...</span></h2>
                    <p className="text-sm text-text-light">Placed on: {format(new Date(order.createdAt), 'MMM d, yyyy - h:mm a')}</p>
                  </div>
                  <span
                    className={`mt-4 sm:mt-0 px-4 py-1.5 rounded-full text-base font-semibold ${getStatusColor(order.status)}`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {product ? (
                    <div className="flex items-center space-x-5">
                      <img
                        src={imageUrl}
                        alt={product.productName}
                        className="w-28 h-28 object-cover rounded-xl border border-gray-200 shadow-sm"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/120x100/e0e0e0/000000?text=Image Error`; }}
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-text-DEFAULT">{product.productName}</h3>
                        <p className="text-text-light">
                          Price: ${displayPrice}
                          {product.discount > 0 && <span className="ml-2 text-green-600">({product.discount}% off)</span>}
                        </p>
                       
                      </div>
                    </div>
                  ) : (
                    <div className="text-text-light">Product details not available.</div>
                  )}
                  
                  <div>
                    <h4 className="text-lg font-semibold text-text-DEFAULT mb-2">Shipping To:</h4>
                    <p className="text-text-light">{order.buyerName}</p>
                    <p className="text-text-light">{order.address}</p>
                    <p className="text-text-light">{order.pincode}</p>
                    <p className="text-text-light">Contact: {order.phoneNumber}</p>
                    {/* Display Payment Type */}
                    <p className="text-text-light mt-2">
                      <span className="font-semibold">Payment Type:</span> {formatPaymentType(order.paymentType)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;