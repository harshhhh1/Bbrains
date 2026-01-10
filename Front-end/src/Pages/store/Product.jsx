import like from '../../assets/Logo/like.svg';
import ProductImage from '../../assets/Logo/theAlchemist.jpg';

export function Product() {
    return (
        <div className="product-container">
            <div className="product-image-container">
                <div className="like-btn">
                    <img src={like} alt="" />
                </div>
                <img src={ProductImage} alt="Product" />
            </div>
            <div className="product-details">
                <div className="name-price-container">
                    <div className="product-name">
                        The Alchemist
                    </div>
                    <div className="product-price">
                        $29.99
                    </div>
                </div>
                <div className="product-description">
                    This book tells the story of a young shepherd named Santiago who embarks on a journey to find a hidden treasure located near the Egyptian pyramids.
                </div>
                <div className="buy-button">
                    <button>Buy Now</button>
                </div>
            </div>
        </div>
    );
}