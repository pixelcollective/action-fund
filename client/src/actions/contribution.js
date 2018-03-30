import axios from 'axios'

function setContributionValue(total) {
  return {
    type:  'SET_CONTRIBUTION',
    total: total
  }
}

function setContributionValueFail() {
  return {
    type: 'SET_CONTRIBUTION_FAILED'
  }
}

export function setContributionTotal() {
  return (dispatch) => {
    axios.get('https://api.dearestjustin.org/contributions/value')
      .then(function(response) {
        console.log(response.data)
        dispatch(setContributionValue(response.data))
      })
      .catch(function(error) {
        console.log(error)
        dispatch(setContributionValueFail())
      })
  }
}

export function completedContribution(amount) {
  return {
    type:     'CONTRIBUTION_COMPLETE',
    complete: true
  }
}
