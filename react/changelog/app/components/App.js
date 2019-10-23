import React, {Component, Fragment} from "react";
import axios from "axios";
import moment from "moment";
import DateTimeRange from "../../../shared/DateTimeRange.js";
import ActionLink from "../../../shared/ActionLink.js";
import ResultTable from "../../../shared/ResultTable.js";

class App extends Component{

  constructor(props){
    super(props);

    this.state = {
      startDate : undefined,
      endDate : undefined,
      data : null,
      error : null
    };

    this.onStartDateChanged = this.onStartDateChanged.bind(this);
    this.onEndDateChanged = this.onEndDateChanged.bind(this);
    this.retrieveData = this.retrieveData.bind(this);
    this.setResultData = this.setResultData.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  onStartDateChanged(value){
    this.setState({startDate : value});
  }

  onEndDateChanged(value){
    this.setState({endDate : value});
  }

  retrieveData(){
    const {startDate, endDate} = this.state;
    axios(`/aperture/changelog/data?startDate=${startDate}&endDate=${endDate}`)
      .then(result => this.setResultData(result.data))
      .catch(error => this.setState({error}));
  }

  setResultData(data){
    this.setState({data});
  }

  onSearchSubmit(event){
    this.retrieveData();
    event.preventDefault();
  }

  componentDidMount(){}

  render(){
    const {data} = this.state;
    const columns = [
      {"id" : "changelogcolumns00", "name" : "Username", "definition" : "user.username"},
      {"id" : "changelogcolumns01", "name" : "Project", "definition" : "project.name"},
      {"id" : "changelogcolumns02", "name" : "File", "definition" : "file.title"},
      {"id" : "changelogcolumns03", "name" : "Action", "definition" : "action"},
      {"id" : "changelogcolumns04", "name" : "Datetime", "definition" :"datetime"}
    ];
    return (
      <Fragment>
      <div className="InputFromTo">
        <DateTimeRange onStartDateChanged={this.onStartDateChanged} onEndDateChanged={this.onEndDateChanged} />
        <ActionLink onClick={this.onSearchSubmit} className="link">Search</ActionLink>
      </div>
      <div>
        <ResultTable tableData={data} columns={columns} />
      </div>
      </Fragment>
    );
  }
}

export default App;
