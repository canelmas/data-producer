import _ from 'lodash';
import faker from 'faker';

const customerTypes = ["Bireysel", "Ticari"]

const welcomeScreens = [
  'wanda',
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

const campaigns = [
  'gayle',
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

const shortcuts = [
  'mabel',
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

const menuTitles = [
  'mabelle',
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

const dashboardTabs = [
  'clara',
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

const randomKeys = [
  'eos', 
  'quia', 
  'saepe', 
  'unde', 
  'voluptates',
  'merl',
  'jed',
  'mason',
  'vernie',
  'lance'
]

let generateRandomAttributes = (event) => {

  if (_.has(attributes, event)) { // todo : this may be unnecessary

    switch (event) { // smells
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
  return addRandomAdditionalAttributes(
    {
      kullaniciTipi: _.sample(customerTypes),
      other1: faker.internet.domainWord(),
      other2: faker.internet.domainWord(),
      other3: faker.internet.domainWord(),
      other4: faker.internet.domainWord()
    }
  )
}

let addRandomAdditionalAttributes = (attrs) => {
  _.times(_.random(0,3), () => {
    attrs[getRandomKey()] = getRandomPrimitiveArray()
  })   
  return attrs   
}

let getRandomKey = () => {
  return _.sample(randomKeys)
}

let getRandomPrimitive = (type) => {
  let typeMap = {
    1: faker.random.number(),
    2: faker.random.word(),
    3: faker.random.boolean()
  }
  return typeMap[type]
}

let getRandomPrimitiveArray = () => {
  let type = _.sample([1,2,3])
  return _.times(_.random(1,5), () => {
    return getRandomPrimitive(type)        
  })
}

let getCampaignAttributes = () => {  
  return addRandomAdditionalAttributes({
    kampanyaAdi: _.sample(campaigns),
    kullaniciTipi: _.sample(customerTypes)
  })
}

let getWelcomeScreenAttributes = () => {  
  return addRandomAdditionalAttributes({
    ekranAdi: _.sample(welcomeScreens),
    kullaniciTipi: _.sample(customerTypes)
  })
}

let getShortcutAttributes = () => {  
  return addRandomAdditionalAttributes({
    kisayolAdi: _.sample(shortcuts),
    kullaniciTipi: _.sample(customerTypes)    
  })  
}

let getDashboardTabAttributes = () => {  
  return addRandomAdditionalAttributes({
    dashboardTabi: _.sample(dashboardTabs),
    kullaniciTipi: _.sample(customerTypes)
  })  
}

let getMenuItemAttributes = () => {  
  return addRandomAdditionalAttributes({
    menuAdi: _.sample(menuTitles),
    ustMenu: _.sample(menuTitles),
    kullaniciTipi: _.sample(customerTypes)
  })
}

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
  "kredi_kart_basvuru_step_3_failure",
  "pfm_dashboard_viewed",
  "prelogin_mobile_key_remember_box_checked",
  "prelogin_mobile_key_reactivate_link_pressed",
  "prelogin_entrance_mobile_key_continue_button_pressed",
  "prelogin_entrance_otp_activation_link_pressed",
  "prelogin_entrance_otp_continue_button_pressed",
  "prelogin_mobile_key_continue_button_pressed",
  "prelogin_menu_item_pressed",
  "prelogin_language_button_pressed",
  "prelogin_settings_menu_displayed",
  "prelogin_settings_isportfoy_button_pressed",
  "prelogin_left_menu_security_button_pressed",
  "prelogin_support_line_called",
  "prelogin_support_line_cancel_button_pressed",
  "prelogin_prices_and_rates_currency_converter_calculate_button_pressed",
  "prelogin_mobil_borsa_dashboard_tab_selected",
  "prelogin_mobil_borsa_my_page_asset_selected",
  "prelogin_mobil_borsa_markets_asset_selected",
  "prelogin_mobil_borsa_detail_screen_tab_selected",
  "prelogin_mobil_borsa_analysis_screen_feature_button_pressed",
  "prelogin_mobil_borsa_depth_button_pressed",
  "prelogin_mobil_borsa_my_orders_button_pressed",
  "prelogin_mobil_borsa_buy_button_pressed",
  "prelogin_mobil_borsa_sell_button_pressed",
  "prelogin_mobil_borsa_analysis_asset_selected",
  "prelogin_mobil_borsa_analysis_depth_button_pressed",
  "prelogin_mobil_borsa_analysis_my_orders_button_pressed",
  "prelogin_mobil_borsa_analysis_buy_button_pressed",
  "prelogin_mobil_borsa_analysis_sell_button_pressed",
  "prelogin_prices_and_rates_time_deposit_interest_rates_button_pressed",
  "prelogin_prices_and_rates_time_deposit_interest_rates_open_deposit_account_button_pressed",
  "prelogin_prices_and_rates_bank_rates_currency_converter_button_pressed",
  "instant_credit_application_confirmed",
  "instant_credit_application_trx_detail_button_pressed",
  "instant_credit_application_main_page_button_pressed",
  "multiple_document_approval_first_step_passed",
  "multiple_document_approval_transaction_confirmed",
  "mobil_borsa_dashboard_tab_selected",
  "mobil_borsa_my_page_asset_selected",
  "mobil_borsa_markets_asset_selected",
  "mobil_borsa_detail_screen_tab_selected",
  "mobil_borsa_analysis_screen_feature_button_pressed",
  "mobil_borsa_depth_button_pressed",
  "mobil_borsa_my_orders_button_pressed",
  "mobil_borsa_buy_button_pressed",
  "mobil_borsa_sell_button_pressed",
  "money_transfer_action_button_pressed",
  "hgs_update_instruction_step1_passed",
  "hgs_update_instruction_confirmed",
  "ogs_update_instruction_step1_passed",
  "ogs_update_instruction_confirmed",
  "user_logged_in",
  "mobil_borsa_dashboard_tab_selected",
  "mobil_borsa_analysis_asset_selected",
  "mobil_borsa_analysis_depth_button_pressed",
  "mobil_borsa_analysis_my_orders_button_pressed",
  "mobil_borsa_analysis_buy_button_pressed",
  "mobil_borsa_analysis_sell_button_pressed",
  "contracts_detail_button_pressed",
  "contract_approval_link_pressed",
  "contract_approval_contract_approved",
  "investment_open_investment_account_button_pressed",
  "instant_commercial_credit_application_credit_type_selected",
  "instant_commercial_credit_application_credit_amount_entered",
  "instant_commercial_credit_application_maturity_and_installment_date_entered",
  "instant_commercial_credit_application_continue_button_pressed",
  "instant_commercial_credit_application_account_and_mail_entered",
  "instant_commercial_credit_application_transfer_into_account_button_pressed",
  "instant_commercial_credit_application_credit_amount_screen_back_button_pressed",
  "instant_commercial_credit_application_maturity_and_installment_date_screen_back_button_pressed",
  "instant_commercial_credit_application_confirm_screen_back_button_pressed",
  "instant_commercial_credit_application_account_and_mail_screen_back_button_pressed",
  "instant_commercial_credit_application_approve_screen_back_button_pressed",
  "prices_and_rates_open_deposit_account_button_pressed",
  "dashboard_tab_selected",
  "shortcut_added",
  "shortcut_pressed",
  "shortcut_deleted",
  "postlogin_notif_deleted",
  "postlogin_notif_all_deleted",
  "postlogin_notif_pressed",
  "postlogin_notif_settings_button_pressed",
  "postlogin_notif_settings_switch_subscribed",
  "postlogin_notif_settings_switch_unsubscribed",
  "postlogin_notif_icon_pressed",
  "welcome_screen_refreshed",
  "postlogin_settings_welcome_screen_pressed",
  "postlogin_settings_registered_users_on_device_pressed",
  "postlogin_settings_registered_user_cancelled",
  "postlogin_settings_registered_devices_pressed",
  "postlogin_settings_registered_device_cancelled",
  "postlogin_settings_imessage_pressed",
  "postlogin_settings_imessage_account_set",
  "postlogin_settings_imessage_account_deleted",
  "postlogin_settings_notifications_pressed",
  "left_menu_settings_button_pressed",
  "postlogin_support_line_called",
  "user_logged_out",
  "logout_button_pressed",
  "campaign_selected",
  "campaign_displayed",
  "campaign_not_interested_button_pressed",
  "campaign_maybe_later_button_pressed",
  "campaign_get_ref_code_button_pressed",
  "campaign_interested_button_pressed",
  "account_selected",
  "account_swiped",
  "account_detail_button_pressed",
  "account_share_option_selected",
  "account_activity_list_filtered",
  "account_activity_list_sent_via_email",
  "receipt_filtered",
  "receipt_selected",
  "receipt_rotated",
  "receipt_send_email_button_pressed",
  "receipt_sent_via_email",
  "deposit_tl_account_opening_offer_displayed_and_first_step_passed",
  "deposit_tl_account_opening_first_step_passed",
  "deposit_tl_account_opening_view_interest_rates_button_pressed",
  "deposit_tl_account_opening_confirmed",
  "deposit_tl_account_opening_receipt_sent",
  "deposit_tl_account_opening_trx_detail_button_pressed",
  "deposit_tl_account_opening_main_page_button_pressed",
  "deposit_tl_account_opening_back_button_pressed",
  "deposit_foreign_currency_account_opening_back_button_pressed",
  "deposit_tl_account_closing_first_step_passed",
  "deposit_tl_account_closing_confirmed",
  "deposit_tl_account_closing_trx_detail_button_pressed",
  "deposit_tl_account_closing_main_page_button_pressed",
  "deposit_tl_account_closing_receipt_sent",
  "overdraft_account_application_first_step_passed",
  "overdraft_account_application_second_step_passed",
  "overdraft_account_application_third_step_passed",
  "overdraft_account_application_confirmed",
  "overdraft_account_application_trx_detail_button_pressed",
  "overdraft_account_application_main_page_button_pressed",
  "credit_card_swiped",
  "card_shopping_permissions_saved",
  "prices_and_rates_instant_loan_button_pressed",
  "prices_and_rates_credit_type_selected",
  "prices_and_rates_open_account_button_pressed",
  "instant_commercial_credit_application_credit_type_selected",
  "prices_and_rates_investment_fund_and_gold_sell_button_pressed",
  "prices_and_rates_foreign_currency_buy_button_pressed",
  "prices_and_rates_foreign_currency_sell_button_pressed",
  "menu_item_searched",
  "money_transfer_to_unregistered_account_step1_passed",
  "money_transfer_to_unregistered_account_confirmed",
  "money_transfer_to_unregistered_account_trx_detail_button_pressed",
  "money_transfer_to_unregistered_account_accnt_info_button_pressed",
  "money_transfer_to_unregistered_account_receipt_sent",
  "money_transfer_to_unregistered_account_main_page_button_pressed",
  "money_transfer_to_registered_account_step1_passed",
  "money_transfer_to_registered_account_confirmed",
  "money_transfer_to_registered_account_trx_detail_button_pressed",
  "money_transfer_to_registered_account_accnt_info_button_pressed",
  "money_transfer_to_registered_account_receipt_sent",
  "money_transfer_to_registered_account_main_page_button_pressed",
  "money_transfer_to_mobile_step1_passed",
  "money_transfer_to_mobile_confirmed",
  "money_transfer_to_mobile_trx_detail_button_pressed",
  "money_transfer_to_mobile_receipt_sent",
  "money_transfer_to_mobile_main_page_button_pressed",
  "eft_to_unregistered_account_step1_passed",
  "eft_to_unregistered_account_confirmed",
  "eft_to_unregistered_account_trx_detail_button_pressed",
  "eft_to_unregistered_account_accnt_info_button_pressed",
  "eft_to_unregistered_account_receipt_sent",
  "eft_to_unregistered_account_main_page_button_pressed",
  "eft_to_registered_account_step1_passed",
  "eft_to_registered_account_confirmed",
  "eft_to_registered_account_trx_detail_button_pressed",
  "eft_to_registered_account_accnt_info_button_pressed",
  "eft_to_registered_account_receipt_sent",
  "eft_to_registered_account_main_page_button_pressed",
  "foreign_currency_transfer_to_unregistered_account_step1_passed",
  "foreign_currency_transfer_to_unregistered_account_confirmed",
  "foreign_currency_transfer_to_unregistered_account_trx_detail_button_pressed",
  "foreign_currency_transfer_to_unregistered_account_receipt_sent",
  "foreign_currency_transfer_to_unregistered_account_main_page_button_pressed",
  "foreign_currency_transfer_to_registered_account_step1_passed",
  "foreign_currency_transfer_to_registered_account_confirmed",
  "foreign_currency_transfer_to_registered_account_trx_detail_button_pressed",
  "foreign_currency_transfer_to_registered_account_receipt_sent",
  "foreign_currency_transfer_to_registered_account_main_page_button_pressed",
  "digital_coinbox_first_tutorial_close_button_pressed",
  "digital_coinbox_first_tutorial_next_button_pressed",
  "digital_coinbox_second_tutorial_close_button_pressed",
  "digital_coinbox_second_tutorial_previous_button_pressed",
  "digital_coinbox_settings_button_pressed",
  "digital_coinbox_name_updated",
  "digital_coinbox_target_amount_updated",
  "digital_coinbox_target_amount_info_button_pressed",
  "digital_coinbox_play_sound_switch_updated",
  "digital_coinbox_show_balance_switch_updated",
  "digital_coinbox_show_balance_info_button_pressed",
  "digital_coinbox_clear_amount_button_pressed",
  "digital_coinbox_amount_entrance_step_passed",
  "digital_coinbox_transfer_confirmed",
  "digital_coinbox_transfer_accnt_info_button_pressed",
  "digital_coinbox_transfer_trx_detail_button_pressed",
  "digital_coinbox_transfer_main_page_button_pressed",
  "digital_coinbox_transfer_receipt_sent",
  "create_transfer_order_first_step_passed",
  "create_transfer_order_first_step_info_button_pressed",
  "create_transfer_order_confirmation_info_button_pressed",
  "create_transfer_order_confirmed"
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