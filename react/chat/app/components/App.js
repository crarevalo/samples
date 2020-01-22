import React, {Component, Fragment} from "react";
import moment from "moment";
import socketIOClient from "socket.io-client";
import TextBox from "../../../shared/TextBox.js";
import ActionLink from "../../../shared/ActionLink.js";

let refScrollTarget = React.createRef();

class App extends Component{

  constructor(props){
    super(props);

    this.state = {
      socket : socketIOClient(),
      msg : "",
      messages : [],
      error : null
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onTextBoxKeyPress = this.onTextBoxKeyPress.bind(this);
    this.onSendMessage = this.onSendMessage.bind(this);
  }

  onInputChange(event){
    this.setState({msg : event.target.value});
  }

  onTextBoxKeyPress(event){
    if (event.charCode === 13){
      event.preventDefault();
      this.onSendMessage();
    }
  }

  onSendMessage(event){
    const {msg, socket} = this.state;
    socket.emit("chatMessage", {"content" : msg});
    this.setState({msg : ""});
  }

  componentDidMount(){
    const {socket, messages} = this.state;
    const self = this;
    socket.on("chatMessage", function(message){
      const timestamp = message.timestamp;
      const date = new Date(timestamp);
      message.date = moment(date).format("HH:mm:ss");
      messages.push(message);
      self.setState({messages});
      refScrollTarget.scrollIntoView({behavior : "smooth"});
    });
  }

// <ActionLink onClick={this.onSendMessage} className="link">Send</ActionLink>
  render(){
    const {msg, messages} = this.state;
    return (
      <Fragment>
        <div className="section_display">
          {messages.map(message =>
            <Fragment key={message.key}>
              <span className="header">{message.username} ({message.date}):</span>
              <span className="content">{message.content}</span>
              <br/>
            </Fragment>
          )}
          <div ref={element => refScrollTarget = element}></div>
        </div>
        <div className="section_input">
          <TextBox onChange={this.onInputChange} onKeyPress={this.onTextBoxKeyPress} content={msg} />
        </div>
      </Fragment>
    );
  }
}

export default App;
