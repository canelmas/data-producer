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

let getAmount = () => {
  return _.random(1, 10000, true)
}

let generateProduct = () => {

  let category = faker.commerce.product()
  let name = faker.commerce.productName()

  return {
    id: Buffer.from(name, "ascii").toString("base64"),
    name: name,
    description: util.format("A very %s %s", faker.commerce.productAdjective(), name),
    brand: util.format("%s Brand", faker.commerce.productAdjective()),
    quantity: _.random(1, 5),
    price: getAmount(),
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

let getStore = () => {
  return 'store_' + _.random(1, 50)
}

let getUserType = () => {
  return 'userType_' + _.random(1, 10)
}

let getDistributor = () => {
  return 'distributor_' + _.random(1, 500)
}

let generatePurchase = (success) => {

  let products = generateProducts(_.random(1, 10))

  let totalValue = getTotalValue(products)

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
    errorMessage: !success ? util.format("NOK-%s", _.random(1, 10)) : null,
    firstSuccess: _.sample([true, false]),
    firstError: _.sample([true, false]),
    store: getStore()
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
      return render(event, {product : generateProduct()})

    case "search":
      return render(event, {
        query: faker.commerce.product()
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
      return render(event, {product : generateProduct()})

    case "removeFromWishList":
      return render(event, {product : generateProduct()})

    case "addToCart":
      return render(event, {product : generateProduct(), value: getAmount(), totalCartValue : getAmount()})

    case "removeFromCart":
      return render(event, {product : generateProduct(), value: getAmount(), totalCartValue : getAmount()})

    case "startCheckout" :
      return render(event, {value : getAmount(), currency : "USD", quantity: _.random(1, 10)})

    default:
      return render(event, null)
  }
}

let render = (eventName, data) => {

  if (data) {
    Object.assign(data, {
      userType: getUserType(),
      distributor: getDistributor()
    })

    if (['viewProduct', 'search', 'viewCategory', 'addToCart'].includes(eventName)) {
      Object.assign(data, {
        firstTime: _.sample([true, false])
      })
    }
  }

  return {
    "name": eventName,
    "attrs": data
  }
}

export default {
  takeOne: generateEvent
}