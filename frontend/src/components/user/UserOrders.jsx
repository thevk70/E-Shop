import React from "react";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import { Card, Tag } from "antd";
import Loader from "../shared/Loader";
import Error from "../shared/Error";
import { priceCalculator } from "../../lib/price-calculator";
import moment from "moment";
import placeholderimg from "../../assets/product-placeholder.jpg";
const UserOrders = () => {
  const { data, error, isLoading } = useSWR("/orders", fetcher);
  console.log(data);

  if (isLoading) {
    <Loader />;
  }

  if (error) {
    <Error message={error.message} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Your Orders</h1>
      {data &&
        data.map((item, index) => (
          <Card
            key={index}
            title={`Order ID - ${item._id}`}
            hoverable
            extra={moment(item.createdAt).format("MMM DD YYYY, hh:mmA")}
          >
            {item.products.map((itemData, itemDataIndex) => (
              <div
                className="flex items-start justify-between mb-6 border-b border-b-gray-100 pb-4"
                key={itemDataIndex}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={itemData.id.images?.[0] || placeholderimg}
                    className="w-34 rounded-lg"
                  />

                  <div>
                    <h1 className="capitalize font-semibold text-lg">
                      {itemData.id.title}
                    </h1>
                    <p className="text-gray-500">
                      {itemData.id.description.slice(0, 100)}...
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <label className="font-medium text-gray-600">
                        ₹
                        {priceCalculator(
                          itemData.id.price,
                          itemData.id.discount,
                        )}
                      </label>
                      <del className="text-rose-500">
                        ₹{itemData.id.price.toLocaleString()}
                      </del>
                      <label>({itemData.id.discount}% Discount)</label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <Tag className="!capitalize">{item.status}</Tag>
              <h1 className="text-2xl font-bold">
                ₹{item.amount.toLocaleString()}
              </h1>
            </div>
          </Card>
        ))}
    </div>
  );
};

export default UserOrders;
