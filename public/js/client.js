// const io = require('socket.io')
const socket = io(window.location.host)
const React = require('react')
const ReactDOM = require('react-dom')
const app = document.getElementById('app')
var user = {
  name: '',
  connected: false,
  joined: false
}

const Heading = React.createClass({
  propTypes: {
    status: React.PropTypes.string.isRequired
  },
  getDefaultProps: function () {
    return {
      status: 'default'
    }
  },
  getInitialState: function () {
    return {
      msg: 'loading',
      status: 'default'
    }
  },
  componentWillReceiveProps: function (props) {
    console.log(props.status)
    if (props === 'default') {
      console.log('default')
      this.setState({
        msg: 'loading',
        status: 'default'
      })
    } else if (props.status === 'success') {
      console.log('success')
      this.setState({
        msg: 'connected',
        status: 'success'
      })
    } else {
      console.log('fail')
      this.setState({
        msg: 'disconnect',
        status: 'danger'
      })
    }
  },
  render: function () {
    return (
    <h1>
      WDISG2 Chat <span id='status' className={'label label-' + this.state.status}>{this.state.msg}</span>
    </h1>
    )
  }
})

const Join = React.createClass({
  propTypes: {
    connected: React.PropTypes.bool.isRequired,
    joined: React.PropTypes.bool.isRequired
  },
  getDefaultProps: function () {
    return {
      connected: false,
      joined: false
    }
  },
  getInitialState: function () {
    return {
      hidden: 'hidden',
      button: '',
      name: ''
    }
  },
  componentWillReceiveProps: function (props) {
    if (props.connected && props.joined) {
      this.setState({
        hidden: 'hidden'
      })
    } else if (props.connected) {
      this.setState({
        hidden: '',
        button: <button id='sendJoin' className='btn btn-success' enable>Join</button>
      })
    } else if (!props.connected) {
      this.setState({
        button: <button id='sendJoin' className='btn btn-success' disabled>Join</button>
      })
    }
  },
  setName: function (event) {
    this.setState({
      name: event.target.value
    })
  },
  submitUser: function (event) {
    event.preventDefault()
    user.name = this.state.name
    console.log('Joining chat with name: ', user.name)
    socket.emit('join', user)
  },
  render: function () {
    return (
      <section id='join' className={'well ' + this.state.hidden}>
        <form id='JoinForm' className='form-inline text-right' onSubmit={this.submitUser}>
            <fieldset>
              <input type='text' onChange={this.setName} className='form-control' placeholder='Your name' autoComplete='off' required autoFocus />
              {this.state.button}
            </fieldset>
        </form>
      </section>
    )
  }
})

const Chat = React.createClass({
  propTypes: {
    connected: React.PropTypes.bool.isRequired,
    joined: React.PropTypes.bool.isRequired,
    msg: React.PropTypes.object
  },
  getDefaultProps: function () {
    return {
      connected: false,
      joined: false
    }
  },
  getInitialState: function () {
    return {
      hidden: 'hidden',
      messages: []
    }
  },
  addMsg: function (msg) {
    var html
    if (msg.type === 'welcome') {
      html = <div className='text-center'><strong>{msg.content}</strong></div>
    }
    this.setState({
      messages: this.state.messages.push(html)
    })
    console.log(this.state.messages[0])
  },
  componentWillReceiveProps: function (props) {
    if (props.connected && props.joined) {
      this.setState({
        hidden: ''
      })
    }
    if (props.msg) this.addMsg(props.msg)
  },
  render: function () {
    return (
      <main className={'panel panel-default ' + this.state.hidden}>
        <div className='panel-heading'>
          <form id='MessageForm' className='form-inline text-right'>
            <fieldset>
              <input type='text' className='form-control' placeholder='say what?' autoComplete='off' required autoFocus />
              <button id='sendMessage' className='btn btn-success' disabled>Send</button>
            </fieldset>
          </form>
        </div>
        <section className='panel-body'>
          <div className='text-center'><small id='connected'></small></div>
          <hr />
          <div id='messages'>
            {this.state.messages[0]}
          </div>
        </section>
      </main>
    )
  }
})

const Base = React.createClass({
  propTypes: {
    socketStatus: React.PropTypes.string.isRequired,
    connected: React.PropTypes.bool.isRequired,
    joined: React.PropTypes.bool.isRequired,
    msg: React.PropTypes.object
  },
  getDefaultProps: function () {
    return {
      socketStatus: 'default',
      connected: false,
      joined: false
    }
  },
  render: function () {
    return (
      <div>
        <Heading status={this.props.socketStatus}/>
        <Join connected={this.props.connected} joined={this.props.joined}/>
        <Chat connected={this.props.connected} joined={this.props.joined} msg={this.props.msg}/>
      </div>
    )
  }
})

ReactDOM.render(<Base />, app)

socket.on('connect', function () {
  console.log('Connected to Chat Socket')
  user.connected = true
  ReactDOM.render(<Base socketStatus={'success'} connected={user.connected} joined={user.joined}/>, app)
})

socket.on('disconnect', function () {
  console.log('Disconnected from Chat Socket')
  user.connected = false
  ReactDOM.render(<Base socketStatus={'fail'} connected={user.connected} joined={user.joined}/>, app)
})

socket.on('welcome', function (msg) {
  console.log('Received welcome message: ', msg)
  var msgObject = {
    type: 'welcome',
    content: msg
  }
  user.joined = true
  ReactDOM.render(<Base socketStatus={'success'} connected={user.connected} joined={user.joined} msg={msgObject}/>, app)
})
