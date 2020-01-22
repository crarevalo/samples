import React, {Component, Fragment} from "react";
import axios from "axios";
import { Line } from 'react-chartjs-2';

const AVBASE = "https://api.worldtradingdata.com/api/v1/history"; //"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY";
const SYMBOL = "symbol=";
const DATEFROM = "date_from=";
const APIKEY = "";

class App extends Component{

  constructor(props){
    super(props);

    this.state = {
      mode : "",
      symbol : "",
      metadata : null,
      data : null
    };

    this.retrieveData = this.retrieveData.bind(this);
    this.setChartData = this.setChartData.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  retrieveData(symbol){
    axios(`${AVBASE}?${SYMBOL}${symbol}&${DATEFROM}2018-01-01&${APIKEY}`).then(result => this.setChartData(result)).catch(error => this.setState({error}));
  }

  setChartData(result){
    if (!result || !result.data) return;
    
    let series = result.data["history"]; //"Time Series (Daily)"];
    if (!series) return;

    const {symbol} = this.state;
    let values = [];
    let keys = Object.keys(series);
    keys.sort();
    for (let i = 0; i < keys.length; i++){
      const key = keys[i];
      const info = series[key];
      const value = info["close"]; //"4. close"];
      values.push(value);
    }
    
    const color = "rgba(0, 0, 255, 0.25)";
    this.setState({data : {datasets : [{label : symbol, borderColor : color, backgroundColor : color, data : values}], labels : keys}});
  }

  onSearchChange(event){
    this.setState({symbol : event.target.value});
  }

  onSearchSubmit(event){
    this.retrieveData(this.state.symbol);
    event.preventDefault();
  }

  componentDidMount(){}

  render(){
    const {symbol, data} = this.state;

    return (
      <Fragment>
        <Search value={symbol} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Search</Search>
        {data ? <Line data={data} /> : ""}
      </Fragment>
    );
  }
}

const Search = ({value, onChange, onSubmit, children}) =>
  <form onSubmit={onSubmit}>
    <input type="text" value={value} onChange={onChange} />
    <button type="submit">{children}</button>
  </form>

export default App;
