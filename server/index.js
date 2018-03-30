const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const axios = require('axios')
const money = require('./util/money')

const config = require('./config')
const stripeSecretKey = config.stripeSecretKey
const nowSecret = config.nowSecret
const actionNetworkSecret = config.actionNetworkSecret

var stripe = require('stripe')(stripeSecretKey)
require('now-logs')(nowSecret)

const app = express()

app.use(helmet())
app.use(cors())
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.json('oh hello')
})

app.get('/contributions/value', function (req, res) {
  stripe.balance.retrieve(function(err, balance) {
    console.log('available balance: ' + balance.available[0].amount)
    console.log('pending balance: ' + balance.pending[0].amount)
    let balanceTotal = balance.available[0].amount
    balanceTotal += balance.pending[0].amount
    stripe.payouts.list({limit: 100}, function(err, payouts) {
      var payoutValue = 0, payoutTotal = 0, currentPayout = 0, numberOfPayouts = 0
      for (currentPayout = 0, numberOfPayouts = payouts.data.length; currentPayout < numberOfPayouts; currentPayout++) {
        payoutValue = payouts.data[currentPayout].amount
        payoutTotal += payoutValue
      }
      let campaignTotal = (payoutTotal + balanceTotal) / 100
      console.log('total amount contributed: ' + campaignTotal)
      res.json(campaignTotal)
    })
  })
})

app.post('/contribution/create/:amount', function (req, res) {
  let amount = decodeURIComponent(req.params.amount)
  stripe.charges.create({
    amount:      amount,
    currency:    'usd',
    description: 'Dearest Justin',
    source:      req.body.id
  }, function(err, charge) {
    if(err) {
      console.log('contribution error: ' + err)
      res.json(err)
    } else {
      console.log('contribution complete: ' + charge)
      res.json(charge)
    }
  })
})

app.listen(3000, () => console.log('Server running.'))
