import React, { Component } from "react";
import axios from "axios";

import "./putraShopeeTest.css";

class Shopee extends Component {
  state = {
    currencies: [
      { name: "CAD", value: 0, detail: "CAD - Canadian Dollar" },
      { name: "IDR", value: 0, detail: "IDR - Indonesian Rupiah" },
      { name: "GBP", value: 0, detail: "GBP - British Pound" },
      { name: "CHF", value: 0, detail: "CHF - Swiss Franc" },
      { name: "SGD", value: 0, detail: "SGD - Singapore Dollar" },
      { name: "INR", value: 0, detail: "INR - Indian Rupee" },
      { name: "MYR", value: 0, detail: "MYR - Malaysian Ringgit" },
      { name: "JPY", value: 0, detail: "JPY - Japanese Yen" },
      { name: "KRW", value: 0, detail: "IDR - South Korean Won" },
      { name: "EUR", value: 0, detail: "EUR - Euro" }
    ],
    shows: [],
    showsDefault: ["IDR", "EUR", "GBP", "SGD"],
    rates: undefined,
    defaultValue: 10,
    selectedCurrencyIndex: ""
  };

  componentDidMount() {
    this.getRates();
  }

  getRates = async () => {
    let { currencies, shows, defaultValue, showsDefault } = this.state;

    const response = await axios.get(
      "https://api.exchangeratesapi.io/latest?base=USD&symbols=EUR,IDR,CAD,GBP,CHF,SGD,INR,MYR,JPY,KRW"
    );

    currencies = await this.calculate(
      currencies,
      response.data.rates,
      defaultValue
    );

    for (let key of showsDefault) {
      for (let currency of currencies) {
        if (key === currency.name) {
          shows.push(currency);

          const index = currencies.indexOf(currency);
          currencies.splice(index, 1);
        }
      }
    }

    this.setState({
      ...this.state,
      rates: response.data,
      currencies,
      shows
    });
  };

  addCurrency = () => {
    let { currencies, shows, selectedCurrencyIndex } = this.state;

    if (selectedCurrencyIndex !== "") {
      shows.push(currencies[selectedCurrencyIndex]);

      currencies.splice(selectedCurrencyIndex, 1);
    }

    this.setState({
      ...this.state,
      currencies,
      shows,
      selectedCurrencyIndex: ""
    });
  };

  selectCurrency = event => {
    this.setState({
      ...this.state,
      selectedCurrencyIndex: event.target.value
    });
  };

  removeCurrency = index => {
    let { currencies, shows } = this.state;

    currencies.push(shows[index]);

    shows.splice(index, 1);

    this.setState({
      ...this.state,
      currencies,
      shows
    });
  };

  calculate = (currencies, rates, inputValue) => {
    for (let currency of currencies) {
      for (let rate of Object.keys(rates)) {
        if (currency.name === rate) {
          currency.value = inputValue * rates[rate];
          break;
        }
      }
    }

    return currencies;
  };

  handleInputChange = async event => {
    let { currencies, shows } = this.state;
    let { rates } = this.state.rates;

    let input = event.target.value;

    currencies = await this.calculate(currencies, rates, input);
    shows = await this.calculate(shows, rates, input);

    this.setState({
      ...this.state,
      currencies,
      shows
    });
  };

  numberWithCommas(num) {
    var num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }

  render() {
    const {
      currencies,
      defaultValue,
      shows,
      rates,
      selectedCurrencyIndex
    } = this.state;

    return (
      <div className="container">
        <div className="head">
          <em className="title">USD - United State Dolar</em>

          <div>USD</div>

          <input
            type="text"
            defaultValue={defaultValue}
            onChange={this.handleInputChange}
          />
        </div>

        {shows.map((data, index) => {
          let { name, value, detail } = data;

          value = value.toFixed(4);
          value = this.numberWithCommas(value);

          let rate = rates.rates[name].toFixed(4);
          rate = this.numberWithCommas(rate);

          return (
            <div className="currency-container" key={index}>
              <div className="currency">
                <div className="currency-title">
                  <div>{name}</div>
                  <div className="value">{value}</div>
                </div>

                <div>
                  <em className="detail">{detail}</em>
                  <div className="rate">{`1 USD = ${name} ${rate}`}</div>
                </div>
              </div>

              <button
                type="submit"
                className="button-delete"
                onClick={() => this.removeCurrency(index)}
              >
                -
              </button>
            </div>
          );
        })}

        <div className="sumbit">
          <select value={selectedCurrencyIndex} onChange={this.selectCurrency}>
            <option value="">Add Currency</option>

            {currencies.map((currency, index) => {
              return (
                <option key={index} value={index}>
                  {currency.name}
                </option>
              );
            })}
          </select>

          <button
            type="submit"
            className="button-add"
            onClick={this.addCurrency}
          >
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default Shopee;
