export const priceCalculator = (price, discount) => {
  const discountedAmount = (price * discount) / 100;
  const afterDiscountPrice = price - discountedAmount;
  return afterDiscountPrice;
};
