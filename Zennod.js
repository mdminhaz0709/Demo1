const readline = require('readline');

const productPrices = {
  'Product A': 20,
  'Product B': 40,
  'Product C': 50,
};

const discountRules = {
  'flat_10_discount': { threshold: 200, discount: 10 },
  'bulk_5_discount': { threshold: 10, discount: 0.05 },
  'bulk_10_discount': { threshold: 20, discount: 0.1 },
  'tiered_50_discount': { totalThreshold: 30, productThreshold: 15, discount: 0.5 },
};

const giftWrapFee = 1;
const shippingFeePerPackage = 5;
const unitsPerPackage = 10;

function calculateProductTotal(product, quantity, isGiftWrapped) {
  const unitPrice = productPrices[product];
  const giftWrapCost = isGiftWrapped ? giftWrapFee * quantity : 0;
  const totalAmount = unitPrice * quantity + giftWrapCost;
  return { totalAmount, giftWrapCost };
}

function calculateDiscount(cart) {
  let maxDiscount = 0;
  let appliedRule = '';

  for (const rule in discountRules) {
    const { threshold, discount, totalThreshold, productThreshold } = discountRules[rule];

    if (threshold && cart.subtotal > threshold) {
      const currentDiscount = discount;
      if (currentDiscount > maxDiscount) {
        maxDiscount = currentDiscount;
        appliedRule = rule;
      }
    } else if (totalThreshold && productThreshold) {
      if (cart.totalQuantity > totalThreshold && cart.maxProductQuantity > productThreshold) {
        const currentDiscount = discount;
        if (currentDiscount > maxDiscount) {
          maxDiscount = currentDiscount;
          appliedRule = rule;
        }
      }
    }
  }

  return { discount: maxDiscount, rule: appliedRule };
}

function calculateShippingFee(totalQuantity) {
  return Math.ceil(totalQuantity / unitsPerPackage) * shippingFeePerPackage;
}

async function processOrder() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const cart = {
    items: [],
    subtotal: 0,
    totalQuantity: 0,
    maxProductQuantity: 0,
    totalGiftWrapFee: 0,
  };

  async function getProductInput(product) {
    const quantity = parseInt(await askQuestion(`Enter the quantity of ${product}: `), 10);
    const isGiftWrapped = (await askQuestion(`Is ${product} wrapped as a gift? (yes/no): `)).toLowerCase() === 'yes';

    const { totalAmount, giftWrapCost } = calculateProductTotal(product, quantity, isGiftWrapped);

    cart.items.push({ product, quantity, totalAmount });
    cart.subtotal += totalAmount;
    cart.totalQuantity += quantity;
    cart.maxProductQuantity = Math.max(cart.maxProductQuantity, quantity);
    cart.totalGiftWrapFee += giftWrapCost;
  }

  function askQuestion(question) {
    return new Promise(resolve => {
      rl.question(question, answer => {
        resolve(answer);
      });
    });
  }

  const productNames = Object.keys(productPrices);
  for (const product of productNames) {
    await getProductInput(product);
  }

  const { discount, rule } = calculateDiscount(cart);

  const shippingFee = calculateShippingFee(cart.totalQuantity);

  console.log('Order Summary:');
  cart.items.forEach(item => {
    console.log(`${item.product} - Quantity: ${item.quantity} - Total: $${item.totalAmount}`);
  });
  console.log(`Subtotal: $${cart.subtotal}`);
  console.log(`Discount applied (${rule}): $${discount}`);
  console.log(`Gift Wrap Fee: $${cart.totalGiftWrapFee}`);
  console.log(`Shipping Fee: $${shippingFee}`);
  console.log(`Total: $${cart.subtotal - discount + shippingFee + cart.totalGiftWrapFee}`);

  rl.close();
}

processOrder();