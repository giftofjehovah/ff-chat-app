// const io = require('socket.io')
console.log('Chat in React Goodnesssss!')
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
    if (props === 'default') {
      console.log('default')
      this.setState({
        msg: 'loading',
        status: 'default'
      })
    } else if (props.status === 'success') {
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
      button: <button id='sendJoin' className='btn btn-success' disabled>Join</button>,
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
    msg: React.PropTypes.object,
    names: React.PropTypes.string
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
      messages: [],
      currentMsg: '',
      id: 0,
      names: '',
      button: <button id='sendMessage' className='btn btn-success' disabled>Send</button>
    }
  },
  addMsg: function (msg) {
    var html
    this.state.id++
    if (msg.type === 'welcome') {
      html = <div key='welcome' className='text-center'><strong>{msg.content}</strong></div>
    } else if (msg.type === 'chat') {
      html = <div key={this.state.id} className='alert alert-success'><strong>{msg.content.user.name + ': '}</strong>{msg.content.message}</div>
    } else if (msg.type === 'left') {
      html = <div key={this.state.id} className='text-center'><strong>{msg.content}</strong></div>
    } else if (msg.type === 'join') {
      html = <div key={this.state.id} className='text-center'><strong>{msg.content}</strong></div>
    }
    this.state.messages.unshift(html)
  },
  componentWillReceiveProps: function (props) {
    if (props.connected && props.joined) {
      this.setState({
        hidden: '',
        button: <button id='sendMessage' className='btn btn-success' enable>Send</button>
      })
    } else if (!props.connected && props.joined) {
      this.setState({
        button: <button id='sendMessage' className='btn btn-success' disabled>Send</button>
      })
    }
    if (props.msg) this.addMsg(props.msg)
    if (props.names) this.showOnline(props.names)
  },
  showOnline: function (names) {
    this.setState({
      names: names
    })
  },
  storeText: function (event) {
    this.setState({
      currentMsg: event.target.value
    })
  },
  sendMessage: function (event) {
    event.preventDefault()
    console.log('Sending message: ', this.state.currentMsg)
    this.state.id ++
    var html = <div key={this.state.id} className='alert alert-info text-right'>{this.state.currentMsg}</div>
    this.state.messages.unshift(html)
    socket.emit('chat', this.state.currentMsg)
    this.setState({
      currentMsg: ''
    })
  },
  render: function () {
    return (
      <main className={'panel panel-default ' + this.state.hidden}>
        <div className='panel-heading'>
          <form id='MessageForm' className='form-inline text-right' onSubmit={this.sendMessage}>
            <fieldset>
              <input type='text' onChange={this.storeText} value={this.state.currentMsg} className='form-control' placeholder='say what?' autoComplete='off' required autoFocus />
              {this.state.button}
            </fieldset>
          </form>
        </div>
        <section className='panel-body'>
          <div className='text-center'><small id='connected'>{this.state.names}</small></div>
          <hr />
          {this.state.messages}
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
    msg: React.PropTypes.object,
    names: React.PropTypes.string
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
        <Chat connected={this.props.connected} joined={this.props.joined} msg={this.props.msg} names={this.props.names}/>
      </div>
    )
  }
})

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

socket.on('chat', function (msg) {
  console.log('Received message: ', msg)
  var msgObject = {
    type: 'chat',
    content: msg
  }
  ReactDOM.render(<Base socketStatus={'success'} connected={user.connected} joined={user.joined} msg={msgObject}/>, app)
})

socket.on('left', function (users) {
  console.log(users.name + ' left the chat.')
  var msgObject = {
    type: 'left',
    content: users.name + ' left the chat.'
  }
  ReactDOM.render(<Base socketStatus={'success'} connected={user.connected} joined={user.joined} msg={msgObject}/>, app)
})

socket.on('joined', function (users) {
  console.log(users.name + ' joined the chat.')
  var msgObject = {
    type: 'join',
    content: users.name + ' joined the chat.'
  }
  ReactDOM.render(<Base socketStatus={'success'} connected={user.connected} joined={user.joined} msg={msgObject}/>, app)
})

socket.on('online', function (connections) {
  var names = ''
  console.log('Connections: ', connections)
  for (var i = 0; i < connections.length; ++i) {
    if (connections[i].user) {
      if (i > 0) {
        if (i === connections.length - 1) names += ' and '
        else names += ', '
      }
      names += connections[i].user.name
    }
  }
  ReactDOM.render(<Base socketStatus={'success'} connected={user.connected} joined={user.joined} names={names}/>, app)
})

ReactDOM.render(<Base />, app)
