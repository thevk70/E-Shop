import useSWR, { mutate } from "swr";
import { fetcher } from "../lib/fetcher";
import Error from "./shared/Error";
import Loader from "./shared/Loader";
import { Card, Tag, Button, Carousel } from "antd";
import { priceCalculator } from "../lib/price-calculator";
import { ShoppingCart, Star, ShieldCheck, Truck } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../zustand/useAuth";
import { httpRequest } from "../lib/http-request";
import placeholderImg from "../assets/product-placeholder.jpg";

const Home = () => {
  const { data, error, isLoading } = useSWR("/products", fetcher);
  console.log(data);

  const { user } = useAuth();
  const navigate = useNavigate();

  const addToCart = async (id) => {
    try {
      if (!user || user.role !== "user") {
        navigate("/login");
        return;
      }

      const response = await httpRequest.post("/cart", { product: id });
      mutate("/cart");
      toast.success(response.data.message || "Added to cart", {
        position: "top-center",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  if (error) {
    return <Error message={error.message} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-10 text-white shadow-xl">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-white">
                <Star className="h-4 w-4" />
                Premium shopping experience
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Discover products built for everyday life.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                Browse quality products, compare prices, and enjoy a smooth
                shopping experience with secure checkout and fast browsing.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <ShieldCheck className="h-5 w-5 text-green-400" />
                <p className="mt-2 text-sm font-semibold">Secure Payment</p>
                <p className="text-xs text-zinc-300">Safe checkout flow</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <Truck className="h-5 w-5 text-sky-400" />
                <p className="mt-2 text-sm font-semibold">Fast Delivery</p>
                <p className="text-xs text-zinc-300">Quick dispatch options</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <ShoppingCart className="h-5 w-5 text-amber-400" />
                <p className="mt-2 text-sm font-semibold">Easy Shopping</p>
                <p className="text-xs text-zinc-300">Simple cart experience</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Featured Products
          </h2>
          <p className="text-sm text-gray-500">
            {data?.length || 0} products available
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {data?.map((item, index) => {
            const discountedPrice = priceCalculator(item.price, item.discount);
            const stock = Number(item.stock || 0);
            const isOutOfStock = stock === 0;

            return (
              <Card
                key={index}
                hoverable
                className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                cover={
                  <div className="bg-white">
                    <Carousel arrows dots>
                      {(item.images?.length > 0
                        ? item.images
                        : [placeholderImg]
                      ).map((img, imgIndex) => (
                        <div key={imgIndex}>
                          <div className="flex h-64 w-full items-center justify-center bg-gray-100 px-4">
                            <img
                              src={img}
                              alt={`product-${imgIndex}`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        </div>
                      ))}
                    </Carousel>
                  </div>
                }
              >
                <div className="flex h-full flex-col">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 break-words text-lg font-semibold leading-snug text-gray-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 break-words text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Tag className="!m-0 !rounded-full !border-0 !bg-zinc-900 !px-3 !py-1 !text-xs !text-white">
                      {item.category}
                    </Tag>

                    {isOutOfStock ? (
                      <Tag color="red" className="!m-0 rounded-full">
                        Out of Stock
                      </Tag>
                    ) : stock <= 10 ? (
                      <Tag color="orange" className="!m-0 rounded-full">
                        Hurry, only few left
                      </Tag>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{item.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.discount}% discount applied
                    </p>
                  </div>

                  <Button
                    onClick={() => addToCart(item._id)}
                    size="large"
                    type="primary"
                    disabled={isOutOfStock}
                    icon={<ShoppingCart className="h-4 w-4" />}
                    className="mt-5 h-12 w-full rounded-2xl font-semibold shadow-md"
                  >
                    {isOutOfStock ? "Unavailable" : "Add to Cart"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
