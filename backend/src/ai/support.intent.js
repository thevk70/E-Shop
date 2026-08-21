const supportCategories = {
  payment: {
    keywords: [
      "payment failed",
      "payment failure",
      "payment issue",
      "payment problem",
      "payment not working",
      "transaction failed",
      "transaction issue",
      "transaction problem",
      "money deducted",
      "money debited",
      "payment deducted",
      "upi failed",
      "card payment failed",
      "razorpay failed",
      "checkout failed",
    ],

    title: "Payment Support",

    message:
      "We're sorry you're experiencing an issue with your payment. Please contact our support team for assistance.",

    email: "support@e-shop.com",
    phone: "+91 79035 71542",
  },

  order: {
    keywords: [
      "order issue",
      "order problem",
      "order not received",
      "didn't receive my order",
      "not received my order",
      "where is my order",
      "order is late",
      "order delayed",
      "delivery issue",
      "delivery problem",
      "delivery late",
      "delivery delayed",
    ],

    title: "Order & Delivery Support",

    message:
      "We're sorry you're having trouble with your order. Please contact our support team with your order details.",

    email: "support@e-shop.com",
    phone: "+91 79035 71542",
  },

  refund: {
    keywords: [
      "refund",
      "refund issue",
      "refund not received",
      "refund pending",
      "money not refunded",
      "want my money back",
      "money back",
    ],

    title: "Refund Support",

    message:
      "For refund-related issues, please contact our support team with your order and payment details.",

    email: "support@e-shop.com",
    phone: "+91 79035 71542",
  },

  return: {
    keywords: [
      "return product",
      "return item",
      "want to return",
      "return my order",
      "product return",
      "return issue",
      "return problem",
    ],

    title: "Product Return Support",

    message:
      "For product returns, please contact our support team with your order details.",

    email: "support@e-shop.com",
    phone: "+91 79035 71542",
  },

  product: {
    keywords: [
      "damaged product",
      "damaged item",
      "broken product",
      "broken item",
      "wrong product",
      "wrong item",
      "defective product",
      "defective item",
      "product issue",
      "product problem",
      "received damaged",
    ],

    title: "Product Support",

    message:
      "We're sorry about the issue with your product. Please contact our support team and provide your order details.",

    email: "support@e-shop.com",
    phone: "+91 79035 71542",
  },

  complaint: {
    keywords: [
      "complaint",
      "complain",
      "raise a complaint",
      "file a complaint",
      "customer complaint",
      "bad experience",
      "poor service",
      "unhappy",
      "not satisfied",
      "issue with my order",
      "problem with my order",
      "need help",
      "customer support",
    ],

    title: "Customer Support",

    message:
      "We're sorry you're experiencing an issue. Our support team is here to help you resolve it.",

    email: "support@e-shop.com",
    phone: "+91 79035 71542",
  },
};

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s₹]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const detectSupportIntent = (text) => {
  const normalizedText = normalizeText(text);

  let bestMatch = null;
  let highestScore = 0;

  for (const [category, config] of Object.entries(supportCategories)) {
    let score = 0;

    for (const keyword of config.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (normalizedText.includes(normalizedKeyword)) {
        // Longer phrases are stronger matches
        score += normalizedKeyword.split(" ").length;
      }
    }

    if (score > highestScore) {
      highestScore = score;

      bestMatch = {
        category,
        ...config,
      };
    }
  }

  return bestMatch;
};
