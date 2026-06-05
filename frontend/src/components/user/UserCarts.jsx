import { Button, Space, Card, Popconfirm, Empty, Tag } from "antd";
import {
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { fetcher } from "../../lib/fetcher";
import Loader from "../shared/Loader";
import Error from "../shared/Error";
import { priceCalculator } from "../../lib/price-calculator";
import { toast } from "react-toastify";
import { httpRequest } from "../../lib/http-request";
import placeholderimg from "../../assets/product-placeholder.jpg";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const calculateTotalAmount = (items) => {
  let totalAmount = 0;

  items.forEach((data) => {
    const qnt = Number(data.qnt || 0);
    const price = Number(data.product?.price || 0);
    const discount = Number(data.product?.discount || 0);
    const discountAmount = (price * discount) / 100;
    const realPriceAfterDiscount = price - discountAmount;
    totalAmount += realPriceAfterDiscount * qnt;
  });

  return totalAmount;
};

const UserCarts = () => {
  const { data, error, isLoading } = useSWR("/cart", fetcher);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const hasOutOfStockItem = useMemo(() => {
    return (
      Array.isArray(data) &&
      data.some((item) => Number(item.product?.stock || 0) === 0)
    );
  }, [data]);

  const increaseDecreaseCart = async (id, qnt) => {
    try {
      await httpRequest.put(`/cart/${id}`, { qnt });
      mutate("/cart");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  const checkoutNow = async (cartItems) => {
    try {
      setLoading(true);

      const products = cartItems.map((item) => ({
        id: item.product._id,
        qnt: item.qnt,
      }));

      const res = await httpRequest.post("/checkout", { products });
      window.location.href = res.data.paymentLink;
    } catch (err) {
      setLoading(false);
      toast.error(err?.response?.data?.message || "Something went wrong");
      if (err?.response?.data?.redirectTo) {
        setTimeout(() => {
          navigate(err.response.data.redirectTo);
        }, 1000);
      }
    }
  };

  const deleteCart = async (id) => {
    try {
      await httpRequest.delete(`/cart/${id}`);
      mutate("/cart");
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Card className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-100 bg-white px-4 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-gray-900 sm:text-3xl">
                  Shopping Cart
                </h1>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Review your items before checkout
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 sm:p-6">
            {data && data.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                {/* Cart items */}
                <div className="space-y-4">
                  {data.map((item) => {
                    const productStock = Number(item.product?.stock || 0);
                    const isOutOfStock = productStock === 0;
                    const isLowStock = productStock > 0 && productStock <= 10;
                    const canIncrease = item.qnt < productStock;

                    return (
                      <Card
                        key={item._id}
                        hoverable
                        className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          {/* Left section */}
                          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row">
                            <div className="mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:mx-0 sm:h-32 sm:w-32">
                              <img
                                src={
                                  item.product?.images?.[0] || placeholderimg
                                }
                                alt={item.product?.title || "product"}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h2 className="break-words text-lg font-semibold text-gray-900 sm:text-xl">
                                {item.product?.title}
                              </h2>

                              <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">
                                {item.product?.description?.slice(0, 120)}
                                {item.product?.description ? "..." : ""}
                              </p>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Tag className="!m-0 !rounded-full !border-0 !bg-zinc-900 !px-3 !py-1 !text-xs !text-white">
                                  {item.product?.category}
                                </Tag>

                                {isOutOfStock ? (
                                  <Tag
                                    color="red"
                                    className="!m-0 rounded-full"
                                  >
                                    Out of Stock
                                  </Tag>
                                ) : isLowStock ? (
                                  <Tag
                                    color="orange"
                                    className="!m-0 rounded-full"
                                  >
                                    Only {productStock} left
                                  </Tag>
                                ) : null}
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="text-base font-semibold text-gray-900">
                                  ₹
                                  {priceCalculator(
                                    item.product?.price,
                                    item.product?.discount,
                                  ).toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  ₹
                                  {Number(
                                    item.product?.price || 0,
                                  ).toLocaleString()}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-gray-500">
                                {item.product?.discount}% discount applied
                              </p>
                            </div>
                          </div>

                          {/* Right section */}
                          <div className="flex flex-col gap-3 md:min-w-[220px] md:items-end">
                            <Popconfirm
                              onConfirm={() => deleteCart(item._id)}
                              title="Do you want to delete this cart item?"
                            >
                              <Button
                                icon={<Trash2 className="h-4 w-4" />}
                                danger
                                type="primary"
                                className="h-10 w-full rounded-2xl md:w-auto"
                              >
                                Delete
                              </Button>
                            </Popconfirm>

                            <div className="w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                              <p className="mb-2 text-sm font-medium text-gray-700">
                                Quantity
                              </p>

                              <Space.Compact className="w-full">
                                <Button
                                  icon={<Minus className="h-4 w-4" />}
                                  onClick={() => {
                                    if (item.qnt <= 1) return;
                                    increaseDecreaseCart(
                                      item._id,
                                      item.qnt - 1,
                                    );
                                  }}
                                  disabled={item.qnt <= 1}
                                  className="w-1/3 sm:w-auto"
                                />
                                <Button className="w-1/3 !cursor-default !bg-white sm:w-auto">
                                  {item.qnt}
                                </Button>
                                <Button
                                  icon={<Plus className="h-4 w-4" />}
                                  onClick={() => {
                                    if (!canIncrease) {
                                      toast.error(
                                        isOutOfStock
                                          ? "This product is out of stock"
                                          : `Only ${productStock} item(s) left in stock`,
                                      );
                                      return;
                                    }
                                    increaseDecreaseCart(
                                      item._id,
                                      item.qnt + 1,
                                    );
                                  }}
                                  disabled={!canIncrease || isOutOfStock}
                                  className="w-1/3 sm:w-auto"
                                />
                              </Space.Compact>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="lg:sticky lg:top-24 lg:h-fit">
                  <Card className="rounded-3xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                      Order Summary
                    </h2>

                    <div className="mt-5 space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Items</span>
                        <span>{data.length}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Total</span>
                        <span className="font-medium text-gray-900">
                          ₹{calculateTotalAmount(data).toLocaleString()}
                        </span>
                      </div>

                      {hasOutOfStockItem && (
                        <div className="flex items-start gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            One or more items are out of stock. Please remove
                            them before checkout.
                          </span>
                        </div>
                      )}

                      <Button
                        disabled={loading || hasOutOfStockItem}
                        onClick={() => checkoutNow(data)}
                        type="primary"
                        size="large"
                        className="h-12 w-full rounded-2xl bg-zinc-900 font-semibold shadow-md hover:!bg-zinc-800"
                      >
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {hasOutOfStockItem
                          ? "Remove Out of Stock Items"
                          : "Checkout"}
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="py-10">
                <Empty description="Cart is empty !!" />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserCarts;
