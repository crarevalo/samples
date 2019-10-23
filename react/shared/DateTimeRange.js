import React, {Component, Fragment} from "react";

//const DateRange = ({startDate, endDate, onStartDateChanged, onEndDateChanged, modifiers}) =>
  
const DATE_FORMAT = "y_mmdd";

class DateTimeRange extends Component{

  constructor(props){
    super(props);

    this.onStartFieldChanged = this.onStartFieldChanged.bind(this);
    this.onEndFieldChanged = this.onEndFieldChanged.bind(this);
    this.onStartPickerChanged = this.onStartPickerChanged.bind(this);
    this.onEndPickerChanged = this.onEndPickerChanged.bind(this);
  }

  onStartFieldChanged(event){
    this.props.onStartDateChanged(event.target.input);
  }

  onEndFieldChanged(event){
    this.props.onEndDateChanged(event.target.input);
  }

  onStartPickerChanged(value){
    this.props.onStartDateChanged(value);
  }

  onEndPickerChanged(value){
    this.props.onEndDateChanged(value);
  }

  componentDidMount(){
    var options = {
      defaultDate : "+1w",
      changeMonth : true,
      changeYear : true,
      numberOfMonths : 1,
      dateFormat : DATE_FORMAT
    };

    const startPickerChanged = this.onStartPickerChanged;
    var from = jQuery("#date_start").datepicker(options).on("change", function(){
      to.datepicker("option", "minDate", getDate(this));
      startPickerChanged(this.value);
    });

    const endPickerChanged = this.onEndPickerChanged;
    var to = jQuery("#date_end").datepicker(options).on("change", function(f = this.onEndPickerChanged){
      from.datepicker("option", "maxDate", getDate(this));
      endPickerChanged(this.value);
    });

    function getDate(element){
      var date;
      try{
        date = jQuery.datepicker.parseDate(DATE_FORMAT, element.value);
      }
      catch(error){
        date = null;
      } 
      return date;
    }     
  }
  
  render(){
    const {startDate, endDate, showingTimeFields} = this.props;
    const startTimeField = showingTimeFields ? <input type="text" className="" maxLength="4" size="4" id="time_start" name="time_start" autoComplete="off" /> : "";
    const endTimeField = showingTimeFields ? <input type="text" className="" maxLength="4" size="4" id="time_end" name="time_end" autoComplete="off" /> : "";

    return (
      <Fragment>
        <span className="header">Start:</span>
        <input type="text" className="" value={startDate} maxLength="8" size="8" id="date_start" name="date_start" autoComplete="off" onChange={this.props.onStartDateChanged} />
        {startTimeField}
        <span className="header">End:</span>
        <input type="text" className="" value={endDate} maxLength="8" size="8" id="date_end" name="date_end" autoComplete="off" onChange={this.props.onEndDateChanged} />
        {endTimeField}
      </Fragment>
    );
  }
}
export default DateTimeRange;
