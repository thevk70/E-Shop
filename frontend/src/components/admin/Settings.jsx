import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Switch,
  Tabs,
  Upload,
  message,
  Divider,
} from "antd";
import {
  Bell,
  Building2,
  Camera,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  Store,
  UserCircle2,
  Save,
} from "lucide-react";
import { httpRequest } from "../../lib/http-request";
import { useAuth } from "../../zustand/useAuth";

const Settings = () => {
  const { user } = useAuth();
  const [profileForm] = Form.useForm();
  const [storeForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const initialProfileValues = {
    fullname: user?.fullname || "Admin",
    email: user?.email || "admin@e-shop.com",
    phone: user?.phone || "",
  };

  const initialStoreValues = {
    storeName: "e-shop",
    supportEmail: "support@e-shop.com",
    supportPhone: "+91 98765 43210",
    address: "India",
  };

  const initialNotificationValues = {
    newOrders: true,
    paymentAlerts: true,
    lowStockAlerts: true,
    newUserAlerts: true,
    cancelledOrderAlerts: true,
  };

  const initialSecurityValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const handleProfileSave = async (values) => {
    try {
      setLoading(true);
      await httpRequest.put("/admin/settings/profile", values);
      message.success("Profile updated successfully");
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSave = async (values) => {
    try {
      setLoading(true);
      await httpRequest.put("/admin/settings/store", values);
      message.success("Store settings updated successfully");
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Failed to update store settings",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async (values) => {
    try {
      setLoading(true);
      await httpRequest.put("/admin/settings/notifications", values);
      message.success("Notification settings saved");
    } catch (err) {
      message.error(
        err?.response?.data?.message ||
          "Failed to update notification settings",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySave = async (values) => {
    try {
      setLoading(true);

      if (values.newPassword !== values.confirmPassword) {
        message.error("New password and confirm password do not match");
        return;
      }

      await httpRequest.put("/admin/settings/security", values);
      securityForm.resetFields();
      message.success("Password changed successfully");
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: "profile",
      label: (
        <span className="flex items-center gap-2">
          <UserCircle2 className="h-4 w-4" />
          Profile
        </span>
      ),
      children: (
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Profile</h2>
              <p className="text-sm text-gray-500">
                Update your personal information
              </p>
            </div>
          </div>

          <Form
            form={profileForm}
            layout="vertical"
            initialValues={initialProfileValues}
            onFinish={handleProfileSave}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Form.Item
                label="Full Name"
                name="fullname"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input size="large" placeholder="Full name" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  size="large"
                  prefix={<Mail className="h-4 w-4 text-gray-400" />}
                  placeholder="Email address"
                />
              </Form.Item>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Form.Item label="Phone" name="phone">
                <Input
                  size="large"
                  prefix={<Phone className="h-4 w-4 text-gray-400" />}
                  placeholder="Phone number"
                />
              </Form.Item>

              <Form.Item label="Profile Image">
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button size="large" icon={<Camera className="h-4 w-4" />}>
                    Upload Image
                  </Button>
                </Upload>
              </Form.Item>
            </div>

            <div className="flex justify-end">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<Save className="h-4 w-4" />}
                className="h-11 rounded-2xl bg-zinc-900 font-semibold hover:!bg-zinc-800"
              >
                Save Profile
              </Button>
            </div>
          </Form>
        </Card>
      ),
    },
    {
      key: "store",
      label: (
        <span className="flex items-center gap-2">
          <Store className="h-4 w-4" />
          Store
        </span>
      ),
      children: (
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Store Information
              </h2>
              <p className="text-sm text-gray-500">Update your shop details</p>
            </div>
          </div>

          <Form
            form={storeForm}
            layout="vertical"
            initialValues={initialStoreValues}
            onFinish={handleStoreSave}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Form.Item
                label="Store Name"
                name="storeName"
                rules={[{ required: true, message: "Please enter store name" }]}
              >
                <Input size="large" placeholder="Store name" />
              </Form.Item>

              <Form.Item
                label="Support Email"
                name="supportEmail"
                rules={[
                  { required: true, message: "Please enter support email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  size="large"
                  prefix={<Mail className="h-4 w-4 text-gray-400" />}
                  placeholder="Support email"
                />
              </Form.Item>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Form.Item
                label="Support Phone"
                name="supportPhone"
                rules={[
                  { required: true, message: "Please enter support phone" },
                ]}
              >
                <Input
                  size="large"
                  prefix={<Phone className="h-4 w-4 text-gray-400" />}
                  placeholder="Support phone"
                />
              </Form.Item>

              <Form.Item
                label="Address"
                name="address"
                rules={[
                  { required: true, message: "Please enter store address" },
                ]}
              >
                <Input size="large" placeholder="Store address" />
              </Form.Item>
            </div>

            <div className="flex justify-end">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<Save className="h-4 w-4" />}
                className="h-11 rounded-2xl bg-zinc-900 font-semibold hover:!bg-zinc-800"
              >
                Save Store Settings
              </Button>
            </div>
          </Form>
        </Card>
      ),
    },
    {
      key: "notifications",
      label: (
        <span className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </span>
      ),
      children: (
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-500">
                Choose what alerts you want to receive
              </p>
            </div>
          </div>

          <Form
            layout="vertical"
            initialValues={initialNotificationValues}
            onFinish={handleNotificationSave}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Form.Item
                label="New Order Alerts"
                name="newOrders"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Payment Alerts"
                name="paymentAlerts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Low Stock Alerts"
                name="lowStockAlerts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="New User Alerts"
                name="newUserAlerts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Cancelled Order Alerts"
                name="cancelledOrderAlerts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>

            <Divider />

            <div className="flex justify-end">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<Save className="h-4 w-4" />}
                className="h-11 rounded-2xl bg-zinc-900 font-semibold hover:!bg-zinc-800"
              >
                Save Preferences
              </Button>
            </div>
          </Form>
        </Card>
      ),
    },
    {
      key: "security",
      label: (
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Security
        </span>
      ),
      children: (
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Change Password
              </h2>
              <p className="text-sm text-gray-500">
                Keep your admin account secure
              </p>
            </div>
          </div>

          <Form
            form={securityForm}
            layout="vertical"
            initialValues={initialSecurityValues}
            onFinish={handleSecuritySave}
          >
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[
                { required: true, message: "Please enter current password" },
              ]}
            >
              <Input.Password size="large" placeholder="Current password" />
            </Form.Item>

            <div className="grid gap-4 md:grid-cols-2">
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  { required: true, message: "Please enter new password" },
                ]}
              >
                <Input.Password size="large" placeholder="New password" />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                rules={[{ required: true, message: "Please confirm password" }]}
              >
                <Input.Password size="large" placeholder="Confirm password" />
              </Form.Item>
            </div>

            <div className="flex justify-end">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<Save className="h-4 w-4" />}
                className="h-11 rounded-2xl bg-zinc-900 font-semibold hover:!bg-zinc-800"
              >
                Update Password
              </Button>
            </div>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Manage your profile, store details, notification preferences, and
            account security from one place.
          </p>
        </div>

        <Tabs
          defaultActiveKey="profile"
          items={tabItems}
          className="admin-settings-tabs"
        />
      </div>
    </div>
  );
};

export default Settings;
