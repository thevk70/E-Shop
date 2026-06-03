import { useEffect, useState } from "react";
import { useAuth } from "../../zustand/useAuth";
import { Select, Table } from "antd";
import { Loader2 } from "lucide-react";
import moment from "moment/moment";
import { toast } from "react-toastify/unstyled";
import { httpRequest } from "../../lib/http-request";

const Customers = () => {
  const { user } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await httpRequest.get("/auth/users");
      setCustomers(data);
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (role, id) => {
    alert(role);
    try {
      const { data } = await httpRequest.put(`/auth/users/${id}`, { role });
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response.user.data.message);
    }
  };

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  const columns = [
    {
      key: "sn",
      title: "SN",
      render: (item1, item2, index) => index + 1,
    },
    {
      key: "customersName",
      title: "Customer's name",
      render: (item) => <label className="capital">{item.fullname}</label>,
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
    },
    {
      key: "role",
      title: "Role",
      render: (item) => (
        <Select
          defaultValue={item.role}
          className="w-90px"
          onChange={(role) => changeRole(role, item._id)}
        >
          <Select.Option value="user">User</Select.Option>
          <Select.Option value="admin">Admin</Select.Option>
        </Select>
      ),
    },
    {
      key: "joinedAt",
      title: "Joined",
      render: (item) => moment(item.createdAt).format("MMM DD YYYY hh:mm A"),
    },
  ];

  if (isLoading)
    return (
      <div className="flex items-pt-32 justify-center h-screen">
        <Loader2 className="animate-spin w-12 h-12 text-gray-400" />
      </div>
    );
  return (
    <Table
      rowKey={(record) => record._id}
      columns={columns}
      dataSource={customers}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default Customers;
