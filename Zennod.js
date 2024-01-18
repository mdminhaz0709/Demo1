//My name is Md Minhaz Alam
/* 
Task 1

Here is a catalogue with 3 products.

Product Name : Price
Product A : $20
Product B : $40
Product C : $50

Discount Rules:
"flat_10_discount": If cart total exceeds $200, apply a flat $10 discount on the cart total.
"bulk_5_discount": If the quantity of any single product exceeds 10 units, apply a 5% discount on that item's total price.
"bulk_10_discount": If total quantity exceeds 20 units, apply a 10% discount on the cart total.
"tiered_50_discount": If total quantity exceeds 30 units & any single product quantity greater than 15, then apply a 50% discount on products which are above  15 quantity. The first 15 quantities have the original price and units above 15 will get a 50% discount.
Note: Only one rule can be applied per purchase. If multiple discounts are applicable, the program calculates the discount amount for each rule and applies the most beneficial one for customer.

Fees:
Gift wrap fee: $1 per unit.
Shipping fee: 10 units can be packed in one package, and the shipping fee for each package is $5.
Program
The program will ask the quantity of each product. The program will also ask if that product is wrapped as a gift?

Then the program will show / output below details.
The product name, quantity & total amount of that product.
Subtotal
The discount name applied & the discount amount.
The shipping fee & the gift wrap fee.
Total
Please solve the problem using 2 programming languages you know well (preferably Python, JavaScript, or PHP). You don't need to create a web application or don’t need to use any database for this. 

*/
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
