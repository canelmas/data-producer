import _ from 'lodash';
import faker from 'faker';

const customerTypes = ["Bireysel", "Ticari"]

const welcomeScreens = ['wanda',
  'anika',
  'geovanny',
  'dashawn',
  'marlee',
  'rickey',
  'fidel',
  'andreanne',
  'mina',
  'alivia'
]

const campaigns = ['gayle',
  'steve',
  'skye',
  'valerie',
  'dewayne',
  'verner',
  'samir',
  'jayme',
  'gisselle',
  'rosa',
  'marcia',
  'garth',
  'coralie',
  'selina',
  'keanu',
  'golda',
  'elmer',
  'jessy',
  'rudy',
  'allene'
]

const shortcuts = ['mabel',
  'pierce',
  'tobin',
  'malinda',
  'jeffery',
  'rosanna',
  'hellen',
  'don',
  'gerson',
  'lola',
  'blake',
  'rigoberto',
  'alanis',
  'avery',
  'arely',
  'gust',
  'jalon',
  'trace',
  'blanche',
  'gilberto'
]

const menuTitles = ['mabelle',
  'ken',
  'thad',
  'dulce',
  'graciela',
  'mac',
  'darrin',
  'larissa',
  'alta',
  'carolanne',
  'madelynn',
  'ali',
  'vidal',
  'johnnie',
  'amelie',
  'hayley',
  'freeda',
  'owen',
  'dina',
  'harley',
  'carlee',
  'donnell',
  'jailyn',
  'lou',
  'marquis',
  'bria',
  'alena',
  'novella',
  'ciara',
  'felicity',
  'ryann',
  'eugene',
  'jamil',
  'carley',
  'beaulah',
  'hilbert',
  'tamia',
  'zaria',
  'yasmine',
  'seth',
  'abagail',
  'marianna',
  'birdie',
  'bud',
  'jennyfer',
  'blanche',
  'elvis',
  'evalyn',
  'junius',
  'jaclyn'
]

const dashboardTabs = ['clara',
  'kellen',
  'emelia',
  'eduardo',
  'maymie',
  'holden',
  'caterina',
  'turner',
  'annabel',
  'herminia',
  'jaren',
  'adrian',
  'kellen',
  'lane',
  'jordi',
  'jody',
  'anahi',
  'eda',
  'fermin',
  'idella',
  'ethelyn',
  'berry',
  'roderick',
  'zelma',
  'ford',
  'lillie',
  'lisandro',
  'nona',
  'lauryn',
  'xander',
  'hulda',
  'garett',
  'coty',
  'alisa',
  'jacklyn',
  'claud',
  'georgiana',
  'wiley',
  'lucinda',
  'angelo',
  'cruz',
  'trisha',
  'louie',
  'donald',
  'tiana',
  'weston',
  'elaina',
  'isom',
  'leda',
  'gonzalo'
]

const attributes = {
  "left_menu_item_pressed": getMenuItemAttributes,
  "dashboard_tab_selected": getDashboardTabAttributes,
  "shortcut_added": getShortcutAttributes,
  "shortcut_pressed": getShortcutAttributes,
  "shortcut_deleted": getShortcutAttributes,
  "welcome_screen_refreshed": getWelcomeScreenAttributes,
  "campaign_selected": getCampaignAttributes,
  "campaign_displayed": getCampaignAttributes,
  "campaign_not_interested_button_pressed": getCampaignAttributes,
  "campaign_maybe_later_button_pressed": getCampaignAttributes,
  "campaign_get_ref_code_button_pressed": getCampaignAttributes,
  "campaign_interested_button_pressed": getCampaignAttributes
}

let generateRandomAttributes = (event) => {

  if (_.has(attributes, event)) {

    switch (event) { // smells really bad
      case "shortcut_added":
      case "shortcut_pressed":
      case "shortcut_deleted":
        return getShortcutAttributes()
      case "campaign_selected":
      case "campaign_displayed":
      case "campaign_not_interested_button_pressed":
      case "campaign_maybe_later_button_pressed":
      case "campaign_get_ref_code_button_pressed":
      case "campaign_interested_button_pressed":
        return getCampaignAttributes()
      case "welcome_screen_refreshed":
        return getWelcomeScreenAttributes()
      case "dashboard_tab_selected":
        return getDashboardTabAttributes()
      case "left_menu_item_pressed":
        return getMenuItemAttributes()
      default:
        return getRandomAttributes()
    }

  } else {
    return getRandomAttributes()
  }
}

let getRandomAttributes = () => {
  return {
    kullaniciTipi: _.sample(customerTypes),
    other1: faker.internet.domainWord(),
    other2: faker.internet.domainWord(),
    other3: faker.internet.domainWord(),
    other4: faker.internet.domainWord()
  }
}

let getCampaignAttributes = () => {
  return {
    kampanyaAdi: _.sample(campaigns),
    kullaniciTipi: _.sample(customerTypes)
  }
}

let getWelcomeScreenAttributes = () => {
  return {
    ekranAdi: _.sample(welcomeScreens),
    kullaniciTipi: _.sample(customerTypes)
  }
}

let getShortcutAttributes = () => {
  return {
    kisayolAdi: _.sample(shortcuts),
    kullaniciTipi: _.sample(customerTypes)
  }
}

let getDashboardTabAttributes = () => {
  return {
    dashboardTabi: _.sample(dashboardTabs),
    kullaniciTipi: _.sample(customerTypes)
  }
}

let getMenuItemAttributes = () => {
  return {
    menuAdi: _.sample(menuTitles),
    ustMenu: _.sample(menuTitles),
    kullaniciTipi: _.sample(customerTypes)
  }
}

const events = [
  "login_clicked",
  "left_menu_item_pressed",
  "dashboard_item_clicked",
  "payments_clicked",
  "help_button_clicked",
  "logout_clicked",
  "kredi_kart_basvuru_step_1_success",
  "kredi_kart_basvuru_step_2_success",
  "kredi_kart_basvuru_step_3_success",
  "kredi_kart_basvuru_step_1_failure",
  "kredi_kart_basvuru_step_2_failure",
  "kredi_kart_basvuru_step_3_failure"
]

let takeOne = () => {

  let event = _.sample(events)

  return {
    "name": event,
    "attrs": generateRandomAttributes(event)
  }
}

export default {
  takeOne
}