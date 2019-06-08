import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import moment from 'moment'
import {newEventTime} from '../util'

let generate = (appId) => {

  let ldid = uuid()

  return {    
    email : faker.internet.email(),
    clientCreationDate: newEventTime(),
    appId: appId || null,
    phone: faker.phone.phoneNumber(),
    aid: uuid(),
    cid: uuid(),
    nid: faker.finance.iban(),
    ldid: ldid,
    fn: faker.name.firstName(),
    ln: faker.name.lastName(),
    gender: _.sample(["male", "female", "other"]),
    dob: moment(faker.date.past(_.sample([20, 25, 30, 35, 40, 45, 50, 55, 60]))).format("YYYY-MM-DD"),
    maritalStatus: _.sample(["M", "S", "O"]),
    dids : [
      ldid,
      uuid()
    ],
    createdAt: moment(faker.date.past()).format('x'),
    lastSeenAt: moment(faker.date.recent()).format('x'),
    lastModifiedAt: moment(faker.date.recent()).format('x'),
    data : process.env.GENERATE_USER_DEMOGRAPHICS ? generateDemographics() : null
  }  

}

let generateDemographics = () => {

  let firstActivityYearsAgo = _.sample([20, 25, 30, 35, 40, 45, 50, 55, 60])

  return {
    "birth_city" : _.sample([6, 34, 35, 1, 24, 25, 40, 59]),
    "resid_city" : _.sample([6, 34, 35, 1, 24, 25, 40, 59]),
    "num_of_kids" : _.random(0,5),
    "type": _.sample(["bireysel", "kobi", "ticari"]),
    "segment": _.sample(["Mass", "Private", "Platinum"]),
    "first_activity": moment(faker.date.past(firstActivityYearsAgo)).format("YYYY-MM-DD"),
    "last_activity": moment(faker.date.between("2018-01-01", "2019-01-10")).format("YYYY-MM-DD"),
    "activity_status": _.sample(["Active", "Inactive"]),
    "active_years" : firstActivityYearsAgo,
    "is_mensup": _.sample([0,1]),
    "monthly_income" : faker.finance.amount(2000.00, 500000.00),
    "last_education": _.sample(["Grad", "Undergrad", "Highschool"]),
    "is_maas_customer": _.sample([0,1]),
    "is_isuni" : _.sample([0,1]),
    "is_kamu" : _.sample([0,1]),
    "is_emekli" : _.sample([0,1]),
    "meslek_segment" : _.sample(["doktor", "pilot", "öğretmen", "mühendis"]),
    "num_of_vehicles" : _.random(0, 10),
    "num_of_houses": _.random(0,20),
    "resid_country" : faker.address.countryCode(),
    "is_digital" : _.sample([0,1]),
    "num_of_visits_internet_last_year" : _.random(0,3000),
    "num_of_transactions_internet_last_year" : _.random(0, 20000),
    "num_of_visits_mobile_last_year": _.random(0,3000),
    "num_of_transactions_mobile_last_year" : _.random(0, 20000),
    "num_of_visits_branch_last_year" : _.random(0,3000),
    "num_of_transactions_branch_last_year" : _.random(0, 20000),
    "num_of_visits_atm_last_year" : _.random(0,3000),
    "num_of_transactions_atm_last_year" : _.random(0, 20000),
    "most_atm_branch_visited_city" : _.sample([6, 34, 35, 1, 24, 25, 40, 59]),
    "total_mal_varlik" : faker.finance.amount(100.00, 1000000.00),
    "has_tl_vadesiz" : _.sample([0,1]),
    "has_doviz_vadesiz" : _.sample([0,1]),
    "num_of_vadesiz" : _.random(0,10),
    "avg_vadesiz_amount_last_1_year" : faker.finance.amount(1000.00,100000.00),
    "has_tl_vadeli" : _.sample([0,1]),
    "total_borc" : faker.finance.amount(0, 2000000.00),
    "has_aktif_kredi": _.sample([0,1]),
    "has_aktif_kredi_last_2_years" : _.sample([0,1]),
    "total_aktif_kredi": faker.finance.amount(0, 2000000.00),
    "total_kredi_basvuru" : _.random(0,10),
    "has_kredi_basvuru_red": _.sample([0,1]),
    "has_aktif_ev_kredi": _.sample([0,1]),
    "has_aktif_tasit_kredi" : _.sample([0,1]),
    "num_of_aktif_kart": _.random(0,10),
    "has_aktif_ek_kart" : _.sample([0,1]),
    "has_aktif_sanal_kart" : _.sample([0,1]),
    "total_kart_limit": faker.finance.amount(2000.00, 50000.00),
    "has_kart_red": _.sample([0,1]),
    "average_monthly_kart_spending" : faker.finance.amount(200.00, 100000.00),
    "most_kart_spending_city" : _.sample([6, 34, 35, 1, 24, 25, 40, 59]),
    "total_aktif_products": _.random(1, 20),
    "max_aktif_products": _.random(1,40),
    "total_customer_value_last_1_year": faker.finance.amount(200.00, 1000000.00),
    "num_of_aktif_otomatik_fatura" : _.random(0,10),
    "num_of_fatura_last_1_year" : _.random(0,120),
    "num_of_faturasiz_hat_last_1_year" : _.random(0,48),
    "num_of_kira_last_1_year" : _.random(0,48),
    "num_of_okul_last_1_year" : _.random(0,36)
  }
}


export default { generate }