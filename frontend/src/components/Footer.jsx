import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full bg-zinc-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
                <img
                  src={logo}
                  alt="e-shop logo"
                  className="h-full w-full object-contain p-1"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-wide text-white">
                  e-shop
                </h2>
                <p className="text-sm text-gray-400">
                  Premium Shopping Experience
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Discover quality products, secure payments, and fast delivery.
              Shop smarter with a seamless and modern e-commerce experience.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 transition-all duration-300 hover:bg-zinc-700 hover:text-white"
              >
                <Facebook size={18} />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 transition-all duration-300 hover:bg-zinc-700 hover:text-white"
              >
                <Instagram size={18} />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 transition-all duration-300 hover:bg-zinc-700 hover:text-white"
              >
                <Twitter size={18} />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 transition-all duration-300 hover:bg-zinc-700 hover:text-white"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">
              Quick Links
            </h3>

            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 transition hover:text-white"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/users/carts"
                  className="text-gray-400 transition hover:text-white"
                >
                  Cart
                </Link>
              </li>

              <li>
                <Link
                  to="/users/orders"
                  className="text-gray-400 transition hover:text-white"
                >
                  Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">
              Customer Care
            </h3>

            <ul className="space-y-3">
              <li>
                <Link
                  to="#"
                  className="text-gray-400 transition hover:text-white"
                >
                  Shipping Policy
                </Link>
              </li>

              <li>
                <Link
                  to="#"
                  className="text-gray-400 transition hover:text-white"
                >
                  Return Policy
                </Link>
              </li>

              <li>
                <Link
                  to="#"
                  className="text-gray-400 transition hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  to="#"
                  className="text-gray-400 transition hover:text-white"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-white">
              Contact Us
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-500" />
                <span className="text-gray-400">support@e-shop.com</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gray-500" />
                <span className="text-gray-400">+91 79035 71542</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 text-gray-500" />
                <span className="text-gray-400">Bihar, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-gray-500 md:flex-row">
            <p>© {year} e-shop. All Rights Reserved.</p>
            <p className="text-center">
              Crafted with ❤️ for a seamless shopping experience.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
