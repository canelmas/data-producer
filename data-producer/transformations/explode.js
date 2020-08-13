const _ = require('lodash')

module.exports = (data) => {

    if (!data.attributes || Object.keys(data.attributes).length == 1) {
        return data
    }

    let exploded = []

    let keys = Object.keys(data.attributes)

    keys.forEach(key => {

        let item = {
            dim_name: key
        }

        let type = typeof (data.attributes[key])
        // console.log(`TYPE====>>> ${type} for ${key}`)

        switch (type) {
            case 'object':

                if (key === 'products') {

                    let products = data.attributes[key]

                    products.forEach(product => {

                        let keys = Object.keys(product)

                        keys.forEach(key => {

                            let item = {
                                dim_name: `products.${key}`
                            }

                            switch (typeof (product[key])) {
                                case 'number':
                                    item.dim_value_double = product[key]
                                    break
                                case 'boolean':
                                    item.dim_value_boolean = product[key]
                                    break
                                case 'string':
                                default:
                                    item.dim_value_string = product[key]
                                    break
                            }

                            exploded.push(_.assignIn(Object.assign({}, data), {
                                attributes: item
                            }))

                        })

                    })
                } else {
                    item.dim_value_string = data.attributes[key]
                }
                break
            case 'number':
                item.dim_value_double = data.attributes[key]
                break
            case 'boolean':
                item.dim_value_boolean = data.attributes[key]
                break
            case 'string':
            default:
                item.dim_value_string = data.attributes[key]
                break
        }

        exploded.push(_.assignIn(Object.assign({}, data), {
            attributes: item
        }))

    })

    return exploded

}