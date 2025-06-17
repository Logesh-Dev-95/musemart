import { Link } from "react-router-dom";


const ProductCard = ({ product }) => {

  const displayPrice = product.discount > 0
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price.toFixed(2);

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0].blob // assuming blob is Base64 string
    : `https://placehold.co/500x400/e0e0e0/000000?text=${encodeURIComponent(product.productName.split(' ')[0] || 'Art')}`;

  return (
    
     <Link to={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
        <div className="relative pb-3/4 h-48">
          <img 
            src={imageUrl} 
            alt={product.productName} 
            className="absolute h-full w-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 text-gray-800">{product.productName}</h3>
          <p className="text-gray-600 text-sm mb-2">by {product.productOwnerName}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="font-bold text-purple-600">${displayPrice}</span>
            <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2 px-4 rounded-full transition duration-300">
              OrderNow
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};


export default ProductCard