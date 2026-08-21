import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Headphones,
  Loader2,
  Mail,
  Minus,
  Move,
  Phone,
  Send,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { httpRequest } from "../lib/http-request";
import { priceCalculator } from "../lib/price-calculator";
import placeholderImg from "../assets/product-placeholder.jpg";

const INITIAL_MESSAGE = {
  role: "assistant",
  type: "text",
  content:
    "Hi! 👋 I'm your AI shopping assistant. Tell me what you're looking for, your budget, occasion, or preferences and I'll help you find the right products.",
};

const AIShoppingAssistant = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [productContext, setProductContext] = useState(null);

  const [messages, setMessages] = useState([INITIAL_MESSAGE]);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [dragging, setDragging] = useState(false);

  const messagesEndRef = useRef(null);

  const dragStart = useRef({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // =========================================================
  // PRODUCT CONTEXT EVENTS
  // =========================================================

  useEffect(() => {
    const handleOpenAI = (event) => {
      const product = event.detail?.product;

      if (!product) return;

      setProductContext(product);
      setOpen(true);

      const recommendationReason =
        event.detail?.recommendationReason ||
        product.recommendationReason ||
        null;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "text",
          content: recommendationReason
            ? `You're viewing "${product.title}". I recommended this product because ${recommendationReason} I can also answer questions about its price, features, stock, or compare it with other products.`
            : `You're viewing "${product.title}". I can help you understand this product, explain whether it fits your needs, compare it with other products, or answer questions about it.`,
        },
      ]);
    };

    const handleProductContext = (event) => {
      const product = event.detail?.product;

      if (!product) return;

      setProductContext(product);
    };

    window.addEventListener("open-ai-assistant", handleOpenAI);

    window.addEventListener("ai-product-context", handleProductContext);

    return () => {
      window.removeEventListener("open-ai-assistant", handleOpenAI);

      window.removeEventListener("ai-product-context", handleProductContext);
    };
  }, []);

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =========================================================
  // DRAGGING
  // =========================================================

  const handleDragStart = (event) => {
    if (event.button !== 0) return;

    setDragging(true);

    dragStart.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      startX: position.x,
      startY: position.y,
    };

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragStart.current.mouseX;

      const deltaY = moveEvent.clientY - dragStart.current.mouseY;

      let newX = dragStart.current.startX + deltaX;

      let newY = dragStart.current.startY + deltaY;

      newX = Math.max(-350, Math.min(newX, 300));
      newY = Math.max(-500, Math.min(newY, 300));

      setPosition({
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      setDragging(false);

      document.removeEventListener("mousemove", handleMouseMove);

      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);

    document.addEventListener("mouseup", handleMouseUp);
  };

  // =========================================================
  // ASK AI
  // =========================================================

  const askAI = async (text = query) => {
    const cleanQuery = text.trim();

    if (!cleanQuery || loading) return;

    setQuery("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        type: "text",
        content: cleanQuery,
      },
    ]);

    try {
      setLoading(true);

      const response = await httpRequest.post("/ai/shopping-assistant", {
        query: cleanQuery,

        productContext: productContext
          ? {
              _id: productContext._id,
              title: productContext.title,
              description: productContext.description,
              price: productContext.price,
              discount: productContext.discount,
              category: productContext.category,
              stock: productContext.stock,
              recommendationReason: productContext.recommendationReason || null,
            }
          : null,
      });

      const data = response.data;

      if (data.type === "support") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "support",
            content: data.answer,
            category: data.category,
            support: data.support,
          },
        ]);

        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "recommendation",
          content: data.answer,
          products: data.products || [],
        },
      ]);
    } catch (error) {
      console.error("AI assistant error:", error);

      toast.error(
        error.response?.data?.message || "Unable to connect to AI assistant.",
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "text",
          content: "Sorry, I couldn't process that request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // VIEW PRODUCT
  // =========================================================

  const handleViewProduct = (product) => {
    if (!product?._id) {
      toast.error("Product information is unavailable.");
      return;
    }

    navigate(`/product/${product._id}`, {
      state: {
        aiContext: {
          productId: product._id,
          productTitle: product.title,
          productDescription: product.description,
          productPrice: product.price,
          productDiscount: product.discount,
          productCategory: product.category,
          productStock: product.stock,
          recommendationReason: product.recommendationReason || null,
        },
      },
    });

    setOpen(false);
  };

  const suggestions = [
    "Gift under ₹3000",
    "Something for fitness",
    "Home office essentials",
  ];

  return (
    <>
      {/* =====================================================
          CHAT WINDOW
      ===================================================== */}

      {open && (
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
          className={`
            fixed
            bottom-24
            right-4
            z-[1000]
            flex
            h-[min(680px,calc(100vh-120px))]
            w-[calc(100vw-32px)]
            max-w-[420px]
            flex-col
            overflow-hidden
            rounded-3xl
            border
            border-gray-200
            bg-white
            shadow-[0_25px_80px_rgba(0,0,0,0.22)]
            sm:right-6
            ${dragging ? "cursor-grabbing" : ""}
          `}
        >
          {/* Header */}

          <div
            onMouseDown={handleDragStart}
            className="relative shrink-0 cursor-grab overflow-hidden bg-gray-950 px-5 py-4 text-white active:cursor-grabbing"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-600/30 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-600/20">
                  <span className="text-sm font-black tracking-tight">AI+</span>

                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-gray-950 bg-green-400" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">ShopAI</h3>

                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-gray-300">
                      AI
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-gray-400">
                    Personal shopping assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="mr-1 hidden items-center gap-1 text-gray-500 sm:flex">
                  <Move className="h-3 w-3" />

                  <span className="text-[9px]">Drag</span>
                </div>

                <button
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Minimize assistant"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <button
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat */}

          <div className="flex-1 overflow-y-auto bg-[#fafafa] px-4 py-5">
            <div className="space-y-5">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[9px] font-black text-violet-600">
                      AI+
                    </div>
                  )}

                  <div className="max-w-[86%]">
                    {/* Text */}

                    {message.type === "text" && (
                      <div
                        className={`
                          rounded-2xl px-4 py-3 text-sm leading-5
                          ${
                            message.role === "user"
                              ? "rounded-br-md bg-gray-900 text-white"
                              : "rounded-tl-md border border-gray-200 bg-white text-gray-700 shadow-sm"
                          }
                        `}
                      >
                        {message.content}
                      </div>
                    )}

                    {/* Recommendations */}

                    {message.type === "recommendation" && (
                      <>
                        <div className="rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-3 text-sm leading-5 text-gray-700 shadow-sm">
                          {message.content}
                        </div>

                        {message.products?.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {message.products.map((product, productIndex) => {
                              const finalPrice = priceCalculator(
                                product.price,
                                product.discount,
                              );

                              return (
                                <div
                                  key={product._id}
                                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                >
                                  <div className="flex gap-3 p-3">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                                      <img
                                        src={
                                          product.images?.[0] || placeholderImg
                                        }
                                        alt={product.title}
                                        className="h-full w-full object-contain p-2"
                                        onError={(event) => {
                                          event.currentTarget.src =
                                            placeholderImg;
                                        }}
                                      />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      {productIndex === 0 && (
                                        <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-bold text-violet-700">
                                          <span className="font-black">
                                            AI+
                                          </span>
                                          BEST MATCH
                                        </span>
                                      )}

                                      <h4 className="line-clamp-2 text-sm font-semibold text-gray-900">
                                        {product.title}
                                      </h4>

                                      <div className="mt-1 flex items-center gap-2">
                                        <span className="font-bold text-gray-900">
                                          ₹{finalPrice.toLocaleString("en-IN")}
                                        </span>

                                        {product.discount > 0 && (
                                          <span className="text-[10px] text-gray-400 line-through">
                                            ₹
                                            {Number(
                                              product.price,
                                            ).toLocaleString("en-IN")}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {product.recommendationReason && (
                                    <div className="border-t border-violet-100 bg-violet-50/60 px-3 py-2.5">
                                      <div className="flex gap-2">
                                        <span className="mt-0.5 shrink-0 text-[9px] font-black text-violet-600">
                                          AI+
                                        </span>

                                        <div>
                                          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700">
                                            Why I picked this
                                          </p>

                                          <p className="text-[11px] leading-4 text-violet-900">
                                            {product.recommendationReason}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <button
                                    onClick={() => handleViewProduct(product)}
                                    className="flex h-9 w-full items-center justify-center gap-1.5 border-t border-gray-100 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-violet-600"
                                  >
                                    View product
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {message.products?.length === 0 && (
                          <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 text-center">
                            <ShoppingBag className="mx-auto h-5 w-5 text-gray-400" />

                            <p className="mt-2 text-xs text-gray-500">
                              I couldn't find a strong product match.
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Support */}

                    {message.type === "support" && (
                      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {message.support?.title || "Customer Support"}
                              </p>

                              <p className="text-[10px] text-gray-500">
                                We're here to help
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="text-xs leading-5 text-gray-600">
                            {message.content}
                          </p>

                          {message.support?.email && (
                            <a
                              href={`mailto:${message.support.email}`}
                              className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:bg-gray-100"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                <Mail className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                                  Email
                                </p>

                                <p className="text-xs font-semibold text-gray-800">
                                  {message.support.email}
                                </p>
                              </div>
                            </a>
                          )}

                          {message.support?.phone && (
                            <a
                              href={`tel:${message.support.phone.replace(
                                /\s/g,
                                "",
                              )}`}
                              className="mt-2 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:bg-gray-100"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                <Phone className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                                  Phone
                                </p>

                                <p className="text-xs font-semibold text-gray-800">
                                  {message.support.phone}
                                </p>
                              </div>
                            </a>
                          )}

                          <div className="mt-3 flex items-center gap-2 rounded-xl bg-violet-50 p-3">
                            <Headphones className="h-4 w-4 shrink-0 text-violet-600" />

                            <p className="text-[10px] leading-4 text-violet-900">
                              Our support team will assist you with your issue.
                            </p>
                          </div>

                          {message.support?.email && (
                            <a
                              href={`mailto:${
                                message.support.email
                              }?subject=E-Shop ${
                                message.support?.title || "Support"
                              }`}
                              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-xs font-semibold text-white transition hover:bg-violet-600"
                            >
                              Contact Support
                              <ArrowRight className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-600">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading */}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[9px] font-black text-violet-600">
                    AI+
                  </div>

                  <div className="rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500" />

                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500"
                          style={{
                            animationDelay: "120ms",
                          }}
                        />

                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500"
                          style={{
                            animationDelay: "240ms",
                          }}
                        />
                      </div>

                      <span className="text-xs text-gray-400">
                        Finding the best options...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestions */}

          {messages.length === 1 && !loading && (
            <div className="shrink-0 border-t border-gray-100 bg-white px-4 pt-3">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <span className="font-black text-violet-600">AI+</span>
                Try asking
              </div>

              <div className="flex gap-2 overflow-x-auto pb-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => askAI(suggestion)}
                    className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-medium text-gray-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}

          <div className="shrink-0 border-t border-gray-200 bg-white p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 transition focus-within:border-violet-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-100">
              <textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    askAI();
                  }
                }}
                rows={1}
                placeholder="Ask about products or any issue..."
                className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-xs text-gray-900 outline-none placeholder:text-gray-400"
              />

              <button
                onClick={() => askAI()}
                disabled={!query.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-[9px] text-gray-400">
              AI+ can help with products, orders, payments, refunds and more.
            </p>
          </div>
        </div>
      )}

      {/* Floating AI+ button */}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-5 right-5 z-[1000] flex h-16 w-16 items-center justify-center rounded-full bg-gray-950 text-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-105 hover:bg-violet-600 sm:bottom-6 sm:right-6"
          aria-label="Open AI shopping assistant"
        >
          <span className="relative text-sm font-black tracking-tight">
            AI+
          </span>

          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400" />
        </button>
      )}
    </>
  );
};

export default AIShoppingAssistant;
