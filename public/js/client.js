// const io = require('socket.io')
const socket = io(window.location.host)
const React = require('react')
const ReactDOM = require('react-dom')
const app = document.getElementById('app')

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
    connected: React.PropTypes.bool.isRequired
  },
  getDefaultProps: function () {
    return {
      connected: false
    }
  },
  getInitialState: function () {
    return {
      hidden: 'hidden',
      button: ''
    }
  },
  componentWillReceiveProps: function (props) {
    if (props.connected) {
      this.setState({
        hidden: '',
        button: <button id='sendJoin' className='btn btn-success' onSubmit={this.submitUser} enable>Join</button>
      })
    } else {
      this.setState({
        button: <button id='sendJoin' className='btn btn-success' disabled>Join</button>
      })
    }
  },
  submitUser: function (event) {
    console.log(event.target)
  },
  render: function () {
    return (
      <section id='join' className={'well ' + this.state.hidden}>
        <form id='JoinForm' className='form-inline text-right'>
            <fieldset>
              <input type='text' className='form-control' placeholder='Your name' autoComplete='off' required autoFocus />
              {this.state.button}
            </fieldset>
        </form>
      </section>
    )
  }
})

const Chat = React.createClass({
  render: function () {
    return (
      <main className='panel panel-default hidden'>
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
    joined: React.PropTypes.bool.isRequired
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
        <Join connected={this.props.connected}/>
        <Chat />
      </div>
    )
  }
})

ReactDOM.render(<Base />, app)

socket.on('connect', function () {
  console.log('Connected to Chat Socket')
  ReactDOM.render(<Base socketStatus={'success'} connected={true}/>, app)
})

socket.on('disconnect', function () {
  console.log('Disconnected from Chat Socket')
  ReactDOM.render(<Base socketStatus={'fail'}/>, app)
})
