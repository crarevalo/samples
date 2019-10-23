import React, {Component, Fragment} from "react";
import axios from "axios";
import moment from "moment";
import ImportForm from "./ImportForm.js";
import EditForm from "./EditForm.js";
import DateTimeRange from "../../../shared/DateTimeRange.js";
import TextField from "../../../shared/TextField.js";
import ActionLink from "../../../shared/ActionLink.js";
import ResultTable from "../../../shared/ResultTable.js";
import Dialog from "../../../shared/Dialog.js";
import PDF from "../../../shared/PDF.js";
import UploadFile from "../../../shared/UploadFile.js";

const COLUMNS = [
  {"id" : "receiptscolumns00", "name" : "Vendor", "definition" : "vendor"},
  {"id" : "receiptscolumns01", "name" : "Amount", "definition" : "amount"},
  {"id" : "receiptscolumns02", "name" : "Date", "definition" : "date"},
];

class App extends Component{

  constructor(props){
    super(props);

    this.state = {
      mode : "view", // view | search | edit | new
      searchFields : {
        startDate : "",
        endDate : "",
        vendor : "",
        amount : ""
      },
      data : null,
      receiptURL : null,
      formFields : {
        id : "",
        vendor : "",
        amount : "",
        date : "",
        path : ""
      },
      error : null
    };

    this.onStartDateChanged = this.onStartDateChanged.bind(this);
    this.onEndDateChanged = this.onEndDateChanged.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.retrieveData = this.retrieveData.bind(this);
    this.setResultData = this.setResultData.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.onSearchOpen = this.onSearchOpen.bind(this);
    this.onSearchClose = this.onSearchClose.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onImportFormChange = this.onImportFormChange.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.onImportFormSave = this.onImportFormSave.bind(this);
    this.onImportOpen = this.onImportOpen.bind(this);
    this.onImportClose = this.onImportClose.bind(this);
    this.onClickRow = this.onClickRow.bind(this);
    this.onEditFormChange = this.onEditFormChange.bind(this);
    this.onEditFormSave = this.onEditFormSave.bind(this);
    this.onEditClose = this.onEditClose.bind(this);
  }

  onStartDateChanged(value){
    this.setState({searchFields : {...this.state.searchFields, startDate : value}});
  }

  onEndDateChanged(value){
    this.setState({searchFields : {...this.state.searchFields, endDate : value}});
  }

  onSearchChange(event){
    const name = event.target.name;
    const value = event.target.value;
    this.setState({searchFields : {...this.state.searchFields, [name] : value}});
  }

  retrieveData(){
    const {startDate, endDate, vendor, amount} = this.state.searchFields;
    axios(`/grandeur/receipts/data?startDate=${startDate}&endDate=${endDate}&vendor=${vendor}&amount=${amount}`)
      .then(result => this.setResultData(result.data))
      .catch(error => this.setState({error}));
  }

  setResultData(data){
    this.setState({mode : "view", data});
  }

  onClearSearch(){
    this.setState({searchFields : {startDate : "", endDate : "", vendor : "", amount : ""}});
  }

  onSearchOpen(event){
    this.setState({mode : "search"});
  }

  onSearchClose(event){
    this.setState({mode : "view"});
  }

  onSearchSubmit(event){
    event.preventDefault();
    const {searchFields} = this.state;
    var flag = false;
    for (let property in searchFields){
      if (searchFields[property].trim()){
        flag = true;
        break;
      }
    }

    if (!flag){
      alert("Please use at least one field.");
      return;
    }

    this.retrieveData();
    this.setState({mode : "view"});
  }

  onClickRow(rowId){
    const {data} = this.state;
    const receipt = data[rowId];
    const path = receipt.path;
    const receiptURL = "/grandeur/receipts/receipt?filename=" + path;
    const formFields = {
      ...this.state.formFields,
      id : receipt.id,
      vendor : receipt.vendor,
      amount : receipt.amount,
      date : receipt.date,
      path : receipt.path
    };
    this.setState({mode : "edit", receiptURL, formFields});
  }

  onEditClose(){
    this.setState({mode : "view", receiptURL : null});
  }

