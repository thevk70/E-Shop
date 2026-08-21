import Groq from "groq-sdk";
import Product from "../products/products.schema.js";
import { detectSupportIntent } from "./support.intent.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const shoppingAssistant = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        message: "Please enter what you are looking for.",
      });
    }

    //Support Intent
    const supportIntent = detectSupportIntent(query);

    if (supportIntent) {
      return res.status(200).json({
        type: "support",
        category: supportIntent.category,
        answer: supportIntent.message,
        support: {
          title: supportIntent.title,
          email: supportIntent.email,
          phone: supportIntent.phone,
        },
        products: [],
      });
    }

    // Get products currently in stock
    const products = await Product.find({
      stock: { $gt: 0 },
    })
      .select("title description price discount stock category images")
      .lean();

    if (!products.length) {
      return res.status(404).json({
        message: "No products are currently available.",
      });
    }

    // Prepare catalog for AI
    const productCatalog = products.map((product) => ({
      id: product._id.toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      discount: product.discount,
      finalPrice: product.price - (product.price * product.discount) / 100,
      stock: product.stock,
      category: product.category,
    }));

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: `
You are an AI shopping assistant for an e-commerce store.

Your job is to recommend products ONLY from the provided catalog.

IMPORTANT RULES:

1. Never invent products.
2. Never invent product IDs.
3. Every productId MUST exactly match an id from the catalog.
4. Respect the user's budget.
5. Prefer products that are in stock.
6. Recommend a maximum of 4 products.
7. Give a short reason for each recommendation.
8. Return ONLY valid JSON.
9. Do not use markdown.
10. Do not include any text outside the JSON.

Required JSON format:

{
  "message": "short helpful response",
  "recommendations": [
    {
      "productId": "exact product id from catalog",
      "reason": "short explanation"
    }
  ]
}
          `,
        },
        {
          role: "user",
          content: `
Customer request:

${query}

Available products:

${JSON.stringify(productCatalog)}
          `,
        },
      ],

      temperature: 0.2,

      response_format: {
        type: "json_object",
      },
    });

    const rawAnswer = response.choices[0].message.content;

    let aiResult;

    try {
      aiResult = JSON.parse(rawAnswer);
    } catch (parseError) {
      return res.status(500).json({
        message: "AI returned an invalid response.",
      });
    }

    // Validate recommendations
    const validRecommendations = Array.isArray(aiResult.recommendations)
      ? aiResult.recommendations.filter((recommendation) =>
          products.some(
            (product) => product._id.toString() === recommendation.productId,
          ),
        )
      : [];

    // Get actual MongoDB products
    const recommendedProducts = validRecommendations
      .map((recommendation) => {
        const product = products.find(
          (item) => item._id.toString() === recommendation.productId,
        );

        if (!product) return null;

        return {
          ...product,
          recommendationReason: recommendation.reason,
        };
      })
      .filter(Boolean);

    return res.json({
      answer: aiResult.message,
      products: recommendedProducts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to process your shopping request.",
    });
  }
};
