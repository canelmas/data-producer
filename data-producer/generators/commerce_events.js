import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import util from 'util'
import {
  Buffer
} from 'buffer';

const commerceEvents = [
  "purchase",  
  "purchaseError",
  "viewProduct",
  "viewCategory",
  "search",
  "clearCart",
  "addToWishList",
  "removeFromWishList",
  "startCheckout",
  "addToCart",
  "removeFromCart"
]

let generateProduct = () => {

  let category = faker.commerce.product()
  let name = faker.commerce.productName()

  return {
    id: Buffer.from(name, "ascii").toString("base64"),
    name: name,
    description: util.format("A very %s %s", faker.commerce.productAdjective(), name),
    brand: util.format("%s Brand", faker.commerce.productAdjective()),
    quantity: _.random(1, 5),
    price: Number(faker.commerce.price()),
    variant: faker.commerce.color(),
    category: category,
    currency: "USD"
  }

}

let generateProducts = (num) => {
  return _.times(num, () => {
    return generateProduct()
  })
}

let getTotalQuantity = (products) => {
  let q = 0
  _.forEach(products, (product) => {
    q += Number(product.quantity)
  })
  return q
}

let getTotalValue = (products) => {
  let value = 0
  _.forEach(products, (product) => {
    value += (parseInt(product.quantity) * parseFloat(product.price))
  })
  return value
}

let generatePurchase = (success) => {

  let products = generateProducts(_.random(1, 10))

  let totalValue = Number(getTotalValue(products))

  return {
    currency: "USD",
    value: totalValue,
    tax: totalValue / 40,
    ship: totalValue / 10,
    coupon: faker.lorem.word(11).toUpperCase(),
    discount: totalValue / 20,
    trxId: uuid(),
    paymentMethod: _.sample(["visa", "mastercard", "troy", "debit", "american express"]),
    quantity: getTotalQuantity(products),
    products: products,
    success: success,
    errorCode: !success ? _.sample([100, 101, 102, 103, 104, 105]) : null,
    errorMessage: !success ? util.format("NOK-%s", _.random(1, 10)) : null
  }

}

let generateCheckout = () => {
  return {
    value: 5 * Number(faker.commerce.price()),
    currency: "USD",
    quantity: _.random(1, 10)
  }
}

let generateEvent = () => {

  let event = _.sample(commerceEvents)

  switch (event) {

    case "viewProduct":
      return render(event, generateProduct())

    case "search":
      return render(event, {
        keyword: faker.commerce.product()
      })

    case "viewCategory":
      return render(event, {
        category: faker.commerce.product()
      })

    case "purchase":
      return render(event, generatePurchase(true))    
    
    case "purchaseError":
      return render("purchase", generatePurchase(false))    

    case "addToWishList":
      return render(event, generateProduct())

    case "removeFromWishList":
      return render(event, generateProduct())

    case "startCheckout":
      return render(event, generateCheckout())

    case "addToCart":
      return render(event, generateProduct())

    case "removeFromCart":
      return render(event, generateProduct())

    default:
      return render(event, null)
  }
}

let render = (eventName, data) => {
  return {
    "name": eventName,
    "attrs": data
  }
}

export default {
  takeOne: generateEvent
}