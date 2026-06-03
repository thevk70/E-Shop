import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";

const schema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email"),
});

const ForgotPassword = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      console.log(values);

      // API Call Later
      // await httpRequest.post("/forgot-password", values)
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <Sparkles className="h-8 w-8" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Forgot Password
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Enter your registered email address and we'll send you a password
              reset link.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-zinc-700" />

              <div>
                <h3 className="font-semibold text-zinc-900">Secure Recovery</h3>

                <p className="mt-1 text-sm text-zinc-600">
                  For security reasons, password reset instructions will only be
                  sent to registered accounts.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-zinc-900 font-semibold text-white shadow-lg transition hover:bg-zinc-800 active:scale-[0.99]"
            >
              Send Reset Link
            </button>
          </form>

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
