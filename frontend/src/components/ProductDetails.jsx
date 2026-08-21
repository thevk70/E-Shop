import { useEffect, useState } from "react";
import useSWR from "swr";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Truck,
  ShieldCheck,
  PackageCheck,
  Loader2,
  Minus,
  Plus,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { fetcher } from "../lib/fetcher";
import { httpRequest } from "../lib/http-request";
import { priceCalculator } from "../lib/price-calculator";
import { useAuth } from "../zustand/useAuth";
import placeholderImg from "../assets/product-placeholder.jpg";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const aiContext = location.state?.aiContext;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const {
    data: product,
    error,
    isLoading,
  } = useSWR(`/products/id/${id}`, fetcher);

  // Keep AI+ aware of the product currently being viewed.
  useEffect(() => {
    if (!product) return;

    window.dispatchEvent(
      new CustomEvent("ai-product-context", {
        detail: {
          product: {
            _id: product._id,
            title: product.title,
            description: product.description,
            price: product.price,
            discount: product.discount,
            category: product.category,
            stock: product.stock,
            recommendationReason:
              product.recommendationReason ||
              aiContext?.recommendationReason ||
              null,
          },
        },
      }),
    );
  }, [product, aiContext]);

  const addToCart = async () => {
    if (!product || Number(product.stock) <= 0) {
      toast.error("This product is currently unavailable.");
      return;
    }

    if (!user || user.role !== "user") {
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);

      for (let i = 0; i < quantity; i++) {
        await httpRequest.post("/cart", {
          product: product._id,
        });
      }

      toast.success(
        quantity === 1
          ? "Product added to cart"
          : `${quantity} items added to cart`,
        {
          position: "top-center",
        },
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to add product to cart",
        {
          position: "top-center",
        },
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const openAIForProduct = () => {
    if (!product) return;

    const context = {
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      discount: product.discount,
      category: product.category,
      stock: product.stock,
      recommendationReason:
        product.recommendationReason || aiContext?.recommendationReason || null,
    };

    window.dispatchEvent(
      new CustomEvent("open-ai-assistant", {
        detail: {
          product: context,
          recommendationReason: context.recommendationReason,
        },
      }),
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-5 w-24 rounded bg-gray-200" />

            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <div className="h-[520px] rounded-3xl bg-gray-200" />

              <div className="space-y-5">
                <div className="h-6 w-24 rounded bg-gray-200" />
                <div className="h-12 w-3/4 rounded bg-gray-200" />
                <div className="h-24 rounded bg-gray-200" />
                <div className="h-28 rounded-2xl bg-gray-200" />
                <div className="h-14 rounded-2xl bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb] px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <PackageCheck className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Product not found
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            The product you're looking for may have been removed or is no longer
            available.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = priceCalculator(product.price, product.discount);

  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;

  const images = product.images?.length > 0 ? product.images : [placeholderImg];

  const savings = Number(product.price) - Number(discountedPrice);

  const currentImage = images[selectedImage] || placeholderImg;

  const increaseQuantity = () => {
    if (quantity < stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const previousImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Breadcrumb */}

        <div className="mb-7 flex items-center gap-2 overflow-hidden text-xs text-gray-400">
          <button
            onClick={() => navigate("/")}
            className="shrink-0 transition hover:text-gray-900"
          >
            Home
          </button>

          <span>/</span>

          <button
            onClick={() => navigate(-1)}
            className="shrink-0 transition hover:text-gray-900"
          >
            Products
          </button>

          <span>/</span>

          <span className="truncate font-medium text-gray-600">
            {product.title}
          </span>
        </div>

        {/* Main Product */}

        <div className="overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* Images */}

            <div className="border-b border-gray-100 p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
              <button
                onClick={() => navigate(-1)}
                className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>

              <div className="group relative flex h-[390px] items-center justify-center overflow-hidden rounded-[24px] bg-[#f7f7f8] sm:h-[480px]">
                {aiContext && (
                  <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-violet-100 bg-white/90 px-3 py-1.5 text-[10px] font-bold text-violet-700 shadow-sm backdrop-blur">
                    <span className="text-[9px] font-black">AI+</span>
                    Recommended
                  </div>
                )}

                {images.length > 1 && (
                  <button
                    onClick={previousImage}
                    className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                <img
                  src={currentImage}
                  alt={product.title}
                  className="h-full w-full object-contain p-8 transition duration-500 group-hover:scale-[1.03] sm:p-12"
                  onError={(event) => {
                    event.currentTarget.src = placeholderImg;
                  }}
                />

                {images.length > 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 rounded-full bg-gray-950/80 px-3 py-1.5 text-[10px] font-medium text-white backdrop-blur">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={`
                        h-20 w-20 shrink-0 overflow-hidden rounded-xl
                        border bg-gray-50 p-2 transition
                        ${
                          selectedImage === index
                            ? "border-violet-500 ring-2 ring-violet-100"
                            : "border-gray-200 hover:border-gray-300"
                        }
                      `}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="h-full w-full object-contain"
                        onError={(event) => {
                          event.currentTarget.src = placeholderImg;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}

            <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                  {product.category}
                </span>

                {product.discount > 0 && (
                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-700">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-gray-950 sm:text-4xl">
                {product.title}
              </h1>

              <p className="mt-6 text-sm leading-7 text-gray-600 sm:text-base">
                {product.description}
              </p>

              <div className="my-7 h-px bg-gray-100" />

              {/* Price */}

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Price
                </p>

                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-bold tracking-tight text-gray-950">
                    ₹{discountedPrice.toLocaleString("en-IN")}
                  </span>

                  {product.discount > 0 && (
                    <span className="mb-1 text-lg text-gray-400 line-through">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                  )}

                  {product.discount > 0 && (
                    <span className="mb-1 rounded-lg bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                      Save ₹{savings.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Inclusive of applicable discounts
                </p>
              </div>

              {/* Stock */}

              <div
                className={`
                  mt-6 flex items-center justify-between
                  rounded-2xl border p-4
                  ${
                    isOutOfStock
                      ? "border-red-100 bg-red-50"
                      : stock <= 10
                        ? "border-orange-100 bg-orange-50"
                        : "border-green-100 bg-green-50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      flex h-9 w-9 items-center justify-center rounded-xl
                      ${
                        isOutOfStock
                          ? "bg-red-100 text-red-600"
                          : stock <= 10
                            ? "bg-orange-100 text-orange-600"
                            : "bg-green-100 text-green-600"
                      }
                    `}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {isOutOfStock
                        ? "Currently unavailable"
                        : stock <= 10
                          ? "Limited stock"
                          : "In stock"}
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {isOutOfStock
                        ? "Please check back later"
                        : stock <= 10
                          ? `Only ${stock} left — order soon`
                          : `${stock} units available`}
                    </p>
                  </div>
                </div>

                {!isOutOfStock && (
                  <span className="text-[10px] font-semibold text-green-700">
                    Ready to ship
                  </span>
                )}
              </div>

              {/* Quantity + Cart */}

              {!isOutOfStock && (
                <div className="mt-6">
                  <p className="mb-2 text-xs font-semibold text-gray-700">
                    Quantity
                  </p>

                  <div className="flex gap-3">
                    <div className="flex h-14 items-center rounded-2xl border border-gray-200 bg-white">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1 || addingToCart}
                        className="flex h-full w-12 items-center justify-center text-gray-500 transition hover:text-gray-900 disabled:opacity-30"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-8 text-center text-sm font-bold text-gray-900">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={quantity >= stock || addingToCart}
                        className="flex h-full w-12 items-center justify-center text-gray-500 transition hover:text-gray-900 disabled:opacity-30"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={addToCart}
                      disabled={addingToCart}
                      className="flex h-14 flex-1 items-center justify-center gap-2.5 rounded-2xl bg-gray-950 px-5 text-sm font-bold text-white shadow-lg shadow-gray-900/10 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {addingToCart ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Trust Features */}

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <Truck className="h-5 w-5 text-violet-600" />

                  <p className="mt-3 text-xs font-bold text-gray-900">
                    Fast Delivery
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-gray-500">
                    Quick dispatch to your doorstep
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <ShieldCheck className="h-5 w-5 text-green-600" />

                  <p className="mt-3 text-xs font-bold text-gray-900">
                    Secure Payment
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-gray-500">
                    Safe and secure checkout
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <RotateCcw className="h-5 w-5 text-blue-600" />

                  <p className="mt-3 text-xs font-bold text-gray-900">
                    Easy Support
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-gray-500">
                    We're here when you need us
                  </p>
                </div>
              </div>

              {/* AI+ */}

              <div className="mt-5 overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-[10px] font-black text-white shadow-sm">
                      AI+
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold text-gray-950">
                          Need help deciding?
                        </p>

                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[8px] font-bold text-violet-700">
                          AI POWERED
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] leading-4 text-gray-600">
                        Ask AI+ why this product was recommended, whether it
                        fits your needs, or compare it with other products.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openAIForProduct}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 text-xs font-bold text-white shadow-sm transition hover:bg-violet-600 active:scale-[0.99]"
                  >
                    <span className="text-[10px] font-black">AI+</span>
                    Ask AI+ about this product
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
