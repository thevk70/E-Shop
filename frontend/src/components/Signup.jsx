import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../zustand/useAuth";

const schema = Yup.object({
  fullname: Yup.string().required("Fullname field is required."),
  email: Yup.string()
    .required("Email field is required.")
    .email("Please enter a valid email.")
    .test("is-gmail", "Only gmail is allowed", (value) => {
      return value && value.toLowerCase().endsWith("@gmail.com");
    }),
  password: Yup.string()
    .required("Password field is required.")
    .min(6, "Minimum 6 character required.")
    .matches(/[A-Z]/, "Atleast one uppercase required")
    .matches(/[a-z]/, "Atleast one lowercase required")
    .matches(/[0-9]/, "Atleast one number required")
    .matches(/[^A-Za-z0-9]/, "Atleast one special characters required"),
});

const Signup = () => {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullname: "",
      email: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: signup,
  });

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-zinc-100 via-white to-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.12)] lg:grid-cols-2">
          <div className="relative hidden min-h-[680px] overflow-hidden bg-zinc-900 p-8 text-white lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_28%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-900 shadow-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">e-shop</h2>
                  <p className="text-sm text-zinc-300">
                    Premium shopping experience
                  </p>
                </div>
              </div>

              <div className="max-w-md">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-zinc-100 backdrop-blur">
                  <ShieldCheck className="h-4 w-4" />
                  Secure account creation
                </div>

                <h1 className="text-4xl font-bold leading-tight tracking-tight">
                  Create your account and start shopping smarter.
                </h1>
                <p className="mt-4 text-base leading-7 text-zinc-300">
                  Join e-shop to browse products, place orders, and manage your
                  shopping journey with a clean and secure experience.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-sm font-semibold">Fast Signup</p>
                  <p className="mt-1 text-sm text-zinc-300">
                    Quick account creation with a modern interface.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-sm font-semibold">Secure Access</p>
                  <p className="mt-1 text-sm text-zinc-300">
                    Safe login for both users and admins.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                      e-shop
                    </h2>
                    <p className="text-sm text-gray-500">
                      Premium shopping experience
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Create account
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Fill in your details to get started.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={formik.handleSubmit}>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        name="fullname"
                        value={formik.values.fullname}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="John Doe"
                        className={`w-full rounded-2xl border bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-4 ${
                          formik.touched.fullname && formik.errors.fullname
                            ? "border-rose-500 focus:ring-rose-100"
                            : "border-gray-200 focus:border-zinc-900 focus:ring-zinc-100"
                        }`}
                      />
                    </div>
                    {formik.touched.fullname && formik.errors.fullname && (
                      <p className="mt-2 text-xs font-medium text-rose-500">
                        {formik.errors.fullname}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        autoComplete="username"
                        placeholder="example@gmail.com"
                        className={`w-full rounded-2xl border bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-4 ${
                          formik.touched.email && formik.errors.email
                            ? "border-rose-500 focus:ring-rose-100"
                            : "border-gray-200 focus:border-zinc-900 focus:ring-zinc-100"
                        }`}
                      />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <p className="mt-2 text-xs font-medium text-rose-500">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="********"
                        className={`w-full rounded-2xl border bg-gray-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:bg-white focus:ring-4 ${
                          formik.touched.password && formik.errors.password
                            ? "border-rose-500 focus:ring-rose-100"
                            : "border-gray-200 focus:border-zinc-900 focus:ring-zinc-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-900"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <p className="mt-2 text-xs font-medium text-rose-500">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-zinc-900 font-semibold text-white shadow-lg transition hover:bg-zinc-800 active:scale-[0.99]"
                  >
                    Create Account
                  </button>
                </form>

                <div className="mt-6 flex flex-col gap-3 text-sm">
                  <p className="text-center text-gray-500">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-zinc-900 transition hover:underline"
                    >
                      Sign in now
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