  onEditFormChange(event){
    const name = event.target.name;
    const value = event.target.value;
    if (name === "amount"){
      const regex = /^(\d*)$|^(\d*\.\d*)$/;
      if (!regex.test(value)) return;
    }
    this.setState({formFields : {...this.state.formFields, [name] : value}});
  }

  onEditFormSave(){
    const {id, vendor, amount, date} = this.state.formFields;
    const self = this;
    axios.post("/grandeur/receipts/update", {id, vendor, amount, date}).then(function(response){
      alert(response.data.message);
      self.retrieveData();
    }).catch(function(error){
      self.setState({error});
    });
  }

  onImportOpen(){
    this.setState({mode : "new", formFields : {vendor : "", amount : "", date : ""}});
  }

  onImportClose(){
    this.setState({mode : "view"});
  }

  onUpload(){
    alert("Upload complete.");
    this.setState({mode : "view"});
  }

  onImportFormChange(event){
    const name = event.target.name;
    const value = event.target.value;
    if (name === "amount"){
      const regex = /^(\d*)$|^(\d*\.\d*)$/;
      if (!regex.test(value)) return;
    }
    this.setState({formFields : {...this.state.formFields, [name] : value}});
  }

  onImportFormSave(){
    const {vendor, amount, date} = this.state.formFields;
    const self = this;
    axios.post("/grandeur/receipts/create", {vendor, amount, date}).then(function(response){
      alert(response.data.message);
      self.retrieveData();
    }).catch(error => this.setState({error}));
  }

  componentDidMount(){}

  render(){
    const {mode, data, receiptURL, searchFields, formFields} = this.state;
    switch (mode){
      case "search":
        return (
          <Dialog dialogClassName="react-dialog dialog-search">
            <ActionLink onClick={this.onSearchClose} className="link dialog-close">Close</ActionLink>
            <div className="InputFromTo">
              <DateTimeRange
                onStartDateChanged={this.onStartDateChanged}
                onEndDateChanged={this.onEndDateChanged}
                startDate={searchFields["startDate"]}
                endDate={searchFields["endDate"]}
              />
            </div>
            <div>
              <TextField onChange={this.onSearchChange} name="vendor" value={searchFields["vendor"]} className="form-field" label="Vendor:" size="30" />
            </div>
            <div>
              <TextField onChange={this.onSearchChange} name="amount" value={searchFields["amount"]} className="form-field" label="Amount:" size="20" />
            </div>
            <div>
              <ActionLink onClick={this.onClearSearch} className="link">Clear</ActionLink>
              <ActionLink onClick={this.onSearchSubmit} className="link">Search</ActionLink>
            </div>
          </Dialog>
        );
      case "edit":
        return (
          <Dialog dialogClassName="react-dialog dialog-edit">
            <ActionLink onClick={this.onEditClose} className="link dialog-close">Close</ActionLink>
            <UploadFile location={formFields["path"]} onUpload={this.onUpload} />
            <PDF className="pdf-display" url={receiptURL} />
            <EditForm
              className="edit-form"
              onChange={this.onEditFormChange}
              onSave={this.onEditFormSave}
              vendor={formFields["vendor"]}
              amount={formFields["amount"]}
              date={formFields["date"]}
            />
          </Dialog>
        );
      case "new":
        return (
          <Dialog dialogClassName="react-dialog dialog-import">
            <ActionLink onClick={this.onImportClose} className="link dialog-close">Close</ActionLink>
            <ImportForm
              className="import-form"
              onChange={this.onImportFormChange}
              onSave={this.onImportFormSave}
              vendor={formFields["vendor"]}
              amount={formFields["amount"]}
              date={formFields["date"]}
            />
          </Dialog>
        );
      default:
        return (
          <Fragment>
            <div>
              <ActionLink onClick={this.onImportOpen} className="link">Import</ActionLink>
              <ActionLink onClick={this.onSearchOpen} className="link">Search</ActionLink>
            </div>
            <div>
              <ResultTable tableData={data ? Object.values(data) : null} columns={COLUMNS} onClickRow={this.onClickRow} />
            </div>
          </Fragment>
        );
    };
  }
}

export default App;
