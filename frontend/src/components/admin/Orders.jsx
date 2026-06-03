import React from "react";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import Loader from "../shared/Loader";
import Error from "../shared/Error";
import { Select, Table } from "antd";
import { Link } from "react-router-dom";
import moment from "moment/moment";
import { toast } from "react-toastify";
import { priceCalculator } from "../../lib/price-calculator";
import product_placeholder from "../../assets/product-placeholder.jpg";
import { httpRequest } from "../../lib/http-request";

const Orders = () => {
  const { data, error, isLoading } = useSWR("/orders", fetcher);

  if (isLoading) return <Loader />;

  if (error) return <Error message={error.message} />;

  const updateOrder = async (value, id) => {
    try {
      await httpRequest.put(`/orders/${id}`, { status: value });
      toast.success(`Order status updated to ${value}`);
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const columns = [
    {
      key: "customer",
      title: "Customer",
      render: (item) => (
        <div>
          <h1 className="capitalize text-black font-medium">
            {item.user.fullname}
          </h1>
          <label className="text-gray-500">{item.user.email}</label>
        </div>
      ),
    },
    {
      key: "items",
      title: "Item Details",
      render: (item) => (
        <div>
          <Link to="#">{item.products.length} Items purchased</Link>
          <p className="text-gray-500">₹{item.amount.toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: "address",
      title: "Address",
      render: (item) => (
        <div>
          <p>
            {item.user.address}, {item.user.city}, {item.user.state},{" "}
            {item.user.country} {item.user.pincode}
          </p>
        </div>
      ),
    },
    {
      key: "date",
      title: "Date",
      render: (item) => moment(item.createdAt).format("DD MMM YYYY, hh:mm A"),
    },
    {
      key: "status",
      title: "Status",
      render: (item) => (
        <Select
          defaultValue={item.status}
          onChange={(value) => updateOrder(value, item._id)}
        >
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="dispatched">Dispatched</Select.Option>
          <Select.Option value="cancelled">Cancelled</Select.Option>
        </Select>
      ),
    },
  ];

  const viewProducts = (item) => {
    return (
      <div>
        {item.products.map((itemData, itemDataIndex) => (
          <div
            className="flex items-start justify-between mb-6 border-b border-b-gray-100 pb-4"
            key={itemDataIndex}
          >
            <div className="flex items-start gap-4">
              <img
                src={itemData.id.images[0] || product_placeholder}
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
                    ₹{priceCalculator(itemData.id.price, itemData.id.discount)}
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
      </div>
    );
  };

  return (
    <div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        expandable={{
          expandedRowRender: viewProducts,
        }}
        scroll={{
          x: "max-content",
        }}
      />
    </div>
  );
};

export default Orders;
