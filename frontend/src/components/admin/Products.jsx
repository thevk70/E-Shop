import {
  Button,
  Card,
  Popconfirm,
  Tag,
  Tooltip,
  Input,
  Modal,
  Form,
  Select,
  Carousel,
} from "antd";
import {
  Edit2,
  Plus,
  Search,
  Trash2,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { priceCalculator } from "../../lib/price-calculator";
import { httpRequest } from "../../lib/http-request";
import placeholderImg from "../../assets/product-placeholder.jpg";

const categories = [
  "Fashion",
  "Electronics",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Health & Fitness",
  "Sports & Outdoors",
  "Books & Stationery",
  "Toys & Baby Products",
  "Automotive",
  "Groceries",
  "Pet Supplies",
  "Digital Products",
  "Gift Items",
];

const Products = () => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [productForm] = Form.useForm();

  const handleClose = () => {
    setEditId(null);
    productForm.resetFields();
    productForm.setFieldsValue({ images: [""], stock: 0 });
    setOpen(false);
  };

  const normalizeImages = (images) => {
    if (!Array.isArray(images)) return [];
    return images.map((img) => img?.trim()).filter(Boolean);
  };

  const createProduct = async (values) => {
    try {
      const payload = {
        ...values,
        price: Number(values.price),
        discount: Number(values.discount || 0),
        stock: Number(values.stock || 0),
        images: normalizeImages(values.images),
      };

      await httpRequest.post("/products", payload);
      handleClose();
      toast.success("Product Added Successfully");
      setUpdateCount((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add product");
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await httpRequest.get("/products");
      setProducts(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch products");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await httpRequest.delete(`/products/${id}`);
      setUpdateCount((prev) => prev + 1);
      toast.success("Product Deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete product");
    }
  };

  const editProduct = (item) => {
    setEditId(item._id);
    productForm.setFieldsValue({
      ...item,
      stock: item.stock ?? 0,
      images:
        Array.isArray(item.images) && item.images.length > 0
          ? item.images
          : [""],
    });
    setOpen(true);
  };

  const saveProduct = async (values) => {
    try {
      const payload = {
        ...values,
        price: Number(values.price),
        discount: Number(values.discount || 0),
        stock: Number(values.stock || 0),
        images: normalizeImages(values.images),
      };

      await httpRequest.put(`/products/${editId}`, payload);
      handleClose();
      toast.success("Product Updated Successfully");
      setUpdateCount((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [updateCount]);

  const filteredProducts = products.filter((item) => {
    const search = searchText.toLowerCase().trim();
    const matchesSearch =
      !search ||
      item.title?.toLowerCase().includes(search) ||
      item.category?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search);

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            size="large"
            placeholder="Search products"
            className="!w-full md:!w-md"
            prefix={<Search className="h-4 w-4 text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Select
            size="large"
            className="!w-full md:!w-64"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              { value: "all", label: "All Categories" },
              ...categories.map((item) => ({ value: item, label: item })),
            ]}
          />
        </div>

        <Button
          onClick={() => {
            setEditId(null);
            productForm.resetFields();
            productForm.setFieldsValue({ images: [""], stock: 0 });
            setOpen(true);
          }}
          size="large"
          type="primary"
          icon={<Plus className="h-4 w-4" />}
        >
          Add Product
        </Button>
      </div>

      {filteredProducts.length > 0 ? (
        filteredProducts.map((item, index) => (
          <Card
            key={index}
            hoverable
            cover={
              <Carousel arrows dots>
                {(item.images?.length > 0 ? item.images : [placeholderImg]).map(
                  (img, imgIndex) => (
                    <div key={imgIndex}>
                      <div className="flex h-60 w-full items-center justify-center bg-gray-100">
                        <img
                          src={img}
                          alt={`product-${imgIndex}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  ),
                )}
              </Carousel>
            }
          >
            <Card.Meta
              title={item.title}
              description={
                <div className="flex items-center gap-2">
                  <label className="font-medium text-gray-600">
                    ₹
                    {priceCalculator(
                      item.price,
                      item.discount,
                    ).toLocaleString()}
                  </label>
                  <del className="text-rose-500">
                    ₹{item.price.toLocaleString()}
                  </del>
                  <label>({item.discount}% Discount)</label>
                </div>
              }
            />

            <Tag className="!mt-3">{item.category}</Tag>

            <div className="mt-2">
              {Number(item.stock) > 0 ? (
                <Tag color="green">In Stock ({item.stock})</Tag>
              ) : (
                <Tag color="red">Out of Stock</Tag>
              )}
            </div>

            <div className="mt-4 space-x-3">
              <Tooltip title="Edit product">
                <Button
                  onClick={() => editProduct(item)}
                  icon={<Edit2 className="h-4 w-4" />}
                  type="primary"
                  className="!bg-indigo-500"
                />
              </Tooltip>

              <Tooltip title="Delete product">
                <Popconfirm
                  onConfirm={() => deleteProduct(item._id)}
                  title="Do you want to delete this product ?"
                >
                  <Button
                    icon={<Trash2 className="h-4 w-4" />}
                    type="primary"
                    danger
                  />
                </Popconfirm>
              </Tooltip>
            </div>
          </Card>
        ))
      ) : (
        <div className="col-span-4 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No products found for the selected filter.
        </div>
      )}

      <Modal
        open={open}
        onCancel={handleClose}
        centered
        width={700}
        footer={null}
        title={
          <h1 className="text-lg">{editId ? "Edit Product" : "New Product"}</h1>
        }
      >
        <Form
          form={productForm}
          onFinish={editId ? saveProduct : createProduct}
          layout="vertical"
          className="!mt-4"
          initialValues={{ images: [""], stock: 0 }}
        >
          <Form.Item
            label={
              <label className="text-base text-gray-500">Product name</label>
            }
            rules={[{ required: true, message: "Please enter product name" }]}
            name="title"
          >
            <Input placeholder="Product name goes here" size="large" />
          </Form.Item>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              label={<label className="text-base text-gray-500">Price</label>}
              rules={[{ required: true, message: "Please enter price" }]}
              name="price"
            >
              <Input type="number" placeholder="00.00" size="large" />
            </Form.Item>

            <Form.Item
              label={
                <label className="text-base text-gray-500">Discount</label>
              }
              name="discount"
              initialValue={0}
            >
              <Input type="number" placeholder="00.00%" size="large" />
            </Form.Item>

            <Form.Item
              label={<label className="text-base text-gray-500">Stock</label>}
              rules={[
                { required: true, message: "Please enter stock quantity" },
              ]}
              name="stock"
              initialValue={0}
            >
              <Input type="number" placeholder="Available stock" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            label={<label className="text-base text-gray-500">Category</label>}
            rules={[{ required: true, message: "Please choose category" }]}
            name="category"
          >
            <Select size="large" placeholder="Choose category" showSearch>
              {categories.map((item, index) => (
                <Select.Option value={item} key={index}>
                  {item}
                </Select.Option>
              ))}
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <label className="text-base text-gray-500">Description</label>
            }
            rules={[{ required: true, message: "Please enter description" }]}
            name="description"
          >
            <Input.TextArea
              placeholder="Description goes here"
              size="large"
              rows={5}
            />
          </Form.Item>

          <Form.List name="images">
            {(fields, { add, remove }) => (
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-base text-gray-500">Images</label>
                  <Button
                    type="dashed"
                    onClick={() => add("")}
                    icon={<PlusCircle className="h-4 w-4" />}
                  >
                    Add Image
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {fields.map((field, index) => (
                    <div key={field.key} className="flex items-center gap-2">
                      <Form.Item
                        {...field}
                        className="mb-0 flex-1"
                        rules={[
                          {
                            type: "url",
                            warningOnly: true,
                            message: "Please enter a valid image URL",
                          },
                        ]}
                      >
                        <Input
                          placeholder={`Image link ${index + 1}`}
                          size="large"
                        />
                      </Form.Item>

                      <Button
                        danger
                        type="text"
                        icon={<MinusCircle className="h-4 w-4" />}
                        onClick={() => remove(field.name)}
                        disabled={fields.length === 1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Form.List>

          <Form.Item className="mb-0">
            {editId ? (
              <Button type="primary" size="large" htmlType="submit" danger>
                Save
              </Button>
            ) : (
              <Button type="primary" size="large" htmlType="submit">
                Submit
              </Button>
            )}

            <Button
              onClick={handleClose}
              type="primary"
              className="!ml-3 !bg-gray-200 !text-black !shadow-none hover:!bg-gray-200"
              size="large"
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
