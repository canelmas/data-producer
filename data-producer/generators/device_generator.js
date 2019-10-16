import _ from 'lodash';

let ANDROID_BRANDS = [
  "HTC",
  "Casper",
  "LGE",
  "Samsung",
  "General Mobile",
  "Motorola",
  "Huawei",
  "Google",
  "Xiaomi"
]

let ANDROID_MODELS = [
  "Nexus 5",
  "SM-G928C",
  "LG-D802",
  "SM-G610F",
  "Pixel",
  "GT-N7100",
  "Samsung Grand Prime Plus",
  "Samsung Galaxy S8",
  "Samsung Grand J5",
  "Samsung Grand S7",
  "Xiaomi Redmi Note",
  "Samsung Galaxy S9"
]

let generate = (deviceId) => {

  let platform = _.sample(["ANDROID", "iOS"]) || process.env.DP_PLATFORM
  let brand = getDeviceBrand(platform) || process.env.DP_BRAND
  let model = getDeviceModel(brand) || process.env.DP_MODEL

  return {
    deviceId: deviceId,
    language: _.sample(["tr", "en", "fr", "it", "es", "hy", "eu", "bg", "la", "pl", "uk"]) || process.env.DP_LANGUAGE,
    country: _.sample(["US", "TR", "ES", "PT", "PL", "UA", "NO", "MT", "KR", "IT", "DE", "PY", "PE", "QA", "SN", "ZA", "CH", "AL", "AO", "BS", "AU", "BG", "CA", "DK", "FR", "IN", "JP", "MY", "MX", "GB", "ZW"]) || process.env.DP_COUNTRY,
    appVersionName: _.sample(["1.0.0", "1.0.1", "1.0.2", "1.0.3", "1.0.4", "1.0.5", "2.0.0", "2.1.0", "2.2.2"]) || process.env.DP_APP_VERSION_NAME,
    appVersionCode: _.sample(_.range(1, 20)) || process.env.DP_APP_VERSION_CODE,
    appPackageName: "com.lovely.app" || process.env.DP_APP_PACKAGE_NAME,
    sdkVersion: _.sample(["1.2.10", "1.3.0", "1.1.0", "1.1.1", "2.0.0", "2.1.0", "2.2.0", "2.2.1"]) || process.env.DP_SDK_VERSION,
    timezone: _.sample(["Europe/Minsk", "Europe/Brussels", "America/Sao_Paulo", "Europe/Berlin", "Europe/Rome", "Europe/Moscow", "Europe/Istanbul", "Europe/London",
      "America/Chicago", "America/Los_Angeles", "America/New_York", "Europe/Vatican", "Asia/Seoul", "Europe/Madrid"
    ]) || process.env.DP_TIMEZONE,
    platform: platform,
    deviceCategory: _.sample(["PHONE", "DESKTOP"]) || process.env.DP_DEVICE_CATEGORY,
    deviceBrand: brand,
    deviceModel: model,
    osVersion: _.sample(["9", "24", "12.0.1", "10.13", "7.1.1", "11.4.1", "16", "12.1.0", "6.0", "10.1", "11.1.1"]) || process.env.DP_OS_VERSION,
    carrier: _.sample(["Vodafone", "Turkcell", "Unknown", "Verizon", "Sprint", "Turk Telekom", "Bell", "AT&T"]) || process.env.DP_CARRIER
  }

}

let getDeviceBrand = (platform) => {
  switch (platform) {
    case "ANDROID":
      return _.sample(ANDROID_BRANDS)
    case "iOS":
      return "Apple"
  }
}

let getDeviceModel = (brand) => {

  switch (brand) {
    case "Apple":
      return _.sample(["iPhone SE", "iPhone 7 Plus", "iPhone X", "iPhone 6"])
    default:
      return _.sample(ANDROID_MODELS)
  }

}

export default {
  generate
}